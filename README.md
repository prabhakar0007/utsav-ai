# Utsav AI - GenAI Event Planner 🎉

An AI-powered event planning web application built for PromptWars Virtual.

## 🚀 Features
- **Dynamic Event Planning:** Generates comprehensive event plans including itemized budget breakdown, day-by-day timeline, recommended vendors, and creative personalized ideas.
- **Powered by Gemini AI:** Uses Google Gemini API (`gemini-3.5-flash-lite`) with structured JSON generation.
- **Modern Interactive UI:** Built with React, Vite, Tailwind CSS, Lucide icons, and Framer Motion animations.
- **RESTful API Backend:** Express.js server handling generation requests and health monitoring.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, dotenv, cors
- **AI Model:** Google Gemini API
- **Testing:** Vitest, React Testing Library

---

## 💻 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/prabhakar0007/utsav-ai.git
cd utsav-ai
```

### 2. Configure Environment Variables
Copy the sample environment file in `backend`:
```bash
cp backend/.env.example backend/.env
```
Add your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### 3. Install All Dependencies
```bash
npm run install-all
```

### 4. Run Development Servers
To start both backend and frontend concurrently:
```bash
npm run dev
```

* **Frontend:** http://localhost:5173
* **Backend:** http://localhost:5000

---

## 🧪 Running Tests
```bash
npm test
```
