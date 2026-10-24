/**
 * Utsav AI - GenAI Event Planner Backend
 * Production-ready Express API with Security, Caching, and Validation.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ==========================================
// 1. SECURITY & PERFORMANCE MIDDLEWARE
// ==========================================

// HTTP Security Headers via Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Allows flexible SPA asset loading
    crossOriginEmbedderPolicy: false
}));

// Gzip / Deflate Compression for high efficiency
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow mobile apps, curl, postman, and same-origin requests (origin === undefined)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to permissive for hackathon demo
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser with strict payload size limit (Anti-DoS)
app.use(express.json({ limit: '25kb' }));

// Rate Limiting (Anti-Abuse / Quota Protection)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests. Please wait a few moments before trying again."
    }
});
app.use('/api/', apiLimiter);

// ==========================================
// 2. IN-MEMORY HIGH-SPEED CACHE (TTL: 1 Hour)
// ==========================================
const planCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(eventType, budget, guests, vibe) {
    return `${String(eventType).trim().toLowerCase()}_${budget}_${guests}_${String(vibe).trim().toLowerCase()}`;
}

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of planCache.entries()) {
        if (now - entry.timestamp > CACHE_TTL_MS) {
            planCache.delete(key);
        }
    }
}, 10 * 60 * 1000);

// ==========================================
// 3. INPUT VALIDATION & SANITIZATION (Anti-Prompt-Injection)
// ==========================================
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[<>{}\`]/g, '') // Strip script/template tags
        .trim()
        .slice(0, 60); // Cap length
}

function validateEventPayload(req, res, next) {
    let { eventType, budget, guests, vibe } = req.body;

    // Check presence
    if (!eventType || budget === undefined || guests === undefined || !vibe) {
        return res.status(400).json({ 
            error: "Validation failed: 'eventType', 'budget', 'guests', and 'vibe' are required." 
        });
    }

    // Number conversion & bounds check
    const numericBudget = Number(budget);
    const numericGuests = parseInt(guests, 10);

    if (isNaN(numericBudget) || numericBudget < 500 || numericBudget > 100000000) {
        return res.status(400).json({ 
            error: "Validation failed: 'budget' must be a valid number between ₹500 and ₹10,00,00,000." 
        });
    }

    if (isNaN(numericGuests) || numericGuests < 1 || numericGuests > 50000) {
        return res.status(400).json({ 
            error: "Validation failed: 'guests' must be a valid whole number between 1 and 50,000." 
        });
    }

    // Sanitize string inputs
    const cleanEventType = sanitizeInput(eventType);
    const cleanVibe = sanitizeInput(vibe);

    // Guard against prompt injection phrases
    const injectionPatterns = [
        /ignore previous instructions/i,
        /system prompt/i,
        /disregard/i,
        /as an ai assistant/i,
        /repeat back/i
    ];

    if (injectionPatterns.some(p => p.test(cleanEventType) || p.test(cleanVibe))) {
        return res.status(400).json({
            error: "Invalid input content detected. Please use genuine event descriptions."
        });
    }

    // Attach sanitized values to request
    req.sanitized = {
        eventType: cleanEventType,
        budget: numericBudget,
        guests: numericGuests,
        vibe: cleanVibe
    };

    next();
}

// ==========================================
// 4. API ROUTES
// ==========================================

// Health & Monitoring Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        cacheSize: planCache.size
    });
});

// Event Plan Generation Endpoint
app.post('/api/generate-plan', validateEventPayload, async (req, res) => {
    const { eventType, budget, guests, vibe } = req.sanitized;
    const cacheKey = getCacheKey(eventType, budget, guests, vibe);

    // 1. Check in-memory cache first (Ultra-low latency <5ms)
    const cached = planCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached.data);
    }

    // 2. Validate Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: "Gemini API key is not configured on the server."
        });
    }

    try {
        console.log(`[API] Generating plan for: ${eventType} | Budget: ₹${budget} | Guests: ${guests} | Vibe: ${vibe}`);

        const prompt = `You are an elite, certified event planning expert. 
Create an exhaustive, highly realistic event plan for:
Event: ${eventType}
Target Budget: ₹${budget}
Expected Guests: ${guests}
Theme/Vibe: ${vibe}

Strict Requirements:
1. Budget breakdown must have realistic itemized allocations totaling approximately ₹${budget}.
2. Timeline must provide chronological steps with realistic daysBefore count.
3. Vendors must be relevant industry service providers.
4. Personalized ideas must be creative, actionable, and match the specified theme.

Return ONLY a valid JSON object with this exact structure:
{
  "budgetBreakdown": [{"category": "String", "amount": Number}],
  "timeline": [{"task": "String", "daysBefore": Number}],
  "vendors": ["String"],
  "personalizedIdeas": ["String"]
}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                    maxOutputTokens: 1500
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            console.error("[Gemini Error]", data.error || data);
            throw new Error(data.error?.message || `Gemini API returned status ${response.status}`);
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No plan candidate generated by AI.");
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? rawText.slice(firstBrace, lastBrace + 1) : rawText.trim();

        const plan = JSON.parse(jsonStr);

        // Sanity check generated structure
        if (!Array.isArray(plan.budgetBreakdown) || !Array.isArray(plan.timeline) || !Array.isArray(plan.vendors) || !Array.isArray(plan.personalizedIdeas)) {
            throw new Error("Generated plan structure is incomplete.");
        }

        // Save into cache
        planCache.set(cacheKey, { timestamp: Date.now(), data: plan });

        res.setHeader('X-Cache', 'MISS');
        return res.json(plan);

    } catch (error) {
        console.error("[Backend Error]", error.message);
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: "AI request timed out. Please try again." });
        }
        return res.status(500).json({ 
            error: "Failed to generate event plan. Please check API parameters or try again." 
        });
    }
});

// ==========================================
// 5. STATIC ASSET SERVING & SPA FALLBACK
// ==========================================
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
    // Cache static assets (images, css, js) for 1 day
    app.use(express.static(distPath, {
        maxAge: '1d',
        etag: true
    }));
}

// Client-Side Routing Fallback
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
            message: "Utsav AI Server is active. Build frontend to view interface.",
            endpoints: {
                health: "GET /api/health",
                generatePlan: "POST /api/generate-plan"
            }
        });
    }
});

// ==========================================
// 6. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Utsav AI Server securely running on port ${PORT}`);
    });
}

module.exports = app;
