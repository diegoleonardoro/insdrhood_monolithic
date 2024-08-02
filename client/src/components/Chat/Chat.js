import "./chat.css"
import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";



const Chat = () => {
  const [newMessage, setNewMessage] = useState('');

  const [messages, setMessages]= useState([])

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    // onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <ul className="messages-list">
        {messages.map((msg, index) => (
          <li key={index} className={`message ${msg.is_user ? 'user' : 'bot'}`}>
            {msg.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat
