import { useState, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Info,
  BadgeCheck,
  Save,
  Loader2
} from 'lucide-react';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const StudioProfileEditorPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    userName: '',
    bio: '',
    address: '',
    telephone: '',
    email: '',
    profilePhoto: '',
    bannerImage: ''
  });
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getMyProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        userName: profile.userName,
        bio: profile.bio,
        address: profile.address,
        telephone: profile.telephone,
        email: profile.email,
        bannerImage: profile.bannerImage
      });
      toast.success('Atelier profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (type === 'photo') {
        setUploadingPhoto(true);
        const { photoUrl } = await userService.uploadPhoto(file);
        setProfile(prev => ({ ...prev, profilePhoto: photoUrl }));
        toast.success('Profile photo updated!');
      } else {
        setUploadingBanner(true);
        const { bannerUrl } = await userService.uploadBanner(file);
        setProfile(prev => ({ ...prev, bannerImage: bannerUrl }));
        toast.success('Banner image updated!');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingPhoto(false);
      setUploadingBanner(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Customise Your Atelier</h1>
          <p className="text-gray-500 mt-1">This is how your brand appears to buyers on Dressrosa.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Visual Identity Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30">
            <h3 className="font-bold text-gray-900">Visual Identity</h3>
          </div>
          
          <div className="p-8">
            {/* Banner Editor */}
            <div className="relative group mb-12">
              <div className="h-48 w-full bg-gray-100 rounded-2xl overflow-hidden relative border-2 border-dashed border-gray-200">
                {profile.bannerImage ? (
                  <img src={profile.bannerImage} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">No Banner Image</span>
                  </div>
                )}
                
                {/* Banner Change Overlay */}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                  {uploadingBanner ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs font-black uppercase tracking-widest">Change Banner</span>
                    </>
                  )}
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
                </label>
              </div>

              {/* Profile Photo Editor */}
              <div className="absolute -bottom-6 left-8 group/photo">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-gray-50 shadow-lg">
                    {profile.profilePhoto ? (
                      <img src={profile.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                    {uploadingPhoto ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
              High-quality images help convert {Math.floor(Math.random() * 20) + 40}% more visitors
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Info className="w-5 h-5 text-burgundy" />
            <span>Atelier Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atelier Name</label>
              <input 
                type="text" 
                value={profile.userName}
                onChange={(e) => setProfile(prev => ({ ...prev, userName: e.target.value }))}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                placeholder="Name of your shop"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="w-full px-5 py-3.5 bg-gray-100 border-none rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bio / Story</label>
              <textarea 
                rows={4}
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-burgundy/10 transition-all resize-none"
                placeholder="Tell your customers about your atelier, your inspiration, and your craft..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={profile.telephone || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, telephone: e.target.value }))}
                  className="w-full px-12 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                  placeholder="000 000 00 00"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location / Address</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={profile.address || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-12 py-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-burgundy/10 transition-all"
                  placeholder="City, Region"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white flex items-center justify-between shadow-xl shadow-indigo-100">
          <div className="max-w-md">
            <h3 className="text-xl font-black mb-2 flex items-center space-x-2">
              <BadgeCheck className="w-6 h-6" />
              <span>Identity Verification</span>
            </h3>
            <p className="text-indigo-100 text-sm opacity-90 leading-relaxed">
              Verify your identity to unlock the "Trusted Atelier" badge and increase customer trust. 
              Verified sellers see a 40% increase in checkout completions.
            </p>
          </div>
          <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg whitespace-nowrap ml-8">
            Verify Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioProfileEditorPage;
