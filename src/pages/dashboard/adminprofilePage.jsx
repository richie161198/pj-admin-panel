import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { useGetAdminProfileQuery, useUpdateAdminProfileMutation, useChangePasswordMutation } from '@/store/api/admin/adminApi';
import { useUploadSingleImageMutation } from '@/store/api/image/imageApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingIcon from '@/components/LoadingIcon';
import useDarkMode from "@/hooks/useDarkMode";

const AdminProfilePage = () => {
  const navigate = useNavigate();
    const [isDark, setDarkMode] = useDarkMode();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // API hooks
  const { data: adminResponse, isLoading: userLoading, refetch } = useGetAdminProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [uploadImage] = useUploadSingleImageMutation();
  const { user: authUser } = useAuth();

  // Extract admin data from response
  const user = adminResponse?.data?.admin || adminResponse?.admin || adminResponse;

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    transactionPin: '',
    newTransactionPin: '',
    confirmTransactionPin: ''
  });

  // Admin creation form state

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        transactionPin: '',
        newTransactionPin: '',
        confirmTransactionPin: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdminInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setAdminFormData(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, value]
          : prev.permissions.filter(p => p !== value)
      }));
    } else {
      setAdminFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await uploadImage(formData).unwrap();
      setFormData(prev => ({
        ...prev,
        profilePhoto: result.url
      }));
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdminCreation = async (e) => {
    e.preventDefault();
    
    if (adminFormData.password !== adminFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...adminData } = adminFormData;
      const response = await adminRegister(adminData).unwrap();
      
      if (response.status) {
        toast.success('Admin created successfully');
        setAdminFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'admin',
          department: '',
          phone: '',
          permissions: []
        });
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create admin';
      toast.error(errorMessage);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.profilePhoto
      }).unwrap();
      
      if (response.status) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!formData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    // Check password strength requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }).unwrap();
      
      if (response.status) {
        toast.success('Password changed successfully');
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  const handleTransactionPinChange = async (e) => {
    e.preventDefault();
    if (formData.newTransactionPin !== formData.confirmTransactionPin) {
      toast.error('Transaction pins do not match');
      return;
    }

    try {
      await updateProfile({
        id: user._id,
        transactionPin: formData.transactionPin,
        newTransactionPin: formData.newTransactionPin
      }).unwrap();
      
      toast.success('Transaction pin updated successfully');
      setFormData(prev => ({
        ...prev,
        transactionPin: '',
        newTransactionPin: '',
        confirmTransactionPin: ''
      }));
    } catch (error) {
      toast.error('Failed to update transaction pin');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'ph:user' },
    { id: 'security', label: 'Security', icon: 'ph:shield-check' },
    // { id: 'notifications', label: 'Notifications', icon: 'ph:bell' },
    // { id: 'preferences', label: 'Preferences', icon: 'ph:gear' },
    // { id: 'billing', label: 'Billing', icon: 'ph:credit-card' },
    // { id: 'api', label: 'API Keys', icon: 'ph:key' }
  ];

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon icon={tab.icon} className="mr-3 text-lg" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card title="Profile Information">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {formData.profilePhoto ? (
                      <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Icon icon="ph:user" className="text-2xl text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                      <Icon icon="ph:camera" className="text-sm" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.name || 'Admin User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || 'admin@example.com'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Click the camera icon to change photo
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || 'Admin'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="btn btn-primary"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary"
                    >
                      <Icon icon="ph:pencil" className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
              <Card title="Change Password">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Icon icon="ph:info" className="text-blue-500 text-xl mr-3 mt-0.5" />
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Password Requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>At least 8 characters long</li>
                          <li>One uppercase letter (A-Z)</li>
                          <li>One lowercase letter (a-z)</li>
                          <li>One number (0-9)</li>
                          <li>One special character (@$!%*?&)</li>
                          <li>Must be different from current password</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your new password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                      minLength="8"
                      autoComplete="new-password"
                    />
                    {formData.newPassword && (
                      <div className="mt-2 space-y-1">
                        {formData.newPassword.length < 8 && (
                          <p className="text-xs text-red-500">Password must be at least 8 characters</p>
                        )}
                        {formData.newPassword.length >= 8 && !/(?=.*[a-z])/.test(formData.newPassword) && (
                          <p className="text-xs text-red-500">Password must contain at least one lowercase letter</p>
                        )}
                        {formData.newPassword.length >= 8 && !/(?=.*[A-Z])/.test(formData.newPassword) && (
                          <p className="text-xs text-red-500">Password must contain at least one uppercase letter</p>
                        )}
                        {formData.newPassword.length >= 8 && !/(?=.*\d)/.test(formData.newPassword) && (
                          <p className="text-xs text-red-500">Password must contain at least one number</p>
                        )}
                        {formData.newPassword.length >= 8 && !/(?=.*[@$!%*?&])/.test(formData.newPassword) && (
                          <p className="text-xs text-red-500">Password must contain at least one special character (@$!%*?&)</p>
                        )}
                        {formData.newPassword.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword) && (
                          <p className="text-xs text-green-500 flex items-center">
                            <Icon icon="ph:check-circle" className="mr-1" />
                            Password meets all requirements
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your new password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                      autoComplete="new-password"
                    />
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                    {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                      <p className="text-xs text-green-500 mt-1 flex items-center">
                        <Icon icon="ph:check-circle" className="mr-1" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        }));
                      }}
                      className="btn btn-outline"
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={isChangingPassword || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)}
                      className="btn btn-primary flex-1"
                    >
                      {isChangingPassword ? (
                        <>
                          <LoadingIcon />
                          <span className="ml-2">Changing Password...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="ph:lock-key" className="mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Transaction Pin */}
              {/* <Card title="Transaction Pin">
                <form onSubmit={handleTransactionPinChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Transaction Pin
                    </label>
                    <input
                      type="password"
                      name="transactionPin"
                      value={formData.transactionPin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      maxLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Transaction Pin
                    </label>
                    <input
                      type="password"
                      name="newTransactionPin"
                      value={formData.newTransactionPin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      maxLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Transaction Pin
                    </label>
                    <input
                      type="password"
                      name="confirmTransactionPin"
                      value={formData.confirmTransactionPin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      maxLength="6"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary"
                  >
                    {isUpdating ? 'Updating...' : 'Update Transaction Pin'}
                  </Button>
                </form>
              </Card> */}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card title="Theme Preferences">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Theme
                    </label>

                    <select 
                    
                            onChange={() => setDarkMode(!isDark)}

                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                      <option value="UTC">UTC</option>
                      <option value="IST">India Standard Time</option>
                      <option value="EST">Eastern Time</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* <Card title="Data & Privacy">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Data Analytics</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Allow data collection for analytics</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive marketing and promotional emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </Card> */}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card title="Billing Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Billing Address
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="Enter billing address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="Enter tax ID"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="btn btn-primary">
                      Update Billing Info
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Payment Methods">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon icon="ph:credit-card" className="text-2xl text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">**** **** **** 4242</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/25</p>
                      </div>
                    </div>
                    <Button className="btn btn-sm btn-outline-danger">
                      Remove
                    </Button>
                  </div>
                  
                  <Button className="btn btn-outline-primary w-full">
                    <Icon icon="ph:plus" className="mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <Card title="API Keys">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Production API Key</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">pk_live_51H...xyz</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="btn btn-sm btn-outline">
                        <Icon icon="ph:copy" />
                      </Button>
                      <Button className="btn btn-sm btn-outline-danger">
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Test API Key</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">pk_test_51H...abc</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="btn btn-sm btn-outline">
                        <Icon icon="ph:copy" />
                      </Button>
                      <Button className="btn btn-sm btn-outline-danger">
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="btn btn-primary">
                    <Icon icon="ph:plus" className="mr-2" />
                    Generate New API Key
                  </Button>
                </div>
              </Card>

              <Card title="Webhooks">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Order Created</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">https://api.example.com/webhooks/orders</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                      <Button className="btn btn-sm btn-outline-danger">
                        <Icon icon="ph:trash" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="btn btn-outline-primary w-full">
                    <Icon icon="ph:plus" className="mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
