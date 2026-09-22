import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, X, Send, ArrowRight, ShieldAlert, PlaySquare, MapPin, Database, ChevronRight, MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  actionLink?: {
    label: string;
    url: string;
  };
  timestamp: string;
};

export const BhoomiCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'BOT',
      text: "Namaste! I am the BhoomiRaksha AI Copilot. Ask me anything about corridor delay forecasts, statutory bottlenecks, policy simulations, or high-risk projects across 2,540 national highway records.",
      timestamp: 'Just now',
    }
  ]);

  const QUICK_PROMPTS = [
    { label: "Top Critical States", query: "Which states have the highest concentration of critical project delays?" },
    { label: "High Court Litigations", query: "Show corridors facing severe legal disputes and pending cases" },
    { label: "What-If Policy Advice", query: "What intervention produces the fastest delay reduction?" },
    { label: "Section 3A vs 3D Bottleneck", query: "Explain why Section 3A to 3D causes the longest delay" },
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'USER',
      text: query,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent decision response
    setTimeout(() => {
      const qLower = query.toLowerCase();
      let botReply: Message;

      if (qLower.includes('state') || qLower.includes('highest') || qLower.includes('critical')) {
        botReply = {
          id: String(Date.now() + 1),
          sender: 'BOT',
          text: "Based on our Random Forest model analysis of 2,540 projects, Maharashtra, Uttar Pradesh, and Jammu & Kashmir show the highest count of critical risk corridors, primarily due to land valuation disputes and contested forest clearance parcels.",
          actionLink: {
            label: "Open State Analytics & Benchmarks",
            url: "/analytics",
          },
          timestamp: 'Just now',
        };
      } else if (qLower.includes('legal') || qLower.includes('court') || qLower.includes('litigation') || qLower.includes('case')) {
        botReply = {
          id: String(Date.now() + 1),
          sender: 'BOT',
          text: "Legal disputes under Section 3C (objections) and High Court writ petitions add an average of +22 days per case. Our simulation proves that holding dedicated Lok Adalats or dispute mediation camps compresses corridor schedule slippage by up to 65 days.",
          actionLink: {
            label: "Simulate Lok Adalat Fast-Track",
            url: "/simulate",
          },
          timestamp: 'Just now',
        };
      } else if (qLower.includes('policy') || qLower.includes('intervention') || qLower.includes('fastest') || qLower.includes('advice')) {
        botReply = {
          id: String(Date.now() + 1),
          sender: 'BOT',
          text: "The fastest delay-reduction intervention is 'Direct Escrow Handover' combined with pre-notification land validation: accelerating compensation to >85% compresses schedule slippage by 45–90 days and saves an estimated ₹3.2+ Crores in avoided contractor idling.",
          actionLink: {
            label: "Launch Interactive What-If Engine",
            url: "/simulate",
          },
          timestamp: 'Just now',
        };
      } else if (qLower.includes('bottleneck') || qLower.includes('3a') || qLower.includes('3d') || qLower.includes('statutory')) {
        botReply = {
          id: String(Date.now() + 1),
          sender: 'BOT',
          text: "The Section 3A to Section 3D phase is the nationwide statutory bottleneck. While the benchmark SLA is 180 days, actual national highway projects average 312 days (+132 days slippage). Digital parcel validation prior to gazette release resolves 80% of these delays.",
          actionLink: {
            label: "Review Statutory Milestone Tracker",
            url: "/analytics",
          },
          timestamp: 'Just now',
        };
      } else {
        botReply = {
          id: String(Date.now() + 1),
          sender: 'BOT',
          text: `Analyzing your query regarding "${query}". The predictive engine flags 500+ high-risk projects and evaluates real-time delay probability across multiple statutory indicators. You can inspect project dossiers or explore interactive map coordinates.`,
          actionLink: {
            label: "Explore Live GIS Risk Map",
            url: "/map",
          },
          timestamp: 'Just now',
        };
      }

      setMessages(prev => [...prev, botReply]);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-xl shadow-blue-700/30 hover:shadow-blue-700/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>BhoomiRaksha AI Copilot</span>
            </div>
          </button>
        )}
      </div>

      {/* Slide-over Copilot Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-[28px] shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600/80 border border-blue-400/30 flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">BhoomiRaksha Copilot</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-semibold">
                    AI Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Decision Intelligence & Policy Copilot</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'USER'
                      ? 'bg-blue-700 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actionLink && (
                    <button
                      onClick={() => {
                        navigate(msg.actionLink!.url);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 border-t border-slate-100 bg-white space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Quick Prompts</div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors flex-shrink-0"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about project delays, policies, or bottlenecks..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
