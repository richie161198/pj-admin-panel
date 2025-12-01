import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { 
  useGetAllAdminsQuery, 
  useDeleteAdminByIdMutation,
  useGetAdminStatsQuery,
  useAdminRegisterMutation
} from '@/store/api/admin/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingIcon from '@/components/LoadingIcon';

const AdminList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    isActive: ''
  });

  // State for admin creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    department: '',
    phone: '',
    permissions: []
  });

  // API hooks
  const { 
    data: adminsResponse, 
    isLoading: adminsLoading, 
    error: adminsError,
    refetch: refetchAdmins 
  } = useGetAllAdminsQuery(filters);
  
  const { 
    data: statsResponse, 
    isLoading: statsLoading 
  } = useGetAdminStatsQuery();
  
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminByIdMutation();
  const [createAdmin, { isLoading: isCreatingAdmin }] = useAdminRegisterMutation();

  // Extract data from responses
  const admins = adminsResponse?.data?.admins || [];
  const pagination = adminsResponse?.data?.pagination || {};
  const stats = statsResponse?.data?.stats || {};

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle admin deletion
  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAdmin(adminId).unwrap();
      toast.success('Admin deleted successfully');
      refetchAdmins();
    } catch (error) {
      console.error('Delete admin error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to delete admin';
      toast.error(errorMessage);
    }
  };

  // Handle admin form input changes
  const handleAdminInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle permission changes
  const handlePermissionChange = (permission) => {
    setAdminFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // Handle admin creation
  const handleAdminCreation = async (e) => {
    e.preventDefault();
    
    if (adminFormData.password !== adminFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (adminFormData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await createAdmin({
        name: adminFormData.name,
        email: adminFormData.email,
        password: adminFormData.password,
        role: adminFormData.role,
        department: adminFormData.department,
        phone: adminFormData.phone,
        permissions: adminFormData.permissions
      }).unwrap();
      
      toast.success('Admin created successfully');
      setShowCreateForm(false);
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
      refetchAdmins();
    } catch (error) {
      console.error('Create admin error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create admin';
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

  // Get status badge color
  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  if (adminsLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
      </div>
    );
  }

  if (adminsError) {
    return (
      <div className="text-center py-8">
        <Icon icon="ph:warning" className="mx-auto text-red-500 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Admins
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {adminsError?.data?.message || 'Failed to load admin list'}
        </p>
        <Button onClick={() => refetchAdmins()} className="btn btn-primary">
          <Icon icon="ph:arrow-clockwise" className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage admin accounts and permissions
          </p>
        </div>
        {currentUser?.role === 'super_admin' && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <Icon icon="ph:user-plus" className="mr-2" />
            Create Admin
          </Button>
        )}
      </div>

      {/* Create Admin Form - Show first when form is visible */}
      {showCreateForm && (
        <Card title="Create New Admin">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Create New Admin
            </h3>
            <Button
              onClick={() => setShowCreateForm(false)}
              className="btn btn-outline btn-sm"
            >
              <Icon icon="ph:x" />
            </Button>
          </div>
          
          <form onSubmit={handleAdminCreation} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={adminFormData.name}
                  onChange={handleAdminInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminFormData.email}
                  onChange={handleAdminInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={adminFormData.password}
                  onChange={handleAdminInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={adminFormData.confirmPassword}
                  onChange={handleAdminInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={adminFormData.role}
                  onChange={handleAdminInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
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
                  value={adminFormData.department}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter department"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={adminFormData.phone}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                {[
                  'users:read', 'users:write', 'users:delete',
                  'products:read', 'products:write', 'products:delete',
                  'orders:read', 'orders:write', 'orders:delete',
                  'categories:read', 'categories:write', 'categories:delete',
                  'analytics:read', 'settings:read', 'settings:write',
                  'tickets:read', 'tickets:write', 'tickets:delete',
                  'admins:read', 'admins:write', 'admins:delete'
                ].map((permission) => (
                  <label key={permission} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <input
                      type="checkbox"
                      checked={adminFormData.permissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {permission}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline"
              >
                <Icon icon="ph:x" className="mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingAdmin}
                className="btn btn-primary"
              >
                {isCreatingAdmin ? (
                  <>
                    <Icon icon="ph:spinner" className="animate-spin mr-2" />
                    Creating Admin...
                  </>
                ) : (
                  <>
                    <Icon icon="ph:user-plus" className="mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Statistics Cards - Show only when form is not visible */}
      {!showCreateForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Icon icon="ph:users" className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAdmins || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Icon icon="ph:user-check" className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeAdmins || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <Icon icon="ph:crown" className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Super Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.superAdmins || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Icon icon="ph:shield-check" className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Support Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.supportStaff || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters - Show only when form is not visible */}
      {!showCreateForm && (
        <Card title="Filters">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="support">Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Admin Table - Show only when form is not visible */}
      {!showCreateForm && (
        <Card title="Admin List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Icon icon="ph:users" className="mx-auto text-gray-400 text-4xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Admins Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No admin accounts match your current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <Icon icon="ph:user" className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {admin.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {admin.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(admin.isActive)}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {admin.lastLogin 
                        ? new Date(admin.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => navigate(`/admin-details/${admin._id}`)}
                          className="btn btn-sm btn-outline"
                        >
                          <Icon icon="ph:eye" />
                        </Button>
                        {currentUser?.role === 'super_admin' && (
                          <>
                            <Button
                              onClick={() => navigate(`/admin-details/${admin._id}?edit=true`)}
                              className="btn btn-sm btn-outline"
                            >
                              <Icon icon="ph:pencil" />
                            </Button>
                            {admin._id !== currentUser.id && admin.role !== 'super_admin' && (
                              <Button
                                onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                                className="btn btn-sm btn-outline-danger"
                                disabled={isDeleting}
                              >
                                <Icon icon="ph:trash" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="btn btn-outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="btn btn-outline"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalAdmins)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalAdmins}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-outline"
                  >
                    <Icon icon="ph:chevron-left" />
                  </Button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-outline"
                  >
                    <Icon icon="ph:chevron-right" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
      )}
    </div>
  );
};

export default AdminList;
