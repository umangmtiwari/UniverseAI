import React, { useState } from 'react';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

function Image({ deductCredits, imageCost}) {
  const bedrockClient = new BedrockRuntimeClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
  });

  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...'); // State for loading message
  let timeoutId = null; // To hold the timeout ID

  const handleTextInput = (e) => {
    setInputText(e.target.value);
  };

  const handleGeneration = async () => {
    if (!inputText) return;

    // Deduct credits here
    deductCredits(imageCost);

    setLoading(true);
    setLoadingMessage('Loading...'); // Reset loading message

    // Set timeout to change the loading message after 7 seconds
    timeoutId = setTimeout(() => {
      setLoadingMessage("It's taking longer than usual. Please wait...");
    }, 7000);

    const payload = {
      textToImageParams: {
        text: inputText,
      },
      taskType: "TEXT_IMAGE",
      imageGenerationConfig: {
        cfgScale: 8,
        seed: 0,
        quality: "standard",
        width: 1024,
        height: 1024,
        numberOfImages: 1,
      },
    };

    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-image-generator-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      const data = await bedrockClient.send(command);
      clearTimeout(timeoutId);
      const responseBody = JSON.parse(new TextDecoder().decode(data.body));
      const base64Images = responseBody.images || [];
      setImages(base64Images.map((imageData) => `data:image/png;base64,${imageData}`));
    } catch (error) {
      console.error('Error:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageSrc) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = 'generated-image.png'; // Specify a default filename
    link.click();
  };

  return (
    <div className="content-container">
      <div className="chat-bar">
        <textarea
          value={inputText}
          onChange={handleTextInput}
          placeholder="Enter your prompt here..."
          rows="1"
          className="chat-input"
        />
        <button className="send-button" onClick={handleGeneration} disabled={!inputText || loading}>
          ➜
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading"></div>
          <div className="loading-message">{loadingMessage}</div>
        </div>
      )}
      
      {images.length > 0 && (
        <div className="response-content">
          <div className="image-gallery" style={{ display: 'flex', flexDirection: 'column' }}>
            {images.map((imageSrc, index) => (
              <div key={index} style={{ position: 'relative', marginBottom: '10px' }}>
                <img src={imageSrc} alt={`Generated ${index + 1}`} style={{ width: '400px', height: '400px', objectFit: 'contain' }} />
                <button onClick={() => handleDownload(imageSrc)} className="copy-button" style={{ position: 'absolute', top: '10px', right: '80px' }}>
                  Download Image
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Image;