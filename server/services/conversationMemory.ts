import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, UserProfile, MedicalHistory, SessionContext } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class ConversationMemory {
  private readonly CONTEXT_WINDOW_DAYS = 14; // Load last 2 weeks of conversations
  private readonly MAX_CONTEXT_MESSAGES = 50; // Maximum messages to include in context

  async generateContextSummary(
    userId: string,
    chatMessages: ChatMessage[],
    userProfile?: UserProfile,
    medicalHistory?: MedicalHistory[]
  ): Promise<string> {
    try {
      const recentMessages = this.getRecentMessages(chatMessages);
      
      const summaryPrompt = `Generate a comprehensive medical context summary for continuing patient care:

PATIENT PROFILE:
${userProfile ? JSON.stringify(userProfile, null, 2) : "No profile available"}

MEDICAL HISTORY:
${medicalHistory ? JSON.stringify(medicalHistory.slice(-10), null, 2) : "No medical history available"}

RECENT CONVERSATION MESSAGES:
${recentMessages.map(msg => 
  `[${msg.timestamp}] ${msg.senderName} (${msg.senderRole || 'User'}): ${msg.message}`
).join('\n')}

Create a concise summary including:
1. Current health concerns and symptoms
2. Ongoing treatments and medications
3. Key recommendations made by specialists
4. Pending follow-ups or tests
5. Travel plans or lifestyle factors
6. Any risk factors or alerts
7. Conversation patterns and compliance

Keep summary under 500 words but include all medically relevant details.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: summaryPrompt,
      });

      return response.text || "Unable to generate context summary";

    } catch (error) {
      console.error("Context summary generation error:", error);
      return `Context: Recent conversation with ${chatMessages.length} messages. User profile: ${userProfile?.name || 'Unknown'}`;
    }
  }

  async checkForRepetitiveQuestions(
    newMessage: string,
    recentMessages: ChatMessage[]
  ): Promise<{
    isRepetitive: boolean;
    previousResponse?: string;
    similarity: number;
  }> {
    try {
      // Get user messages from recent history
      const userMessages = recentMessages
        .filter(msg => msg.isFromUser === 1)
        .slice(-10)
        .map(msg => msg.message);

      if (userMessages.length === 0) {
        return { isRepetitive: false, similarity: 0 };
      }

      const similarityPrompt = `Compare this new question with recent questions to detect repetition:

NEW QUESTION: "${newMessage}"

RECENT QUESTIONS:
${userMessages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n')}

Respond in JSON format:
{
  "isRepetitive": boolean,
  "mostSimilarQuestion": "question text or null",
  "similarity": number (0-100),
  "reason": "explanation of similarity or difference"
}

Consider questions repetitive if they ask about the same health concern, symptom, or topic with >70% similarity.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: similarityPrompt,
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        
        if (result.isRepetitive && result.mostSimilarQuestion) {
          // Find the AI response to the similar question
          const similarMessageIndex = recentMessages.findIndex(
            msg => msg.isFromUser === 1 && msg.message.includes(result.mostSimilarQuestion.slice(0, 50))
          );
          
          if (similarMessageIndex >= 0 && similarMessageIndex < recentMessages.length - 1) {
            const aiResponse = recentMessages[similarMessageIndex + 1];
            if (aiResponse && aiResponse.isFromUser === 0) {
              result.previousResponse = aiResponse.message;
            }
          }
        }

        return {
          isRepetitive: result.isRepetitive,
          previousResponse: result.previousResponse,
          similarity: result.similarity || 0
        };
      }

      return { isRepetitive: false, similarity: 0 };

    } catch (error) {
      console.error("Repetitive question check error:", error);
      return { isRepetitive: false, similarity: 0 };
    }
  }

  async generateAdaptiveResponse(
    newMessage: string,
    contextSummary: string,
    repetitiveCheck: any,
    specialist: any
  ): Promise<string> {
    if (repetitiveCheck.isRepetitive && repetitiveCheck.previousResponse) {
      return this.generateReferenceResponse(newMessage, repetitiveCheck.previousResponse, specialist);
    }

    return contextSummary; // Return full context for new questions
  }

  private async generateReferenceResponse(
    newMessage: string,
    previousResponse: string,
    specialist: any
  ): Promise<string> {
    try {
      const referencePrompt = `The user is asking a similar question to one answered recently. Provide an updated response that:
1. References the previous answer
2. Adds any new relevant information
3. Avoids exact repetition
4. Maintains the specialist's voice

SPECIALIST: ${specialist.name} (${specialist.role})
NEW QUESTION: "${newMessage}"
PREVIOUS RESPONSE: "${previousResponse}"

Create a response that acknowledges the previous discussion and provides updated or clarified information.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: referencePrompt,
      });

      return `[Referencing our previous discussion] ${response.text}`;

    } catch (error) {
      console.error("Reference response generation error:", error);
      return `As I mentioned before: ${previousResponse.slice(0, 200)}...`;
    }
  }

  private getRecentMessages(chatMessages: ChatMessage[]): ChatMessage[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.CONTEXT_WINDOW_DAYS);

    return chatMessages
      .filter(msg => new Date(msg.date) >= cutoffDate)
      .slice(-this.MAX_CONTEXT_MESSAGES)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async summarizeSessionForStorage(
    sessionMessages: ChatMessage[],
    sessionId: string,
    userId: string
  ): Promise<{
    conversationSummary: string;
    keyTopics: string[];
    specialistsInvolved: string[];
    actionItems: string[];
    followUpNeeded: string[];
  }> {
    try {
      const sessionPrompt = `Analyze this conversation session and create a structured summary:

SESSION MESSAGES:
${sessionMessages.map(msg => 
  `[${msg.timestamp}] ${msg.senderName}: ${msg.message}`
).join('\n')}

Respond in JSON format:
{
  "conversationSummary": "Brief summary of main discussion points",
  "keyTopics": ["topic1", "topic2"],
  "specialistsInvolved": ["specialist1", "specialist2"],
  "actionItems": ["action1", "action2"],
  "followUpNeeded": ["followup1", "followup2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: sessionPrompt,
      });

      if (response.text) {
        return JSON.parse(response.text);
      }

      // Fallback summary
      const specialists = [...new Set(sessionMessages
        .filter(msg => msg.isFromUser === 0)
        .map(msg => msg.senderName)
        .filter(Boolean)
      )];

      return {
        conversationSummary: `Session with ${sessionMessages.length} messages`,
        keyTopics: ["General health consultation"],
        specialistsInvolved: specialists,
        actionItems: [],
        followUpNeeded: []
      };

    } catch (error) {
      console.error("Session summary error:", error);
      return {
        conversationSummary: "Unable to generate summary",
        keyTopics: [],
        specialistsInvolved: [],
        actionItems: [],
        followUpNeeded: []
      };
    }
  }
}

export const conversationMemory = new ConversationMemory();