import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Fileinput from '@/components/ui/Fileinput';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import {
  useGetAllNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useSendNotificationMutation,
  useGetNotificationStatsQuery
} from '@/store/api/notifications/notificationApi';
import { useGetAllUsersQuery } from '@/store/api/user/userApi';
import { useUploadSingleImageMutation } from '@/store/api/image/imageApi';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });

  // API hooks
  const { data: notificationsData, isLoading, refetch } = useGetAllNotificationsQuery({
    page: 1,
    limit: 50,
    ...filters
  });
  
  const { data: statsData } = useGetNotificationStatsQuery();
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetAllUsersQuery();
  
  // Debug logging
  console.log('Users data:', usersData);
  console.log('Is loading users:', isLoadingUsers);
  console.log('Users error:', usersError);
  console.log('Users data details:', usersData?.details);
  console.log('Users data length:', usersData?.details?.length);
  const [createNotification, { isLoading: isCreating }] = useCreateNotificationMutation();
  const [updateNotification, { isLoading: isUpdating }] = useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [sendNotification, { isLoading: isSending }] = useSendNotificationMutation();
  const [uploadImage] = useUploadSingleImageMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    targetAudience: 'all',
    targetUsers: [],
    targetSegment: 'all_users',
    imageUrl: '',
    scheduledAt: '',
    metadata: {}
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsUploadingImage(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const response = await uploadImage(formData).unwrap();
      
      if (response.success && response.data?.url) {
        setFormData(prev => ({
          ...prev,
          imageUrl: response.data.url
        }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
        setSelectedImageFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error?.data?.message || 'Failed to upload image');
      setSelectedImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (usersData?.details) {
      setSelectedUsers(usersData.details.map(user => user._id));
    }
  };

  const handleDeselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    console.log('Creating notification with data:', formData);
    
    // Basic validation
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }
    
    // Convert scheduledAt from local time to UTC ISO string
    const notificationData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? convertLocalToUTC(formData.scheduledAt) : null,
      targetUsers: formData.targetAudience === 'specific_users' ? selectedUsers : []
    };
    
    try {
      const response = await createNotification(notificationData).unwrap();
      console.log('Create notification response:', response);
      
      if (response.status) {
        toast.success('Notification created successfully');
        setShowCreateModal(false);
        resetForm();
        setSelectedUsers([]);
        refetch();
      } else {
        toast.error(response.message || 'Failed to create notification');
      }
    } catch (error) {
      console.error('Create notification error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create notification';
      toast.error(errorMessage);
    }
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    try {
      // Convert scheduledAt from local time to UTC ISO string
      const updateData = {
        ...formData,
        scheduledAt: formData.scheduledAt ? convertLocalToUTC(formData.scheduledAt) : null
      };
      const response = await updateNotification({
        id: selectedNotification._id,
        ...updateData
      }).unwrap();
      if (response.status) {
        toast.success('Notification updated successfully');
        setShowEditModal(false);
        setSelectedNotification(null);
        resetForm();
        refetch();
      }
    } catch (error) {
      console.error('Update notification error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update notification';
      toast.error(errorMessage);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await deleteNotification(id).unwrap();
        if (response.status) {
          toast.success('Notification deleted successfully');
          refetch();
        }
      } catch (error) {
        console.error('Delete notification error:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to delete notification';
        toast.error(errorMessage);
      }
    }
  };

  const handleSendNotification = async (id) => {
    if (window.confirm('Are you sure you want to send this notification?')) {
      try {
        const response = await sendNotification(id).unwrap();
        if (response.status) {
          toast.success(`Notification sent successfully to ${response.data.sentCount} devices`);
          refetch();
        }
      } catch (error) {
        console.error('Send notification error:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to send notification';
        toast.error(errorMessage);
      }
    }
  };

  // Helper function to convert UTC date to local datetime-local format
  const formatDateForInput = (utcDateString) => {
    if (!utcDateString) return '';
    const date = new Date(utcDateString);
    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to convert local datetime-local format to UTC ISO string
  const convertLocalToUTC = (localDateTimeString) => {
    if (!localDateTimeString) return null;
    // Create a date object from the local datetime string
    // This treats the input as local time
    const localDate = new Date(localDateTimeString);
    // Return ISO string which is in UTC
    return localDate.toISOString();
  };

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      targetAudience: notification.targetAudience,
      targetUsers: notification.targetUsers || [],
      targetSegment: notification.targetSegment,
      imageUrl: notification.imageUrl || '',
      scheduledAt: formatDateForInput(notification.scheduledAt),
      metadata: notification.metadata || {}
    });
    // Set image preview if imageUrl exists
    if (notification.imageUrl) {
      setImagePreview(notification.imageUrl);
      setSelectedImageFile(null); // Clear file since we're using URL
    } else {
      setImagePreview(null);
      setSelectedImageFile(null);
    }
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'general',
      priority: 'normal',
      targetAudience: 'all',
      targetUsers: [],
      targetSegment: 'all_users',
      imageUrl: '',
      scheduledAt: '',
      metadata: {}
    });
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      sent: { color: 'bg-green-100 text-green-800', label: 'Sent' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { color: 'bg-yellow-100 text-yellow-800', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };
    const config = priorityConfig[priority] || priorityConfig.normal;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'list', label: 'All Notifications', icon: 'ph:list' },
    { id: 'stats', label: 'Statistics', icon: 'ph:chart-bar' }
  ];

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Push Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and send push notifications to users</p>
        </div>
        <Button
          onClick={() => {
            console.log('Create Notification button clicked');
            setShowCreateModal(true);
          }}
          className="btn btn-primary"
        >
          <Icon icon="ph:plus" className="mr-2" />
          Create Notification
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 dark:bg-gray-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Icon icon={tab.icon} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon icon="ph:bell" className="text-2xl text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsData?.data?.overview?.totalNotifications || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon icon="ph:check-circle" className="text-2xl text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsData?.data?.overview?.sentNotifications || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Icon icon="ph:clock" className="text-2xl text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsData?.data?.overview?.scheduledNotifications || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon icon="ph:file-text" className="text-2xl text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsData?.data?.overview?.draftNotifications || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="general">General</option>
                    <option value="promotional">Promotional</option>
                    <option value="order_update">Order Update</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search notifications..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications List */}
          <Card>
            <div className="p-6">
              <div className="space-y-4">
                {notificationsData?.data?.notifications?.map((notification) => (
                  <div key={notification._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {getStatusBadge(notification.status)}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Type: {notification.type}</span>
                          <span>Target: {notification.targetAudience}</span>
                          <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                          {notification.sentAt && (
                            <span>Sent: {new Date(notification.sentAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {notification.sentCount > 0 && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Sent to {notification.sentCount} devices
                            {notification.deliveredCount > 0 && (
                              <span> • Delivered: {notification.deliveredCount}</span>
                            )}
                            {notification.clickedCount > 0 && (
                              <span> • Clicks: {notification.clickedCount}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.status === 'draft' && (
                          <>
                            <Button
                              onClick={() => handleEdit(notification)}
                              className="btn btn-sm btn-outline"
                            >
                              <Icon icon="ph:pencil" className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleSendNotification(notification._id)}
                              disabled={isSending}
                              className="btn btn-sm btn-primary"
                            >
                              <Icon icon="ph:paper-plane" className="mr-1" />
                              Send
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDeleteNotification(notification._id)}
                          disabled={isDeleting}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Icon icon="ph:trash" className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Create Notification' : 'Edit Notification'}
              </h2>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedNotification(null);
                  resetForm();
                }}
                className="btn btn-outline"
              >
                <Icon icon="ph:x" />
              </Button>
            </div>

            <form onSubmit={showCreateModal ? handleCreateNotification : handleUpdateNotification}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="general">General</option>
                      <option value="promotional">Promotional</option>
                      <option value="order_update">Order Update</option>
                      <option value="system">System</option>
                      <option value="security">Security</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="all">All Users</option>
                      <option value="specific_users">Specific Users</option>
                      <option value="user_segment">User Segment</option>
                    </select>
                  </div>
                </div>

                {/* User Selection - Only show when "Specific Users" is selected */}
                {formData.targetAudience === 'specific_users' && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Users ({selectedUsers.length} selected)
                      </label>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={handleSelectAllUsers}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAllUsers}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    
                    {/* User Search */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    
                    {/* User List */}
                    <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                      {isLoadingUsers ? (
                        <div className="p-4 text-center text-gray-500">Loading users...</div>
                      ) : usersError ? (
                        <div className="p-4 text-center text-red-500">
                          Error loading users: {usersError?.data?.message || usersError?.message || 'Unknown error'}
                        </div>
                      ) : usersData?.details && usersData.details.length > 0 ? (
                        usersData.details
                          .filter(user => 
                            user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                          )
                          .map(user => (
                            <div key={user._id} className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                              <input
                                type="checkbox"
                                id={`user-${user._id}`}
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleUserToggle(user._id)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.name || 'No Name'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {usersData ? 'No users found' : 'Failed to load users'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scheduled At
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Image
                  </label>
                  
                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Fileinput
                      selectedFile={selectedImageFile}
                      onChange={handleImageChange}
                      preview={true}
                      id="notification-image-upload"
                    >
                      <Button
                        div
                        icon="ph:upload"
                        text={isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        iconClass="text-xl"
                        className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
                        disabled={isUploadingImage}
                      />
                    </Fileinput>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative inline-block">
                        <div className="w-48 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Notification preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <Icon icon="ph:x" className="text-sm" />
                        </button>
                      </div>
                    )}

                    {/* Show uploaded image URL if available */}
                    {formData.imageUrl && !imagePreview && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Image URL:</p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={formData.imageUrl}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedNotification(null);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={showCreateModal ? isCreating : isUpdating}
                  className="btn btn-primary"
                >
                  {showCreateModal ? (isCreating ? 'Creating...' : 'Create') : (isUpdating ? 'Updating...' : 'Update')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
