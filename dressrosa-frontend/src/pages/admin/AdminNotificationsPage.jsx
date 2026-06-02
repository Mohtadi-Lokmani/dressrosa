import { useState } from 'react';
import { 
  Bell, Send, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const data = {
        title: title.trim(),
        message: message.trim(),
        target,
      };
      await adminService.sendNotification(data);
      toast.success(`Broadcasting announcement to all ${target.toLowerCase()} completed`);
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      toast.error('Failed to broadcast platform notification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="max-w-3xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Broadcasts</h1>
            <p className="text-sm text-gray-500 mt-0.5">Send a global push announcement to all buyers, sellers, or all users on Dressrosa</p>
          </div>
        </div>

        {/* Broadcast Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSendNotification} className="space-y-6">
            
            {/* Target Select */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Target Audience Group
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'ALL', label: 'All Users' },
                  { value: 'SELLERS', label: 'Ateliers Only' },
                  { value: 'BUYERS', label: 'Buyers Only' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTarget(option.value)}
                    className={`px-4 py-3 rounded-xl border text-xs font-black transition-all ${
                      target === option.value
                        ? 'bg-burgundy/10 border-burgundy/30 text-burgundy shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Broadcast Title */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Announcement Title
              </label>
              <input
                type="text"
                placeholder="E.g. Scheduled System Upgrade Notification..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Broadcast Message */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Announcement Details
              </label>
              <textarea
                placeholder="Write the full detail announcement text that will display in users' notification tray..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all whitespace-pre-wrap"
                required
              />
            </div>

            {/* Disclaimer Alert */}
            <div className="flex items-start space-x-3 p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Important Notice:</span> Platform broadcasts instantly append notification items to all active accounts in the target audience group database. Please verify details before sending.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-burgundy to-burgundy-light hover:from-burgundy-light hover:to-burgundy disabled:from-gray-300 disabled:to-gray-400 text-white text-xs font-black rounded-xl shadow-lg shadow-burgundy/20 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Broadcasting Announcement...' : 'Broadcast Announcement'}</span>
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminNotificationsPage;
