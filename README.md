# 🌾 Kisaan Saathi

**Guided Agricultural Diagnostic Platform**

Kisaan Saathi is a guided visual agricultural diagnostic platform featuring an adaptive assistant that helps farmers make faster and more confident crop decisions through multilingual conversational interaction, optimized for real-world connectivity conditions.

## ✨ Features

### Core Capabilities
- **Guided Visual Assistant**: Clean, professional agricultural assistant with subtle state animations (listening, thinking, suggesting)
- **Adaptive Diagnostic Flow**: Akinator-style questioning that narrows down crop issues through contextual probing
- **Progress & Confidence Meters**: Real-time visual feedback showing diagnostic progress and confidence levels
- **Multilingual Support**: Full Hindi and English interface with seamless language switching
- **Voice Input/Output**: Web Speech API integration for hands-free interaction
- **Connectivity-Aware**: Three connectivity states (Online, Low Bandwidth, Disconnected) with appropriate optimizations
- **Sunlight-Readable UI**: High contrast design with large touch targets optimized for outdoor field use
- **Expert Escalation**: Automatic suggestions to contact agricultural experts when confidence is low

### Technical Features
- **Supabase Backend**: Scalable database with Edge Functions for serverless API
- **Structured Diagnostic Engine**: Probability scoring model with symptom-disease mapping
- **Real-time Conversation**: Stateful chat with symptom tracking and adaptive questioning
- **Three Connectivity States**: Full Online, Low Bandwidth Mode, Disconnected Mode with cached advisory
- **Performance Optimized**: Compressed payloads, efficient API calls, and responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (already configured)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## 🏗️ Architecture

### Database Schema

**Crops** - Supported crops with growth stages
- Cotton (कपास)
- Wheat (गेहूं)

**Symptoms** - Observable crop issues with multilingual descriptions

**Diseases** - Disease information with treatments and prevention

**Symptom-Disease Mappings** - Probability weights for diagnostic engine

**Diagnostic Questions** - Adaptive follow-up questions

**Conversations** - Session management with detected symptoms and probabilities

**Advisories** - Generated recommendations with confidence scores

### Edge Functions

**chat-orchestrator** - Handles conversational flow, symptom detection, and adaptive questioning

**generate-advisory** - Creates structured recommendations with confidence scoring

### Frontend Components

**LandingPage** - Language, crop, and growth stage selection

**ChatInterface** - Conversational diagnostic with voice input

**AdvisoryDisplay** - Detailed recommendations with text-to-speech

## 🌱 Workflow

1. **Onboarding**: Farmer selects language, crop, growth stage, and location with guided interface
2. **Guided Diagnosis**: Visual assistant guides through conversational symptom description
3. **Adaptive Questioning**: System asks smart follow-up questions to narrow possibilities
4. **Progress Tracking**: Real-time progress bar and confidence meter show diagnostic advancement
5. **Probability Calculation**: Disease likelihood computed from symptom patterns with visual feedback
6. **Advisory Generation**: Structured recommendations with clear confidence scoring
7. **Escalation**: Low confidence triggers expert consultation with direct contact information

## 🎯 MVP Scope

- **Crops**: Cotton and Wheat
- **Diseases**:
  - Cotton: Bollworm, Whitefly, Wilt
  - Wheat: Rust, Aphid, Loose Smut
- **Languages**: English and Hindi
- **Features**: Conversational diagnosis, voice input, confidence scoring

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Public read access for reference data only
- Session-based conversation isolation
- No authentication required for advisory access

## 📊 Impact Metrics

KrishiSahay enables:
- Faster decision cycles during critical crop stages
- Reduced incorrect pesticide usage through accurate diagnosis
- Improved farmer confidence with transparent recommendations
- Reduced advisory bottlenecks during peak demand periods

## 🛡️ Safety Features

- Confidence thresholds (< 60% triggers escalation)
- Clear disclaimers on all advisories
- Expert consultation recommendations
- Kisan Call Centre integration (1800-180-1551)

## 🌐 Future Enhancements

- Image-based symptom detection
- Weather integration for proactive alerts
- Market price advisory
- Government scheme mapping
- Expanded crop and disease coverage
- Regional language expansion (Punjabi, Marathi, Telugu)

## 🎯 Key Differentiator

Most agricultural AI solutions focus on intelligence.

**Kisaan Saathi focuses on accessible intelligence optimized for real agricultural environments.**

The platform combines:
- Structured diagnostic reasoning (not just LLM responses)
- Visual guidance that feels intelligent, not childish
- Realistic connectivity handling (three states, not offline-first claims)
- Sunlight-readable UI for actual field conditions
- Progressive disclosure to manage complexity

## 📝 License

Educational/Research Project

## 🙏 Acknowledgments

Built to help farmers make faster and more confident crop decisions through guided agricultural intelligence.

---

**Kisaan Saathi is a guided agricultural diagnostic platform that helps farmers describe symptoms, not diagnoses. Our system understands natural descriptions and guides you to confident decisions.**
