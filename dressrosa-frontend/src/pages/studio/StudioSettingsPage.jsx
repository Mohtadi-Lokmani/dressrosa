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
  Info,
  Lock
} from 'lucide-react';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const StudioSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('automation');
  
  // Automation & Hours State
  const [settings, setSettings] = useState({
    autoReplyMessage: '',
    openingHours: '',
    isAutoReplyEnabled: false
  });

  // Business Hours Days (0 = Sunday, 1 = Monday, etc.)
  const [activeDays, setActiveDays] = useState([false, true, true, true, true, true, false]); // Mon - Fri default

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMessages: true,
    pushOrders: true,
    pushMessages: false
  });

  // Password / Security State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Localization State
  const [localization, setLocalization] = useState({
    language: 'EN',
    currency: 'TND'
  });

  useEffect(() => {
    fetchSettings();
    
    // Load local storage options if they exist
    const savedNotifs = localStorage.getItem('studio_notif_settings');
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)); } catch (e) {}
    }
    
    const savedLoc = localStorage.getItem('studio_loc_settings');
    if (savedLoc) {
      try { setLocalization(JSON.parse(savedLoc)); } catch (e) {}
    }
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

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      
      // Save Automation / Business Hours to backend
      await userService.updateProfile({
        autoReplyMessage: settings.isAutoReplyEnabled ? settings.autoReplyMessage : '',
        openingHours: settings.openingHours
      });
      
      // Save other views to local storage
      localStorage.setItem('studio_notif_settings', JSON.stringify(notifications));
      localStorage.setItem('studio_loc_settings', JSON.stringify(localization));
      
      toast.success('Studio settings updated');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (index) => {
    const updated = [...activeDays];
    updated[index] = !updated[index];
    setActiveDays(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  const tabs = [
    { id: 'automation', label: 'Automation', icon: MessageSquare },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'localization', label: 'Localization', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Studio Settings</h1>
          <p className="text-gray-500 mt-1">Manage your business operations and automation.</p>
        </div>
        {activeTab !== 'privacy' && (
          <button 
            onClick={handleSaveGeneral}
            disabled={saving}
            className="bg-burgundy text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-burgundy-dark transition-all shadow-xl shadow-burgundy/10 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Apply Settings</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Categories */}
        <div className="space-y-2">
          {tabs.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-white shadow-sm border border-gray-100 text-burgundy' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* 1. Automation View */}
          {activeTab === 'automation' && (
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
          )}

          {/* 2. Business Hours View */}
          {activeTab === 'hours' && (
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">Active Atelier Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`h-10 rounded-lg flex items-center justify-center text-xs font-black border transition-all ${
                          activeDays[i] 
                            ? 'bg-burgundy text-white border-burgundy shadow-sm shadow-burgundy/10' 
                            : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 3. Notifications View */}
          {activeTab === 'notifications' && (
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Notification Preferences</h3>
              </div>
              
              <div className="p-8 space-y-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Choose how and when you want to receive notifications from Dressrosa.
                </p>

                <div className="space-y-4">
                  {[
                    { key: 'emailOrders', title: 'Email Alerts on Orders', desc: 'Receive email notifications when customers make purchases.' },
                    { key: 'emailMessages', title: 'Email Alerts on Chats', desc: 'Receive email notifications on incoming messages.' },
                    { key: 'pushOrders', title: 'Desktop Push on Orders', desc: 'Enable push alerts for order updates.' },
                    { key: 'pushMessages', title: 'Desktop Push on Messages', desc: 'Enable push alerts for customer messages.' },
                  ].map((notifItem) => (
                    <div key={notifItem.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{notifItem.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{notifItem.desc}</p>
                      </div>
                      <button 
                        onClick={() => setNotifications(prev => ({ ...prev, [notifItem.key]: !prev[notifItem.key] }))}
                        className="transition-all"
                      >
                        {notifications[notifItem.key] ? (
                          <ToggleRight className="w-10 h-10 text-burgundy" />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-gray-300" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4. Privacy & Security View */}
          {activeTab === 'privacy' && (
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Change Password</h3>
              </div>
              
              <form onSubmit={handlePasswordChangeSubmit} className="p-8 space-y-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Update your account credentials to keep your atelier secure.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Current Password</label>
                    <input 
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">New Password</label>
                    <input 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                      placeholder="Min 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Confirm New Password</label>
                    <input 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                      placeholder="Re-type new password"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-burgundy text-white py-3.5 rounded-xl font-bold hover:bg-burgundy-dark transition-all flex items-center justify-center space-x-2 shadow-lg shadow-burgundy/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  <span>Update Password</span>
                </button>
              </form>
            </section>
          )}

          {/* 5. Localization View */}
          {activeTab === 'localization' && (
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">Localization & Display</h3>
              </div>
              
              <div className="p-8 space-y-6">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Configure the default display options and preferred regional metrics.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Display Language</label>
                    <select
                      value={localization.language}
                      onChange={(e) => setLocalization(p => ({ ...p, language: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                    >
                      <option value="EN">English</option>
                      <option value="FR">Français</option>
                      <option value="AR">العربية</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Preferred Currency</label>
                    <select
                      value={localization.currency}
                      onChange={(e) => setLocalization(p => ({ ...p, currency: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                    >
                      <option value="TND">TND (Tunisian Dinar)</option>
                      <option value="DZD">DZD (Algerian Dinar)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudioSettingsPage;
