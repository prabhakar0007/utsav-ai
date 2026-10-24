import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Sparkles, Calendar, DollarSign, Users, Loader2, AlertCircle } from 'lucide-react';

// Smooth Animation Variants
const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

function App() {
  const [formData, setFormData] = useState({ eventType: 'Wedding', budget: 100000, guests: 100, vibe: 'Royal' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setPlan(data);
    } catch (err) {
      setError(err.message || "Failed to generate plan. Check backend & API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Background Decor (Glowing Bubbles) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <header className="text-center mb-12 relative z-10">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-4xl md:text-6xl font-extrabold flex items-center justify-center gap-4"
        >
          <motion.div whileHover={{ rotate: 20, scale: 1.2 }}>
            <PartyPopper className="text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" size={48} />
          </motion.div>
          Utsav AI
        </motion.h1>
        <p className="text-gray-300 mt-4 text-lg font-medium">Create Magic with AI ✨</p>
      </header>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-10 relative z-10">
        
        {/* Bubble Form */}
        <motion.div 
          variants={bubbleVariants} initial="hidden" animate="visible"
          className="bubble-card p-6 md:p-8 col-span-1 h-fit sticky top-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="text-yellow-400" /> Plan It
          </h2>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label htmlFor="eventType" className="block text-sm font-semibold text-gray-300 mb-2 ml-2">Event Type</label>
              <select 
                id="eventType" 
                className="w-full p-4 rounded-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500 outline-none transition-all appearance-none text-white cursor-pointer hover:bg-white/10"
                onChange={(e) => setFormData({...formData, eventType: e.target.value})}
              >
                <option className="text-black">Wedding</option>
                <option className="text-black">Birthday</option>
                <option className="text-black">Corporate Event</option>
                <option className="text-black">Community Festival</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="budget" className="block text-sm font-semibold text-gray-300 mb-2 ml-2">Budget (₹)</label>
              <input 
                id="budget" type="number" 
                className="w-full p-4 rounded-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-white placeholder-gray-500"
                value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} 
              />
            </div>
            
            <div>
              <label htmlFor="guests" className="block text-sm font-semibold text-gray-300 mb-2 ml-2">Guests</label>
              <input 
                id="guests" type="number" 
                className="w-full p-4 rounded-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-white"
                value={formData.guests} onChange={(e) => setFormData({...formData, guests: e.target.value})} 
              />
            </div>
            
            <div>
              <label htmlFor="vibe" className="block text-sm font-semibold text-gray-300 mb-2 ml-2">Theme / Vibe</label>
              <input 
                id="vibe" type="text" 
                className="w-full p-4 rounded-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-white"
                value={formData.vibe} onChange={(e) => setFormData({...formData, vibe: e.target.value})} 
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all flex justify-center items-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Generate Magic ✨"}
            </motion.button>
          </form>
        </motion.div>

        {/* Output Bubbles */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/20 border border-red-500/50 p-6 rounded-3xl flex items-center gap-4 text-red-200 backdrop-blur-md">
                <AlertCircle /> {error}
              </motion.div>
            )}

            {!plan && !loading && !error && (
              <motion.div 
                variants={bubbleVariants} initial="hidden" animate="visible"
                className="bubble-card p-12 text-center h-[400px] flex flex-col items-center justify-center text-gray-400"
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                  <Calendar size={80} className="mb-6 opacity-30 text-pink-400" />
                </motion.div>
                <p className="text-xl font-medium text-gray-300">Fill the details and let AI plan your perfect event.</p>
              </motion.div>
            )}
            
            {loading && (
              <motion.div variants={bubbleVariants} initial="hidden" animate="visible" className="bubble-card p-12 text-center h-[400px] flex flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                   <Loader2 className="text-pink-400 mb-6" size={60} />
                </motion.div>
                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse">
                  AI is crafting your event... ✨
                </p>
              </motion.div>
            )}

            {plan && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Budget */}
                <motion.div variants={bubbleVariants} className="bubble-card p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><DollarSign className="text-green-400" /> Budget Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plan.budgetBreakdown.map((item, i) => (
                      <motion.div whileHover={{ scale: 1.02 }} key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                        <span className="text-gray-300 font-medium">{item.category}</span> 
                        <span className="font-extrabold text-green-400 text-lg">₹{item.amount}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div variants={bubbleVariants} className="bubble-card p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Calendar className="text-blue-400" /> Timeline</h3>
                  <ul className="space-y-4 border-l-2 border-blue-500/30 ml-3">
                    {plan.timeline.map((item, i) => (
                      <motion.li whileHover={{ x: 5 }} key={i} className="pl-6 relative">
                        <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                        <span className="font-bold text-blue-300 mr-2">{item.daysBefore} Days Before:</span> 
                        <span className="text-gray-200">{item.task}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Vendors & Ideas */}
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={bubbleVariants} className="bubble-card p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Users className="text-purple-400" /> Vendors Checklist</h3>
                    <ul className="space-y-3">
                      {plan.vendors.map((v, i) => (
                        <motion.li whileHover={{ scale: 1.02 }} key={i} className="bg-white/5 p-3 rounded-xl px-5 text-gray-300 border border-white/5">
                          {v}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div variants={bubbleVariants} className="bubble-card p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Sparkles className="text-yellow-400" /> Personalized Ideas</h3>
                    <ul className="space-y-3">
                      {plan.personalizedIdeas.map((idea, i) => (
                        <motion.li whileHover={{ scale: 1.02 }} key={i} className="bg-gradient-to-r from-yellow-500/10 to-transparent p-3 rounded-xl px-5 text-gray-300 border border-yellow-500/10">
                          {idea}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;

