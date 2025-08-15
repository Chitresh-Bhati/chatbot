import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import { emergencyDetector } from "./services/emergencyDetector";
import { conversationMemory } from "./services/conversationMemory";
import type { UserProfile, MedicalHistory, EmergencyAlert } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Specialist {
  id: string;
  name: string;
  role: string;
  color: string;
  specialties: string[];
  canProvideAdvice: boolean;
}

const specialists: Specialist[] = [
  {
    id: "ruby",
    name: "Ruby",
    role: "Concierge",
    color: "ruby",
    specialties: ["logistics", "scheduling", "coordination", "general questions", "appointments", "team coordination"],
    canProvideAdvice: false  // Ruby ONLY handles logistics - never gives medical/health advice
  },
  {
    id: "warren",
    name: "Dr. Warren",
    role: "Medical Strategist",
    color: "warren",
    specialties: ["medical advice", "diagnoses", "test results", "lab interpretation", "symptoms", "medications", "medical conditions", "health assessments", "emergency", "chest pain", "heart attack", "stroke"],
    canProvideAdvice: true
  },
  {
    id: "advik", 
    name: "Advik",
    role: "Performance Scientist",
    color: "advik",
    specialties: ["fitness", "wearables", "performance tracking", "heart rate", "sleep data", "exercise metrics", "training", "recovery", "HRV", "workout"],
    canProvideAdvice: true
  },
  {
    id: "carla",
    name: "Carla", 
    role: "Nutritionist",
    color: "carla",
    specialties: ["diet", "nutrition", "supplements", "food", "eating", "meals", "vitamins", "calories", "macros", "weight management", "meal planning"],
    canProvideAdvice: true
  },
  {
    id: "rachel",
    name: "Rachel",
    role: "Physiotherapist", 
    color: "rachel",
    specialties: ["injuries", "exercise form", "mobility", "pain", "stretching", "physical therapy", "movement", "posture", "rehabilitation", "muscle"],
    canProvideAdvice: true
  },
  {
    id: "neel",
    name: "Neel",
    role: "Relationship Manager",
    color: "neel", 
    specialties: ["health planning", "service quality", "program management", "long-term goals", "lifestyle changes", "overall strategy", "travel health"],
    canProvideAdvice: true
  }
];

function determineSpecialist(query: string, isAdviceNeeded: boolean = true): Specialist {
  const lowercaseQuery = query.toLowerCase();
  
  // If user needs medical/health advice, Ruby should refer to appropriate specialist
  if (isAdviceNeeded) {
    // Score specialists who can provide advice
    const advisorSpecialists = specialists.filter(s => s.canProvideAdvice);
    const scores = advisorSpecialists.map(specialist => {
      const score = specialist.specialties.reduce((acc, specialty) => {
        return acc + (lowercaseQuery.includes(specialty.toLowerCase()) ? 1 : 0);
      }, 0);
      return { specialist, score };
    });

    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    // Return the best advisor specialist, or Dr. Warren for general medical questions
    return bestMatch.score > 0 ? bestMatch.specialist : specialists[1]; // Dr. Warren
  }

  // For logistics/scheduling/coordination, use Ruby
  const logisticsKeywords = ["schedule", "appointment", "coordinate", "book", "reschedule", "cancel", "logistics", "contact", "team"];
  const isLogistics = logisticsKeywords.some(keyword => lowercaseQuery.includes(keyword));
  
  if (isLogistics) {
    return specialists[0]; // Ruby
  }

  // Default to Ruby for general questions
  return specialists[0];
}

