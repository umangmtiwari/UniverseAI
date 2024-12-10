import React, { useState } from 'react';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const Code = ({ deductCredits, codeContentCost}) => {
  const bedrockClient = new BedrockRuntimeClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
  });

  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...'); // State for loading message
  const [showResponse, setShowResponse] = useState(false); // State to control visibility of response
  let timeoutId = null; // To hold the timeout ID

  const handleTextInput = (e) => {
    setInputText(e.target.value);
  };

  const handleGeneration = async () => {
    if (!inputText) return;

    // Deduct credits here
    deductCredits(codeContentCost); // Pass the cost as an argument

    setLoading(true);
    setResponse('');
    setShowResponse(true); // Show response area when button is clicked

    // Set timeout to change the loading message after 5 seconds
    timeoutId = setTimeout(() => {
      setLoadingMessage("Loading... It's taking longer than usual");
    }, 5000);

    const params = {
      modelId: "anthropic.claude-v2",
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Human: Write a short and high-quality python script for the following task:\n<task>\n${inputText}\n</task>\nAssistant:`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 2048,
        stopSequences: ["\n\nHuman:"],
        temperature: 0.5,
        topP: 1
      }
    };

    const command = new ConverseCommand(params);

    try {
      const response = await bedrockClient.send(command);
      const content = response?.output?.message?.content?.[0]?.text || 'No response';
      setResponse(content);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error generating response. Please try again.');
    } finally {
      setLoading(false);
      clearTimeout(timeoutId); // Clear timeout when loading is done
    }
  };

  const handleCopy = () => {
    const codeMatch = response.match(/```python([^`]+)```/);
    const codeToCopy = codeMatch ? codeMatch[1].trim() : response;
    navigator.clipboard.writeText(codeToCopy);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy Code'), 2000);
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

      {/* Render the response container only after the button is clicked */}
      {showResponse && (
        <div className="response-content">
          <div className="response-container">
            <textarea
              className="response-textarea code-response-textarea" // Added class for code styling
              value={loading ? loadingMessage : response} // Show loading message or response
              readOnly
              rows={10}
            />
            <button className="copy-button" onClick={handleCopy} disabled={loading}>
              {copyButtonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Code;