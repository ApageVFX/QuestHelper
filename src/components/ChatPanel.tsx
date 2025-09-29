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

interface FirebaseChatMessage {
  user: string;
  message: string;
  timestamp: string;
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for messages from Firebase Realtime Database
  useEffect(() => {
    const messagesRef = ref(realtimeDb, 'chat/messages');

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data).map((msg: any, index: number) => ({
          id: Object.keys(data)[index], // Use Firebase key as ID
          user: msg.user,
          message: msg.message,
          timestamp: new Date(msg.timestamp)
        })) as ChatMessage[];

        // Sort by timestamp
        messagesArray.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    });

    // Cleanup listener on unmount
    return () => {
      off(messagesRef);
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() && currentUser) {
      const messagesRef = ref(realtimeDb, 'chat/messages');
      const message: FirebaseChatMessage = {
        user: currentUser.displayName || currentUser.email || 'Użytkownik',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      // Push to Firebase (it will generate its own ID)
      push(messagesRef, message);
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
                  <span className="message-user">{message.user}</span>
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