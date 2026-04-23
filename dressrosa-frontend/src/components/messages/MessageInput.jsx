import { useState } from 'react';
import { Send, Smile, Plus } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="px-8 py-6 border-t border-gray-50 bg-white/80 backdrop-blur-sm sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto flex items-center space-x-4 bg-[#F9F8F6] p-2 rounded-[2.5rem] border border-gray-100 transition-all focus-within:shadow-md focus-within:bg-white focus-within:border-burgundy/20 group">
        
        {/* Attachment Button */}
        <button
          type="button"
          className="p-3 bg-white text-gray-400 hover:text-burgundy hover:scale-105 rounded-full shadow-sm transition-all duration-300 flex-shrink-0 border border-gray-50"
          disabled={disabled}
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 flex items-center min-h-[48px]">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Select conversation...' : 'Compose a letter...'}
            disabled={disabled || sending}
            rows={1}
            className="w-full px-2 py-2 bg-transparent border-none resize-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed font-serif italic text-gray-700 placeholder:text-gray-400 text-base"
            style={{
              maxHeight: '120px',
              overflow: message.split('\n').length > 3 ? 'auto' : 'hidden',
            }}
          />
        </div>

        {/* Actions side */}
        <div className="flex items-center space-x-2 pr-1">
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-burgundy hover:scale-110 transition-all duration-300 hidden sm:block"
            disabled={disabled}
          >
            <Smile className="w-6 h-6" />
          </button>

          <button
            type="submit"
            disabled={!message.trim() || sending || disabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
              !message.trim() || sending || disabled
                ? 'bg-gray-200 text-gray-400'
                : 'bg-burgundy text-white hover:bg-burgundy-dark hover:scale-105 active:scale-95'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;