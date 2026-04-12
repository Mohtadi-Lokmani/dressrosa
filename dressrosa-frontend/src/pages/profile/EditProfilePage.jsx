import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, setAuth } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    telephone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getMyProfile();
      setFormData({
        userName: data.userName || '',
        email: data.email || '',
        telephone: data.telephone || '',
        address: data.address || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await userService.updateProfile(formData);
      
      // response is now { user, token? }
      const updatedUser = response.user || response;
      updateUser(updatedUser);
      
      // If token was returned (email changed), update stored token
      if (response.token) {
        setAuth(updatedUser, response.token);
      }
      
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewPhoto(e.target.result);
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      const result = await userService.uploadPhoto(file);
      updateUser({ ...user, profilePhoto: result.photoUrl });
      toast.success('Photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      setPreviewPhoto(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Profile</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <Avatar
                  src={previewPhoto || user?.profilePhoto || user?.profileImage}
                  name={user?.userName}
                  size="2xl"
                />
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    icon={Camera}
                    onClick={handleImageUpload}
                    loading={uploading}
                  >
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Username */}
              <Input
                label="Username"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
              />

              {/* Email */}
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
              />

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Your full address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EditProfilePage;