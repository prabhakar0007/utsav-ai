import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PartyPopper, Sparkles, Calendar, DollarSign, Users, 
  Loader2, AlertCircle, CheckCircle2, Copy, Check, 
  Printer, ArrowRight, Lightbulb, Clock, Download, ShieldCheck
} from 'lucide-react';
import { EVENT_PRESETS, SUPPORTED_CURRENCIES } from './constants/presets';

// Smooth Animation Variants
const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 22 }
  }
};

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

function App() {
  const [formData, setFormData] = useState({ 
    eventType: 'Wedding', 
    budget: 100000, 
    guests: 100, 
    vibe: 'Royal Heritage',
    currency: 'INR'
  });
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Interactive Checklist Tracking
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [completedVendors, setCompletedVendors] = useState(new Set());
  const [copied, setCopied] = useState(false);

  // Active currency symbol
  const currencySymbol = useMemo(() => {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === formData.currency);
    return found ? found.symbol : '₹';
  }, [formData.currency]);

  // Apply a quick preset
  const handleApplyPreset = (preset) => {
    setFormData({
      eventType: preset.eventType,
      budget: preset.budget,
      guests: preset.guests,
      vibe: preset.vibe,
      currency: preset.currency || 'INR'
    });
  };

  // Toggle timeline checklist task
  const toggleTask = (index) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Toggle vendor checklist
  const toggleVendor = (index) => {
    setCompletedVendors(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Calculate total budget breakdown amount
  const totalAllocated = useMemo(() => {
    if (!plan?.budgetBreakdown) return 0;
    return plan.budgetBreakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [plan]);

  // Estimated per-guest metric
  const perGuestEstimate = useMemo(() => {
    const b = Number(formData.budget) || 0;
    const g = Number(formData.guests) || 1;
    return Math.round(b / g);
  }, [formData.budget, formData.guests]);

  // Copy Plan to Clipboard
  const handleCopyPlan = () => {
    if (!plan) return;
    const text = `🎉 UTASV AI PLAN: ${formData.eventType} (${formData.vibe})
Target Budget: ${currencySymbol}${Number(formData.budget).toLocaleString()} | Guests: ${formData.guests} (${currencySymbol}${perGuestEstimate}/guest)

💰 BUDGET BREAKDOWN:
${plan.budgetBreakdown.map(b => `• ${b.category}: ${currencySymbol}${Number(b.amount).toLocaleString()}`).join('\n')}

📅 TIMELINE:
${plan.timeline.map(t => `• ${t.daysBefore} Days Before: ${t.task}`).join('\n')}

🤝 RECOMMENDED VENDORS:
${plan.vendors.map(v => `• ${v}`).join('\n')}

✨ PERSONALIZED IDEAS:
${plan.personalizedIdeas.map(i => `• ${i}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download JSON export file
  const handleDownloadJSON = () => {
    if (!plan) return;
    const exportPayload = {
      eventDetails: { ...formData, perGuestEstimate },
      plan,
      exportedAt: new Date().toISOString(),
      generator: "Utsav AI - PromptWars Virtual"
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utsav-ai-${formData.eventType.toLowerCase()}-plan.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print or Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Submit & Generate
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.eventType || !formData.budget || !formData.guests || !formData.vibe) {
      setError("Please fill out all fields before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);
    setCompletedTasks(new Set());
    setCompletedVendors(new Set());
    
    try {
      const res = await fetch(`${API_BASE}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: formData.eventType,
          budget: Number(formData.budget),
          guests: Number(formData.guests),
          vibe: formData.vibe,
          currency: formData.currency
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Server responded with an error");
      }
      setPlan(data);
    } catch (err) {
      console.error("Plan generation error:", err);
      setError(err.message || "Failed to generate plan. Please verify backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 relative overflow-hidden text-slate-100">
      
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-pink-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
      >
        Skip to main content
      </a>

      {/* Background Decor (Glowing Bubbles) */}
      <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
      <div aria-hidden="true" className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="text-center mb-10 relative z-10">
        <motion.div 
          initial={{ y: -30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="inline-flex items-center justify-center gap-3"
        >
          <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
            <PartyPopper className="text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" size={44} aria-hidden="true" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            Utsav <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400">AI</span>
          </h1>
        </motion.div>
        <p className="text-slate-300 mt-3 text-base md:text-lg font-medium max-w-xl mx-auto">
          Intelligent, Budget-Optimized Event Planning Powered by Google Gemini ✨
        </p>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-10 relative z-10">
        
        {/* Left Column: Form & Presets */}
        <section aria-labelledby="planner-form-title" className="col-span-1">
          <motion.div 
            variants={bubbleVariants} initial="hidden" animate="visible"
            className="bubble-card p-6 md:p-8 sticky top-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="planner-form-title" className="text-2xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="text-yellow-400" size={22} aria-hidden="true" /> Plan Event
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30 flex items-center gap-1">
                <ShieldCheck size={12} aria-hidden="true" /> Gemini 3.5
              </span>
            </div>

            {/* Quick Presets */}
            <div className="mb-5">
              <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {EVENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs bg-white/5 hover:bg-pink-500/20 hover:text-pink-200 border border-white/10 hover:border-pink-500/40 px-3 py-1.5 rounded-full text-slate-300 transition-all font-medium focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                    aria-label={`Apply preset for ${preset.label}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4" noValidate>
              
              {/* Event Type & Currency Row */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label htmlFor="eventType" className="block text-xs font-semibold text-slate-200 mb-1">
                    Event Type <span className="text-pink-400" aria-hidden="true">*</span>
                  </label>
                  <select 
                    id="eventType" 
                    name="eventType"
                    required
                    aria-required="true"
                    className="w-full p-3 rounded-2xl bg-slate-900/80 border border-white/15 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:outline-none text-sm text-white cursor-pointer hover:border-white/30"
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  >
                    <option value="Wedding" className="bg-slate-900">💍 Wedding</option>
                    <option value="Birthday" className="bg-slate-900">🎂 Birthday Party</option>
                    <option value="Hackathon" className="bg-slate-900">💻 Tech Hackathon</option>
                    <option value="Corporate Event" className="bg-slate-900">🏢 Corporate Gala</option>
                    <option value="Community Festival" className="bg-slate-900">🪔 Community Utsav</option>
                    <option value="Anniversary" className="bg-slate-900">🥂 Anniversary</option>
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label htmlFor="currency" className="block text-xs font-semibold text-slate-200 mb-1">
                    Currency
                  </label>
                  <select 
                    id="currency" 
                    name="currency"
                    className="w-full p-3 rounded-2xl bg-slate-900/80 border border-white/15 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:outline-none text-sm text-white cursor-pointer hover:border-white/30 font-mono"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code} className="bg-slate-900">{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Budget Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="budget" className="block text-xs font-semibold text-slate-200">
                    Total Budget ({currencySymbol}) <span className="text-pink-400" aria-hidden="true">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{currencySymbol}{Number(formData.budget).toLocaleString()}</span>
                </div>
                <input 
                  id="budget" 
                  name="budget"
                  type="number" 
                  min="100"
                  max="100000000"
                  required
                  aria-required="true"
                  className="w-full p-3 rounded-2xl bg-slate-900/80 border border-white/15 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:outline-none text-sm text-white font-mono"
                  value={formData.budget} 
                  onChange={(e) => setFormData({...formData, budget: e.target.value})} 
                />
              </div>
              
              {/* Guests Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="guests" className="block text-xs font-semibold text-slate-200">
                    Expected Guests <span className="text-pink-400" aria-hidden="true">*</span>
                  </label>
                  <span className="text-[11px] text-pink-300 font-mono">
                    ~{currencySymbol}{perGuestEstimate}/guest
                  </span>
                </div>
                <input 
                  id="guests" 
                  name="guests"
                  type="number" 
                  min="1"
                  max="50000"
                  required
                  aria-required="true"
                  className="w-full p-3 rounded-2xl bg-slate-900/80 border border-white/15 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:outline-none text-sm text-white font-mono"
                  value={formData.guests} 
                  onChange={(e) => setFormData({...formData, guests: e.target.value})} 
                />
              </div>
              
              {/* Vibe Input */}
              <div>
                <label htmlFor="vibe" className="block text-xs font-semibold text-slate-200 mb-1">
                  Theme / Preferred Vibe <span className="text-pink-400" aria-hidden="true">*</span>
                </label>
                <input 
                  id="vibe" 
                  name="vibe"
                  type="text" 
                  maxLength={60}
                  required
                  aria-required="true"
                  placeholder="e.g. Royal Heritage, Neon Cyberpunk, Minimalist"
                  className="w-full p-3 rounded-2xl bg-slate-900/80 border border-white/15 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:outline-none text-sm text-white placeholder-slate-500"
                  value={formData.vibe} 
                  onChange={(e) => setFormData({...formData, vibe: e.target.value})} 
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading} 
                aria-busy={loading}
                className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:outline-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                    <span>Analyzing & Planning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} aria-hidden="true" />
                    <span>Generate Event Plan ✨</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </section>

        {/* Right Columns: Output Sections */}
        <section aria-labelledby="results-section-title" className="col-span-1 md:col-span-2 space-y-6">
          <h2 id="results-section-title" className="sr-only">Event Plan Results</h2>
          
          <AnimatePresence mode="wait">
            
            {/* Error Notification */}
            {error && (
              <motion.div 
                role="alert" 
                aria-live="assertive"
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                className="bg-red-500/20 border border-red-500/40 p-5 rounded-2xl flex items-start gap-3.5 text-red-200 backdrop-blur-md"
              >
                <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={22} aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-red-300">Plan Generation Error</h3>
                  <p className="text-sm text-red-200/90 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!plan && !loading && !error && (
              <motion.div 
                variants={bubbleVariants} initial="hidden" animate="visible"
                className="bubble-card p-12 text-center h-[420px] flex flex-col items-center justify-center text-slate-400"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}>
                  <Calendar size={72} className="mb-4 opacity-40 text-pink-400" aria-hidden="true" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-200 mb-2">Ready to Plan Your Event?</h3>
                <p className="text-slate-400 max-w-md text-sm">
                  Choose a preset or enter your event details on the left, then click <strong>Generate Event Plan</strong> to receive a tailored budget, checklist timeline, and vendor ideas.
                </p>
              </motion.div>
            )}
            
            {/* Loading State */}
            {loading && (
              <motion.div 
                role="status" 
                aria-live="polite"
                variants={bubbleVariants} initial="hidden" animate="visible" 
                className="bubble-card p-12 text-center h-[420px] flex flex-col items-center justify-center"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Loader2 className="text-pink-400 mb-5" size={54} aria-hidden="true" />
                </motion.div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 animate-pulse">
                  Gemini AI is crafting your event plan... ✨
                </h3>
                <p className="text-slate-400 text-xs mt-2">Allocating budget & researching vendors...</p>
              </motion.div>
            )}

            {/* Generated Plan Output */}
            {plan && !loading && (
              <motion.div 
                role="region" 
                aria-live="polite"
                aria-label="Generated Event Plan"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-6"
              >
                {/* Plan Header & Action Bar */}
                <div className="bubble-card p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={22} aria-hidden="true" />
                        {formData.eventType} Plan Ready
                      </h3>
                      {plan.metadata?.budgetAdvisory && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          {plan.metadata.budgetAdvisory}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Target: {currencySymbol}{Number(formData.budget).toLocaleString()} • {formData.guests} Guests • Theme: {formData.vibe}
                    </p>
                  </div>
                  
                  {/* Action Buttons: Copy, Download JSON, Print */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPlan}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                      aria-label="Copy entire event plan summary"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadJSON}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                      aria-label="Download event plan as JSON"
                    >
                      <Download size={14} aria-hidden="true" />
                      <span>Export JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                      aria-label="Print event plan or save as PDF"
                    >
                      <Printer size={14} aria-hidden="true" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>

                {/* 1. Budget Breakdown */}
                <motion.article variants={bubbleVariants} className="bubble-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold flex items-center gap-2.5 text-white">
                      <DollarSign className="text-emerald-400" size={22} aria-hidden="true" />
                      Budget Distribution
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Allocated: {currencySymbol}{totalAllocated.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {plan.budgetBreakdown.map((item, i) => {
                      const amount = Number(item.amount) || 0;
                      const percentage = totalAllocated > 0 ? Math.round((amount / totalAllocated) * 100) : 0;
                      return (
                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-200 font-semibold text-sm">{item.category}</span>
                            <span className="font-extrabold text-emerald-400 font-mono text-base">
                              {currencySymbol}{amount.toLocaleString()}
                            </span>
                          </div>
                          {/* Visual Progress Bar */}
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                              aria-hidden="true"
                            ></div>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1.5 text-right font-mono">{percentage}% of budget</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.article>

                {/* 2. Interactive Countdown Timeline */}
                <motion.article variants={bubbleVariants} className="bubble-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold flex items-center gap-2.5 text-white">
                      <Clock className="text-sky-400" size={22} aria-hidden="true" />
                      Preparation Timeline
                    </h3>
                    <span className="text-xs text-sky-300 font-medium">
                      {completedTasks.size} of {plan.timeline.length} done
                    </span>
                  </div>

                  <ul className="space-y-3.5 border-l-2 border-sky-500/25 ml-3 pl-5">
                    {plan.timeline.map((item, i) => {
                      const isDone = completedTasks.has(i);
                      return (
                        <li 
                          key={i} 
                          className={`relative group p-2.5 rounded-xl transition-all ${isDone ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                        >
                          <div 
                            className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                              isDone ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-900 border-sky-400'
                            }`}
                            aria-hidden="true"
                          ></div>
                          <div className="flex items-start gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleTask(i)}
                              aria-label={`Task: ${item.task}`}
                              className="mt-1 accent-emerald-400 rounded cursor-pointer"
                            />
                            <div onClick={() => toggleTask(i)} className="cursor-pointer">
                              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono mr-2">
                                {item.daysBefore} Days Prior
                              </span>
                              <span className={`text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                {item.task}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </motion.article>

                {/* 3. Vendors Checklist & Personalized Ideas */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Vendors */}
                  <motion.article variants={bubbleVariants} className="bubble-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Users className="text-purple-400" size={20} aria-hidden="true" />
                        Vendor Checklist
                      </h3>
                      <span className="text-xs text-purple-300 font-medium">
                        {completedVendors.size}/{plan.vendors.length}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {plan.vendors.map((v, i) => {
                        const isDone = completedVendors.has(i);
                        return (
                          <li 
                            key={i} 
                            className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs md:text-sm transition-all ${
                              isDone ? 'bg-purple-900/20 border-purple-500/30 text-purple-200 line-through' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggleVendor(i)}
                              aria-label={`Vendor: ${v}`}
                              className="accent-purple-400 rounded cursor-pointer"
                            />
                            <span onClick={() => toggleVendor(i)} className="cursor-pointer">{v}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.article>

                  {/* Personalized Ideas */}
                  <motion.article variants={bubbleVariants} className="bubble-card p-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
                      <Lightbulb className="text-yellow-400" size={20} aria-hidden="true" />
                      Creative Ideas & Themes
                    </h3>
                    <ul className="space-y-2.5">
                      {plan.personalizedIdeas.map((idea, i) => (
                        <li 
                          key={i} 
                          className="bg-gradient-to-r from-yellow-500/10 to-transparent p-3 rounded-xl text-xs md:text-sm text-slate-200 border border-yellow-500/15 leading-relaxed"
                        >
                          ✨ {idea}
                        </li>
                      ))}
                    </ul>
                  </motion.article>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400 relative z-10">
        <p>Utsav AI • Engineered for PromptWars Virtual • Powered by Google Gemini 3.5 Flash Lite</p>
      </footer>
    </div>
  );
}

export default App;
