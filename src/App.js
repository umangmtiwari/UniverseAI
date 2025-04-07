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
  const [apiLoading, setApiLoading] = useState(false); // Track API loading state
  const [usedService, setUsedService] = useState(null); // Track the service used before credits are loaded

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

  useEffect(() => {
    if (usedService == null) return;
    if (usedService == "code" || usedService == "content") {
      const result = handleDeductCredits(); 
      if (!result) handleInsufficientCredits();
      setUsedService(null);
    }
    else if(usedService == "image"){
        const result = handleDeductCredits();
        if (!result) handleInsufficientCredits();
        setUsedService(null);
    }
  }, [usedService]);  // This effect will run whenever `usedService` changes

  const deductCreditsForService = async (service) => {
    if (service === 'image') {
      await handleDeductCredits();
    } else if (service === 'content' || service === 'code') {
      await handleDeductCredits();
    }
  };

  const fetchCredits = () => {
    const storedCredits = parseInt(localStorage.getItem('credits'), 10);
    const lastReset = parseInt(localStorage.getItem('lastReset'), 10);
    const now = Date.now();
  
    if (!lastReset || now - lastReset > 12 * 60 * 60 * 1000) {
      localStorage.setItem('credits', '15'); // start with 15 total
      localStorage.setItem('lastReset', now.toString());
      setCredits(15);
      setCanGenerate(true);
    } else {
      setCredits(storedCredits || 0);
      setCanGenerate((storedCredits || 0) > 0);
    }
  };  

  const handleModelSelection = (model) => {
    if (apiLoading) {
      // If API is still loading (i.e., waking up), allow usage without deducting credits
      //setUsedService(model); // Track the selected service
      setSelectedModel(model);
      setInputText('');
      setLoading(false);
      setLoadingMessage('');
      setClickedButton(model);
      console.log("Used Service if API not loaded: ",usedService);
      return;
    }

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

  
const handleDeductCredits = (cost) => {
  const current = parseInt(localStorage.getItem('credits'), 10) || 0;
  if (current >= cost) {
    const newCredits = current - cost;
    localStorage.setItem('credits', newCredits.toString());
    setCredits(newCredits);
    setCanGenerate(newCredits > 0);
    return true;
  } else {
    handleInsufficientCredits();
    return false;
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

      {showWelcomeModal && (
        <Modal
          message={<div dangerouslySetInnerHTML={{ __html: modalMessage }}></div>}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      {showCreditsModal && (
        <Modal
          message={modalMessage} 
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
          <Code 
          inputText={inputText} 
          startLoading={startLoading} 
          stopLoading={stopLoading} 
          deductCredits={handleDeductCredits}
          codeContentCost={CODE_CONTENT_COST}
        />
        
        )}

        {selectedModel === 'content' && (
          <Content 
          inputText={inputText} 
          startLoading={startLoading} 
          stopLoading={stopLoading} 
          deductCredits={handleDeductCredits}
          codeContentCost={IMAGE_COST}
          />
        )}

        {selectedModel === 'image' && (
          <Image 
          inputText={inputText} 
          startLoading={startLoading} 
          stopLoading={stopLoading} 
          deductCredits={handleDeductCredits}
          imageCost={IMAGE_COST}
        />            
        )}
      </div>
    </div>
  );
}

export default App;
