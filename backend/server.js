const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Path to built frontend assets
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// Health & Status check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: "online",
        message: "🎉 Utsav AI Backend Server is live and running!",
        geminiApiStatus: process.env.GEMINI_API_KEY ? "Connected" : "Missing Key",
        endpoints: {
            generatePlan: "POST /api/generate-plan"
        }
    });
});

app.post('/api/generate-plan', async (req, res) => {
    try {
        const { eventType, budget, guests, vibe } = req.body;
        console.log(`[API] Received request: ${eventType}, Budget: ₹${budget}, Guests: ${guests}, Vibe: ${vibe}`);
        
        const prompt = `You are an expert event planner. Create a detailed plan for a ${eventType}. 
        Budget: ₹${budget}, Guests: ${guests}, Vibe/Theme: ${vibe}.
        Return ONLY a valid JSON object with this exact structure, no markdown, no extra text:
        {
          "budgetBreakdown": [{"category": "String", "amount": Number}],
          "timeline": [{"task": "String", "daysBefore": Number}],
          "vendors": ["String"],
          "personalizedIdeas": ["String"]
        }`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("[API Error] Gemini API returned error:", data);
            throw new Error(data.error?.message || "Invalid response from Gemini API");
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Invalid response from Gemini API: No candidates found");
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? rawText.slice(firstBrace, lastBrace + 1) : rawText.trim();
        
        const parsedPlan = JSON.parse(jsonStr);
        console.log(`[API] Plan generated successfully for ${eventType}!`);
        res.json(parsedPlan);
    } catch (error) {
        console.error("[API Error] Backend Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to generate plan. Please try again." });
    }
});

// For any non-API route, serve frontend index.html if built, else show status JSON
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({
            status: "online",
            message: "🎉 Utsav AI Server is live! Run `npm run build` to serve frontend here.",
            endpoints: {
                health: "GET /api/health",
                generatePlan: "POST /api/generate-plan"
            }
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
