import * as fs from "fs";
import * as path from "path";
import { GoogleGenAI } from "@google/genai";
import type { LabResult, AIAnalysisResult } from "@shared/schema";

// Dynamic import to avoid pdf-parse test file issues
let pdfParse: any = null;
let sharp: any = null;

const initializeDependencies = async () => {
  if (!pdfParse) {
    try {
      pdfParse = (await import("pdf-parse")).default;
    } catch (error) {
      console.warn("PDF parsing not available:", error);
    }
  }
  if (!sharp) {
    try {
      sharp = (await import("sharp")).default;
    } catch (error) {
      console.warn("Image processing not available:", error);
    }
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class FileProcessor {
  private uploadDir = "uploads";

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    // Initialize dependencies asynchronously
    initializeDependencies();
  }

  async processUploadedFile(file: Express.Multer.File): Promise<{
    extractedText?: string;
    medicalData?: any;
    analysisResults?: AIAnalysisResult;
    linkedGuidelines?: string[];
  }> {
    const fileType = file.mimetype;
    const result: any = {};

    try {
      if (fileType === "application/pdf") {
        result.extractedText = await this.extractTextFromPDF(file.buffer);
        result.medicalData = await this.extractMedicalDataFromText(result.extractedText);
      } else if (fileType.startsWith("image/")) {
        // Process medical images
        result.analysisResults = await this.analyzeMedicalImage(file.buffer, fileType);
        result.extractedText = await this.extractTextFromImage(file.buffer);
      }

      // Link relevant guidelines
      if (result.medicalData || result.analysisResults) {
        result.linkedGuidelines = await this.linkRelevantGuidelines(
          result.medicalData || result.analysisResults
        );
      }

      return result;
    } catch (error) {
      console.error("File processing error:", error);
      throw new Error("Failed to process uploaded file");
    }
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      await initializeDependencies();
      if (!pdfParse) {
        throw new Error("PDF parsing not available");
      }
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  private async extractTextFromImage(buffer: Buffer): Promise<string> {
    try {
      // Convert image to base64 for Gemini Vision API
      const base64Image = buffer.toString("base64");
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg",
            },
          },
          "Extract all readable text from this medical image or document. Include any numbers, labels, test results, and medical terminology."
        ],
      });

      return response.text || "";
    } catch (error) {
      console.error("Image text extraction error:", error);
      return "";
    }
  }

  private async analyzeMedicalImage(buffer: Buffer, mimeType: string): Promise<AIAnalysisResult> {
    try {
      const base64Image = buffer.toString("base64");
      
      const analysisPrompt = `You are a medical AI assistant analyzing a medical image. Provide a detailed analysis following Singapore MOH guidelines.

Analyze this medical image and provide:
1. Key findings and observations
2. Any abnormalities or areas of concern
3. Recommendations for follow-up
4. Confidence level in your analysis (0-100)
5. Whether this requires immediate medical attention
6. Relevant Singapore MOH or international medical guidelines

Respond in JSON format:
{
  "findings": ["finding1", "finding2"],
  "abnormalities": ["abnormality1", "abnormality2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "confidence": 85,
  "requiresFollowUp": true,
  "linkedGuidelines": ["MOH guideline 1", "WHO guideline 2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
          analysisPrompt
        ],
      });

      if (response.text) {
        return JSON.parse(response.text);
      }

      throw new Error("No analysis result received");
    } catch (error) {
      console.error("Medical image analysis error:", error);
      return {
        findings: ["Unable to analyze image due to technical error"],
        abnormalities: [],
        recommendations: ["Please consult with a healthcare professional for proper analysis"],
        confidence: 0,
        requiresFollowUp: true,
        linkedGuidelines: []
      };
    }
  }

  private async extractMedicalDataFromText(text: string): Promise<LabResult[]> {
    try {
      const extractionPrompt = `Extract all lab results and medical data from this text. Focus on:
- Test names and values
- Units of measurement
- Normal ranges if provided
- Any indicators of abnormal results

Text: ${text}

Respond in JSON format as an array of lab results:
[
  {
    "testName": "Total Cholesterol",
    "value": "245",
    "unit": "mg/dL",
    "normalRange": "<200",
    "status": "high",
    "category": "lipid_panel"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
        },
        contents: extractionPrompt,
      });

      if (response.text) {
        return JSON.parse(response.text);
      }

      return [];
    } catch (error) {
      console.error("Medical data extraction error:", error);
      return [];
    }
  }

  private async linkRelevantGuidelines(medicalData: any): Promise<string[]> {
    try {
      const guidelinePrompt = `Based on this medical data, identify relevant Singapore MOH, WHO, and international medical guidelines:

Medical Data: ${JSON.stringify(medicalData)}

Return an array of relevant guidelines with citations:
["MOH Clinical Practice Guidelines for Diabetes Mellitus", "WHO Guidelines for Hypertension Management"]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: guidelinePrompt,
      });

      if (response.text) {
        return JSON.parse(response.text);
      }

      return [];
    } catch (error) {
      console.error("Guideline linking error:", error);
      return [];
    }
  }

  async processAndOptimizeImage(buffer: Buffer, maxWidth = 800): Promise<Buffer> {
    try {
      await initializeDependencies();
      if (!sharp) {
        console.warn("Image optimization not available, returning original buffer");
        return buffer;
      }
      return await sharp(buffer)
        .resize(maxWidth, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error("Image optimization error:", error);
      return buffer;
    }
  }
}

export const fileProcessor = new FileProcessor();