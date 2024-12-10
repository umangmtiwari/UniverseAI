import React, { useState } from 'react';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

function Content({deductCredits, codeContentCost}) {
  const bedrockClient = new BedrockRuntimeClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
  });

  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...'); // State for loading message
  let timeoutId = null; // To hold the timeout ID

  const handleTextInput = (e) => {
    setInputText(e.target.value);
  };

  const handleGeneration = async () => {
    if (!inputText) return;

    deductCredits(codeContentCost); // Pass the cost as an argument

    setLoading(true);
    setResponse('');
    setShowResponse(true);
    setLoadingMessage('Loading...'); // Reset loading message

    // Set timeout to change the loading message after 5 seconds
    timeoutId = setTimeout(() => {
      setLoadingMessage("Loading... It's taking longer than usual. Please wait...");
    }, 5000);

    const params = {
      modelId: "anthropic.claude-v2",
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Human: Draft an exciting and socially-engaging blog post based on the following topic:\n<topic>\n${inputText}\n</topic>\nAssistant:`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 2048,
        stopSequences: ["\n\nHuman:"],
        temperature: 1,
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

    setInputText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy Text'), 2000);
  };

  return (
    <div className="content-container">
      <div className="chat-bar">
        <textarea
          value={inputText}
          onChange={handleTextInput}
          placeholder="Type your topic..."
          rows="1"
          className="chat-input"
        />
        <button className="send-button" onClick={handleGeneration} disabled={!inputText || loading}>
          ➜
        </button>
      </div>

      {showResponse && (
        <div className="response-content">
          <div className="response-container">
            <textarea
              className="response-textarea"
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
}

export default Content;
