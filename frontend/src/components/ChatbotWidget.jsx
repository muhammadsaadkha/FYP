import { useState } from 'react';
import { Bot, MapPin, MessageCircle, Send, X } from 'lucide-react';
import { askAssistant } from '../services/chatService.js';

const starter = { role: 'assistant', text: 'Ask me about a timetable, teacher, subject, room, or a campus route. I use the exact LGU snapshot and your campus datastore.' };
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([starter]);
  const send = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput(''); setMessages((items) => [...items, { role: 'user', text }]); setLoading(true);
    try {
      const { data } = await askAssistant(text);
      setMessages((items) => [...items, { role: 'assistant', text: data.message, data }]);
    } catch (error) {
      setMessages((items) => [...items, { role: 'assistant', text: error.message || 'The assistant is temporarily unavailable.' }]);
    } finally { setLoading(false); }
  };
  return <div className={`assistant-dock ${open ? 'is-open' : ''}`}><button className="assistant-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close campus assistant' : 'Open campus assistant'}>{open ? <X size={20} /> : <MessageCircle size={20} />}<span>{open ? 'Close' : 'Campus assistant'}</span></button>{open && <section className="assistant-panel" aria-label="Campus assistant"><header><div><span className="assistant-icon"><Bot size={17} /></span><div><strong>Find My Class assistant</strong><small>Grounded in your campus data</small></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={17} /></button></header><div className="assistant-messages">{messages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}><p>{message.text}</p>{message.data?.navigation?.mapUrl && <a className="assistant-action" href={message.data.navigation.mapUrl}><MapPin size={14} /> Open path on campus map</a>}{message.data?.scheduleResults?.length > 0 && <div className="assistant-results">{message.data.scheduleResults.slice(0, 3).map((item, resultIndex) => <div key={`${item.entry.course}-${resultIndex}`}><strong>{item.entry.course}</strong><span>{item.entry.day} · {item.entry.start}–{item.entry.end} · {item.entry.room}</span><small>{item.entry.teacher}</small></div>)}</div>}{message.data?.citations?.[0] && <small className="assistant-citation">Source: {message.data.citations[0].label}</small>}</div>)}{loading && <div className="assistant-message assistant"><p>Searching the university datastore…</p></div>}</div><form className="assistant-compose" onSubmit={send}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a class or route…" aria-label="Ask campus assistant" /><button type="submit" disabled={loading || !input.trim()} aria-label="Send"><Send size={16} /></button></form></section>}</div>;
}
