import { useState, useEffect } from 'react';
import { 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Bell, 
  Globe,
  Save,
  Loader2,
  ChevronRight,
  ToggleRight,
  ToggleLeft,
  Info
} from 'lucide-react';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const StudioSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoReplyMessage: '',
    openingHours: '',
    isAutoReplyEnabled: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await userService.getMyProfile();
      setSettings({
        autoReplyMessage: data.autoReplyMessage || '',
        openingHours: data.openingHours || '',
        isAutoReplyEnabled: !!data.autoReplyMessage
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        autoReplyMessage: settings.isAutoReplyEnabled ? settings.autoReplyMessage : '',
        openingHours: settings.openingHours
      });
      toast.success('Studio settings updated');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Studio Settings</h1>
          <p className="text-gray-500 mt-1">Manage your business operations and automation.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-burgundy text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-burgundy-dark transition-all shadow-xl shadow-burgundy/10 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Apply Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Categories */}
        <div className="space-y-2">
          {[
            { id: 'automation', label: 'Automation', icon: MessageSquare, active: true },
            { id: 'hours', label: 'Business Hours', icon: Clock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
            { id: 'localization', label: 'Localization', icon: Globe },
          ].map((item) => (
            <button 
              key={item.id}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                item.active 
                  ? 'bg-white shadow-sm border border-gray-100 text-burgundy' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${item.active ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {/* Automation Section */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Conversation Automation</h3>
              </div>
              <button 
                onClick={() => setSettings(prev => ({ ...prev, isAutoReplyEnabled: !prev.isAutoReplyEnabled }))}
                className="transition-colors"
              >
                {settings.isAutoReplyEnabled ? (
                  <ToggleRight className="w-10 h-10 text-burgundy" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-300" />
                )}
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Automated Welcome Reply</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Send a response instantly when a buyer starts a new conversation.</p>
                  </div>
                </div>
                
                <textarea 
                  rows={4}
                  disabled={!settings.isAutoReplyEnabled}
                  value={settings.autoReplyMessage}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoReplyMessage: e.target.value }))}
                  className={`w-full px-5 py-4 border-none rounded-2xl text-sm font-medium transition-all resize-none ${
                    settings.isAutoReplyEnabled 
                      ? 'bg-gray-50 focus:ring-2 focus:ring-burgundy/10 text-gray-900' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder="Example: Thank you for reaching out to our Atelier! We've received your message and will get back to you shortly."
                />
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex space-x-3">
                <div className="p-1.5 bg-blue-100 rounded-lg h-fit text-blue-600">
                  <Info className="w-4 h-4" />
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Automated replies help maintain a high <strong>Response Rate</strong> score, which improves your placement in search results.
                </p>
              </div>
            </div>
          </section>

          {/* Business Hours Section */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">Standard Business Hours</h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Let customers know when you are available to answer queries or process orders.
                </p>
                
                <input 
                  type="text" 
                  value={settings.openingHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, openingHours: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                  placeholder="e.g., Sat - Thu, 09:00 - 18:00"
                />
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className={`h-10 rounded-lg flex items-center justify-center text-xs font-black border ${
                    i === 5 ? 'bg-gray-50 text-gray-300 border-gray-100' : 'bg-burgundy/5 text-burgundy border-burgundy/10'
                  }`}>
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudioSettingsPage;
