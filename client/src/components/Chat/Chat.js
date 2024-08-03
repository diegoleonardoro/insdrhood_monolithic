
import "./chat.css";
import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { content: newMessage, role: 'human' };
    // Immediately display the user's message and a loading spinner
    setMessages(currentMessages => [...currentMessages, userMessage, { content: "", role: "ai", loading: true }]);
    setNewMessage(''); // Clear the input field immediately after submission

    try {
      const response = await axios.post(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/chat`, {
        message: newMessage,
        chatHistory: messages
      });

      // Update messages by removing the loading message and adding the server response
      setMessages(currentMessages => {
        let newMessages = currentMessages.slice(0, -1); // Remove the last message which is the loading spinner
        newMessages.push({ content: response.data, role: "ai", loading: false }); // Add server response
        return newMessages;
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      // Update to remove the spinner and show an error message
      setMessages(currentMessages => {
        let newMessages = currentMessages.slice(0, -1); // Remove the loading spinner
        newMessages.push({ content: "Failed to fetch response", role: "ai" }); // Add error message
        return newMessages;
      });
    }
  };

  return (
    <div className="chat-container">
      <ul className="messages-list">
        {messages.map((msg, index) => (
          <li key={index} className={`message ${msg.role === 'human' ? 'user' : 'bot'}`}>
            {msg.loading ? <div className="loading-spinner"></div> : msg.content}
          </li>
        ))}
        <div ref={messagesEndRef} />
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

export default Chat;