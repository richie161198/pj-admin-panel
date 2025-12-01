import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomerByIdQuery, useUpdateCustomerMutation, useDeleteCustomerMutation } from '@/store/api/auth/authApiSlice';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: customerResponse, isLoading, error, refetch } = useGetCustomerByIdQuery(id);
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  // Extract customer from API response
  const customer = customerResponse?.details || customerResponse;

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await deleteCustomer(id).unwrap();
        toast.success('Customer deleted successfully');
        navigate('/customers');
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleStatusToggle = async () => {
    try {
      await updateCustomer({
        id,
        active: !customer.active
      }).unwrap();
      toast.success(`Customer ${customer.active ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error) {
      toast.error('Failed to update customer status');
    }
  };

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
        <p className="text-red-500">Error loading customer: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/customers')}
            className="btn btn-outline"
          >
            <Icon icon="ph:arrow-left" className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customer Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage customer information
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate(`/customers/${id}/edit`)}
            className="btn btn-outline-secondary"
          >
            <Icon icon="ph:pencil" className="mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={`btn ${customer.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
          >
            <Icon icon={customer.active ? 'ph:pause' : 'ph:play'} className="mr-2" />
            {customer.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            onClick={handleDeleteCustomer}
            disabled={isDeleting}
            className="btn btn-outline-danger"
          >
            <Icon icon="ph:trash" className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {customer.profilePhoto ? (
                  <img 
                    src={customer.profilePhoto} 
                    alt={customer.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {customer.name || 'N/A'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Customer ID: {customer._id}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    customer.active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {customer.active ? 'Active' : 'Inactive'}
                  </span>
                  {customer.isBlocked && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Blocked
                    </span>
                  )}
                  {customer.mobileVerified && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Mobile Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.email || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Address
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.address && customer.address.length > 0 
                    ? customer.address.find(addr => addr.isDefault)?.street || customer.address[0]?.street || 'N/A'
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  City
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.address && customer.address.length > 0 
                    ? customer.address.find(addr => addr.isDefault)?.city || customer.address[0]?.city || 'N/A'
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  App ID
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.appId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Referral Code
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.referralCode || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.role || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Login
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ₹{customer.balance || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Gold Balance</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.goldBalance || 0} gm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Account</span>
                <span className={`text-sm font-medium ${
                  customer.activeAccount 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {customer.activeAccount ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Mobile Verified</span>
                <span className={`text-sm font-medium ${
                  customer.mobileVerified 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {customer.mobileVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/customers/${id}/orders`)}
                className="btn btn-outline w-full justify-start"
              >
                <Icon icon="ph:shopping-bag" className="mr-2" />
                View Orders
              </Button>
              <Button
                onClick={() => navigate(`/customers/${id}/messages`)}
                className="btn btn-outline w-full justify-start"
              >
                <Icon icon="ph:chat-circle" className="mr-2" />
                Send Message
              </Button>
              <Button
                onClick={() => navigate(`/customers/${id}/edit`)}
                className="btn btn-outline w-full justify-start"
              >
                <Icon icon="ph:pencil" className="mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;