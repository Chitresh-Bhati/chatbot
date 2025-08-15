import { GoogleGenAI } from "@google/genai";
import type { EmergencyAlert } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class EmergencyDetector {
  private emergencyKeywords = [
    "chest pain", "difficulty breathing", "shortness of breath", "heart attack",
    "stroke", "unconscious", "severe bleeding", "choking", "allergic reaction",
    "seizure", "overdose", "suicide", "severe headache", "blurred vision",
    "weakness on one side", "confusion", "severe abdominal pain", "high fever",
    "difficulty speaking", "fainting", "diabetic emergency", "asthma attack"
  ];

  async analyzeForEmergency(message: string, medicalHistory?: any[]): Promise<EmergencyAlert> {
    try {
      // Quick keyword check first
      const hasEmergencyKeywords = this.emergencyKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!hasEmergencyKeywords) {
        return {
          isEmergency: false,
          urgencyLevel: "low",
          symptoms: [],
          recommendations: [],
          emergencyNumber: "995"
        };
      }

      // Use AI for detailed analysis
      const analysisPrompt = `You are a medical emergency detection system for Singapore. Analyze this message for emergency symptoms.

CRITICAL EMERGENCY SYMPTOMS (call 995 immediately):
- Chest pain with shortness of breath
- Signs of stroke (weakness, speech difficulty, facial drooping)
- Severe allergic reactions
- Choking or severe breathing difficulty
- Loss of consciousness
- Severe bleeding
- Signs of heart attack
- Severe head injury
- Diabetic emergency (very high/low blood sugar with symptoms)

Message: "${message}"
${medicalHistory ? `Medical History: ${JSON.stringify(medicalHistory)}` : ''}

Respond in JSON format:
{
  "isEmergency": boolean,
  "urgencyLevel": "low|medium|high|critical",
  "symptoms": ["symptom1", "symptom2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "emergencyNumber": "995"
}

For any critical emergency, always include "Call 995 immediately" in recommendations.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: analysisPrompt,
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        return {
          ...result,
          emergencyNumber: "995" // Always use Singapore emergency number
        };
      }

      // Fallback for critical keywords
      return {
        isEmergency: true,
        urgencyLevel: "high",
        symptoms: ["Potential emergency detected"],
        recommendations: [
          "Call 995 immediately if experiencing severe symptoms",
          "Seek immediate medical attention at the nearest hospital",
          "Do not delay if symptoms worsen"
        ],
        emergencyNumber: "995"
      };

    } catch (error) {
      console.error("Emergency detection error:", error);
      
      // Error fallback - be cautious and suggest emergency action
      if (hasEmergencyKeywords) {
        return {
          isEmergency: true,
          urgencyLevel: "high",
          symptoms: ["Unable to analyze - system error"],
          recommendations: [
            "Call 995 immediately if experiencing severe symptoms",
            "Seek immediate medical attention",
            "System unable to analyze - err on side of caution"
          ],
          emergencyNumber: "995"
        };
      }

      return {
        isEmergency: false,
        urgencyLevel: "low",
        symptoms: [],
        recommendations: [],
        emergencyNumber: "995"
      };
    }
  }

  formatEmergencyResponse(alert: EmergencyAlert): string {
    if (!alert.isEmergency) return "";

    let response = "";
    
    if (alert.urgencyLevel === "critical") {
      response = "🚨 **EMERGENCY DETECTED** 🚨\n\n";
      response += "**CALL 995 IMMEDIATELY**\n\n";
    } else if (alert.urgencyLevel === "high") {
      response = "⚠️ **URGENT MEDICAL ATTENTION NEEDED** ⚠️\n\n";
      response += "Consider calling 995 or seek immediate medical care\n\n";
    }

    if (alert.symptoms.length > 0) {
      response += `**Symptoms detected:** ${alert.symptoms.join(", ")}\n\n`;
    }

    if (alert.recommendations.length > 0) {
      response += "**Immediate actions:**\n";
      alert.recommendations.forEach(rec => {
        response += `• ${rec}\n`;
      });
      response += "\n";
    }

    response += `**Emergency Number:** ${alert.emergencyNumber}\n`;
    response += "**Nearest Hospitals:** Singapore General Hospital, Tan Tock Seng Hospital, National University Hospital\n\n";
    
    return response;
  }

  shouldEscalateToSpecialist(alert: EmergencyAlert): boolean {
    return alert.isEmergency && (alert.urgencyLevel === "high" || alert.urgencyLevel === "critical");
  }
}

export const emergencyDetector = new EmergencyDetector();