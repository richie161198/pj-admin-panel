import React, { useState, useEffect } from 'react';
import { useGetMaintenanceStatusQuery, useUpdateMaintenanceStatusMutation } from '@/store/api/maintenance/maintenanceApi';
import { toast } from 'react-toastify';

// Helper to convert UTC date string from backend to local datetime-local input value
const formatDateForInput = (utcDateString) => {
  if (!utcDateString) return '';
  const date = new Date(utcDateString);
  if (Number.isNaN(date.getTime())) return '';
  // Adjust by timezone offset so toISOString returns local time
  const tzOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - tzOffset * 60000);
  return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

// Helper to convert local datetime-local value to UTC ISO string for backend
const convertLocalToUTC = (localDateTimeValue) => {
  if (!localDateTimeValue) return null;
  const localDate = new Date(localDateTimeValue);
  if (Number.isNaN(localDate.getTime())) return null;
  // new Date(...) parses the datetime-local string as local time.
  // Calling toISOString() converts that local time to the correct UTC instant.
  return localDate.toISOString();
};

const MaintenancePage = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [estimatedEndTime, setEstimatedEndTime] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('emergency');
  const [affectedServices, setAffectedServices] = useState(['all']); // kept for backwards-compat, not shown in UI
  const [allowedIPs, setAllowedIPs] = useState(''); // kept but hidden
  const [allowedUserIds, setAllowedUserIds] = useState(''); // kept but hidden

  const { data: maintenanceData, isLoading, refetch } = useGetMaintenanceStatusQuery();
  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateMaintenanceStatusMutation();

  useEffect(() => {
    if (maintenanceData?.data) {
      const data = maintenanceData.data;
      setIsMaintenanceMode(data.isMaintenanceMode || false);
      setMaintenanceMessage(data.maintenanceMessage || '');
      setMaintenanceTitle(data.maintenanceTitle || '');
      // Convert UTC from backend to local value for datetime-local input
      setEstimatedEndTime(formatDateForInput(data.estimatedEndTime));
      setMaintenanceType(data.maintenanceType || 'emergency');
      // The following advanced fields are no longer exposed in the UI,
      // but we keep state wiring for compatibility if backend returns them.
      setAffectedServices(data.affectedServices || ['all']);
      setAllowedIPs(data.allowedIPs ? data.allowedIPs.join(', ') : '');
      setAllowedUserIds(data.allowedUserIds ? data.allowedUserIds.join(', ') : '');

      // Auto-disable maintenance on page refresh if end time has passed
      try {
        if (data.isMaintenanceMode && data.estimatedEndTime) {
          const endTime = new Date(data.estimatedEndTime);
          const now = new Date();

          if (!Number.isNaN(endTime.getTime()) && endTime.getTime() <= now.getTime()) {
            const autoUpdateData = {
              isMaintenanceMode: false,
              maintenanceMessage: data.maintenanceMessage || '',
              maintenanceTitle: data.maintenanceTitle || '',
              estimatedEndTime: null,
              maintenanceType: data.maintenanceType || 'emergency',
            };

            console.log('Auto-disabling maintenance because estimatedEndTime has passed:', {
              endTime,
              now,
              autoUpdateData,
            });

            // Fire and forget; UI state will refresh via refetch
            updateMaintenance(autoUpdateData)
              .unwrap()
              .then((response) => {
                console.log('Auto-disable maintenance response:', response);
                setIsMaintenanceMode(false);
                refetch();
              })
              .catch((error) => {
                console.error('Error auto-disabling maintenance:', error);
              });
          }
        }
      } catch (err) {
        console.error('Error in auto-disable maintenance check:', err);
      }
    }
  }, [maintenanceData]);

  const handleServiceChange = (service) => {
    if (affectedServices.includes(service)) {
      setAffectedServices(affectedServices.filter(s => s !== service));
    } else {
      setAffectedServices([...affectedServices, service]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        isMaintenanceMode,
        maintenanceMessage,
        maintenanceTitle,
        // Convert local datetime-local input to UTC ISO string for backend
        estimatedEndTime: estimatedEndTime ? convertLocalToUTC(estimatedEndTime) : null,
        maintenanceType
        // Advanced controls (affectedServices, allowedIPs, allowedUserIds) are no longer editable from the UI.
      };

      console.log('Updating maintenance with data:', updateData);
      
      const response = await updateMaintenance(updateData).unwrap();
      
      console.log('Maintenance update response:', response);
      
      if (response.status) {
        toast.success(response.message);
        refetch();
      }
    } catch (error) {
      console.error('Error updating maintenance:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.message
      });
      toast.error(error?.data?.message || error?.message || 'Failed to update maintenance status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">App Maintenance</h1>
              <p className="text-gray-600 mt-1">Control app maintenance mode and settings</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isMaintenanceMode 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isMaintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Maintenance Mode Toggle */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">App Maintenance Mode</h3>
                  <p className="text-sm text-gray-600">Enable or disable app maintenance mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isMaintenanceMode}
                    onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Maintenance Details */}
            {isMaintenanceMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Title
                    </label>
                    <input
                      type="text"
                      value={maintenanceTitle}
                      onChange={(e) => setMaintenanceTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="System Maintenance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Type
                    </label>
                    <select
                      value={maintenanceType}
                      onChange={(e) => setMaintenanceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="emergency">Emergency</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="update">Update</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                   Maintenance Message
                  </label>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="We are currently performing maintenance. Please try again later."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={estimatedEndTime}
                    onChange={(e) => setEstimatedEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isMaintenanceMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? 'Updating...' : (isMaintenanceMode ? 'Enable Maintenance' : 'Disable Maintenance')}
              </button>
            </div>
          </form>

          {/* Current Status Display */}
          {maintenanceData?.data && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    maintenanceData.data.isMaintenanceMode 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {maintenanceData.data.isMaintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
                  </span>
                </div>
                {maintenanceData.data.lastUpdated && (
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(maintenanceData.data.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
