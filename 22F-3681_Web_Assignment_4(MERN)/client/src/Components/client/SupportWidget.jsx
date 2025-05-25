import React, { useState, useEffect } from 'react';
import './SupportWidget.css';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hi! How can we help you today?', sender: 'support' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);

    // If opening the chat and we only have the initial message, add a welcome message
    if (!isOpen && messages.length === 1) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            text: 'You can ask questions about projects, payments, or freelancers.',
            sender: 'support'
          }
        ]);
      }, 1000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = { text: newMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate support agent typing
    setIsTyping(true);

    // Generate a response based on the message content
    setTimeout(() => {
      setIsTyping(false);

      let responseText = '';
      const lowerCaseMessage = newMessage.toLowerCase();

      if (lowerCaseMessage.includes('project') || lowerCaseMessage.includes('post')) {
        responseText = 'To post a new project, go to the "Post New Project" page and fill out the project details form. Make sure to include a clear description and budget.';
      } else if (lowerCaseMessage.includes('payment') || lowerCaseMessage.includes('invoice')) {
        responseText = 'You can view and manage all your payments in the Invoices section. We support multiple payment methods including credit cards and PayPal.';
      } else if (lowerCaseMessage.includes('freelancer') || lowerCaseMessage.includes('hire')) {
        responseText = 'You can browse freelancers by skills or invite specific freelancers to your projects. Check their ratings and portfolio before making a decision.';
      } else if (lowerCaseMessage.includes('bid') || lowerCaseMessage.includes('offer')) {
        responseText = 'When you receive bids, you can review them in the "Recent Bids" section. You can accept a bid by clicking the "Accept Bid" button.';
      } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        responseText = 'Hello! How can I assist you today with your projects or freelancers?';
      } else {
        responseText = 'Thanks for your message. If you have specific questions about projects, payments, or freelancers, I can help you with those topics.';
      }

      setMessages(prev => [...prev, { text: responseText, sender: 'support' }]);
    }, 1500);
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (isOpen) {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  return (
    <div className="support-widget">
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <h4>Support Chat</h4>
            <button onClick={toggleChat} className="close-btn">✖</button>
          </div>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === 'user' ? 'user-message' : 'support-message'}`}
              >
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button
        className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle support chat"
      >
        💬
      </button>
    </div>
  );
};

export default SupportWidget;
