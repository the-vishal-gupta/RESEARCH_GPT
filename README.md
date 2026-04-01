# ResearchGPT 🎓🤖

A modern research paper discovery and management platform with AI-powered Q&A capabilities.

![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔍 Research Discovery
- **Multi-Source Search**: Search across 7 APIs - arXiv, Semantic Scholar, CORE, OpenAlex, DBLP, Europe PMC, and Google Scholar (optional)
- **300M+ Papers**: Access to over 300 million research papers across all fields
- **Advanced Filters**: Filter by date, citations, open access, and more
- **Smart Query Processing**: Natural language query understanding
- **Citation Enrichment**: Automatic citation count updates
- **Author Search**: Find papers by specific authors

### 📚 Library Management
- **Save Papers**: Build your personal research library
- **Tags & Organization**: Organize papers with custom tags
- **Notes & Ratings**: Add notes and rate papers
- **Export**: Export to BibTeX, RIS, CSV, JSON

### 🤖 AI Chatbot (NEW!)
- **Ask Questions**: Natural language Q&A about your saved papers
- **RAG-Powered**: Retrieval-Augmented Generation for accurate answers
- **Full PDF Access**: Automatically downloads and extracts full paper text
- **Smart Caching**: Caches extracted PDFs for faster responses
- **Source Citations**: See which papers were used for each answer
- **Chat History**: Save and manage conversation sessions
- **100% Local**: Runs entirely on your machine using Ollama
- **Privacy First**: No data sent to cloud services

### 🧪 Research Labs
- **AI-Powered Analysis**: Get AI summaries and relevance scores
- **Research Questions**: Ask research questions and get paper recommendations
- **Comparative Analysis**: Compare papers side-by-side

### 🔔 Alerts & Tracking
- **Citation Alerts**: Track citation counts for your papers
- **New Papers**: Get notified about new papers in your areas of interest
- **Author Following**: Follow specific authors

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Python 3.8+ (optional, for Google Scholar)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ResearchGPT.git
cd ResearchGPT
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Optional: Enable Google Scholar (Local Use Only)

⚠️ **Warning**: Google Scholar scraping violates Google's ToS. Use only for local testing.

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start Scholar server (in separate terminal)
python scholar_server.py

# Start React app
npm run dev
```

Google Scholar results will be automatically included if the server is running.

### Setting Up the AI Chatbot

The chatbot requires Ollama with the Llama 3.2 model:

**Automated Setup (Recommended):**

Windows:
```bash
setup-chatbot.bat
```

macOS/Linux:
```bash
chmod +x setup-chatbot.sh
./setup-chatbot.sh
```

**Manual Setup:**

1. Install Ollama:
   - Windows: Download from [ollama.ai](https://ollama.ai/download)
   - macOS: `brew install ollama`
   - Linux: `curl -fsSL https://ollama.ai/install.sh | sh`

2. Download the model:
```bash
ollama pull phi3
```

3. Verify Ollama is running at `http://localhost:11434`

**Note:** We use Phi-3 (3.8B) for better accuracy with research papers.

## 🤖 Chatbot Setup Guide

### Prerequisites
- Node.js 18+ and npm
- 4GB+ RAM
- 2GB free disk space

### Automated Setup (Recommended)

**Windows:**
```bash
setup-chatbot.bat
```

**macOS/Linux:**
```bash
chmod +x setup-chatbot.sh
./setup-chatbot.sh
```

### Manual Setup

1. **Install Ollama:**
   - Windows: Download from [ollama.ai](https://ollama.ai/download)
   - macOS: `brew install ollama`
   - Linux: `curl -fsSL https://ollama.ai/install.sh | sh`

2. **Download the model:**
```bash
ollama pull phi3
```

3. **Verify Ollama is running:**
   - Visit `http://localhost:11434` in your browser
   - You should see "Ollama is running"

4. **Start using the chatbot:**
   - Save papers to your library
   - Click the chat icon (bottom-right) or go to "AI Assistant"
   - Ask questions about your papers!

### Troubleshooting

**"Ollama not running" error:**
- Windows: Check system tray for Ollama
- macOS/Linux: Run `ollama serve` in terminal
- Verify: `curl http://localhost:11434`

**"Model not found" error:**
```bash
ollama pull phi3
```

**"Failed to get response from chatbot" error:**
1. Run diagnostic tool: `diagnose-ollama.bat` (Windows)
2. Check browser console (F12) for detailed errors
3. Verify Ollama is running: Visit `http://localhost:11434`
4. Restart Ollama:
   ```bash
   # Stop Ollama (close from system tray or Ctrl+C)
   # Start again
   ollama serve
   ```
5. Test with: `ollama run phi3 "Hello"`
6. Check if model is loaded: `ollama list`

**Slow responses:**
- First query is slower (model loading)
- CPU inference takes 5-15 seconds
- This is normal behavior

**No relevant papers found:**
- Save more papers to your library
- Rephrase your question
- Use keywords from your paper titles

### Testing

Open `chatbot-test.html` in your browser to verify:
1. Ollama connection
2. Model availability
3. Basic generation
4. RAG functionality

## 📖 Usage

### Basic Workflow

1. **Sign Up / Login**
   - Create an account or use demo credentials
   - Demo: `demo@university.edu` / `demo123`

2. **Search for Papers**
   - Use the search bar on the home page
   - Apply filters to refine results
   - Click on papers to view details

3. **Save to Library** ⭐
   - **Important:** Click the **star icon** (⭐) on any paper to save it
   - The star will turn yellow when saved
   - Papers are saved to your personal library
   - Add tags, notes, and ratings in the Library page

4. **Ask the AI Chatbot**
   - Click the chat icon (bottom-right) or go to "AI Assistant"
   - Ask questions about your saved papers
   - Get answers with source citations

### How to Save Papers to Your Library

**Step-by-step:**
1. Go to Home page
2. Search for papers (e.g., "machine learning")
3. Look for the **star icon** (⭐) on the left side of each paper
4. Click the star to save the paper
5. The star will turn yellow/gold when saved
6. Go to "My Library" to see all saved papers
7. Now you can use the AI Assistant to ask questions!

**Tip:** Save at least 3-5 papers before using the chatbot for best results.

### Example Chatbot Questions

**Generic questions (work with any papers):**
- "Tell me about my papers"
- "Summarize all papers"
- "What papers do I have?"
- "Give me an overview"

**Specific questions:**
- "What methodologies are used?"
- "Compare the results of different studies"
- "Which papers discuss [topic]?"
- "What are the key findings about [topic]?"

**Tips for better results:**
- Start with generic questions to see what papers you have
- Then ask specific questions about topics in your papers
- Use keywords from your paper titles for best matches
- Responses are formatted with **bold**, bullet points, and sections for clarity

## 🏗️ Project Structure

```
ResearchGPT/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── FloatingChatbot.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── sections/         # Page components
│   │   ├── HomePage.tsx
│   │   ├── SearchResultsPage.tsx
│   │   ├── LibraryPage.tsx
│   │   ├── ChatbotPage.tsx
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── api/         # API integrations
│   │   ├── llm/         # LLM services
│   │   ├── chatbotService.ts
│   │   ├── libraryService.ts
│   │   └── ...
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── App.tsx          # Main app component
├── server.js            # Express backend
├── setup-chatbot.bat    # Windows chatbot setup
├── setup-chatbot.sh     # Unix chatbot setup
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Accessible primitives

### Backend
- **Express** - API server
- **Axios** - HTTP client
- **CORS** - Cross-origin support

### AI/ML
- **Ollama** - Local LLM runtime
- **Phi-3 (3.8B)** - Language model (Microsoft)
- **RAG** - Retrieval-Augmented Generation

### APIs
- **arXiv API** - Physics, CS, Math papers
- **Semantic Scholar API** - All fields, citation data
- **CORE API** - Open access papers
- **OpenAlex API** - 250M+ papers, all fields ⭐
- **DBLP API** - Computer science papers
- **Europe PMC API** - Biomedical papers
- **Google Scholar API** - All fields (optional, local only) ⚠️
- **CrossRef API** - Metadata enrichment

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# API Keys (optional, for rate limit increases)
VITE_SEMANTIC_SCHOLAR_API_KEY=your_key_here
VITE_CORE_API_KEY=your_key_here

# Server
PORT=3001
```

### Chatbot Configuration

Edit `src/services/chatbotService.ts`:

```typescript
// Change model
const MODEL_NAME = 'phi3'; // Currently using Phi-3
// Or try: 'llama3.2:1b' (faster), 'llama3.2:3b' (balanced)

// Adjust response length
options: {
  temperature: 0.3,
  num_predict: 300  // Longer responses
}

// Change retrieval count
const relevantPapers = findRelevantPapers(query, papers, 5); // Top 5 papers
```

## 📊 Features in Detail

### Search & Discovery
- Multi-source aggregation
- Deduplication across sources
- Citation count enrichment
- Open access detection
- PDF availability checking

### Library Management
- Local storage persistence
- Tag-based organization
- Star ratings
- Personal notes
- Export to multiple formats

### AI Chatbot
- RAG-based Q&A
- Context-aware responses
- Source attribution
- Conversation history
- Floating widget + full page mode

## 🔒 Privacy & Security

- **Local-First**: All data stored locally in browser
- **No Cloud**: Chatbot runs entirely on your machine
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency

## 🚧 Roadmap

- [x] PDF full-text extraction
- [x] Smart PDF caching
- [ ] Advanced citation network visualization
- [ ] Collaborative features
- [ ] Mobile app
- [ ] Browser extension
- [ ] Integration with Zotero/Mendeley
- [ ] Multi-language support
- [ ] Voice interface for chatbot

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM runtime
- [Meta AI](https://ai.meta.com) - Llama models
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [arXiv](https://arxiv.org) - Research paper repository
- [Semantic Scholar](https://www.semanticscholar.org) - Academic search engine

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check [SCHOLAR_SETUP.md](SCHOLAR_SETUP.md) for Google Scholar setup (optional)
- See [API_COVERAGE.md](API_COVERAGE.md) for API details

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

Built with ❤️ for researchers, by researchers
