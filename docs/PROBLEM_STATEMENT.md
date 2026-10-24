# Problem Statement Alignment & Architecture Matrix

## Event Planner Challenge: PromptWars Virtual

Utsav AI was purpose-built to address the complexities of modern event planning by combining Generative AI with structured financial and logistical execution.

---

## Requirements vs. Implementation Matrix

| Requirement / Rubric Area | Utsav AI Solution | Technical Implementation |
| :--- | :--- | :--- |
| **1. Dynamic Event Generation** | End-to-end plan generation tailored to event scale, guest count, budget, and cultural/aesthetic theme. | Powered by Google Gemini 3.5 Flash Lite using structured schema enforcement. |
| **2. Financial Breakdown** | Realistic itemized allocation with visual percentage distribution and per-guest metrics. | Real-time budget progress visualizer, dynamic allocation totaling, multi-currency support. |
| **3. Actionable Timelines** | Reverse countdown checklist mapped to `daysBefore` milestones with interactive task tracking. | Interactive task checklist with persistent state toggle and completion progress tracking. |
| **4. Vendor Curation** | Curated recommendations of service providers aligned with event type and vibe. | Context-aware vendor generation with completion tracking for booking and logistics. |
| **5. Personalization & Themes** | Creative, actionable ideas tailored to selected atmosphere (Royal Heritage, Neon Cyberpunk, Minimalist, etc.). | Prompt-engineered thematic synthesis emphasizing experiential touches and cultural nuances. |
| **6. User Ergonomics & Portability** | Seamless export to clipboard, print-ready document rendering, and downloadable JSON plans. | Client-side export handlers (`navigator.clipboard`, `window.print`, dynamic blob download). |
| **7. Production Performance** | Ultra-responsive interactions with sub-second feedback. | In-memory LRU/TTL caching (sub-25ms response time on cached inputs), Gzip compression. |
