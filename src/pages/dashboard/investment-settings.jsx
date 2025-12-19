import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetInvestmentSettingsQuery, useCreateInvestmentSettingsMutation } from '@/store/api/utils/utilsApi';

const InvestmentSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pricing');

  // API hooks
  const { data: investmentData, isLoading: isFetching, error: fetchError, refetch } = useGetInvestmentSettingsQuery();
  const [createInvestmentSettings, { isLoading: isSaving }] = useCreateInvestmentSettingsMutation();

  const [settings, setSettings] = useState({
    gold: {
      enabled: true,
      price24kt: 0, // 24 karat price per gram
      price22kt: 0, // 22 karat price per gram
      price18kt: 0, // 18 karat price per gram
      pricePerOunce: 0,
    },
    silver: {
      enabled: true,
      pricePerGram: 0,
      pricePerOunce: 0,
    },
    taxes: {
      gstRate: 3.0,
      cgstRate: 1.5,
      sgstRate: 1.5,
      tcsRate: 0.1,
    },
    handling: {
      goldMakingCharges: 15.0,
      silverMakingCharges: 8.0,
      goldWastage: 2.0,
      silverWastage: 3.0,
      goldPolishing: 2.0,
      silverPolishing: 1.5,
      goldHallmarking: 0.5,
      silverHallmarking: 0.3,
    }
  });
  // Load settings from API when data is available
  useEffect(() => {
    if (investmentData?.data) {
      console.log('Investment Settings Data:', investmentData.data);
      setSettings(prev => ({
        ...prev,
        gold: {
          ...prev.gold,
          enabled: investmentData.data.goldStatus === true || investmentData.data.goldStatus === 'active',
          // Map existing goldPrice to 24kt (for backward compatibility)
          price24kt: investmentData.data.goldPrice24kt || investmentData.data.goldPrice || 0,
          price22kt: investmentData.data.goldPrice22kt || 0,
          price18kt: investmentData.data.goldPrice18kt || 0,
        },
        silver: {
          ...prev.silver,
          enabled: investmentData.data.silverStatus === true || investmentData.data.silverStatus === 'active',
          pricePerGram: investmentData.data.silverPrice || 0,
        }
      }));
    }
  }, [investmentData]);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Prepare data for API
      const requestData = {
        goldRate: settings.gold.price24kt, // Keep goldRate for backward compatibility (24kt)
        goldRate24kt: settings.gold.price24kt,
        goldRate22kt: settings.gold.price22kt,
        goldRate18kt: settings.gold.price18kt,
        goldStatus: settings.gold.enabled,
        silverRate: settings.silver.pricePerGram,
        silverStatus: settings.silver.enabled,
      };

      console.log('Saving investment settings:', requestData);

      // Call API
      const response = await createInvestmentSettings(requestData).unwrap();
      
      console.log('Save response:', response);
      toast.success('Investment settings updated successfully');
      
      // Refetch to get latest data
      refetch();
    } catch (error) {
      console.error('Failed to update investment settings:', error);
      toast.error(error?.data?.message || 'Failed to update investment settings');
    }
  };

  const tabs = [
    { id: 'pricing', label: 'Pricing', icon: 'ph:currency-dollar' },
    // { id: 'taxes', label: 'Taxes', icon: 'ph:receipt' },
    // { id: 'charges', label: 'Charges', icon: 'ph:calculator' }
  ];

  // Show loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIcon />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading investment settings...</p>
      </div>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Icon icon="ph:warning-circle" className="text-4xl text-red-500 mb-4" />
        <p className="text-red-500 text-lg mb-2">Failed to load investment settings</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{fetchError?.data?.message || 'Unable to fetch data'}</p>
        <Button onClick={() => refetch()} className="btn btn-primary">
          <Icon icon="ph:arrow-clockwise" className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage gold and silver pricing and charges</p>
          {investmentData?.data?.updatedAt && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Last updated: {new Date(investmentData.data.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

        <div className="lg:col-span-3">
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <Card title="Gold Pricing">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon icon="ph:medal" className="text-2xl text-yellow-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gold Trading</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable gold trading</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${settings.gold.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {settings.gold.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.gold.enabled}
                          onChange={(e) => handleInputChange('gold', 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {settings.gold.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <span className="flex items-center gap-2">
                            <Icon icon="ph:medal" className="text-yellow-500" />
                            24 Karat Gold Price (₹/gram)
                          </span>
                        </label>
                        <input
                          type="number"
                          value={settings.gold.price24kt}
                          onChange={(e) => handleInputChange('gold', 'price24kt', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Pure gold (99.9% purity)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <span className="flex items-center gap-2">
                            <Icon icon="ph:medal" className="text-yellow-600" />
                            22 Karat Gold Price (₹/gram)
                          </span>
                        </label>
                        <input
                          type="number"
                          value={settings.gold.price22kt}
                          onChange={(e) => handleInputChange('gold', 'price22kt', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">91.67% purity</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <span className="flex items-center gap-2">
                            <Icon icon="ph:medal" className="text-yellow-700" />
                            18 Karat Gold Price (₹/gram)
                          </span>
                        </label>
                        <input
                          type="number"
                          value={settings.gold.price18kt}
                          onChange={(e) => handleInputChange('gold', 'price18kt', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">75% purity</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Silver Pricing">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon icon="ph:medal" className="text-2xl text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Silver Trading</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable silver trading</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${settings.silver.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {settings.silver.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.silver.enabled}
                          onChange={(e) => handleInputChange('silver', 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {settings.silver.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Silver Price (₹/gram)
                        </label>
                        <input
                          type="number"
                          value={settings.silver.pricePerGram}
                          onChange={(e) => handleInputChange('silver', 'pricePerGram', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                          step="0.01"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price per Ounce (₹)
                        </label>
                        <input
                          type="number"
                          value={settings.silver.pricePerOunce}
                          onChange={(e) => handleInputChange('silver', 'pricePerOunce', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                          step="0.01"
                        />
                      </div> */}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'taxes' && (
            <Card title="Tax Configuration">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxes.gstRate}
                    onChange={(e) => handleInputChange('taxes', 'gstRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxes.cgstRate}
                    onChange={(e) => handleInputChange('taxes', 'cgstRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxes.sgstRate}
                    onChange={(e) => handleInputChange('taxes', 'sgstRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    TCS Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxes.tcsRate}
                    onChange={(e) => handleInputChange('taxes', 'tcsRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    step="0.1"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'charges' && (
            <div className="space-y-6">
              <Card title="Gold Handling Charges">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Making Charges (₹/gram)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.goldMakingCharges}
                      onChange={(e) => handleInputChange('handling', 'goldMakingCharges', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wastage (%)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.goldWastage}
                      onChange={(e) => handleInputChange('handling', 'goldWastage', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Polishing (₹/gram)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.goldPolishing}
                      onChange={(e) => handleInputChange('handling', 'goldPolishing', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hallmarking (₹/gram)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.goldHallmarking}
                      onChange={(e) => handleInputChange('handling', 'goldHallmarking', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                </div>
              </Card>

              <Card title="Silver Handling Charges">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Making Charges (₹/gram)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.silverMakingCharges}
                      onChange={(e) => handleInputChange('handling', 'silverMakingCharges', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wastage (%)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.silverWastage}
                      onChange={(e) => handleInputChange('handling', 'silverWastage', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Polishing (₹/gram)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.silverPolishing}
                      onChange={(e) => handleInputChange('handling', 'silverPolishing', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hallmarking (₹/gram)
                    </label>
                    <input
                      type="number"
                      value={settings.handling.silverHallmarking}
                      onChange={(e) => handleInputChange('handling', 'silverHallmarking', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      step="0.1"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-8">
            <Button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
              {isSaving ? (
                <>
                  <LoadingIcon />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Icon icon="ph:floppy-disk" className="mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSettings;
