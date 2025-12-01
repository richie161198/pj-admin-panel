import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetPolicyByTypeQuery, useCreateOrUpdatePolicyMutation } from '@/store/api/utils/utilsApi';

const ShippingPolicy = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');

  // API hooks
  const { data: policyResponse, isLoading: isFetching, error: fetchError, refetch } = useGetPolicyByTypeQuery('shipping');
  const [createOrUpdatePolicy, { isLoading: isSaving }] = useCreateOrUpdatePolicyMutation();

  const [policyData, setPolicyData] = useState({
    title: 'Shipping Policy',
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `# Shipping Policy

## Shipping Information

We offer shipping services across India with multiple delivery options to suit your needs.

### Shipping Methods
- Standard Shipping (5-7 business days)
- Express Shipping (2-3 business days)
- Same Day Delivery (available in select cities)
- International Shipping (10-15 business days)

### Shipping Charges
- Free shipping on orders above ₹50,000
- Standard shipping: ₹200 per order
- Express shipping: ₹500 per order
- International shipping: varies by location

## Order Processing

### Processing Time
- Orders placed before 2 PM IST are processed the same day
- Orders placed after 2 PM IST are processed the next business day
- Custom orders may require additional processing time
- Weekends and holidays extend processing time

### Order Tracking
- Tracking number provided within 24 hours of shipment
- Real-time tracking available on our website
- SMS and email notifications sent at each stage
- Customer support available for tracking issues

## Delivery Locations

### Domestic Shipping
- Available across all major cities and towns in India
- Rural areas may have extended delivery times
- Pin code verification during checkout
- Delivery attempts made twice before return

### International Shipping
- Available to select countries
- Customs charges are buyer's responsibility
- Extended timelines for remote locations
- Import duties may apply

## Packaging

### Security Features
- Tamper-proof packaging for all jewelry items
- Insurance coverage for all shipments
- Signature required on delivery
- Discreet packaging available on request

### Package Contents
- Original product with tags and certificates
- Invoice and warranty documents
- Care instructions included
- Gift wrapping available (optional)

## Delivery Issues

### Failed Delivery
- Two delivery attempts made
- SMS notification sent before each attempt
- Customer can reschedule delivery
- Return to origin after failed attempts

### Lost or Damaged Items
- Report within 48 hours of delivery
- Full refund or replacement provided
- Insurance claim processed automatically
- Photographic evidence may be required

## Special Services

### Gift Wrapping
- Complimentary gift wrapping available
- Premium packaging for special occasions
- Personalized gift messages
- Multiple items can be wrapped together

### Expedited Shipping
- Rush delivery available for urgent orders
- Additional charges apply
- Guaranteed delivery dates
- Same-day delivery in metro cities

## Shipping Restrictions

### Items Not Shipped
- Items over 500 grams (international)
- Countries with trade restrictions
- Areas with security concerns
- Remote locations without courier access

### Holiday Season
- Extended delivery times during festivals
- Pre-order recommended for gifting
- Cutoff dates announced in advance
- Priority processing for regular customers

## Contact Information

For shipping-related queries:
- Email: shipping@preciousgoldsmith.com
- Phone: +1 (555) 123-4567
- Hours: Monday-Saturday, 9 AM - 7 PM IST

Last updated: ${new Date().toLocaleDateString()}`
  });

  // Load policy from API
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
        type: 'shipping',
        title: policyData.title,
        content: policyData.content
      }).unwrap();

      toast.success('Shipping policy updated successfully');
      setActiveTab('preview');
      refetch();
    } catch (error) {
      console.error('Failed to update shipping policy:', error);
      toast.error(error?.data?.message || 'Failed to update shipping policy');
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
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading shipping policy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your shipping policy content</p>
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
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Icon icon="ph:eye" className="mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'edit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date(policyData.lastUpdated).toLocaleDateString()}
              </p>
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
        <Card title="Edit Shipping Policy">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policy Title</label>
              <input
                type="text"
                value={policyData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Policy Content</label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Use Markdown formatting. Supports headers (# ## ###), lists (-), bold (**text**), and paragraphs.
              </p>
              <textarea
                value={policyData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" onClick={handleCancel} className="btn btn-outline">Cancel</Button>
              <Button type="button" onClick={() => setActiveTab('preview')} className="btn btn-outline-primary">
                <Icon icon="ph:eye" className="mr-2" />
                Preview
              </Button>
              <Button type="submit" disabled={isSaving} className="btn btn-primary">
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
      )}
    </div>
  );
};

export default ShippingPolicy;

