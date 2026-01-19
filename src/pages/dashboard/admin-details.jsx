import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { 
  useGetAdminByIdQuery,
  useUpdateAdminByIdMutation,
  useUpdateAdminPasswordMutation
} from '@/store/api/admin/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingIcon from '@/components/LoadingIcon';

const AdminDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  
  const isEditMode = searchParams.get('edit') === 'true';
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    isActive: true,
    permissions: []
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // API hooks
  const { 
    data: adminResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetAdminByIdQuery(id);
  
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminByIdMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdateAdminPasswordMutation();

  const admin = adminResponse?.data?.admin;

  // Update form data when admin data loads
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        role: admin.role || '',
        department: admin.department || '',
        phone: admin.phone || '',
        isActive: admin.isActive !== undefined ? admin.isActive : true,
        permissions: admin.permissions || []
      });
    }
  }, [admin]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle permission changes
  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle admin update
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    
    if (formData.permissions.length === 0) {
      toast.error('Please select at least one page access');
      return;
    }

    try {
      await updateAdmin({ id, ...formData }).unwrap();
      toast.success('Admin updated successfully');
      setIsEditing(false);
      setShowPasswordForm(false);
      refetch();
    } catch (error) {
      console.error('Update admin error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update admin';
      toast.error(errorMessage);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await updatePassword({ 
        id, 
        newPassword: passwordData.newPassword 
      }).unwrap();
      toast.success('Password updated successfully');
      setShowPasswordForm(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Update password error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update password';
      toast.error(errorMessage);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderator': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'support': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Page-based permissions (same as admin creation form)
  const pagePermissions = [
    // Ecommerce section
    { id: 'dashboard', label: 'Dashboard', icon: 'ph:house' },
    { id: 'customers', label: 'Customers', icon: 'ph:users' },
    { id: 'products', label: 'Products', icon: 'ph:package' },
    { id: 'categories', label: 'Categories', icon: 'ph:folders' },
    { id: 'banners', label: 'Banners', icon: 'ph:image-square' },
    { id: 'orders', label: 'Orders', icon: 'ph:shopping-cart' },
    { id: 'invoices', label: 'Invoices', icon: 'ph:receipt' },
    { id: 'return-refunds', label: 'Return & Refunds', icon: 'ph:arrow-counter-clockwise' },
    // Investment section
    { id: 'investment-orders', label: 'Investment Orders', icon: 'ph:chart-line-up' },
    { id: 'autopay-subscriptions', label: 'Autopay Subscriptions', icon: 'ph:repeat' },
    { id: 'investment-invoices', label: 'Investment Invoices', icon: 'ph:receipt' },
    // Settings section
    { id: 'investment-settings', label: 'Investment Settings', icon: 'ph:gear-six' },
    { id: 'shipment-settings', label: 'Shipment Settings', icon: 'ph:truck' },
    // Support section
    { id: 'appointments', label: 'Appointments', icon: 'ph:calendar-check' },
    { id: 'support-tickets', label: 'Support Tickets', icon: 'ph:ticket' },
    { id: 'notifications', label: 'Notifications', icon: 'ph:bell' },
    { id: 'referred-users', label: 'Referred Users', icon: 'ph:users' },
    // Admin settings section
    { id: 'admin-profile', label: 'Admin Profile', icon: 'ph:user-circle' },
    { id: 'admin-list', label: 'Admin List', icon: 'ph:users-three' },
    { id: 'maintenance', label: 'Maintenance', icon: 'ph:gear' },
    // Policy settings section
    { id: 'privacy-policy', label: 'Privacy Policy', icon: 'ph:lock' },
    { id: 'return-policy', label: 'Return Policy', icon: 'ph:arrow-counter-clockwise' },
    { id: 'shipping-policy', label: 'Shipping Policy', icon: 'ph:truck' },
    { id: 'cancellation-policy', label: 'Cancellation Policy', icon: 'ph:x-circle' },
    { id: 'grievance-policy', label: 'Grievance Policy', icon: 'ph:warning-circle' },
    { id: 'digigold-redemption-policy', label: 'Digital Gold & Redemption Policy', icon: 'ph:coins' },
    { id: 'terms-and-conditions', label: 'Terms and Conditions', icon: 'ph:file-text' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon icon="ph:warning" className="mx-auto text-red-500 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Admin
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error?.data?.message || 'Failed to load admin details'}
        </p>
        <Button onClick={() => navigate('/admin-list')} className="btn btn-primary">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Admin List
        </Button>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-8">
        <Icon icon="ph:user-x" className="mx-auto text-gray-400 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Admin Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The requested admin account could not be found.
        </p>
        <Button onClick={() => navigate('/admin-list')} className="btn btn-primary">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Admin List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button
            onClick={() => navigate('/admin-list')}
            className="btn btn-outline mb-4"
          >
            <Icon icon="ph:arrow-left" className="mr-2" />
            Back to Admin List
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Admin' : 'Admin Details'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditing ? 'Update admin information and permissions' : 'View admin details and activity'}
          </p>
        </div>
        {currentUser?.role === 'super_admin' && !isEditing && (
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Icon icon="ph:pencil" className="mr-2" />
              Edit Admin
            </Button>
            <Button
              onClick={() => setShowPasswordForm(true)}
              className="btn btn-outline"
            >
              <Icon icon="ph:key" className="mr-2" />
              Change Password
            </Button>
          </div>
        )}
      </div>

      {/* Admin Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card title="Basic Information">
            {isEditing ? (
              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active Account
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
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
                    {isUpdating ? 'Updating...' : 'Update Admin'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{admin.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{admin.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Role
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
                      {admin.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Department
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{admin.department || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{admin.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Permissions */}
          <Card title="Page Access" className="mt-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Page Access *
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Select which pages this admin can access
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                    {pagePermissions.map((page) => (
                      <label 
                        key={page.id} 
                        className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(page.id)}
                          onChange={() => handlePermissionChange(page.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <Icon icon={page.icon} className="ml-3 text-lg text-gray-600 dark:text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {page.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.permissions.length === 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      Please select at least one page access
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {admin.permissions && admin.permissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pagePermissions
                      .filter(page => admin.permissions.includes(page.id))
                      .map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        >
                          <Icon icon={page.icon} className="text-lg text-gray-600 dark:text-gray-400" />
                          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {page.label}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No permissions assigned</p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card title="Account Status">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Login
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {admin.lastLogin 
                    ? new Date(admin.lastLogin).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Modified
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {admin.updatedAt 
                    ? new Date(admin.updatedAt).toLocaleDateString()
                    : '-'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Created By */}
          {admin.createdBy && (
            <Card title="Created By">
              <div className="space-y-2">
                <p className="text-sm text-gray-900 dark:text-white">
                  {admin.createdBy.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {admin.createdBy.email}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="btn btn-primary"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDetails;
