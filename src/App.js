import React, { useState, useEffect } from 'react';
import './App.css';
import Code from './Code';
import Content from './Content';
import Image from './Image';
import StarsBackground from './StarsBackground';
import quotesData from './quotes.json'; 
import Modal from './Modal'; 

const IMAGE_COST = 7;
const CODE_CONTENT_COST = 4;

function App() {
  const API_DOMAIN = process.env.REACT_APP_API_DOMAIN;
  const [selectedModel, setSelectedModel] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [credits, setCredits] = useState(0); // Default to 0 until fetched
  const [canGenerate, setCanGenerate] = useState(true);
  const [clickedButton, setClickedButton] = useState(null); 
  const [randomQuote, setRandomQuote] = useState(''); 
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fade, setFade] = useState(false); 
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // For welcome message
  const [showCreditsModal, setShowCreditsModal] = useState(false); // For insufficient credits
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    // Show welcome modal 2 seconds after the page loads
    const timer = setTimeout(() => {
      setModalMessage(
        `<p>🔄 Credits reset automatically every 12 hours. ⏰</p>
        <p>🖼️ Image Generation: ${IMAGE_COST} Credits</p>
        <p>💻 Code Generation: ${CODE_CONTENT_COST} Credits</p>
        <p>📝 Content Generation: ${CODE_CONTENT_COST} Credits</p>`
      );
      setShowWelcomeModal(true);
    }, 500);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);
  
  useEffect(() => {
    // Fetch initial credits from the API
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/api/credits`);
      const data = await response.json();
      setCredits(data.credits);
      setCanGenerate(data.credits > 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleModelSelection = (model) => {
    if (model === 'image' && credits < IMAGE_COST) {
      handleInsufficientCredits();
      return;
    }
    if ((model === 'code' || model === 'content') && credits < CODE_CONTENT_COST) {
      handleInsufficientCredits();
      return;
    }

    setSelectedModel(model);
    setInputText('');
    setLoading(false);
    setLoadingMessage('');
    setClickedButton(model); 
  };

  const startLoading = () => {
    setLoading(true);
    setLoadingMessage('');
    setTimeout(() => setLoadingMessage("It's taking longer than usual. Please wait..."), 7000);
  };

  const stopLoading = () => {
    setLoading(false);
    setLoadingMessage('');
  };

  const handleInsufficientCredits = () => {
    setModalMessage("❌ Your credits have expired or are insufficient. 😞⏳ Please try again after 12 hours. ⏰");
    setShowCreditsModal(true);
  };
  

  const handleDeductCreditsContentCode = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/api/deductcreditscontentcode`);
      const data = await response.json();
  
      if (data.credits !== undefined) {
        setCredits(data.credits);
        setCanGenerate(data.credits > 0);
        return true; // Indicate success
      }
  
      // Check if the response message indicates "Not enough time"
      if (data.message === "Not enough time has passed to recover credits.") {
        setModalMessage(data.message);
        setShowCreditsModal(true);
        return false; // Indicate failure due to insufficient time
      }
  
      handleInsufficientCredits(); // If no valid credits or other issues
      return false; // Indicate failure
    } catch (error) {
      console.error('Error deducting credits for content/code:', error);
      handleInsufficientCredits();
      return false; // Indicate failure
    }
  };
  
  const handleDeductCreditsImage = async () => {
    try {
      const response = await fetch(`${API_DOMAIN}/api/deductcreditsimage`);
      const data = await response.json();
  
      if (data.credits !== undefined) {
        setCredits(data.credits);
        setCanGenerate(data.credits > 0);
        return true; // Indicate success
      }
  
      // Check if the response message indicates "Not enough time"
      if (data.message === "Not enough time has passed to recover credits.") {
        setModalMessage(data.message);
        setShowCreditsModal(true);
        return false; // Indicate failure due to insufficient time
      }
  
      handleInsufficientCredits(); // If no valid credits or other issues
      return false; // Indicate failure
    } catch (error) {
      console.error('Error deducting credits for image:', error);
      handleInsufficientCredits();
      return false; // Indicate failure
    }
  };
  
  const getRandomQuote = () => {
    setFade(false); 
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotesData.quotes.length);
      setRandomQuote(quotesData.quotes[randomIndex].quote);
      setFade(true); 
    }, 300);
  };

  useEffect(() => {
    getRandomQuote();
    const interval = setInterval(getRandomQuote, 5000); 
    return () => clearInterval(interval); 
  }, []);

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="App">
      <StarsBackground />

      {/* Welcome Modal (shown 2 seconds after page load) */}
      {showWelcomeModal && (
        <Modal
          message={
            <div dangerouslySetInnerHTML={{ __html: modalMessage }}></div>
          }
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      {/* Credits Warning Modal (shown on insufficient credits) */}
      {showCreditsModal && (
        <Modal
          message={modalMessage} // No need for HTML here
          onClose={() => setShowCreditsModal(false)}
        />
      )}

      <div
        className="credits-display"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Credits Available: {credits}
      </div>
      {tooltipVisible && (
        <div className="tooltip">
          <p>Image Generation: {IMAGE_COST} Credits</p>
          <p>Code Generation: {CODE_CONTENT_COST} Credits</p>
          <p>Content Generation: {CODE_CONTENT_COST} Credits</p>
          <p>Credits reset automatically every 12 hours.</p>
        </div>
      )}

      <div className="content-container">
        <h1 className={`quote ${fade ? 'quote-enter-active' : 'quote-enter'}`}>
          {randomQuote}
        </h1>
        <button
          className={`button ${clickedButton === 'content' ? 'clicked' : ''}`}
          onClick={() => handleModelSelection('content')}
        >
          Content Generation
        </button>
        <button
          className={`button ${clickedButton === 'code' ? 'clicked' : ''}`}
          onClick={() => handleModelSelection('code')}
        >
          Code Generation
        </button>
        <button
          className={`button ${clickedButton === 'image' ? 'clicked' : ''}`}
          onClick={() => handleModelSelection('image')}
        >
          Image Generation
        </button>

        {loading && (
          <div className="loading-container">
            <div className="loading"></div>
            {loadingMessage && <p>{loadingMessage}</p>}
          </div>
        )}

        {selectedModel === 'code' && (
          <Code inputText={inputText} startLoading={startLoading} stopLoading={stopLoading} deductCredits={() => {
            const result = handleDeductCreditsContentCode(); // Call API to deduct credits
            console.log(result);
            if (!result) handleInsufficientCredits(); // Trigger modal if credits are insufficient
          }}
           />
        )}

        {selectedModel === 'content' && (
          <Content inputText={inputText} startLoading={startLoading} stopLoading={stopLoading} deductCredits={() => {
            const result = handleDeductCreditsContentCode(); // Call API to deduct credits
            if (!result) handleInsufficientCredits(); // Trigger modal if credits are insufficient
          }}
           />
        )}

        {selectedModel === 'image' && (
          <Image inputText={inputText} startLoading={startLoading} stopLoading={stopLoading} deductCredits={() => {
            const result = handleDeductCreditsImage(); // Call API to deduct credits
            if (!result) handleInsufficientCredits(); // Trigger modal if credits are insufficient
          }}
           />
        )}
        
        {!canGenerate && (
          <p></p>
        )}
      </div>
    </div>
  );
}

export default App;
