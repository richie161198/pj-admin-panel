import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetPolicyByTypeQuery, useCreateOrUpdatePolicyMutation } from '@/store/api/utils/utilsApi';

const DigiGoldRedemption = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');
  const { data: policyResponse, isLoading: isFetching, error: fetchError, refetch } = useGetPolicyByTypeQuery('redemption');
    const [createOrUpdatePolicy, { isLoading: isSaving }] = useCreateOrUpdatePolicyMutation();
  

  const [policyData, setPolicyData] = useState({
    title: 'Digital Gold Delivery & Redemption Policy',
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `# Digital Gold Delivery & Redemption Policy

## Information We Collect

We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

### Personal Information
- Name and contact information
- Email address and phone number
- Billing and shipping addresses
- Payment information (processed securely)

### Usage Information
- Device information and IP address
- Browser type and version
- Pages visited and time spent on our site
- Cookies and similar tracking technologies

## How We Use Your Information

We use the information we collect to:
- Process transactions and provide customer support
- Send you important updates about your account
- Improve our services and user experience
- Comply with legal obligations
- Protect against fraud and abuse

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
- With service providers who assist us in operating our website
- When required by law or to protect our rights
- In connection with a business transfer or acquisition

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Data portability

## Cookies

We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.

## Third-Party Links

Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.

## Children's Privacy

Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

## Contact Us

If you have any questions about this privacy policy, please contact us at:
- Email: privacy@preciousgoldsmith.com
- Phone: +1 (555) 123-4567
- Address: 123 Jewelry Street, Gold City, GC 12345

Last updated: ${new Date().toLocaleDateString()}`
  });


    useEffect(() => {
      if (policyResponse?.data) {
        setPolicyData({
          title: policyResponse.data.title,
          lastUpdated: policyResponse.data.lastUpdated?.split('T')[0] || new Date().toISOString().split('T')[0],
          content: policyResponse.data.content
        });
      }
    }, [policyResponse]);

  const handleInputChange = (field, value) => {
    setPolicyData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSave = async () => {
    try {
      await createOrUpdatePolicy({
        type: 'redemption',
        title: policyData.title,
        content: policyData.content
      }).unwrap();

      toast.success('Digital Gold Delivery & Redemption policy updated successfully');
      setActiveTab('preview');
      refetch();
    } catch (error) {
      console.error('Failed to update Digital Gold Delivery & Redemption policy:', error);
      toast.error(error?.data?.message || 'Failed to update Digital Gold Delivery & Redemption policy');
    }
  };

  const handleCancel = () => {
    setActiveTab('preview');
    refetch();
  };

  const formatContent = (content) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-600 dark:text-gray-400">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4 text-gray-600 dark:text-gray-400">')
      .replace(/(<p[^>]*>.*?<\/p>)(?!\s*<[h|l])/g, '$1');
  };

    if (isFetching) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingIcon />
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading Digital Gold Delivery & Redemption policy...</p>
        </div>
      );
    }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Gold Delivery & Redemption Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your Digital Gold Delivery & Redemption policy content and settings</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline"
          >
            <Icon icon="ph:arrow-left" className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Icon icon="ph:eye" className="mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'edit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Icon icon="ph:pencil" className="mr-2" />
            Edit
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {policyData.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(policyData.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => setActiveTab('edit')}
                className="btn btn-primary"
              >
                <Icon icon="ph:pencil" className="mr-2" />
                Edit Policy
              </Button>
            </div>
            
            <div 
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formatContent(policyData.content) }}
            />
          </Card>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="space-y-6">
          <Card title="Edit Digital Gold Delivery & Redemption Policy">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={policyData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Updated
                </label>
                <input
                  type="date"
                  value={policyData.lastUpdated}
                  onChange={(e) => handleInputChange('lastUpdated', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Policy Content
                </label>
                <div className="mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use Markdown formatting. Supports headers (# ## ###), lists (-), bold (**text**), and paragraphs.
                  </p>
                </div>
                <textarea
                  value={policyData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm"
                  placeholder="Enter your Grievance policy content using Markdown formatting..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
               <Button type="button" onClick={handleCancel} className="btn btn-outline">Cancel</Button>
                           <Button type="button" onClick={() => setActiveTab('preview')} className="btn btn-outline-primary">
                             <Icon icon="ph:eye" className="mr-2" />
                             Preview
                           </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <LoadingIcon />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:floppy-disk" className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DigiGoldRedemption;