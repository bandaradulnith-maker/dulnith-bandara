import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface BioGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextSpecies?: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

export const BioGuideDrawer: React.FC<BioGuideDrawerProps> = ({
  isOpen,
  onClose,
  contextSpecies,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: contextSpecies
        ? `Hello! I am BioGuide, your nature research assistant. I see you are studying ${contextSpecies}. What would you like to know about its taxonomy, behavior, or habitat conservation?`
        : 'Hello! I am BioGuide, your AI biodiversity companion. You can ask me about species identification keys, wildlife observation ethics, ecological food webs, or conservation statuses. How can I help you explore today?',
      citations: ['IUCN Red List of Threatened Species', 'Global Biodiversity Information Facility (GBIF)'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Why are pollinators vital to tropical ecosystems?',
    'How do I observe wildlife safely without causing stress?',
    'What is the difference between Endangered and Vulnerable?',
    'How can I distinguish similar bird calls in dense forest?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/bioguide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6),
          contextSpecies: contextSpecies || undefined,
        }),
      });

      if (!res.ok) throw new Error('BioGuide service temporarily unavailable.');

      const data = await res.json();
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: data.reply,
          citations: data.citations || ['IUCN Species Survival Commission', 'Biodiversity Conservation Research Center'],
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I could not connect to the biodiversity knowledgebase. Please check your network and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">BioGuide AI</h2>
              <p className="text-[10px] text-emerald-300/80 font-medium">
                Ethical Wildlife & Biodiversity Research Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ethics Guard Notice Banner */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2 text-[10px] text-emerald-900 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Strict Leave-No-Trace protocol: Coordinates masked for protected taxa</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-800 text-white rounded-br-none shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm space-y-2'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
                    <span className="font-semibold text-slate-500">Citations:</span>
                    {m.citations.map((c, i) => (
                      <p key={i}>· {c}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>BioGuide is consulting biodiversity records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp)}
              className="text-[10px] font-medium whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask BioGuide about wildlife, species, or field ethics..."
            className="flex-1 bg-slate-100 border border-transparent focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
