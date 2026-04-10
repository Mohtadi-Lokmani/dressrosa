import { useState } from 'react';
import { ArrowLeft, Lock, Bell, Globe, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Container from '../../components/layout/Container';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // TODO: Implement password change API
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion API
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

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

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-5 h-5 text-burgundy" />
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
              <Button type="submit" variant="primary">
                Update Password
              </Button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-5 h-5 text-burgundy" />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Email notifications</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Order updates</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">New messages</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Marketing emails</span>
                <input type="checkbox" className="toggle" />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-5 h-5 text-burgundy" />
              <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Show profile to public</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Show online status</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-center space-x-3 mb-6">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, orders, and messages will be permanently deleted.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
};

export default SettingsPage;