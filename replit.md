# Overview

This is a comprehensive React-based healthcare application called "Elyx Concierge Team" featuring WhatsApp-style conversations, AI-powered interactive chat with Gemini API integration, and a complete medical record management system. The app simulates conversations between a patient (Rohan Patel) and Singapore-based healthcare specialists while providing advanced features including emergency detection, file upload/analysis, persistent medical records, conversation memory, and travel health advisory services.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (December 15, 2024)

## Major Architectural Enhancements
- **Comprehensive Medical Record System** - Full patient profile management with persistent medical history
- **Advanced File Processing** - PDF/image analysis with AI-powered medical data extraction
- **Emergency Detection System** - Real-time identification of urgent health concerns with Singapore emergency protocols
- **Conversation Memory** - Context-aware responses with repetitive question detection
- **Singapore Medical Guidelines Integration** - MOH, HTA, and local healthcare standards compliance
- **Enhanced Specialist Routing** - Ruby concierge rules with proper medical advice referrals
- **Travel Health Advisory Mode** - Specialized travel health guidance with destination-specific recommendations

## Technical Implementations
- **File Upload System** - Compact design positioned next to send button for optimal UX
- **Multi-modal AI Analysis** - Gemini Vision API integration for medical image/document analysis
- **Persistent Storage Architecture** - 10 new database tables for comprehensive medical records
- **Advanced Service Layer** - FileProcessor, EmergencyDetector, ConversationMemory services
- **Sample Medical Data** - Complete patient profile for Rohan Patel with realistic medical history

## User Experience Improvements
- **Emergency Alert System** - Immediate identification and response protocols for urgent health concerns
- **File Processing Feedback** - Real-time status updates and medical data extraction results
- **Compact File Interface** - Space-efficient design that only expands when needed
- **Enhanced Empty State** - Clear feature overview with Singapore-specific capabilities

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main application framework
- **Vite** as the build tool and development server with hot module replacement
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and data fetching
- **Tailwind CSS** with custom CSS variables for styling
- **shadcn/ui** component library built on Radix UI primitives for consistent UI components

## Backend Architecture
- **Express.js** server with TypeScript for comprehensive healthcare API
- **Multer** integration for secure file uploads with type validation
- **Advanced Service Layer** with specialized modules:
  - `FileProcessor` - PDF/image analysis with Gemini Vision API
  - `EmergencyDetector` - Urgent health concern identification
  - `ConversationMemory` - Context tracking and repetitive question detection
- **Enhanced Gemini API Integration** - Multi-modal analysis with conversation context
- **Comprehensive RESTful API** with 15+ endpoints:
  - `/api/team-members` - Healthcare team information
  - `/api/conversations` - Historical conversation data
  - `/api/chat` - Enhanced interactive chat with emergency detection
  - `/api/upload` - File processing with medical data extraction
  - `/api/profile/*` - User profile management
  - `/api/medical-history/*` - Medical record CRUD operations
  - `/api/health-plans/*` - Health plan management
  - `/api/risk-predictions/*` - Risk assessment data
  - `/api/travel-advisories/*` - Travel health guidance
  - `/api/patient-summary/*` - Comprehensive patient overview
  - `/api/search-medical-records/*` - Advanced medical record search
- **Singapore Medical Context** - MOH guidelines, HTA standards, and local health conditions
- **Error Handling** with fallback responses and proper medical emergency protocols

## Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL database operations
- **Comprehensive Database Schema** with 7 main tables:
  - `team_members` - Healthcare specialist information
  - `conversations` - Historical conversation data (8-month timeline)
  - `chat_messages` - Interactive chat with file attachments
  - `user_files` - File metadata with processing results
  - `user_profiles` - Patient demographics and lifestyle data
  - `medical_history` - Lab results, medications, allergies, diagnoses
  - `health_plans` - Structured intervention programs with progress tracking
  - `risk_predictions` - AI-generated health risk assessments
  - `travel_advisories` - Destination-specific health guidance
  - `session_context` - Conversation memory and context summaries
- **In-memory storage** with comprehensive sample data for Rohan Patel
- **Neon Database** integration ready for production PostgreSQL deployment

