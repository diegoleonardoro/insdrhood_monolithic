import "./chat.css"
import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";



const Chat = () => {

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // THE FOLLOWING IS NOT NECESSARY:
    // Fetch initial chat history if needed
    // const fetchHistory = async () => {
    //   // const response = await axios.get('http://localhost:5000/messages');
    //   const response = []
    //   setMessages(response); //.data.messages
    // };
    // fetchHistory();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    const message = { text: newMessage, is_user: true };

    try {
      const response = await axios.post(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/chat`, {
        message: newMessage,
        chatHistory: messages
      });

      setMessages(messages => [
        ...messages,
        message, // Add user message here
        { text: response.data, is_user: false } // AI's response
      ]);
      setNewMessage('');

    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
