import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import './Chat.css'; // Add your CSS styles here

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  createdAt: string;
  status: string;
}

interface User {
  _id: string;
  name: string;
}

interface ChatProps {
  userId: string; // Logged-in user's ID
  recipient: User; // Recipient details
}

const Chat: React.FC<ChatProps> = ({ userId, recipient }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  const socket = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Connect to the WebSocket server
  useEffect(() => {
    socket.current = io("http://localhost:3001" as string, {
      auth: { userId },
    });

    // Event listeners
    socket.current.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.current.on('userTyping', ({ userId: typingUserId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (typingUserId === recipient._id) setIsTyping(isTyping);
    });

    socket.current.on('userOnline', (userId: string) => {
      if (userId === recipient._id) setOnlineStatus(true);
    });

    socket.current.on('userOffline', (userId: string) => {
      if (userId === recipient._id) setOnlineStatus(false);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [userId, recipient]);

  // Scroll to the latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket.current) {
      socket.current.emit('typing', { recipientId: recipient._id, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.current?.emit('typing', { recipientId: recipient._id, isTyping: false });
      }, 1000);
    }
  };

  // Send a message
  const sendMessage = () => {
    if (newMessage.trim() === '' || !socket.current) return;

    const messageData = {
      recipientId: recipient._id,
      content: newMessage,
    };

    socket.current.emit('privateMessage', messageData);

    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(), // Temporary ID until backend assigns one
        sender: userId,
        recipient: recipient._id,
        content: newMessage,
        createdAt: new Date().toISOString(),
        status: 'sent',
      },
    ]);

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{recipient.name}</h3>
        <span className={`status ${onlineStatus ? 'online' : 'offline'}`}>
          {onlineStatus ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender === userId ? 'sent' : 'received'}`}
          >
            <p>{message.content}</p>
            <span className="timestamp">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>
      {isTyping && <div className="typing-indicator">{`${recipient.name} is typing...`}</div>}
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
