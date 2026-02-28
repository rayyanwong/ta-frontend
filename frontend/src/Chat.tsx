import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'mentor';
  content: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: input, timestamp: time };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: input }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, {
          role: 'mentor',
          content: data.mentorReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar">M</div>
        <div>
          <div className="font-bold">Trading Mentor AI</div>
          <div className="text-xs"><span className="status-dot"></span>Online</div>
        </div>
      </div>

      <div className="message-area">
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}`}>
            <div className="markdown-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            <span className="timestamp">{msg.timestamp}</span>
          </div>
        ))}
        {isLoading && (
          <div className="typing-dots">
            <div className="dot"></div><div className="dot"></div><div className="dot"></div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your trades..."
        />
        <button className="send-btn" onClick={handleSendMessage}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;
