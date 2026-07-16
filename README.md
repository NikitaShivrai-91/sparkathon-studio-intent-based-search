# Sparkathon Studio Intent-Based Search

🤖 **AI-Powered Natural Language Search for DataMaps using AWS Bedrock (Claude Sonnet 4.5)**

This prototype demonstrates intelligent, intent-based search capabilities for ACD Studio DataMaps using AWS Bedrock's Claude AI.

## 🌟 Features

- **Natural Language Search**: Search using plain English queries instead of exact keyword matching
- **Semantic Understanding**: AI understands intent and context, not just keywords
- **AI Explanations**: Get plain-English explanations of any DataMap
- **Real-time Search**: Fast, responsive search powered by Claude Sonnet 4.5
- **Token Usage Tracking**: Monitor AI API usage
- **Example Queries**: Built-in example searches to get started quickly

## 🏗️ Architecture

```
┌──────────────────────────┐
│   Angular Frontend       │
│   (Port 4200)            │
│   - Search UI            │
│   - Results Display      │
│   - AI Explanations      │
└────────────┬─────────────┘
             │ HTTP/REST
             ↓
┌──────────────────────────┐
│   Express API Server     │
│   (Port 3000)            │
│   - Search Endpoint      │
│   - Explain Endpoint     │
│   - Mock Data Loading    │
└────────────┬─────────────┘
             │ AWS SDK
             ↓
┌──────────────────────────┐
│   AWS Bedrock            │
│   Claude Sonnet 4.5      │
│   (us-east-1)            │
└──────────────────────────┘
```

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Angular CLI** 17+
- **AWS Credentials** configured (AWS CLI or environment variables)
- **AWS Bedrock Access** with Claude models enabled in us-east-1

## 🚀 Quick Start

### 1. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 2. Start the Backend API

```bash
cd backend
npm start
```

The API will start on `http://localhost:3000`

### 3. Start the Angular Frontend

In a new terminal:

```bash
ng serve
```

Navigate to `http://localhost:4200/`

## 🔍 Usage

### Example Natural Language Queries

Try these searches:

- **"show me billing rules and pricing"**
- **"find configuration for customer service"**
- **"agent skills and team assignments"**
- **"holiday schedule"**
- **"queue settings and SLA metrics"**
- **"escalation procedures"**

### AI Features

1. **Smart Search**: Type a natural language query and click the ✨ button
2. **Get Explanations**: Click the 🧠 icon on any DataMap to get an AI-generated explanation
3. **View Token Usage**: See how many tokens were used for each search
4. **Example Queries**: Click on suggested queries to see how it works

## 📊 Mock Data

The prototype includes 10 realistic DataMaps located in: `src/app/shared/data/mock-datamaps.json`

## 🔧 Configuration

### AWS Bedrock Settings

- **Region**: `us-east-1`
- **Model**: `anthropic.claude-sonnet-4-5-20250929-v1:0`
- **Max Tokens**: 4096

## 🧪 Testing the Prototype

### Health Check
```bash
curl http://localhost:3000/health
```

### Natural Language Search
```bash
curl -X POST http://localhost:3000/api/datamaps/search \
  -H "Content-Type: application/json" \
  -d '{"prompt": "find billing and pricing rules"}'
```

## 🐛 Troubleshooting

### Backend won't start
- Check AWS credentials: `aws sts get-caller-identity`
- Verify Bedrock access in us-east-1 region
- Check port 3000 is available: `netstat -ano | findstr :3000` (Windows) or `lsof -ti:3000` (Mac/Linux)
- Install backend dependencies: `cd backend && npm install`

### Empty table / No data visible
- **Most common issue:** Backend is not running
- Start backend first: `cd backend && npm start`
- Wait for "Loaded DataMaps: 10" message
- Then start frontend: `ng serve`

### Search not working
- Ensure backend is running on port 3000
- Check browser console for errors (F12)
- Verify AWS credentials have `bedrock:InvokeModel` permissions
- Test API directly: `curl http://localhost:3000/api/datamaps`

## 📦 Tech Stack

- Angular 17 + Angular Material
- Node.js + Express
- AWS Bedrock (Claude Sonnet 4.5)
- TypeScript

---

**Made with ❤️ using AWS Bedrock and Claude AI**
