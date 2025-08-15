import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  color: text("color").notNull(),
  avatar: text("avatar").notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey(),
  senderId: text("sender_id"), // null for member messages
  senderName: text("sender_name"),
  senderRole: text("sender_role"),
  senderColor: text("sender_color"),
  message: text("message").notNull(),
  timestamp: text("timestamp").notNull(),
  date: text("date").notNull(),
  monthLabel: text("month_label"),
  isFromMember: integer("is_from_member").notNull().default(0), // 0 for team, 1 for member
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey(),
  senderId: text("sender_id"), // null for user messages
  senderName: text("sender_name"),
  senderRole: text("sender_role"),
  senderColor: text("sender_color"),
  message: text("message").notNull(),
  timestamp: text("timestamp").notNull(),
  date: text("date").notNull(),
  isFromUser: integer("is_from_user").notNull().default(0), // 0 for specialist, 1 for user
  attachments: text("attachments"), // JSON string of file attachments
});

export const userFiles = pgTable("user_files", {
  id: varchar("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadDate: text("upload_date").notNull(),
  extractedText: text("extracted_text"), // For PDFs and images with text
  medicalData: text("medical_data"), // JSON string of extracted health data
  analysisResults: text("analysis_results"), // AI analysis of medical images/reports
  linkedGuidelines: text("linked_guidelines"), // MOH/WHO guidelines referenced
});

// User profile and medical history
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  chronicConditions: text("chronic_conditions"), // JSON array
  travelFrequency: text("travel_frequency"),
  lifestyleHabits: text("lifestyle_habits"), // JSON object
  emergencyContact: text("emergency_contact"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Medical history and test results
export const medicalHistory = pgTable("medical_history", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(), // "lab_result", "diagnosis", "medication", "allergy", etc.
  title: text("title").notNull(),
  value: text("value"), // Numerical value if applicable
  unit: text("unit"), // mg/dL, mmHg, etc.
  normalRange: text("normal_range"),
  status: text("status"), // "normal", "high", "low", "critical"
  notes: text("notes"),
  source: text("source"), // "uploaded_file", "chat_extraction", "manual_entry"
  sourceFileId: varchar("source_file_id"),
  recordedDate: text("recorded_date").notNull(),
  createdAt: text("created_at").notNull(),
});

// Health plans and recommendations
export const healthPlans = pgTable("health_plans", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  actionSteps: text("action_steps"), // JSON array
  responsibleSpecialist: text("responsible_specialist"),
  timeline: text("timeline"),
  progressTracker: text("progress_tracker"), // JSON object
  riskAlerts: text("risk_alerts"), // JSON array
  citations: text("citations"), // MOH, WHO, UpToDate references
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  reviewDate: text("review_date"),
});

// Risk predictions
export const riskPredictions = pgTable("risk_predictions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  riskType: text("risk_type").notNull(), // "heart_disease", "diabetes", "hypertension", etc.
  riskPercentage: integer("risk_percentage").notNull(),
  contributingFactors: text("contributing_factors"), // JSON array
  preventionSteps: text("prevention_steps"), // JSON array
  confidence: integer("confidence"), // AI confidence level 0-100
  basedOnData: text("based_on_data"), // What data was used for prediction
  createdAt: text("created_at").notNull(),
  validUntil: text("valid_until"),
});

// Travel health advisories
export const travelAdvisories = pgTable("travel_advisories", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  destination: text("destination").notNull(),
  travelDate: text("travel_date"),
  returnDate: text("return_date"),
  requiredVaccines: text("required_vaccines"), // JSON array
  healthRisks: text("health_risks"), // JSON array
  preventiveSteps: text("preventive_steps"), // JSON array
  localHealthcareInfo: text("local_healthcare_info"),
  emergencyNumbers: text("emergency_numbers"), // JSON object
  adjustedHealthPlan: varchar("adjusted_health_plan_id"),
  mohAdvisories: text("moh_advisories"), // Links to MOH travel advisories
  whoAdvisories: text("who_advisories"), // Links to WHO advisories
  createdAt: text("created_at").notNull(),
  status: text("status").default("active"), // active, completed, cancelled
});

// Session context for conversation memory
export const sessionContext = pgTable("session_context", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  conversationSummary: text("conversation_summary"), // AI-generated summary of session
  keyTopics: text("key_topics"), // JSON array of discussed topics
  specialistsInvolved: text("specialists_involved"), // JSON array
  actionItems: text("action_items"), // JSON array
  followUpNeeded: text("follow_up_needed"), // JSON array
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertConversationSchema = createInsertSchema(conversations);
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });
export const insertUserFileSchema = createInsertSchema(userFiles).omit({ id: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({ id: true });
export const insertHealthPlanSchema = createInsertSchema(healthPlans).omit({ id: true });
export const insertRiskPredictionSchema = createInsertSchema(riskPredictions).omit({ id: true });
export const insertTravelAdvisorySchema = createInsertSchema(travelAdvisories).omit({ id: true });
export const insertSessionContextSchema = createInsertSchema(sessionContext).omit({ id: true });

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UserFile = typeof userFiles.$inferSelect;
export type InsertUserFile = z.infer<typeof insertUserFileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type HealthPlan = typeof healthPlans.$inferSelect;
export type InsertHealthPlan = z.infer<typeof insertHealthPlanSchema>;
export type RiskPrediction = typeof riskPredictions.$inferSelect;
export type InsertRiskPrediction = z.infer<typeof insertRiskPredictionSchema>;
export type TravelAdvisory = typeof travelAdvisories.$inferSelect;
export type InsertTravelAdvisory = z.infer<typeof insertTravelAdvisorySchema>;
export type SessionContext = typeof sessionContext.$inferSelect;
export type InsertSessionContext = z.infer<typeof insertSessionContextSchema>;

// File attachment interface for chat messages
export interface FileAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
}

// Emergency detection interface
export interface EmergencyAlert {
  isEmergency: boolean;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  symptoms: string[];
  recommendations: string[];
  emergencyNumber: string;
}

// Lab result extraction interface
export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "high" | "low" | "critical";
  category: string;
}

// AI Analysis result interface
export interface AIAnalysisResult {
  findings: string[];
  abnormalities: string[];
  recommendations: string[];
  confidence: number;
  requiresFollowUp: boolean;
  linkedGuidelines: string[];
}