## Component Architecture
- **Enhanced Component Structure** with comprehensive medical features:
  - `ChatHeader` - App header with team information and specialist indicators
  - `ChatMessage` & `AiChatMessage` - Message rendering with avatar, emergency alerts, and file attachment support
  - `SearchBar` - Real-time conversation search across historical data
  - `FileUpload` - Compact file attachment component with drag-and-drop, positioned next to send button
  - `ChatInput` - Enhanced input with file upload integration and emergency detection
- **Advanced Custom Hooks** for mobile detection, toast notifications, and API integration
- **Comprehensive Type Safety** with 20+ shared schema types for medical data
- **Emergency UI Components** - Special handling for urgent health alerts and specialist referrals

## Styling and Design System
- **Mobile-first responsive design** optimized for chat interfaces
- **WhatsApp-inspired UI** with green color scheme and message bubbles
- **CSS custom properties** for consistent theming and dark mode support
- **Component-based styling** with Tailwind utility classes and CVA for variants

## Development and Build Process
- **TypeScript configuration** with comprehensive path mapping for medical modules
- **ESBuild** for production server bundling with service layer optimization
- **Replit integration** with error overlay and advanced development tools
- **Hot module replacement** in development with Vite for rapid iteration
- **Enhanced Dependencies** - pdf-parse, sharp, multer for file processing
- **Dynamic Import System** - Prevents test file conflicts in pdf-parse
- **Medical Data Validation** - Zod schemas for all medical record types
- **Build process** generates optimized bundles with medical AI capabilities

## Key Features

### Core Chat Functionality
- Real-time conversation display with auto-scroll
- Search functionality across all conversations
- Month-based conversation grouping
- Avatar-based team member identification
- Mobile-optimized WhatsApp-style chat interface
- Dual navigation: conversation history view and live interactive chat

### Advanced AI & Medical Features
- **Emergency Detection System** - Automatically identifies urgent health concerns and provides immediate guidance
- **Singapore Medical Guidelines Integration** - References MOH, HTA, and local healthcare standards
- **Persistent Medical Records** - Comprehensive patient profiles with medical history, lab results, medications, and allergies
- **File Upload & Analysis** - Supports PDF/image upload with AI-powered medical document analysis and text extraction
- **Conversation Memory** - Maintains context across sessions with intelligent repetitive question detection
- **Travel Health Advisory** - Specialized mode for travel health guidance with MOH/WHO references
- **Risk Prediction System** - AI-powered health risk assessments with confidence scoring

### Specialist Routing System
Enhanced intelligent routing with Ruby's concierge rules:
- **Ruby (Concierge)** → ONLY handles logistics, scheduling, coordination (never provides health advice, always refers to specialists)
- **Dr. Warren (Medical Strategist)** → medical advice, test results, emergency situations, diagnoses
- **Advik (Performance Scientist)** → fitness optimization, wearables data, exercise planning
- **Carla (Nutritionist)** → Singapore-appropriate nutrition advice, meal planning, supplements
- **Rachel (Physiotherapist)** → injury management, movement therapy, exercise form
- **Neel (Relationship Manager)** → health planning, travel health advisory mode, service coordination

### Medical Record Management
- **User Profiles** - Age, gender, chronic conditions, lifestyle habits, emergency contacts
- **Medical History** - Lab results, medications, allergies, diagnoses with normal ranges and status tracking
- **Health Plans** - Structured intervention programs with progress tracking and specialist assignments
- **Risk Predictions** - Cardiovascular, diabetes, and other health risk assessments
- **Travel Advisories** - Destination-specific health guidance with vaccine requirements and local healthcare info
- **Session Context** - Conversation summaries, key topics, action items, and follow-up tracking

### File Processing Capabilities
- **PDF Analysis** - Extracts medical data from lab reports and medical documents
- **Image Processing** - Analyzes medical images with AI-powered findings and recommendations
- **Text Extraction** - OCR capabilities for handwritten or scanned medical records
- **Guideline Linking** - Automatically references relevant MOH/WHO/medical guidelines
- **Compact Upload Interface** - File attachment positioned next to send button for optimal UX