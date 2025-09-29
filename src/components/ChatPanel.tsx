import React, { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, off } from 'firebase/database';
import { realtimeDb } from '../services/firebase';
import './ChatPanel.css';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  currentUser: any;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ currentUser, isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Funkcja zwracająca kolor użytkownika na podstawie jego nazwy
  const getUserColor = (userName: string) => {
    const colors: { [key: string]: string } = {
      'Apage': '#ffffff',  // Biały
      'Devrena': '#3498db', // Niebieski
      'Bocik': '#e74c3c',  // Czerwony
      'Warrior1': '#27ae60', // Zielony
      'Warrior2': '#2ecc71', // Zielony (odmiana)
    };

    return colors[userName] || '#3498db'; // Domyślny niebieski
  };

  // Load messages from Firebase Realtime Database
  useEffect(() => {
    const messagesRef = ref(realtimeDb, 'chat/messages');

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          user: value.user,
          message: value.message,
          timestamp: new Date(value.timestamp)
        }));
        // Sort by timestamp
        messagesArray.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    });

    return () => {
      off(messagesRef);
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && currentUser) {
      const messageData = {
        user: currentUser.name || currentUser.email || 'Użytkownik',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      const messagesRef = ref(realtimeDb, 'chat/messages');
      push(messagesRef, messageData);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Zamknij chat' : 'Otwórz chat'}
      >
        💬
      </button>

      {/* Chat panel */}
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Chat zespołu</h3>
          <button onClick={onToggle} className="chat-close-btn">×</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              Brak wiadomości. Rozpocznij rozmowę!
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className="chat-message">
                <div className="message-header">
                  <span className="message-user" style={{ color: getUserColor(message.user) }}>
                    {message.user}
                  </span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="message-content">{message.message}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder="Wpisz wiadomość..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            Wyślij
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;