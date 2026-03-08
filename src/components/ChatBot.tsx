'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// Featherless AI config
const FEATHERLESS_API_KEY = 'rc_82ef6597804cb6b2ab383a3b60d9d088c29c0a45e06d567d512066fbc7e70dcc';
const FEATHERLESS_API_URL = 'https://api.featherless.ai/v1/chat/completions';
const FEATHERLESS_MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct';

const SYSTEM_PROMPT =
  'You are a friendly and helpful AI assistant for NibbleNet, a food surplus marketplace app that connects providers (restaurants, bakeries, grocery stores) with consumers looking for affordable food. ' +
  'Keep answers concise and helpful. ' +
  'If the user asks how to contact us, reply with: "You can reach us at: support@nibblenet.com"';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([
    { role: 'system', content: SYSTEM_PROMPT },
  ]);

  // Auto-greet after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!greeted) {
        const greeting = 'Hi! Do you need help with anything?';
        setMessages([{ role: 'assistant', content: greeting }]);
        historyRef.current.push({ role: 'assistant', content: greeting });
        setShowBadge(true);
        setGreeted(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [greeted]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((o) => !o);
    setShowBadge(false);
  };

  const fetchAIResponse = async (): Promise<string> => {
    const res = await fetch(FEATHERLESS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FEATHERLESS_API_KEY}`,
      },
      body: JSON.stringify({
        model: FEATHERLESS_MODEL,
        messages: historyRef.current,
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content.trim();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', content: text });
    setInput('');

    // Contact shortcut
    if (/contact|reach|email|support/i.test(text)) {
      const reply = 'You can reach us at: support@nibblenet.com';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      historyRef.current.push({ role: 'assistant', content: reply });
      return;
    }

    // Fetch AI response
    setIsTyping(true);
    try {
      const reply = await fetchAIResponse();
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      historyRef.current.push({ role: 'assistant', content: reply });
    } catch (err) {
      console.error('Featherless API error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I wasn't able to get a response. Please try again later." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {/* Floating bubble */}
      <button
        onClick={toggleOpen}
        style={{ pointerEvents: 'auto' }}
        className="absolute bottom-16 right-3 w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        {showBadge && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div style={{ pointerEvents: 'auto' }} className="absolute bottom-[112px] right-3 left-3 max-h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-brand-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <span className="font-semibold text-sm">NibbleNet Assistant</span>
            <button onClick={toggleOpen} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[260px] max-h-[320px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                  msg.role === 'user'
                    ? 'ml-auto bg-brand-600 text-white rounded-br-sm'
                    : 'mr-auto bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto bg-gray-100 text-gray-400 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 px-3 py-2.5 flex gap-2 bg-gray-50 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shrink-0"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
