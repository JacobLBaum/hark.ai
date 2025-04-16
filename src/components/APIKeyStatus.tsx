import { isApiKeyConfigured } from '../services/openai';

/**
 * A component that displays the status of the OpenAI API key configuration
 * without revealing the actual key
 */
const APIKeyStatus: React.FC = () => {
  const isConfigured = isApiKeyConfigured();
  
  return (
    <div className="api-key-status">
      <h3>API Configuration Status</h3>
      <div className={`status-indicator ${isConfigured ? 'configured' : 'missing'}`}>
        {isConfigured 
          ? '✅ OpenAI API key is properly configured' 
          : '❌ OpenAI API key is missing or invalid'}
      </div>
      <p className="api-key-info">
        {isConfigured 
          ? 'Your key is securely stored in environment variables.' 
          : 'Please add your API key to the .env file.'}
      </p>
    </div>
  );
};

export default APIKeyStatus; 