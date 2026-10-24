/**
 * Curated Quick-Start Event Presets
 * Allows single-click configuration for common celebration formats.
 */
export const EVENT_PRESETS = [
  { 
    label: '💍 Royal Wedding', 
    eventType: 'Wedding', 
    budget: 500000, 
    guests: 200, 
    vibe: 'Royal Heritage & Grandeur',
    currency: 'INR'
  },
  { 
    label: '🎂 Fun Birthday', 
    eventType: 'Birthday', 
    budget: 25000, 
    guests: 35, 
    vibe: 'Neon Glow & Interactive Games',
    currency: 'INR'
  },
  { 
    label: '💻 Tech Hackathon', 
    eventType: 'Hackathon', 
    budget: 150000, 
    guests: 120, 
    vibe: 'Cyberpunk & High Energy',
    currency: 'INR'
  },
  { 
    label: '🏢 Corporate Gala', 
    eventType: 'Corporate Event', 
    budget: 350000, 
    guests: 100, 
    vibe: 'Executive & Elegant',
    currency: 'INR'
  }
];

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' }
];
