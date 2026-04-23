import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSetup = (e) => {
    e.preventDefault();
    if (phoneNumber.trim().length >= 5) {
      setIsSetup(true);
      // Optional: Fetch previous history if the backend is running
      fetchHistory(phoneNumber);
    } else {
      alert("Please enter a valid phone number.");
    }
  };

  const fetchHistory = async (phone) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${phone}`);
      if (res.ok) {
        const data = await res.json();
        // data contains { message_content, direction, created_at, message_type }
        const history = data.map(msg => ({
          text: msg.message_content,
          sender: msg.direction === 'INCOMING' ? 'user' : 'system',
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        if(history.length > 0) {
          setMessages(history);
        } else {
          // Default greeting
          setMessages([
            { text: "Welcome! Send 'PENZI' to activate our dating service.", sender: 'system', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]);
        }
      }
    } catch (error) {
      console.log("Could not fetch history, start fresh", error);
      setMessages([
        { text: "Welcome! Send 'PENZI' to activate our dating service.", sender: 'system', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Small artificial delay for realism
      await new Promise(r => setTimeout(r, 600));

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          message: userMessage.text
        })
      });

      if (response.ok) {
        const data = await response.json(); // Array of replies
        const newBotMessages = data.map(reply => ({
          text: reply.reply,
          sender: 'system',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setMessages(prev => [...prev, ...newBotMessages]);
      } else {
        setMessages(prev => [...prev, { text: "Error: Could not reach Penzi service.", sender: 'system', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Network error. Make sure the backend is running.", sender: 'system', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isSetup && (
        <div className="setup-overlay">
          <div className="setup-card">
            <h2>Enter your Phone Number</h2>
            <form onSubmit={handleSetup}>
              <input
                type="text"
                className="setup-input"
                placeholder="e.g. 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
              />
              <button type="submit" className="setup-btn">Start Chatting</button>
            </form>
          </div>
        </div>
      )}

      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <div className="avatar">
            P
          </div>
          <div className="header-info">
            <h1>Penzi SMS</h1>
            <p><span className="status-dot"></span> Online - 22141</p>
          </div>
        </header>

        {/* Message Thread */}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                {msg.text}
              </div>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper system">
              <div className="message-bubble" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                Typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <form className="input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isSetup || isLoading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!inputValue.trim() || !isSetup || isLoading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
