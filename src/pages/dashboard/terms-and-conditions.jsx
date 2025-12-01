import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/LoadingIcon';
import { useGetPolicyByTypeQuery, useCreateOrUpdatePolicyMutation } from '@/store/api/utils/utilsApi';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');

  const { data: policyResponse, isLoading: isFetching, refetch } = useGetPolicyByTypeQuery('terms');
  const [createOrUpdatePolicy, { isLoading: isSaving }] = useCreateOrUpdatePolicyMutation();

  const [policyData, setPolicyData] = useState({
    title: 'Terms and Conditions',
    lastUpdated: new Date().toISOString().split('T')[0],
    content: `# Terms and Conditions

## Acceptance of Terms

By accessing and using Precious GoldSmith services, you accept and agree to be bound by the terms and conditions of this agreement.

### Agreement
- These terms constitute a legal agreement
- By using our services, you agree to these terms
- If you disagree, please do not use our services
- We reserve the right to modify these terms

## Definitions

### Key Terms
- **"We," "Us," "Our"** refers to Precious GoldSmith
- **"You," "User," "Customer"** refers to service users
- **"Services"** includes website, products, and customer service
- **"Content"** includes text, images, logos, and materials

## User Accounts

### Registration
- Accurate information must be provided
- Users must be 18 years or older
- One account per person
- Account sharing is prohibited

### Account Security
- Keep your password confidential
- You are responsible for account activity
- Notify us of unauthorized access
- We reserve the right to terminate accounts

## Product Information

### Accuracy
- We strive for accurate product descriptions
- Prices are subject to change without notice
- Product availability is not guaranteed
- Colors may vary from images

### Pricing
- All prices in Indian Rupees (₹)
- Taxes included unless stated otherwise
- Payment must be received before shipment
- We reserve the right to refuse any order

## Intellectual Property

### Ownership
- All content is owned by Precious GoldSmith
- Protected by copyright and trademark laws
- Unauthorized use is prohibited
- Content may not be copied or distributed

### Trademarks
- Company logos and marks are protected
- Product images are copyrighted
- User-generated content rights retained
- License granted for personal use only

## User Obligations

### Acceptable Use
- Use services for lawful purposes only
- Do not interfere with website operations
- No unauthorized access attempts
- Respect other users and staff

### Prohibited Activities
- Fraudulent transactions
- Harassment or abusive behavior
- Spam or unsolicited communications
- Violation of any laws or regulations

## Payment Terms

### Payment Methods
- Credit/Debit cards accepted
- UPI and net banking available
- EMI options subject to approval
- Payment gateways are secure

### Transaction Security
- SSL encryption for all transactions
- We do not store card details
- Third-party payment processors used
- You are responsible for payment disputes

## Delivery and Shipping

### Delivery Terms
- Delivery times are estimates
- Delays may occur beyond our control
- Risk passes to you upon delivery
- Insurance available for high-value items

### Ownership Transfer
- Title passes upon full payment
- Retention of title until payment cleared
- Risk transfers at delivery
- Delivery confirmation required

## Returns and Refunds

### Return Policy
- Subject to our return policy terms
- Items must be in original condition
- Return shipping may apply
- Refunds processed per policy

### Warranty
- Manufacturing defects covered
- Normal wear and tear excluded
- Warranty period as specified
- Registration may be required

## Limitation of Liability

### Disclaimer
- Services provided "as is"
- No warranties, express or implied
- We are not liable for indirect damages
- Maximum liability limited to purchase price

### Force Majeure
- Not liable for events beyond control
- Includes natural disasters, strikes, wars
- Performance suspended during such events
- Notification provided when possible

## Dispute Resolution

### Governing Law
- Subject to Indian law
- Jurisdiction in courts of [City]
- Disputes resolved through arbitration
- Class action lawsuits waived

### Arbitration
- Disputes settled through binding arbitration
- Arbitration conducted per Indian laws
- Each party bears own costs
- Decision is final and binding

## Privacy and Data Protection

### Personal Information
- Subject to our Privacy Policy
- We collect and use data responsibly
- Security measures in place
- You control your data preferences

### Cookies
- We use cookies for functionality
- You can disable cookies in browser
- Some features may not work without cookies
- Third-party cookies may be used

## Modifications to Terms

### Changes
- We may update terms at any time
- Changes effective upon posting
- Continued use implies acceptance
- Major changes notified via email

## Termination

### By User
- You may close your account anytime
- Outstanding obligations remain
- No refund for partial periods
- Data retention per privacy policy

### By Us
- We may terminate for violations
- Immediate termination for fraud
- Notice provided when feasible
- Refunds subject to policies

## Contact Information

### Customer Support
- Email: support@preciousgoldsmith.com
- Phone: +1 (555) 123-4567
- Address: 123 Jewelry Street, Gold City, GC 12345
- Hours: Monday-Saturday, 9 AM - 7 PM IST

### Legal Notices
- Email: legal@preciousgoldsmith.com
- Mail: Legal Department, [Address]
- Response within 5 business days

## Miscellaneous

### Entire Agreement
- These terms constitute entire agreement
- Supersedes all prior agreements
- No other representations made
- Amendments must be in writing

### Severability
- Invalid provisions severed from agreement
- Remaining provisions remain in effect
- Intent of parties preserved
- Replacement provisions as needed

Last updated: ${new Date().toLocaleDateString()}

---

*By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.*`
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
        type: 'terms',
        title: policyData.title,
        content: policyData.content
      }).unwrap();
      toast.success('Terms and Conditions updated successfully');
      setActiveTab('preview');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update terms and conditions');
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
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading terms and conditions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms and Conditions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your terms and conditions content</p>
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
        <Card title="Edit Terms and Conditions">
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

export default TermsAndConditions;

