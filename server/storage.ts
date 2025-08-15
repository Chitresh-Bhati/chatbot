import { 
  type TeamMember, type InsertTeamMember, 
  type Conversation, type InsertConversation, 
  type ChatMessage, type InsertChatMessage, 
  type UserFile, type InsertUserFile,
  type UserProfile, type InsertUserProfile,
  type MedicalHistory, type InsertMedicalHistory,
  type HealthPlan, type InsertHealthPlan,
  type RiskPrediction, type InsertRiskPrediction,
  type TravelAdvisory, type InsertTravelAdvisory,
  type SessionContext, type InsertSessionContext
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Existing methods
  getTeamMembers(): Promise<TeamMember[]>;
  getConversations(): Promise<Conversation[]>;
  searchConversations(query: string): Promise<Conversation[]>;
  getChatMessages(userId?: string, limit?: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserFiles(): Promise<UserFile[]>;
  addUserFile(file: InsertUserFile): Promise<UserFile>;
  getUserFileById(id: string): Promise<UserFile | null>;
  
  // New medical record methods
  getUserProfile(userId: string): Promise<UserProfile | null>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  
  getMedicalHistory(userId: string, category?: string): Promise<MedicalHistory[]>;
  addMedicalHistory(record: InsertMedicalHistory): Promise<MedicalHistory>;
  updateMedicalHistory(recordId: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory>;
  
  getHealthPlans(userId: string, status?: string): Promise<HealthPlan[]>;
  addHealthPlan(plan: InsertHealthPlan): Promise<HealthPlan>;
  updateHealthPlan(planId: string, updates: Partial<HealthPlan>): Promise<HealthPlan>;
  
  getRiskPredictions(userId: string): Promise<RiskPrediction[]>;
  addRiskPrediction(prediction: InsertRiskPrediction): Promise<RiskPrediction>;
  
  getTravelAdvisories(userId: string, status?: string): Promise<TravelAdvisory[]>;
  addTravelAdvisory(advisory: InsertTravelAdvisory): Promise<TravelAdvisory>;
  updateTravelAdvisory(advisoryId: string, updates: Partial<TravelAdvisory>): Promise<TravelAdvisory>;
  
  getSessionContext(userId: string, sessionId?: string): Promise<SessionContext[]>;
  addSessionContext(context: InsertSessionContext): Promise<SessionContext>;
  updateSessionContext(contextId: string, updates: Partial<SessionContext>): Promise<SessionContext>;
  
  // Advanced search and analytics
  searchMedicalRecords(userId: string, query: string): Promise<any[]>;
  getPatientSummary(userId: string): Promise<any>;
  getChatMessagesByDateRange(userId: string, startDate: string, endDate: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private teamMembers: Map<string, TeamMember>;
  private conversations: Map<string, Conversation>;
  private chatMessages: Map<string, ChatMessage>;
  private userFiles: Map<string, UserFile>;
  private userProfiles: Map<string, UserProfile>;
  private medicalHistory: Map<string, MedicalHistory>;
  private healthPlans: Map<string, HealthPlan>;
  private riskPredictions: Map<string, RiskPrediction>;
  private travelAdvisories: Map<string, TravelAdvisory>;
  private sessionContexts: Map<string, SessionContext>;

  constructor() {
    this.teamMembers = new Map();
    this.conversations = new Map();
    this.chatMessages = new Map();
    this.userFiles = new Map();
    this.userProfiles = new Map();
    this.medicalHistory = new Map();
    this.healthPlans = new Map();
    this.riskPredictions = new Map();
    this.travelAdvisories = new Map();
    this.sessionContexts = new Map();
    this.initializeData();
    this.initializeMedicalData();
  }

  private initializeData() {
    // Initialize team members
    const members: TeamMember[] = [
      { id: "ruby", name: "Ruby", role: "Concierge", color: "ruby", avatar: "R" },
      { id: "warren", name: "Dr. Warren", role: "Medical Strategist", color: "warren", avatar: "W" },
      { id: "advik", name: "Advik", role: "Performance Scientist", color: "advik", avatar: "A" },
      { id: "carla", name: "Carla", role: "Nutritionist", color: "carla", avatar: "C" },
      { id: "rachel", name: "Rachel", role: "Physiotherapist", color: "rachel", avatar: "R" },
      { id: "neel", name: "Neel", role: "Relationship Manager", color: "neel", avatar: "N" },
    ];

    members.forEach(member => this.teamMembers.set(member.id, member));

    // Generate comprehensive 8-month conversation data  
    const conversations: Conversation[] = [
      // January 2024 - Onboarding
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge",
        senderColor: "ruby", 
        message: "Hi Rohan! Welcome to Elyx! 🎉 I'm Ruby, your personal concierge. I'll be coordinating your health journey with our amazing team. Ready to get started?",
        timestamp: "10:30 AM",
        date: "01/05/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Hi Ruby! Yes, excited to begin. Travel a lot for work though - hope that won't be an issue?",
        timestamp: "10:45 AM",
        date: "01/05/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby", 
        senderRole: "Concierge",
        senderColor: "ruby",
        message: "Not at all! We specialize in working with frequent travelers. I'll introduce you to Dr. Warren for your initial assessment, then we'll create a flexible plan. First, let's schedule your diagnostic panel - any preference for timing?",
        timestamp: "10:47 AM",
        date: "01/05/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Mornings work best before I fly out. How about Thursday at 8 AM?",
        timestamp: "11:15 AM",
        date: "01/05/24", 
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "Hello Rohan. I've reviewed your intake form. Your cholesterol levels from last year are concerning (LDL: 165 mg/dL). We need comprehensive labs and a stress test. Thursday 8 AM works perfectly.",
        timestamp: "2:15 PM",
        date: "01/08/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "That sounds serious. I fly to Bangkok on Friday - is Thursday cutting it close?",
        timestamp: "2:30 PM",
        date: "01/08/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist", 
        senderColor: "warren",
        message: "Not immediately dangerous, but needs addressing. Thursday morning tests are non-invasive - you'll be cleared for travel. Results ready by Friday evening, we'll discuss remotely while you're in Bangkok.",
        timestamp: "2:35 PM",
        date: "01/08/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge",
        senderColor: "ruby",
        message: "I've also sent your Oura ring and glucose monitor via express delivery. They'll arrive tomorrow. Advik will help you set them up before your trip!",
        timestamp: "3:00 PM",
        date: "01/08/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "advik", 
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Hey Rohan! Got your devices. Quick setup call at 6 PM? I'll walk you through everything and explain what data we're tracking. Takes 15 minutes max.",
        timestamp: "4:30 PM",
        date: "01/09/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Perfect timing! Just finished work. Let's do this.",
        timestamp: "6:00 PM",
        date: "01/09/24",
        monthLabel: null,
        isFromMember: 1,
      },
      
      // January continued - First week data
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik", 
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Your first week of data is in! Sleep efficiency: 68% (target: 85%), HRV: 28ms (below average for your age). The Bangkok jet lag really hit you hard. Let's work on sleep hygiene protocols.",
        timestamp: "6:00 AM",
        date: "01/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Is 68% really that bad? I feel okay most mornings...",
        timestamp: "8:20 AM",
        date: "01/15/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "You're in survival mode, not optimization mode. Quality sleep directly impacts cholesterol metabolism. Your body's working overtime to compensate. We can get you to 80%+ with targeted interventions.",
        timestamp: "8:25 AM",
        date: "01/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "Hi Rohan! I saw your glucose spikes from the Bangkok trip - that street food hit differently! 😅 Let me create a travel nutrition guide. Business trips don't have to derail progress.",
        timestamp: "11:00 AM",
        date: "01/16/24", 
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "The pad thai was calling my name! But seriously, I need help with business dinners. Clients expect me to indulge.",
        timestamp: "12:30 PM",
        date: "01/16/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren", 
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "Lab results are in. LDL: 168 mg/dL (higher than last year), HDL: 45 mg/dL, Triglycerides: 185 mg/dL. Stress test shows good cardiac function but we need aggressive lifestyle intervention. No medications yet.",
        timestamp: "4:00 PM",
        date: "01/18/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "It got worse?! I thought I was eating relatively healthy...",
        timestamp: "4:15 PM",
        date: "01/18/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "Work stress, travel, and hidden dietary factors. The good news? Your heart is strong and we caught this early. With our team's support, we can reverse this in 3-6 months. Trust the process.",
        timestamp: "4:20 PM",
        date: "01/18/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "neel",
        senderName: "Neel",
        senderRole: "Relationship Manager", 
        senderColor: "neel",
        message: "Rohan, I know this feels overwhelming. But you have the best team in Singapore backing you. We've seen dramatic turnarounds in executives just like you. Ready to commit to the next 90 days?",
        timestamp: "5:00 PM",
        date: "01/18/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel", 
        senderRole: null,
        senderColor: "whatsapp",
        message: "Let's do this. I'm all in. What's the game plan?",
        timestamp: "5:30 PM",
        date: "01/18/24",
        monthLabel: null,
        isFromMember: 1,
      },

      // February 2024 - Plan Implementation
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "Morning Rohan! Your personalized exercise plan is ready. Airport workouts, hotel room circuits, and city walking tours that double as cardio. No equipment needed. Ready to crush this? 💪",
        timestamp: "7:00 AM",
        date: "02/01/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Airport workouts? That sounds... very public 😅",
        timestamp: "9:15 AM", 
        date: "02/01/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "Ha! Subtle stuff - calf raises while waiting at gate, walking the terminals instead of sitting. Changi Airport has a gym too! Your comfort zone is where progress dies. Trust me! 😉",
        timestamp: "9:20 AM",
        date: "02/01/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla", 
        message: "Your \"Business Dining Survival Kit\" is ready! 🍽️ Key strategies: order first (others follow), choose grilled over fried, ask for dressing on side. I've included 50+ restaurant phrases that sound sophisticated, not restrictive.",
        timestamp: "11:30 AM", 
        date: "02/03/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Carla, I'm struggling with this. Client expects me to order the steak, you know? It's a Singapore business culture thing.",
        timestamp: "2:45 PM",
        date: "02/03/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "I totally get it! Try this: \"I'll have the salmon - heard amazing things about your preparation here.\" Positions it as curiosity, not restriction. Salmon has omega-3s for cholesterol management. Win-win! 🐟",
        timestamp: "2:50 PM",
        date: "02/03/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Tried the salmon approach at Marina Bay yesterday. Client said \"great choice\" and ordered the same! This actually works!",
        timestamp: "8:30 AM",
        date: "02/05/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Week 3 data showing improvements! Sleep efficiency up to 73%, HRV averaging 32ms. Your body's responding to the changes. The consistency is paying off! 📈",
        timestamp: "6:30 AM",
        date: "02/12/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Actually starting to feel the difference. Less afternoon crashes, more energy for evening calls with US clients.",
        timestamp: "7:45 AM",
        date: "02/12/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "Love seeing your step count! 12K steps yesterday - those terminal walks add up! Ready for the next phase? I want to add some strength training. 20 minutes, 3x per week.",
        timestamp: "10:00 AM",
        date: "02/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Strength training sounds intimidating. I haven't lifted weights since university...",
        timestamp: "2:30 PM", 
        date: "02/15/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "We're starting with bodyweight! Push-ups against the wall, squats using your office chair, planks. I'll send video guides. Progressive overload - your muscles will thank you!",
        timestamp: "2:35 PM",
        date: "02/15/24",
        monthLabel: null,
        isFromMember: 0,
      },

      // March 2024 - First Quarterly Review
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge",
        senderColor: "ruby",
        message: "Rohan! It's been 3 months - time for your quarterly assessment! Dr. Warren has your new lab results. The whole team is excited to see your progress! 🎯",
        timestamp: "9:00 AM",
        date: "03/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "Quarterly labs are exceptional! LDL dropped from 168 to 145 mg/dL (-23 points), HDL up to 52 mg/dL, Triglycerides down to 125 mg/dL. You're responding beautifully to the protocol. How are you feeling overall?",
        timestamp: "4:30 PM",
        date: "03/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel", 
        senderRole: null,
        senderColor: "whatsapp",
        message: "Actually feeling amazing! More energy during long meetings. Wife noticed I'm sleeping better too. Even my suits feel looser!",
        timestamp: "6:45 PM",
        date: "03/15/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "neel",
        senderName: "Neel",
        senderRole: "Relationship Manager",
        senderColor: "neel",
        message: "Rohan! Those results are fantastic - you're in the top 20% of our members for 3-month progress. I'm seeing 65% adherence in your logs. Imagine if we hit 80%? Ready to level up? 🚀",
        timestamp: "10:00 AM",
        date: "03/16/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "The data doesn't lie! What's the next phase look like?",
        timestamp: "11:30 AM",
        date: "03/16/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Your metrics tell an incredible story! Sleep efficiency: 81% (was 68%), HRV: 38ms (was 28ms), resting HR down 8 BPM. Your cardiovascular system has fundamentally improved! 💪",
        timestamp: "2:00 PM",
        date: "03/16/24",
        monthLabel: null,
        isFromMember: 0,
      },

      // April 2024 - Challenges & Adjustments  
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Team, I need help. Back-to-back trips to Mumbai and KL. Oura ring died in Mumbai, missed 2 weeks of data. Completely fell off the nutrition plan. Feeling like I'm back to square one.",
        timestamp: "11:30 PM",
        date: "04/08/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge", 
        senderColor: "ruby",
        message: "Rohan, breathe! One rough couple of weeks doesn't erase 3 months of progress. Your body doesn't forget overnight. I'm sending a replacement Oura ring today - expedited to your office. Let's regroup. ❤️",
        timestamp: "6:45 AM",
        date: "04/09/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Data point: your HRV baseline from March is still 25% higher than January, even without the ring. Your cardiovascular fitness has improved permanently. The hardware failed, not you. 📊",
        timestamp: "7:00 AM",
        date: "04/09/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "Mumbai and KL are my specialties! I've updated your travel guide with street food swaps and local healthy options. Even found cholesterol-friendly options at your hotel restaurants! 🇮🇳🇲🇾",
        timestamp: "8:30 AM",
        date: "04/09/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "You guys are incredible. I was really beating myself up. Let me look at the updated guides.",
        timestamp: "10:15 AM",
        date: "04/09/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "Travel setbacks are normal! Your muscle memory is still there. Let's ease back in - 10-minute hotel room workouts this week, then back to full routine. Progress, not perfection! 💪",
        timestamp: "12:00 PM",
        date: "04/10/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Did 15 minutes this morning - felt good to move again. Thanks for not making me feel like a failure.",
        timestamp: "8:45 AM",
        date: "04/12/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "Quick glucose check shows you're still in good range despite the travel. Your metabolic improvements are holding. This resilience is exactly what we've been building for. Well done.",
        timestamp: "3:30 PM",
        date: "04/15/24",
        monthLabel: null,
        isFromMember: 0,
      },

      // May 2024 - Member-Initiated Concerns
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Dr. Warren, saw this article about statins having memory side effects. My company doctor suggested them for my cholesterol at the annual checkup. Different advice from what we're doing?",
        timestamp: "2:15 PM",
        date: "05/12/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "Valid concern. At your current LDL of 145 and dropping, lifestyle intervention is still first-line therapy. If we plateau above 130 after 6 months, we'll discuss statins. The memory research shows mixed results - benefits usually outweigh risks. Your choice ultimately.",
        timestamp: "2:45 PM",
        date: "05/12/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Appreciate the honesty and evidence-based approach. Let's stick with our plan for now. Company doc wasn't thrilled but respects the systematic approach.",
        timestamp: "3:00 PM",
        date: "05/12/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Quick question - read about intermittent fasting helping cholesterol. Worth trying or stick to current meal timing?",
        timestamp: "7:30 AM",
        date: "05/18/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "Great question! With your travel schedule, I'd recommend time-restricted eating rather than full IF. 12-hour eating window works better for business dinners. Gives benefits without social/travel complications. 🕐",
        timestamp: "9:00 AM",
        date: "05/18/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Team, my Oura is showing elevated stress scores this week. Big presentation to the board on Friday. Any quick wins for stress management?",
        timestamp: "10:45 AM",
        date: "05/23/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "I see the elevated cortisol markers! Box breathing technique: 4 counts in, 4 hold, 4 out, 4 hold. Do this 5 minutes before your presentation. Also, your HRV shows you're handling stress better than 4 months ago! 🧘‍♂️",
        timestamp: "11:00 AM",
        date: "05/23/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "Movement is medicine for stress! Even 5 minutes of walking or stretching between prep sessions. Gets the blood flowing and clears your head. You've got this! 💪",
        timestamp: "11:15 AM",
        date: "05/23/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Board presentation went perfectly! Used the breathing technique right before. Felt calm and focused. Thank you all!",
        timestamp: "4:30 PM",
        date: "05/25/24",
        monthLabel: null,
        isFromMember: 1,
      },

      // June 2024 - Momentum Building
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Team! Incredible milestone - just completed a 5K run in Seoul without stopping. First time in probably 10 years I could do that. Whatever you're doing is absolutely working! 🏃‍♂️",
        timestamp: "6:30 AM",
        date: "06/20/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "YASSS! 🙌 That's what I'm talking about! Your cardiovascular base is absolutely solid now. Ready for the next challenge? I want to add interval training. Let's build some speed for your next business trip! Time to get competitive! 😤",
        timestamp: "8:15 AM",
        date: "06/20/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "Rohan! Your Korean food pics show incredible choices - bulgogi with extra vegetables, minimal rice, kimchi for gut health. You're not just following rules anymore, you're intuitive eating! The education is paying off! 🥢",
        timestamp: "9:00 AM",
        date: "06/20/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Your Seoul run data is beautiful! Perfect negative split, heart rate stayed in Zone 2, quick recovery. Your aerobic base has completely transformed. This is elite-level fitness development! 📊🔥",
        timestamp: "10:30 AM",
        date: "06/20/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge",
        senderColor: "ruby",
        message: "I'm getting emotional reading these updates! 🥺 From someone worried about airport workouts to running 5Ks in foreign cities. You've completely transformed your relationship with movement and health!",
        timestamp: "2:00 PM",
        date: "06/20/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Honestly, this feels like a completely different life. Wife says I have more energy at home, work performance is better, even sleeping through the night consistently. Best investment I've ever made.",
        timestamp: "3:45 PM",
        date: "06/20/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Quick question - colleague at work wants to know about Elyx. Is there a referral program?",
        timestamp: "11:00 AM",
        date: "06/28/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "neel",
        senderName: "Neel",
        senderRole: "Relationship Manager",
        senderColor: "neel",
        message: "The best compliment we can get! Yes, we have a referral program. More importantly, your transformation is inspiring others - that's the real magic of health optimization! I'll send details. 🌟",
        timestamp: "11:30 AM",
        date: "06/28/24",
        monthLabel: null,
        isFromMember: 0,
      },

      // July 2024 - Second Quarterly Review
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "6-month lab results are truly outstanding. LDL: 128 mg/dL (down 40 points from start!), HDL: 58 mg/dL, Triglycerides: 95 mg/dL, BP: 118/76. You've reversed significant cardiovascular risk. This is textbook lifestyle medicine success.",
        timestamp: "1:00 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "This is absolutely incredible! Can I share these results with my wife? She's been so supportive through this entire journey and deserves to see the numbers.",
        timestamp: "3:30 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "neel",
        senderName: "Neel",
        senderRole: "Relationship Manager",
        senderColor: "neel",
        message: "Absolutely! In fact, we'd love to invite her to a partner session next month. Understanding your support system helps us optimize your long-term success. What do you think? 💫",
        timestamp: "4:00 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "She would love that! She's been asking so many questions about the program.",
        timestamp: "4:15 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Your 6-month metrics summary is incredible: Sleep efficiency 86% (was 68%), HRV 42ms (was 28ms), resting HR 58 BPM (was 72). You've gained 10+ years of cardiovascular age back! 🎯",
        timestamp: "5:30 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "10 years younger? That's insane! I definitely feel it - keeping up with my kids is so much easier now.",
        timestamp: "7:00 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "Your food relationship transformation is my favorite part! From stressed about business dinners to confidently navigating any cuisine. You've become your own nutrition expert! 🍽️👨‍🍳",
        timestamp: "8:00 PM",
        date: "07/18/24",
        monthLabel: null,
        isFromMember: 0,
      },

      // August 2024 - Long-term Planning & Completion
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge",
        senderColor: "ruby",
        message: "Rohan, it's been an incredible 8 months! You've transformed not just your health markers, but your entire relationship with wellness. Ready to design your maintenance phase? We're thinking prevention-focused protocols now. 🌟",
        timestamp: "10:00 AM",
        date: "08/10/24",
        monthLabel: "August 2024 - Long-term Planning",
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Ruby, this experience has been life-changing. Yes to continuing! But I want to focus on maintaining what we've built while traveling. Can we do that?",
        timestamp: "2:15 PM",
        date: "08/10/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "advik",
        senderName: "Advik",
        senderRole: "Performance Scientist",
        senderColor: "advik",
        message: "Perfect timing! Your latest HRV shows you've adapted well to travel stress. We're designing \"maintenance mode\" protocols - 60% of current intensity, 90% of the results. Sustainability is the goal now. 📈",
        timestamp: "3:45 PM",
        date: "08/10/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Quick question about maintenance - I'm traveling to Japan next month for 2 weeks. Any specific protocols for such a long trip?",
        timestamp: "10:30 AM",
        date: "08/15/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "carla",
        senderName: "Carla",
        senderRole: "Nutritionist",
        senderColor: "carla",
        message: "Japan is amazing for healthy eating! Focus on traditional choices: miso soup, grilled fish, steamed rice in moderation. Avoid tempura and ramen broths. I'll send a Japan-specific guide with restaurant phrases! 🍣",
        timestamp: "11:00 AM",
        date: "08/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "rachel",
        senderName: "Rachel",
        senderRole: "Physiotherapist",
        senderColor: "rachel",
        message: "Japan = walking paradise! Average 15,000+ steps daily just exploring. Hotel gyms are excellent too. Your fitness level can handle the intensity now. Enjoy the adventure! 🏃‍♂️",
        timestamp: "11:15 AM",
        date: "08/15/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Team, I wanted to share something personal. My annual executive health check came back phenomenal - doctor was shocked at the improvement. Asked what I'd been doing differently. I told him about Elyx!",
        timestamp: "4:30 PM",
        date: "08/20/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "warren",
        senderName: "Dr. Warren",
        senderRole: "Medical Strategist",
        senderColor: "warren",
        message: "That's the ultimate validation! When other doctors notice the transformation, you know we've achieved something special. Your lipid panel, blood pressure, and metabolic markers tell a remarkable story.",
        timestamp: "5:00 PM",
        date: "08/20/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "neel",
        senderName: "Neel",
        senderRole: "Relationship Manager",
        senderColor: "neel",
        message: "Rohan, you've become a case study for us! Your consistency despite travel, willingness to adapt, and commitment to the process - that's what creates lasting transformation. Proud to have you on the team! 🌟",
        timestamp: "5:30 PM",
        date: "08/20/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "One more member-initiated question - my wife wants to start her own health journey. Can you recommend the best way for her to begin with Elyx?",
        timestamp: "8:00 AM",
        date: "08/25/24",
        monthLabel: null,
        isFromMember: 1,
      },
      {
        id: randomUUID(),
        senderId: "ruby",
        senderName: "Ruby",
        senderRole: "Concierge",
        senderColor: "ruby",
        message: "We'd be honored to work with her! I'll set up a personalized consultation. Having both partners on the journey creates incredible accountability and support. Let's make this a family transformation! 💫",
        timestamp: "9:30 AM",
        date: "08/25/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: "team",
        senderName: "Elyx Team",
        senderRole: "Team",
        senderColor: "whatsapp",
        message: "🎊 8-Month Journey Complete! 🎊\n\n✅ LDL cholesterol: 165→125 mg/dL\n✅ Sleep efficiency: 68%→82%\n✅ Exercise consistency: 0→4 days/week\n✅ Energy levels: Significantly improved\n✅ Travel wellness: Mastered\n\n\"The best investment you can make is in yourself.\" - Warren Buffett",
        timestamp: "5:00 PM",
        date: "08/31/24",
        monthLabel: null,
        isFromMember: 0,
      },
      {
        id: randomUUID(),
        senderId: null,
        senderName: "Rohan Patel",
        senderRole: null,
        senderColor: "whatsapp",
        message: "Thank you, team. This has been incredible. Here's to the next chapter! 🚀",
        timestamp: "5:30 PM",
        date: "08/31/24",
        monthLabel: null,
        isFromMember: 1,
      },
    ];

    conversations.forEach(conversation => this.conversations.set(conversation.id, conversation));
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() === dateB.getTime()) {
        const timeA = this.parseTime(a.timestamp);
        const timeB = this.parseTime(b.timestamp);
        return timeA - timeB;
      }
      return dateA.getTime() - dateB.getTime();
    });
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    const allConversations = await this.getConversations();
    const lowercaseQuery = query.toLowerCase();
    
    return allConversations.filter(conversation => 
      conversation.message.toLowerCase().includes(lowercaseQuery) ||
      conversation.senderName?.toLowerCase().includes(lowercaseQuery) ||
      conversation.senderRole?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getChatMessages(userId?: string, limit?: number): Promise<ChatMessage[]> {
    let messages = Array.from(this.chatMessages.values());
    
    // Filter by userId if provided (for future multi-user support)
    if (userId) {
      // For now, return all messages as we have single user
      // In future, filter by userId
    }
    
    // Sort by date and time
    messages = messages.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() === dateB.getTime()) {
        const timeA = this.parseTime(a.timestamp);
        const timeB = this.parseTime(b.timestamp);
        return timeA - timeB;
      }
      return dateA.getTime() - dateB.getTime();
    });
    
    // Apply limit if specified
    if (limit) {
      messages = messages.slice(-limit);
    }
    
    return messages;
  }

  async addChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...messageData,
      id: randomUUID(),
      senderId: messageData.senderId ?? null,
      senderName: messageData.senderName ?? null,
      senderRole: messageData.senderRole ?? null,
      senderColor: messageData.senderColor ?? null,
      isFromUser: messageData.isFromUser ?? 0,
      attachments: messageData.attachments ?? null,
    };
    
    this.chatMessages.set(message.id, message);
    return message;
  }

  async getUserFiles(): Promise<UserFile[]> {
    return Array.from(this.userFiles.values()).sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  async addUserFile(fileData: InsertUserFile): Promise<UserFile> {
    const file: UserFile = {
      ...fileData,
      id: randomUUID(),
      extractedText: fileData.extractedText ?? null,
      medicalData: fileData.medicalData ?? null,
    };
    
    this.userFiles.set(file.id, file);
    return file;
  }

  async getUserFileById(id: string): Promise<UserFile | null> {
    return this.userFiles.get(id) || null;
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async createUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const profile: UserProfile = {
      ...profileData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.userProfiles.set(profile.id, profile);
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existing = this.userProfiles.get(userId);
    if (!existing) {
      throw new Error("User profile not found");
    }
    
    const updated: UserProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.userProfiles.set(userId, updated);
    return updated;
  }

  // Medical History methods
  async getMedicalHistory(userId: string, category?: string): Promise<MedicalHistory[]> {
    const records = Array.from(this.medicalHistory.values())
      .filter(record => record.userId === userId);
    
    if (category) {
      return records.filter(record => record.category === category);
    }
    
    return records.sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
  }

  async addMedicalHistory(recordData: InsertMedicalHistory): Promise<MedicalHistory> {
    const record: MedicalHistory = {
      ...recordData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.medicalHistory.set(record.id, record);
    return record;
  }

  async updateMedicalHistory(recordId: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory> {
    const existing = this.medicalHistory.get(recordId);
    if (!existing) {
      throw new Error("Medical history record not found");
    }
    
    const updated: MedicalHistory = { ...existing, ...updates };
    this.medicalHistory.set(recordId, updated);
    return updated;
  }

  // Health Plans methods
  async getHealthPlans(userId: string, status?: string): Promise<HealthPlan[]> {
    const plans = Array.from(this.healthPlans.values())
      .filter(plan => plan.userId === userId);
    
    if (status) {
      return plans.filter(plan => plan.status === status);
    }
    
    return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addHealthPlan(planData: InsertHealthPlan): Promise<HealthPlan> {
    const plan: HealthPlan = {
      ...planData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.healthPlans.set(plan.id, plan);
    return plan;
  }

  async updateHealthPlan(planId: string, updates: Partial<HealthPlan>): Promise<HealthPlan> {
    const existing = this.healthPlans.get(planId);
    if (!existing) {
      throw new Error("Health plan not found");
    }
    
    const updated: HealthPlan = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.healthPlans.set(planId, updated);
    return updated;
  }

  // Risk Predictions methods
  async getRiskPredictions(userId: string): Promise<RiskPrediction[]> {
    return Array.from(this.riskPredictions.values())
      .filter(prediction => prediction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addRiskPrediction(predictionData: InsertRiskPrediction): Promise<RiskPrediction> {
    const prediction: RiskPrediction = {
      ...predictionData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.riskPredictions.set(prediction.id, prediction);
    return prediction;
  }

  // Travel Advisories methods
  async getTravelAdvisories(userId: string, status?: string): Promise<TravelAdvisory[]> {
    const advisories = Array.from(this.travelAdvisories.values())
      .filter(advisory => advisory.userId === userId);
    
    if (status) {
      return advisories.filter(advisory => advisory.status === status);
    }
    
    return advisories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addTravelAdvisory(advisoryData: InsertTravelAdvisory): Promise<TravelAdvisory> {
    const advisory: TravelAdvisory = {
      ...advisoryData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.travelAdvisories.set(advisory.id, advisory);
    return advisory;
  }

  async updateTravelAdvisory(advisoryId: string, updates: Partial<TravelAdvisory>): Promise<TravelAdvisory> {
    const existing = this.travelAdvisories.get(advisoryId);
    if (!existing) {
      throw new Error("Travel advisory not found");
    }
    
    const updated: TravelAdvisory = { ...existing, ...updates };
    this.travelAdvisories.set(advisoryId, updated);
    return updated;
  }

  // Session Context methods
  async getSessionContext(userId: string, sessionId?: string): Promise<SessionContext[]> {
    const contexts = Array.from(this.sessionContexts.values())
      .filter(context => context.userId === userId);
    
    if (sessionId) {
      return contexts.filter(context => context.sessionId === sessionId);
    }
    
    return contexts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addSessionContext(contextData: InsertSessionContext): Promise<SessionContext> {
    const context: SessionContext = {
      ...contextData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessionContexts.set(context.id, context);
    return context;
  }

  async updateSessionContext(contextId: string, updates: Partial<SessionContext>): Promise<SessionContext> {
    const existing = this.sessionContexts.get(contextId);
    if (!existing) {
      throw new Error("Session context not found");
    }
    
    const updated: SessionContext = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.sessionContexts.set(contextId, updated);
    return updated;
  }

  // Advanced search and analytics
  async searchMedicalRecords(userId: string, query: string): Promise<any[]> {
    const lowercaseQuery = query.toLowerCase();
    const results: any[] = [];
    
    // Search medical history
    const medicalRecords = await this.getMedicalHistory(userId);
    results.push(...medicalRecords.filter(record => 
      record.title.toLowerCase().includes(lowercaseQuery) ||
      record.notes?.toLowerCase().includes(lowercaseQuery) ||
      record.value?.toLowerCase().includes(lowercaseQuery)
    ).map(record => ({ ...record, type: 'medical_history' })));
    
    // Search health plans
    const healthPlans = await this.getHealthPlans(userId);
    results.push(...healthPlans.filter(plan => 
      plan.title.toLowerCase().includes(lowercaseQuery) ||
      plan.description.toLowerCase().includes(lowercaseQuery)
    ).map(plan => ({ ...plan, type: 'health_plan' })));
    
    return results;
  }

  async getPatientSummary(userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId);
    const medicalHistory = await this.getMedicalHistory(userId);
    const healthPlans = await this.getHealthPlans(userId, 'active');
    const riskPredictions = await this.getRiskPredictions(userId);
    const recentMessages = await this.getChatMessages(userId, 20);
    
    return {
      profile,
      medicalHistory: medicalHistory.slice(0, 10), // Last 10 records
      activeHealthPlans: healthPlans,
      riskPredictions,
      recentActivity: recentMessages.length,
      lastActive: recentMessages.length > 0 ? recentMessages[recentMessages.length - 1].date : null
    };
  }

  async getChatMessagesByDateRange(userId: string, startDate: string, endDate: string): Promise<ChatMessage[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.chatMessages.values())
      .filter(message => {
        const messageDate = new Date(message.date);
        return messageDate >= start && messageDate <= end;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private parseTime(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes;
  }

  private initializeMedicalData() {
    // Create sample user profile
    const userProfile: UserProfile = {
      id: "default-user",
      name: "Rohan Patel",
      age: 46,
      gender: "Male",
      chronicConditions: JSON.stringify(["Elevated Cholesterol", "Hypertension (Controlled)"]),
      travelFrequency: "Weekly business travel within APAC",
      lifestyleHabits: JSON.stringify({
        exercise: "3-4 times per week",
        diet: "Mediterranean-Asian fusion",
        smoking: "Never",
        alcohol: "Social drinking (2-3 drinks per week)",
        stress: "High due to work demands",
        sleep: "6-7 hours per night"
      }),
      emergencyContact: "Dr. Sarah Chen - Singapore General Hospital - +65 6222 3322",
      createdAt: "2024-05-15T08:00:00.000Z",
      updatedAt: new Date().toISOString(),
    };
    this.userProfiles.set(userProfile.id, userProfile);

    // Add sample medical history
    const medicalRecords: MedicalHistory[] = [
      {
        id: randomUUID(),
        userId: "default-user",
        category: "lab_result",
        title: "Total Cholesterol",
        value: "5.8",
        unit: "mmol/L",
        normalRange: "<5.2",
        status: "high",
        notes: "Improved from 6.4 mmol/L six months ago through lifestyle interventions",
        source: "chat_extraction",
        sourceFileId: null,
        recordedDate: "2024-12-01T00:00:00.000Z",
        createdAt: "2024-12-01T08:30:00.000Z",
      },
      {
        id: randomUUID(),
        userId: "default-user",
        category: "lab_result",
        title: "LDL Cholesterol",
        value: "3.2",
        unit: "mmol/L",
        normalRange: "<2.6",
        status: "high",
        notes: "Target is <2.6 mmol/L as per Singapore MOH guidelines for cardiovascular risk management",
        source: "chat_extraction",
        sourceFileId: null,
        recordedDate: "2024-12-01T00:00:00.000Z",
        createdAt: "2024-12-01T08:30:00.000Z",
      },
      {
        id: randomUUID(),
        userId: "default-user",
        category: "lab_result",
        title: "Blood Pressure",
        value: "125/82",
        unit: "mmHg",
        normalRange: "<120/80",
        status: "normal",
        notes: "Well controlled with lifestyle modifications. Monitor closely during travel stress",
        source: "chat_extraction",
        sourceFileId: null,
        recordedDate: "2024-12-10T00:00:00.000Z",
        createdAt: "2024-12-10T09:15:00.000Z",
      },
      {
        id: randomUUID(),
        userId: "default-user",
        category: "medication",
        title: "Atorvastatin",
        value: "20mg",
        unit: "daily",
        normalRange: "N/A",
        status: "normal",
        notes: "Prescribed for cholesterol management. Taking with evening meal as recommended by MOH guidelines",
        source: "manual_entry",
        sourceFileId: null,
        recordedDate: "2024-12-01T00:00:00.000Z",
        createdAt: "2024-12-01T08:30:00.000Z",
      },
      {
        id: randomUUID(),
        userId: "default-user",
        category: "allergy",
        title: "Shellfish Allergy",
        value: "Moderate",
        unit: "severity",
        normalRange: "N/A",
        status: "normal",
        notes: "Causes hives and digestive upset. Carries EpiPen for severe reactions. Important for Singapore dining precautions",
        source: "manual_entry",
        sourceFileId: null,
        recordedDate: "2024-05-15T00:00:00.000Z",
        createdAt: "2024-05-15T08:00:00.000Z",
      }
    ];

    medicalRecords.forEach(record => {
      this.medicalHistory.set(record.id, record);
    });

    // Add sample health plans
    const healthPlans: HealthPlan[] = [
      {
        id: randomUUID(),
        userId: "default-user",
        title: "Cholesterol Management Program",
        description: "Comprehensive lifestyle intervention to reduce LDL cholesterol to target levels through Singapore-appropriate dietary changes and exercise",
        actionSteps: JSON.stringify([
          "Reduce saturated fat to <7% of total calories",
          "Increase soluble fiber to 25g daily (oats, barley, local fruits)",
          "Exercise 150 minutes moderate intensity per week",
          "Weight management target: reduce 5-7% current weight",
          "Monthly lipid monitoring",
          "Quarterly specialist review"
        ]),
        responsibleSpecialist: "Carla (Nutritionist) + Dr. Warren (Medical Strategist)",
        timeline: "6-month intensive phase, then maintenance",
        progressTracker: JSON.stringify({
          cholesterolTarget: "5.2 mmol/L",
          currentLevel: "5.8 mmol/L",
          weightTarget: "75kg",
          currentWeight: "79kg",
          exerciseGoal: "150 min/week",
          exerciseCompliance: "85%"
        }),
        riskAlerts: JSON.stringify([
          "Travel stress may affect compliance",
          "Monitor blood pressure during weight loss",
          "Adjust medication if diet changes are insufficient"
        ]),
        citations: JSON.stringify([
          "MOH Clinical Practice Guidelines: Lipid Management",
          "Singapore Heart Foundation Dietary Guidelines",
          "WHO Cardiovascular Disease Prevention Guidelines"
        ]),
        status: "active",
        createdAt: "2024-05-15T08:00:00.000Z",
        updatedAt: new Date().toISOString(),
        reviewDate: "2025-01-15T00:00:00.000Z",
      },
      {
        id: randomUUID(),
        userId: "default-user",
        title: "Travel Health Management",
        description: "Customized health maintenance strategy for frequent APAC business traveler",
        actionSteps: JSON.stringify([
          "Maintain exercise routine with hotel gyms/bodyweight exercises",
          "Pack healthy snacks for long flights",
          "Stay hydrated - 250ml water per hour of flight",
          "Manage jet lag with melatonin and light therapy",
          "Schedule health checks around travel calendar",
          "Carry travel health kit with medications"
        ]),
        responsibleSpecialist: "Neel (Relationship Manager)",
        timeline: "Ongoing with quarterly reviews",
        progressTracker: JSON.stringify({
          travelDays: "12 days/month average",
          healthCompliance: "78%",
          fitnessMaintenanceDuringTravel: "60%",
          jetlagRecoveryTime: "2-3 days"
        }),
        riskAlerts: JSON.stringify([
          "Increased stress during peak travel seasons",
          "Diet compliance challenges in different countries",
          "Medication timing across time zones"
        ]),
        citations: JSON.stringify([
          "MOH Travel Health Advisory Guidelines",
          "WHO International Travel and Health",
          "Singapore Aviation Medicine Guidelines"
        ]),
        status: "active",
        createdAt: "2024-06-01T08:00:00.000Z",
        updatedAt: new Date().toISOString(),
        reviewDate: "2025-03-01T00:00:00.000Z",
      }
    ];

    healthPlans.forEach(plan => {
      this.healthPlans.set(plan.id, plan);
    });

    // Add sample risk predictions
    const riskPredictions: RiskPrediction[] = [
      {
        id: randomUUID(),
        userId: "default-user",
        riskType: "cardiovascular_disease",
        riskPercentage: 15,
        contributingFactors: JSON.stringify([
          "Elevated LDL cholesterol (3.2 mmol/L)",
          "Male gender",
          "Age 46",
          "High-stress occupation",
          "Family history of heart disease",
          "Frequent travel stress"
        ]),
        preventionSteps: JSON.stringify([
          "Continue cholesterol management program",
          "Maintain regular exercise routine",
          "Stress management techniques",
          "Annual cardiac screening",
          "Maintain healthy weight",
          "Regular blood pressure monitoring"
        ]),
        confidence: 85,
        basedOnData: "Lab results, lifestyle factors, family history, and Singapore Heart Foundation risk calculator",
        createdAt: new Date().toISOString(),
        validUntil: "2025-12-15T00:00:00.000Z",
      },
      {
        id: randomUUID(),
        userId: "default-user",
        riskType: "diabetes_type2",
        riskPercentage: 8,
        contributingFactors: JSON.stringify([
          "Age 46",
          "Stress eating patterns",
          "Irregular meal timing due to travel",
          "Asian ethnicity (higher diabetes risk in Singapore)",
          "Metabolic syndrome markers"
        ]),
        preventionSteps: JSON.stringify([
          "HbA1c monitoring every 6 months",
          "Weight management",
          "Regular meal timing",
          "Reduce refined carbohydrates",
          "Monitor fasting glucose quarterly"
        ]),
        confidence: 75,
        basedOnData: "Ethnicity, lifestyle patterns, and Singapore diabetes risk factors",
        createdAt: new Date().toISOString(),
        validUntil: "2025-12-15T00:00:00.000Z",
      }
    ];

    riskPredictions.forEach(prediction => {
      this.riskPredictions.set(prediction.id, prediction);
    });
  }
}

export const storage = new MemStorage();