function needsAdviceDetection(query: string): boolean {
  const adviceKeywords = [
    "how", "what should", "recommend", "suggest", "advice", "help", "problem", 
    "pain", "symptom", "feel", "diet", "exercise", "medication", "treatment",
    "worried", "concerned", "issue", "wrong", "hurt", "ache", "sick", "unwell",
    "improve", "better", "optimize", "manage", "control", "prevent"
  ];
  
  return adviceKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Get current Singapore weather and health context
async function getSingaporeContext(): Promise<string> {
  try {
    // In a real implementation, you would call NEA Weather API
    // For now, providing contextual awareness based on typical Singapore patterns
    const currentMonth = new Date().getMonth();
    const isHazeSeasonRisk = currentMonth >= 5 && currentMonth <= 9; // June-Oct
    const isMonsoonSeason = currentMonth >= 10 || currentMonth <= 3; // Nov-Apr
    
    let weatherContext = "Singapore context: ";
    if (isHazeSeasonRisk) {
      weatherContext += "Haze season risk period - recommend air quality monitoring, indoor exercises when PSI >100. ";
    }
    if (isMonsoonSeason) {
      weatherContext += "Monsoon season - higher respiratory illness risk, focus on immunity support. ";
    }
    weatherContext += "Year-round high humidity (80-90%) and heat (26-32°C) - prioritize hydration and heat management.";
    
    return weatherContext;
  } catch (error) {
    return "Singapore tropical climate - maintain hydration and consider seasonal health factors.";
  }
}

export async function generateSpecialistResponse(
  query: string, 
  userId: string = "default-user",
  sessionId: string = "current-session"
): Promise<{
  specialist: Specialist;
  response: string;
  emergencyAlert?: EmergencyAlert;
  needsReferral?: boolean;
  referredSpecialist?: Specialist;
}> {
  try {
    // 1. Check for emergency situations first
    const medicalHistory = await storage.getMedicalHistory(userId);
    const emergencyAlert = await emergencyDetector.analyzeForEmergency(query, medicalHistory);
    
    if (emergencyAlert.isEmergency) {
      const emergencyResponse = emergencyDetector.formatEmergencyResponse(emergencyAlert);
      return {
        specialist: specialists[1], // Dr. Warren for emergencies
        response: emergencyResponse,
        emergencyAlert
      };
    }

    // 2. Load conversation context and user data
    const userProfile = await storage.getUserProfile(userId);
    const recentMessages = await storage.getChatMessages(userId, 20);
    const contextSummary = await conversationMemory.generateContextSummary(
      userId, recentMessages, userProfile, medicalHistory
    );

    // 3. Check for repetitive questions
    const repetitiveCheck = await conversationMemory.checkForRepetitiveQuestions(query, recentMessages);

    // 4. Determine if user needs advice or just logistics
    const needsAdvice = needsAdviceDetection(query);
    const primarySpecialist = determineSpecialist(query, needsAdvice);

    // 5. Handle Ruby's referral logic
    if (primarySpecialist.id === "ruby" && needsAdvice) {
      // Ruby should refer to appropriate specialist
      const advisorSpecialist = determineSpecialist(query, true);
      if (advisorSpecialist.id !== "ruby") {
        const rubyResponse = await generateRubyReferralResponse(query, advisorSpecialist);
        const specialistResponse = await generateSpecialistAdvice(
          query, advisorSpecialist, contextSummary, repetitiveCheck, userId
        );
        
        return {
          specialist: specialists[0], // Ruby
          response: `${rubyResponse}\n\n${advisorSpecialist.name} (${advisorSpecialist.role}): ${specialistResponse}`,
          needsReferral: true,
          referredSpecialist: advisorSpecialist
        };
      }
    }

    // 6. Generate appropriate response based on specialist
    let finalResponse: string;
    
    if (repetitiveCheck.isRepetitive && repetitiveCheck.previousResponse) {
      finalResponse = await conversationMemory.generateAdaptiveResponse(
        query, contextSummary, repetitiveCheck, primarySpecialist
      );
    } else {
      finalResponse = await generateSpecialistAdvice(
        query, primarySpecialist, contextSummary, repetitiveCheck, userId
      );
    }

    return {
      specialist: primarySpecialist,
      response: finalResponse
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    
    return {
      specialist: specialists[0],
      response: "I'm experiencing some technical difficulties right now. Let me connect you with the right team member shortly. In the meantime, feel free to send your question and we'll get back to you!"
    };
  }
}

async function generateRubyReferralResponse(query: string, advisorSpecialist: Specialist): Promise<string> {
  const referralPrompts = {
    warren: "I understand your concern about this health issue. Let me bring in Dr. Warren to provide you with proper medical guidance.",
    advik: "That's a great fitness question! Let me connect you with Advik, our Performance Scientist, who can give you expert advice.",
    carla: "Perfect nutrition question! I'll bring in Carla, our Nutritionist, to help you with that.",
    rachel: "That sounds like something our Physiotherapist Rachel can help you with. Let me get her for you.",
    neel: "This seems like a perfect question for Neel, our Relationship Manager, who handles health planning and strategy."
  };

  return referralPrompts[advisorSpecialist.id as keyof typeof referralPrompts] || 
    `Let me connect you with ${advisorSpecialist.name} from our team who can help you with that.`;
}

async function generateSpecialistAdvice(
  query: string, 
  specialist: Specialist, 
  contextSummary: string, 
  repetitiveCheck: any,
  userId: string
): Promise<string> {
  const singaporeContext = await getSingaporeContext();
  
  // Check if travel is mentioned for Neel's travel health advisor mode
  const isTravelQuery = query.toLowerCase().includes('travel') || 
                       query.toLowerCase().includes('trip') || 
                       query.toLowerCase().includes('vacation');

  let specialistInstructions = "";
  
  if (specialist.id === "ruby") {
    specialistInstructions = `You are Ruby, the Concierge. You ONLY handle:
- Scheduling appointments and coordinating with the team
- Logistics and administrative tasks  
- General coordination between specialists
- Team introductions and referrals

You NEVER provide medical, nutrition, fitness, or health advice. If asked for advice, always refer to the appropriate specialist.`;

  } else if (specialist.id === "warren") {
    specialistInstructions = `You are Dr. Warren, Medical Strategist. Provide evidence-based medical advice citing:
- Singapore MOH guidelines and clinical practice guidelines
- MOH TRUST Platform data when relevant
- Singapore HTA recommendations for medications
- Local clinical data and health trends
Always include proper medical citations and consider Singapore's healthcare context.`;

  } else if (specialist.id === "neel" && isTravelQuery) {
    // Activate travel health advisor mode
    specialistInstructions = `You are Neel in TRAVEL HEALTH ADVISOR mode. For travel health:
- Reference MOH and WHO travel advisories for the destination
- Suggest required/recommended vaccines
- Provide destination-specific health risks and precautions
- Adjust health plans for travel periods
- Include emergency contact information for the destination
- Consider Singapore return requirements`;

  } else {
    specialistInstructions = `You are ${specialist.name}, ${specialist.role}. ${getSpecialistStyle(specialist)}`;
  }

  const systemPrompt = `${specialistInstructions}

SINGAPORE MEDICAL CONTEXT:
${singaporeContext}

PATIENT CONTEXT:
${contextSummary}

CONVERSATION NOTES:
${repetitiveCheck.isRepetitive ? `This is similar to a previous question. Previous response was: "${repetitiveCheck.previousResponse?.slice(0, 200)}..."` : "This is a new question."}

CRITICAL RULES:
1. Always start response with your name and role: "${specialist.name} (${specialist.role}):"
2. Cite credible sources (MOH, WHO, UpToDate, Singapore clinical guidelines)
3. Keep responses conversational but professional
4. Consider Singapore's climate, culture, and healthcare system
5. Adapt advice based on patient's travel frequency and lifestyle
6. Reference previous conversations when relevant

If question is outside your expertise, briefly refer to the appropriate team member.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
    },
    contents: query,
  });

  return response.text || "I apologize, but I'm having trouble responding right now. Please try again.";
}

function getSpecialistStyle(specialist: Specialist): string {
  const styles = {
    advik: "Provide data-driven fitness advice optimized for Singapore's climate. Focus on performance metrics, wearables data, and evidence-based training.",
    carla: "Give practical nutrition advice considering Singapore's food culture. Include local healthy options and dietary modifications.",
    rachel: "Provide direct, encouraging physiotherapy advice. Consider Singapore's heat and humidity for exercise recommendations.",
    neel: "Take a strategic, big-picture approach to health planning. Focus on long-term goals and lifestyle integration."
  };
  
  return styles[specialist.id as keyof typeof styles] || "Provide helpful, professional advice in your area of expertise.";
}