import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import "./chat.css";

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { content: "Welcome to the NYC Neighborhood Chat! Ask questions and get insights directly from residents and various sources.", role: 'ai' },
    { content: "What borough do you want to explore?", role: 'ai' },
    { content: ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island'], role: 'options' }
  ]);
  const messagesEndRef = useRef(null);
  const [optionMapping, setOptionMapping] = useState({});

  useEffect(() => {
    // Initialize the mapping for the first set of options on component mount
    const initialOptions = messages.find(msg => msg.role === 'options')?.content;
    if (initialOptions) {
      const initialMapping = initialOptions.reduce((acc, option) => {
        acc[option] = 1; // Set the count for the initial options
        return acc;
      }, {});
      setOptionMapping(initialMapping);
    }
    scrollToBottom();
  }, []); // Only run once on component mount

  useEffect(() => {
    scrollToBottom();  // Ensure that the scrollToBottom is called every time messages are updated
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const processMessage = async (message, role = 'human', fromOption = null) => {
    const userMessage = { content: message, role: role };
    setMessages(currentMessages => [...currentMessages, userMessage, { content: "", role: "ai", loading: true }]);
    setNewMessage('');

    const validChatHistory = messages.filter(msg => msg.role === 'human' || msg.role === 'ai');

    try {
      const response = await axios.post(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/chat`, {
        message: message,
        fromOption: fromOption,
        chatHistory: validChatHistory
      });

      setMessages(currentMessages => {
        let newMessages = currentMessages.slice(0, -1);
        newMessages.push({ content: response.data.llm_response, role: "ai", loading: false });

        if (response.data.additional_option && response.data.additional_option.options) {
          newMessages.push({
            content: response.data.message,
            role: "ai"
          });
          newMessages.push({
            content: response.data.additional_option.options,
            role: 'options'
          });

          // Use set number from backend to update the mapping
          const setNumber = response.data.additional_option.setNumber;
          setOptionMapping(prevMapping => {
            const updatedMapping = { ...prevMapping };
            response.data.additional_option.options.forEach(option => {
              updatedMapping[option] = setNumber;
            });
            return updatedMapping;
          });
        }

        return newMessages;
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(currentMessages => {
        let newMessages = currentMessages.slice(0, -1);
        newMessages.push({ content: "Failed to fetch response", role: "ai" });
        return newMessages;
      });
    }
  };

  const handleOptionClick = (option) => {
    const questionLabel = `question-${optionMapping[option] || 1}`; // Default to 1 if undefined
    processMessage(option, 'human', questionLabel);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    processMessage(newMessage);
  };

  return (
    <div className="chat-container">
      <ul className="messages-list">
        {messages.map((msg, index) => (
          <li key={index} className={`message ${msg.role === 'human' ? 'user' : 'bot'}`}>
            {msg.role === 'options' ? (
              <div className="options-container">
                {msg.content.map(option => (
                  <button className="buttonOptionChat" key={option} onClick={() => handleOptionClick(option)}>{option}</button>
                ))}
              </div>
            ) : msg.loading ? <div className="loading-spinner"></div> : msg.content}
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message or select an option..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;