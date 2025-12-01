import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetReferredUsersQuery, useGetReferralStatsQuery } from '@/store/api/user/userApi';

const ReferredUsers = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    userId: ''
  });

  // API queries
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetReferredUsersQuery(filters);
  const { data: statsData, isLoading: statsLoading } = useGetReferralStatsQuery();

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || {};
  const stats = statsData?.data || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getKycStatus = (user) => {
    if (user.kycVerified) return { text: 'Verified', color: 'success' };
    if (user.panVerified) return { text: 'PAN Verified', color: 'info' };
    if (user.mobileVerified) return { text: 'Mobile Verified', color: 'warning' };
    return { text: 'Not Verified', color: 'danger' };
  };

  if (usersLoading || statsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referred Users</h1>
          <p className="text-gray-600 dark:text-gray-400">View users who registered using referral codes</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats.overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Referred Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.overview.totalReferredUsers || 0}
                </p>
              </div>
              <Icon icon="ph:users" className="text-2xl text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">KYC Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.overview.totalKycVerified || 0}
                </p>
              </div>
              <Icon icon="ph:check-circle" className="text-2xl text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points Given</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.overview.totalReferralPointsGiven || 0}
                </p>
              </div>
              <Icon icon="ph:coins" className="text-2xl text-purple-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.overview.totalReferralCount || 0}
                </p>
              </div>
              <Icon icon="ph:user-plus" className="text-2xl text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Top Referrers */}
      {stats.topReferrers && stats.topReferrers.length > 0 && (
        <Card title="Top Referrers" className="p-4">
          <div className="space-y-3">
            {stats.topReferrers.map((referrer, index) => (
              <div
                key={referrer._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {referrer.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {referrer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Referrals</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {referrer.referralCount || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Points</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {referrer.referralPoints || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Referring User ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Enter user ID..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => handleFilterChange('userId', '')}
              className="btn btn-outline"
            >
              Clear Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card title="Referred Users List" className="p-4">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="ph:users" className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No referred users found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filters.userId ? 'No users found for this referring user' : 'No users have been referred yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      User Details
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      User ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Referral Points
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      KYC Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Referred By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const kycStatus = getKycStatus(user);
                    return (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {user.userId}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Icon icon="ph:coins" className="text-yellow-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {user.referralPoints || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge color={kycStatus.color} size="sm">
                            <Icon
                              icon={
                                kycStatus.color === 'success'
                                  ? 'ph:check-circle'
                                  : kycStatus.color === 'info'
                                  ? 'ph:info'
                                  : kycStatus.color === 'warning'
                                  ? 'ph:clock'
                                  : 'ph:x-circle'
                              }
                              className="mr-1"
                            />
                            {kycStatus.text}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {user.referredBy ? (
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.referredBy.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.referredBy.email}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Code: {user.referredBy.referralCode}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn btn-sm btn-outline"
                  >
                    <Icon icon="ph:arrow-left" className="mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn btn-sm btn-outline"
                  >
                    Next
                    <Icon icon="ph:arrow-right" className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ReferredUsers;

