import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateSpecialistResponse } from "./gemini";
import { fileProcessor } from "./services/fileProcessor";
import { conversationMemory } from "./services/conversationMemory";
import { 
  insertChatMessageSchema, 
  insertUserProfileSchema,
  insertMedicalHistorySchema,
  insertHealthPlanSchema,
  type FileAttachment 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all team members
  app.get("/api/team-members", async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Search conversations
  app.get("/api/conversations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const conversations = await storage.searchConversations(query);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to search conversations" });
    }
  });

  // Get all chat messages
  app.get("/api/chat-messages", async (req, res) => {
    try {
      const chatMessages = await storage.getChatMessages();
      res.json(chatMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Enhanced chat endpoint with comprehensive medical record integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, files, userId = "default-user", sessionId = "current-session" } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: "Message is required" });
      }

      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const date = now.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      });

      // Process file attachments if any
      let fileContext = "";
      let attachments = null;
      let processedFiles: any[] = [];
      
      if (files && Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          try {
            // In a real implementation with actual file uploads, you would process the buffer
            // For now, we'll simulate file processing
            const fileData = await storage.addUserFile({
              fileName: file.fileName,
              originalName: file.originalName,
              fileType: file.fileType,
              fileSize: file.fileSize,
              uploadDate: now.toISOString(),
              extractedText: null,
              medicalData: null,
              analysisResults: null,
              linkedGuidelines: null,
            });
            
            processedFiles.push(fileData);
          } catch (fileError) {
            console.error("File processing error:", fileError);
          }
        }
        
        const fileNames = files.map((f: FileAttachment) => f.originalName).join(", ");
        fileContext = `\n\n[User attached files: ${fileNames}]`;
        attachments = JSON.stringify(files);
      }

      // Store user message
      const userMessage = await storage.addChatMessage({
        senderId: null,
        senderName: "You",
        senderRole: null,
        senderColor: "user",
        message: message.trim() + fileContext,
        timestamp,
        date,
        isFromUser: 1,
        attachments,
      });

      // Generate AI response with enhanced context and medical record integration
      const fullQuery = message.trim() + fileContext;
      const aiResult = await generateSpecialistResponse(fullQuery, userId, sessionId);

      // Store AI response
      const aiMessage = await storage.addChatMessage({
        senderId: aiResult.specialist.id,
        senderName: aiResult.specialist.name,
        senderRole: aiResult.specialist.role,
        senderColor: aiResult.specialist.color,
        message: aiResult.response,
        timestamp,
        date,
        isFromUser: 0,
        attachments: null,
      });

      // Update session context
      try {
        const sessionMessages = [userMessage, aiMessage];
        const sessionSummary = await conversationMemory.summarizeSessionForStorage(
          sessionMessages, sessionId, userId
        );
        
        await storage.addSessionContext({
          userId,
          sessionId,
          conversationSummary: sessionSummary.conversationSummary,
          keyTopics: JSON.stringify(sessionSummary.keyTopics),
          specialistsInvolved: JSON.stringify(sessionSummary.specialistsInvolved),
          actionItems: JSON.stringify(sessionSummary.actionItems),
          followUpNeeded: JSON.stringify(sessionSummary.followUpNeeded),
        });
      } catch (contextError) {
        console.error("Session context storage error:", contextError);
      }

      res.json({
        userMessage,
        aiMessage,
        specialist: aiResult.specialist,
        emergencyAlert: aiResult.emergencyAlert,
        needsReferral: aiResult.needsReferral,
        referredSpecialist: aiResult.referredSpecialist,
        processedFiles
      });

    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.array('files', 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.body.userId || "default-user";
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const processedFiles = [];
      
      for (const file of files) {
        try {
          // Process the uploaded file
          const processingResult = await fileProcessor.processUploadedFile(file);
          
          // Store file metadata and processing results
          const fileData = await storage.addUserFile({
            fileName: file.filename || file.originalname,
            originalName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            extractedText: processingResult.extractedText || null,
            medicalData: processingResult.medicalData ? JSON.stringify(processingResult.medicalData) : null,
            analysisResults: processingResult.analysisResults ? JSON.stringify(processingResult.analysisResults) : null,
            linkedGuidelines: processingResult.linkedGuidelines ? JSON.stringify(processingResult.linkedGuidelines) : null,
          });

          // Extract medical data to medical history if available
          if (processingResult.medicalData && Array.isArray(processingResult.medicalData)) {
            for (const labResult of processingResult.medicalData) {
              await storage.addMedicalHistory({
                userId,
                category: labResult.category || "lab_result",
                title: labResult.testName,
                value: labResult.value,
                unit: labResult.unit,
                normalRange: labResult.normalRange,
                status: labResult.status,
                notes: `Extracted from uploaded file: ${file.originalname}`,
                source: "uploaded_file",
                sourceFileId: fileData.id,
                recordedDate: new Date().toISOString(),
              });
            }
          }

          processedFiles.push({
            ...fileData,
            processingResult
          });

        } catch (fileError) {
          console.error(`File processing error for ${file.originalname}:`, fileError);
          processedFiles.push({
            filename: file.originalname,
            error: "Failed to process file"
          });
        }
      }

      res.json({
        message: "Files uploaded and processed successfully",
        files: processedFiles
      });

    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // User profile management
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user profile" });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      const profile = await storage.updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Medical history management
  app.get("/api/medical-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { category } = req.query;
      const history = await storage.getMedicalHistory(userId, category as string);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical history" });
    }
  });

  app.post("/api/medical-history", async (req, res) => {
    try {
      const recordData = insertMedicalHistorySchema.parse(req.body);
      const record = await storage.addMedicalHistory(recordData);
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to add medical history record" });
    }
  });

  // Health plans management
  app.get("/api/health-plans/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;
      const plans = await storage.getHealthPlans(userId, status as string);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health plans" });
    }
  });

  app.post("/api/health-plans", async (req, res) => {
    try {
      const planData = insertHealthPlanSchema.parse(req.body);
      const plan = await storage.addHealthPlan(planData);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create health plan" });
    }
  });

  // Risk predictions
  app.get("/api/risk-predictions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const predictions = await storage.getRiskPredictions(userId);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk predictions" });
    }
  });

  // Travel advisories
  app.get("/api/travel-advisories/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;
      const advisories = await storage.getTravelAdvisories(userId, status as string);
      res.json(advisories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch travel advisories" });
    }
  });

  // Patient summary endpoint for comprehensive overview
  app.get("/api/patient-summary/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const summary = await storage.getPatientSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient summary" });
    }
  });

  // Advanced search across medical records
  app.get("/api/search-medical-records/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const results = await storage.searchMedicalRecords(userId, q);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search medical records" });
    }
  });

  // Enhanced chat messages endpoint with user filtering
  app.get("/api/chat-messages", async (req, res) => {
    try {
      const { userId, limit } = req.query;
      const chatMessages = await storage.getChatMessages(
        userId as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(chatMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
