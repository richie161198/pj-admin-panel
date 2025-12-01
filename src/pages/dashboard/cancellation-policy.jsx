import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetPolicyByTypeQuery, useCreateOrUpdatePolicyMutation } from '@/store/api/utils/utilsApi';

const CancellationPolicy = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');

  const { data: policyResponse, isLoading: isFetching, refetch } = useGetPolicyByTypeQuery('cancellation');
  const [createOrUpdatePolicy, { isLoading: isSaving }] = useCreateOrUpdatePolicyMutation();

  const [policyData, setPolicyData] = useState({
    title: 'Cancellation Policy',
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `# Cancellation Policy

## Order Cancellation

### Cancellation Window
- Orders can be cancelled within 24 hours of placement
- No cancellation charges for orders cancelled within 24 hours
- After 24 hours, cancellation may incur charges
- Custom orders have different cancellation terms

### How to Cancel
- Login to your account and go to Orders
- Select the order you wish to cancel
- Click on "Cancel Order" button
- Provide reason for cancellation
- Confirmation email will be sent

## Cancellation Charges

### Standard Orders
- Free cancellation within 24 hours
- 5% cancellation fee after 24 hours
- 10% cancellation fee if order is packed
- No cancellation allowed after shipment

### Custom Orders
- Free cancellation within 2 hours of order
- 20% cancellation fee within 24 hours
- 50% cancellation fee after production starts
- No cancellation allowed after completion

## Refund Process

### Refund Timeline
- Cancellation processed within 24 hours
- Refund initiated within 3-5 business days
- Amount credited to original payment method
- Bank processing may take additional 5-7 days

### Refund Amount
- Full refund for cancellations within 24 hours
- Refund after deducting applicable charges
- Transaction fees are non-refundable
- Shipping charges non-refundable for shipped orders

## Special Circumstances

### Force Majeure
- Natural disasters or emergencies
- Government regulations or restrictions
- Supply chain disruptions
- Full refund provided without charges

### Quality Issues
- Manufacturing defects identified
- Product quality concerns
- Mismatch with product description
- Full refund without cancellation charges

## Exceptions

### Non-Cancellable Items
- Engraved or personalized jewelry
- Special occasion orders (48 hours before)
- Clearance sale items
- Gift cards and vouchers

### Holiday Season
- Extended cancellation windows
- Special cancellation policies announced
- Rush orders have limited cancellation time
- Pre-order cancellations subject to terms

## Contact for Cancellation

### Customer Support
- Email: cancel@preciousgoldsmith.com
- Phone: +1 (555) 123-4567
- Hours: Monday-Saturday, 9 AM - 7 PM IST
- Online chat support available

### Required Information
- Order number
- Registered email address
- Reason for cancellation
- Contact phone number

## Modification vs Cancellation

### Order Modifications
- Address changes allowed before shipment
- Quantity changes subject to availability
- Product changes may require cancellation
- No charges for modifications

### Alternative Solutions
- Exchange for different product
- Store credit instead of refund
- Postpone delivery date
- Gift card conversion

## Seller-Initiated Cancellation

### Reasons for Cancellation
- Product out of stock
- Pricing errors
- Unable to verify payment
- Delivery not available to location

### Compensation
- Full refund processed immediately
- Additional discount coupon provided
- Priority processing on next order
- No cancellation charges

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
    setPolicyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await createOrUpdatePolicy({
        type: 'cancellation',
        title: policyData.title,
        content: policyData.content
      }).unwrap();
      toast.success('Cancellation policy updated successfully');
      setActiveTab('preview');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update cancellation policy');
    }
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
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading cancellation policy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cancellation Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your cancellation policy content</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          <Icon icon="ph:arrow-left" className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'
            }`}
          >
            <Icon icon="ph:eye" className="mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'edit' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'
            }`}
          >
            <Icon icon="ph:pencil" className="mr-2" />
            Edit
          </button>
        </nav>
      </div>

      {activeTab === 'preview' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{policyData.title}</h2>
              <p className="text-sm text-gray-500">Last updated: {new Date(policyData.lastUpdated).toLocaleDateString()}</p>
            </div>
            <Button onClick={() => setActiveTab('edit')} className="btn btn-primary">
              <Icon icon="ph:pencil" className="mr-2" />
              Edit Policy
            </Button>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(policyData.content) }} />
        </Card>
      )}

      {activeTab === 'edit' && (
        <Card title="Edit Cancellation Policy">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policy Title</label>
              <input
                type="text"
                value={policyData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policy Content</label>
              <p className="text-sm text-gray-500 mb-2">Use Markdown formatting</p>
              <textarea
                value={policyData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" onClick={() => { setActiveTab('preview'); refetch(); }} className="btn btn-outline">Cancel</Button>
              <Button type="button" onClick={() => setActiveTab('preview')} className="btn btn-outline-primary">
                <Icon icon="ph:eye" className="mr-2" />
                Preview
              </Button>
              <Button type="submit" disabled={isSaving} className="btn btn-primary">
                {isSaving ? (<><LoadingIcon /><span className="ml-2">Saving...</span></>) : (<><Icon icon="ph:floppy-disk" className="mr-2" />Save Changes</>)}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CancellationPolicy;

