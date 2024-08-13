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
  const messagesEndRef = useRef([]);
  const chatContainerRef = useRef(null);  // Ref for the chat container to track scroll
  const [lastMessageIndex, setLastMessageIndex] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);  // State to track if the user is at the bottom

  const [optionMapping, setOptionMapping] = useState({});
  const [expanded, setExpanded] = useState({});

  const [visibleLinks, setVisibleLinks] = useState(1);
  const [visibleOptions, setVisibleOptions] = useState({});

  

  const [visibleEntries, setVisibleEntries] = useState({});

  const [visibleCharLimits, setVisibleCharLimits] = useState({});

  const handleShowMore = () => {
    setVisibleLinks(prevLinks => prevLinks + 3);  // Show 3 more links on click
  };

  const handleShowMoreEntries = (index) => {
    setVisibleEntries(prev => ({ ...prev, [index]: (prev[index] || 200) + 200 }));
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    const onScroll = () => {
      const atBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 10;
      setIsAtBottom(atBottom);
    };

    chatContainer.addEventListener('scroll', onScroll);

    // Initial options and scrollToBottom logic
    const initialOptions = messages.find(msg => msg.role === 'options')?.content;
    if (initialOptions) {
      const initialMapping = initialOptions.reduce((acc, option) => {
        acc[option] = 1;
        return acc;
      }, {});
      setOptionMapping(initialMapping);
    }
    scrollToBottom();
    messages.forEach((msg, index) => {
      if (msg.role === 'options') {
        setVisibleOptions(prev => ({ ...prev, [index]: 5 }));
      }
    });

    return () => {
      messagesEndRef.current = [];
      chatContainer.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();  // Ensure that the scrollToBottom is called every time messages are updated
  }, [messages]);

  const scrollToBottom = () => {
    if (isAtBottom) {
      messagesEndRef.current[lastMessageIndex + 1]?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShowMoreOptions = (index) => {
    setVisibleOptions(prev => ({ ...prev, [index]: (prev[index] || 4) + 4 })); // Increment by 4 more options
  };

  const processMessage = async (message, role = 'human', fromOption = null) => {

    setLastMessageIndex(messages.length - 1);
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

        // handle raw text
        newMessages.push({ content: response.data.llm_response, role: "ai", loading: false });

        // handle promotions links
        if (response.data.additional_option && response.data.additional_option.links) {
          newMessages.push({
            content: response.data.promotions_message,
            role: "ai"
          });
          newMessages.push({
            content: response.data.additional_option.links,
            role: 'promotion_links'
          });

        }

        // handle options
        if (response.data.additional_option && response.data.additional_option.options) {
          newMessages.push({
            content: response.data.message,
            role: "ai"
          });

          const options = response.data.additional_option.options;
          const setNumber = response.data.additional_option.setNumber;

          newMessages.push({
            content: options,
            role: 'options'
          });



          setOptionMapping(prevMapping => {
            const updatedMapping = { ...prevMapping };
            if (Array.isArray(options)) {
              options.forEach(option => {
                updatedMapping[option] = setNumber;
              });
            } else {
              Object.values(options).forEach(subOptions => {
                subOptions.forEach(option => {
                  updatedMapping[option] = setNumber;
                });
              });
            }
            return updatedMapping;
          });

          // Update visible options state based on the structure received
          if (Array.isArray(options)) {
            setVisibleOptions(prev => ({
              ...prev,
              [newMessages.length - 1]: 3  // Assuming index based on new message insertion
            }));
          } else {
            const newVisibility = {};
            Object.keys(options).forEach(section => {
              newVisibility[section] = 3; // Initialize with 5 visible items per section
            });
            setVisibleOptions(newVisibility);
          }
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

  const MAX_LENGTH = 180;

  // Function to render text content with "Show More/Less" logic
  const renderTextContent = (content, index) => {
    const isExpanded = expanded[index];
    if (content.length > MAX_LENGTH && !isExpanded) {
      return (
        <>
          {content.substring(0, MAX_LENGTH)}...
          <button onClick={() => toggleExpand(index)} className="buttonLikeText show-more">Show More</button>
        </>
      );
    } else {
      return (
        <>
          {content}
          {content.length > MAX_LENGTH && (
            <button onClick={() => toggleExpand(index)} className="buttonLikeText show-less">Show Less</button>
          )}
        </>
      );
    }
  };

  // Toggle function to expand or collapse the message text
  const toggleExpand = index => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderSectionOptions = (msg, msgIndex) => {
    let currentChars = 0;
    let sectionsRendered = [];
    let hasMoreContent = false; // Flag to determine if "Show More" should be displayed

    const totalVisibleChars = visibleCharLimits[msgIndex] || 50; // Default to 200 or use the stored limit
    const entries = Object.entries(msg.content);

    for (let i = 0; i < entries.length; i++) {
      const [section, options] = entries[i];
      let sectionChars = section.length + 2; // Include space for ": " or similar
      let optionsRendered = [];
      let displayedAllOptions = true;

      for (let option of options) {
        let optionChars = option.length + 2; // Include space for a comma or space
        if (currentChars + sectionChars + optionChars <= totalVisibleChars) {
          optionsRendered.push(
            <button className="buttonOptionChat" key={`${option}-${msgIndex}-${i}`} onClick={() => handleOptionClick(option, section)}>
              {option}
            </button>
          );
          sectionChars += optionChars;
        } else {
          displayedAllOptions = false;
          hasMoreContent = true; // There are still options not shown
          break; // Stop adding more options if the limit is exceeded
        }
      }

      if (optionsRendered.length > 0) {
        sectionsRendered.push(
          <div key={i}>
            <div className="section-title">{section}</div>
            {optionsRendered}
          </div>
        );
        currentChars += sectionChars;
      }

      if (!displayedAllOptions) {
        break; // Stop rendering further sections if limit reached within a section
      }
    }

    return (
      <>
        {sectionsRendered}
        {hasMoreContent && (
          <button className="buttonLikeText buttonOptionChat show-more" onClick={() => handleShowMoreChars(msgIndex)}>
            Show More
          </button>
        )}
      </>
    );
  };

  const handleShowMoreChars = (msgIndex) => {
    setVisibleCharLimits(prevLimits => ({
      ...prevLimits,
      [msgIndex]: (prevLimits[msgIndex] || 200) + 200
    }));
  };

  return(
    <div className="chat-container" ref={chatContainerRef}>
      <ul className="messages-list">
        {messages.map((msg, index) => (
          <li key={index} className={`message ${msg.role === 'human' ? 'user' : 'bot'}`} ref={el => messagesEndRef.current[index] = el}>
            {msg.role === 'options' ? (
              <div className="options-container">
                {Array.isArray(msg.content) ? (
                  msg.content.slice(0, visibleOptions[index] || 5).map(option => (
                    <button className="buttonOptionChat" key={option} onClick={() => handleOptionClick(option)}>
                      {option}
                    </button>
                  ))
                ) : renderSectionOptions(msg, index)}
              </div>
            ) : msg.role === 'promotion_links' ? (
              <div className="promotion-links-container">
                {msg.content.slice(0, visibleLinks).map((promotion, promotionIndex) => (
                  <a href={promotion['Activity URL']} className="promotionLink" style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" key={promotion['Activity URL']}>
                    <div style={{ color: "white", marginTop: "15px", borderBottom: "1px solid white" }}>
                      <div style={{ backgroundColor: "#007bff", display: "inline-block", paddingLeft: "7px", paddingRight: "7px", borderRadius: "10px", marginBottom: "10px" }}>{promotion['Tour Title']}</div>
                      <div>Category: {promotion['Category']}</div>
                    </div>
                  </a>
                ))}
                {visibleLinks < msg.content.length && (
                    <button className="buttonLikeText buttonOptionChat show-more" onClick={handleShowMore}>Show More</button>
                )}
              </div>
            ) : msg.loading ? (
              <div className="loading-typing">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              <div>
                {msg.content.info ? renderTextContent(msg.content.info, index) : renderTextContent(msg.content, index)}
              </div>
            )}

          </li>
        ))}
      </ul>
      {!isAtBottom && (
        <div className="scroll-indicator">More messages below</div>
      )}
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