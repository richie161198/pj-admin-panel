import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetPolicyByTypeQuery, useCreateOrUpdatePolicyMutation } from '@/store/api/utils/utilsApi';

const RefundPolicy = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

    const { data: policyResponse, isLoading: isFetching, error: fetchError, refetch } = useGetPolicyByTypeQuery('return');
  
  const [createOrUpdatePolicy, { isLoading: isSaving }] = useCreateOrUpdatePolicyMutation();

  const [policyData, setPolicyData] = useState({
    title: 'Refund & Return Policy',
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `# Refund & Return Policy

## Return Eligibility

We accept returns and exchanges within **30 days** of the original purchase date. Items must be in their original condition with all tags and packaging intact.

### Eligible Items
- Unworn jewelry in original condition
- Items with original tags and packaging
- Custom orders (subject to specific terms)
- Defective or damaged items

### Non-Eligible Items
- Items worn or damaged by customer
- Items without original packaging
- Personalized or engraved items
- Sale or clearance items (unless defective)

## Return Process

### Step 1: Contact Us
- Email: returns@preciousgoldsmith.com
- Phone: +1 (555) 123-4567
- Include your order number and reason for return

### Step 2: Get Authorization
- We'll provide a Return Merchandise Authorization (RMA) number
- Include this number with your return package

### Step 3: Package Items
- Use original packaging when possible
- Include all original tags and certificates
- Add the RMA number to the package

### Step 4: Ship Return
- Ship to: Returns Department, 123 Jewelry Street, Gold City, GC 12345
- Use a trackable shipping method
- Keep your shipping receipt

## Refund Timeline

- **Processing Time**: 3-5 business days after receiving return
- **Refund Method**: Original payment method
- **Refund Amount**: Full purchase price (excluding shipping)
- **Shipping Costs**: Customer responsible for return shipping

## Exchange Policy

### Size Exchanges
- Free size exchanges within 30 days
- Customer pays for return shipping
- We cover shipping for replacement item

### Style Exchanges
- Subject to price difference
- Customer pays return shipping
- We cover shipping for replacement item

## Defective Items

### Quality Issues
- Manufacturing defects covered at no cost
- We provide prepaid return shipping label
- Full refund or replacement offered

### Damage During Shipping
- Report damage within 48 hours of delivery
- Provide photos of damage
- We'll arrange pickup and replacement

## Custom Orders

### Cancellation
- Orders can be cancelled within 24 hours
- Custom work in progress may incur charges
- Cancellation fees may apply

### Modifications
- Changes allowed before production starts
- Additional charges may apply
- Timeline may be extended

## International Returns

### Shipping
- Customer responsible for return shipping
- Use trackable international shipping
- Include all customs documentation

### Timeline
- Extended to 45 days for international orders
- Processing may take 7-10 business days
- Currency conversion rates apply

## Refund Methods

### Credit Card
- Refunded to original card
- 3-5 business days processing
- Appears on next billing cycle

### PayPal
- Refunded to PayPal account
- 2-3 business days processing
- Available immediately in PayPal

### Bank Transfer
- 5-7 business days processing
- May require additional verification
- International transfers may take longer

## Special Circumstances

### Holiday Returns
- Extended return period during holidays
- Check specific dates on our website
- Rush processing available

### Wedding Jewelry
- Special return policy for wedding items
- Extended timeline for special occasions
- Consultation available for exchanges

## Contact Information

### Returns Department
- Email: returns@preciousgoldsmith.com
- Phone: +1 (555) 123-4567
- Hours: Monday-Friday, 9 AM - 6 PM EST

### Customer Service
- Email: support@preciousgoldsmith.com
- Live Chat: Available on our website
- Response Time: Within 24 hours

## Policy Updates

This return policy may be updated from time to time. We will notify customers of any significant changes via email or website notification.

**Last updated**: ${new Date().toLocaleDateString()}

---

*For questions about this policy, please contact our customer service team.*`
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
        type: 'return',
        title: policyData.title,
        content: policyData.content
      }).unwrap();

      toast.success('Return policy updated successfully');
      setActiveTab('preview');
      refetch();
    } catch (error) {
      console.error('Failed to update return policy:', error);
      toast.error(error?.data?.message || 'Failed to update return policy');
    }
  };

  const handleCancel = () => {
    setActiveTab('preview');
    refetch();
  };


  const handlePreview = () => {
    setActiveTab('preview');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('edit');
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Refund & Return Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your refund and return policy content</p>
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
                onClick={handleEdit}
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
          <Card title="Edit Refund Policy">
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
                  placeholder="Enter your refund policy content using Markdown formatting..."
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

export default RefundPolicy;