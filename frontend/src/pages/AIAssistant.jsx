import { useState } from "react";
import {
  Send,
  Bot,
  User,
  Sprout,
  Droplets,
  CloudSun,
  Bug,
  Lightbulb
} from "lucide-react";

function AIAssistant() {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello Farmer! 👋 How can I help you with your farm today?"
    }
  ]);

  const suggestions = [
    "Which fertilizer is good for tomato?",
    "How often should I irrigate rice?",
    "How can I prevent crop diseases?",
    "What is the best time to plant maize?"
  ];

  const sendMessage = (text = message) => {

    if (!text.trim()) return;

    const userMessage = {
      type: "user",
      text: text
    };

    setMessages((prev) => [...prev, userMessage]);

    setMessage("");

    setTimeout(() => {

      const aiMessage = {
        type: "ai",
        text:
          "Based on your farming question, I recommend checking soil moisture, crop growth stage and current weather conditions before making a decision. 🌱"
      };

      setMessages((prev) => [...prev, aiMessage]);

    }, 700);
  };


  return (

    <div className="ai-page">

      {/* HERO */}

      <section className="ai-hero">

        <div className="ai-hero-content">

          <div className="ai-badge">
            <Bot size={18} />
            SmartAgri AI Assistant
          </div>

          <h1>
            Your Intelligent
            <span> Farming Assistant 🌱</span>
          </h1>

          <p>
            Get instant guidance about crops, soil, irrigation,
            fertilizers, diseases and farming practices.
          </p>

        </div>

        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80"
          alt="Modern agriculture field"
          className="ai-hero-image"
        />

      </section>


      {/* MAIN CHAT AREA */}

      <section className="ai-layout">

        {/* CHAT */}

        <div className="chat-card">

          <div className="chat-header">

            <div className="chat-bot-icon">
              <Bot size={25} />
            </div>

            <div>
              <h2>SmartAgri AI</h2>
              <span>
                <span className="online-dot"></span>
                AI Assistant Online
              </span>
            </div>

          </div>


          {/* Messages */}

          <div className="messages">

            {messages.map((item, index) => (

              <div
                key={index}
                className={`message-row ${item.type}`}
              >

                {item.type === "ai" && (
                  <div className="message-avatar ai-avatar">
                    <Bot size={18} />
                  </div>
                )}

                <div className="message-bubble">
                  {item.text}
                </div>

                {item.type === "user" && (
                  <div className="message-avatar user-avatar">
                    <User size={18} />
                  </div>
                )}

              </div>

            ))}

          </div>


          {/* Input */}

          <div className="chat-input-area">

            <input
              type="text"
              value={message}
              placeholder="Ask about crops, soil, fertilizer..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
              onClick={() => sendMessage()}
              className="send-button"
            >
              <Send size={19} />
            </button>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="ai-sidebar">


          {/* Quick Questions */}

          <div className="ai-side-card">

            <div className="side-card-title">
              <Lightbulb size={19} />
              <h3>Quick Questions</h3>
            </div>

            <div className="suggestions">

              {suggestions.map((item, index) => (

                <button
                  key={index}
                  onClick={() => sendMessage(item)}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* AI Features */}

          <div className="ai-side-card">

            <div className="side-card-title">
              <Sprout size={19} />
              <h3>AI Capabilities</h3>
            </div>

            <div className="ai-feature">

              <div className="feature-icon green">
                <Sprout size={18} />
              </div>

              <div>
                <strong>Crop Guidance</strong>
                <p>Planting and harvesting advice</p>
              </div>

            </div>


            <div className="ai-feature">

              <div className="feature-icon blue">
                <Droplets size={18} />
              </div>

              <div>
                <strong>Irrigation</strong>
                <p>Watering recommendations</p>
              </div>

            </div>


            <div className="ai-feature">

              <div className="feature-icon orange">
                <CloudSun size={18} />
              </div>

              <div>
                <strong>Weather Advice</strong>
                <p>Weather-based farming tips</p>
              </div>

            </div>


            <div className="ai-feature">

              <div className="feature-icon red">
                <Bug size={18} />
              </div>

              <div>
                <strong>Disease Support</strong>
                <p>Identify possible crop diseases</p>
              </div>

            </div>

          </div>


          {/* Farming Image */}

          <div className="ai-photo-card">

            <img
              src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=600&q=80"
              alt="Green agricultural field"
            />

            <div className="photo-overlay">
              <h3>Grow Smarter 🌱</h3>
              <p>
                Use AI-powered information to make
                better farming decisions.
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AIAssistant;