import { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import Button from '../common/Button';

const MessageInput = ({ onSendMessage, sending, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;

    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end space-x-2">
        {/* Emoji Button (Placeholder) */}
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          disabled={disabled}
        >
          <Smile className="w-6 h-6 text-gray-600" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Select a conversation to start messaging' : 'Type a message...'}
            disabled={disabled || sending}
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              overflow: message.split('\n').length > 3 ? 'auto' : 'hidden',
            }}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={!message.trim() || sending || disabled}
          loading={sending}
          className="rounded-full w-11 h-11 p-0 flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;