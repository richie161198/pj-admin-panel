import{b as P,r,j as e,L as m,c as a,B as i,I as s,C as B,F as p,Q as g}from"./index.cccf3715.js";const M=()=>{const y=P(),[o,c]=r.exports.useState(!1),[h,N]=r.exports.useState(!1),[n,d]=r.exports.useState("preview"),[f,b]=r.exports.useState("2024-01-15"),[l,x]=r.exports.useState(`# Withdrawal Policy

## 1. Withdrawal Eligibility

### 1.1 Account Requirements
- Your account must be fully verified with KYC documents
- Minimum account balance must be maintained as per our terms
- All transactions must be completed and settled
- No pending disputes or chargebacks

### 1.2 Verification Status
- PAN card verification: Required
- Bank account verification: Required
- Mobile number verification: Required
- Address proof verification: Required

## 2. Withdrawal Methods

### 2.1 Bank Transfer
- **Processing Time**: 1-3 business days
- **Minimum Amount**: \u20B91,000
- **Maximum Amount**: \u20B910,00,000 per transaction
- **Daily Limit**: \u20B950,00,000
- **Charges**: \u20B925 per transaction

### 2.2 UPI Transfer
- **Processing Time**: Instant to 2 hours
- **Minimum Amount**: \u20B9100
- **Maximum Amount**: \u20B92,00,000 per transaction
- **Daily Limit**: \u20B95,00,000
- **Charges**: \u20B910 per transaction

### 2.3 Wallet Transfer
- **Processing Time**: Instant
- **Minimum Amount**: \u20B950
- **Maximum Amount**: \u20B91,00,000 per transaction
- **Daily Limit**: \u20B92,00,000
- **Charges**: \u20B95 per transaction

## 3. Withdrawal Limits

### 3.1 Daily Limits
- **New Users (0-30 days)**: \u20B91,00,000
- **Verified Users (30+ days)**: \u20B95,00,000
- **Premium Users**: \u20B910,00,000

### 3.2 Monthly Limits
- **Standard Users**: \u20B950,00,000
- **Premium Users**: \u20B91,00,00,000
- **VIP Users**: No limit

### 3.3 Annual Limits
- **Standard Users**: \u20B95,00,00,000
- **Premium Users**: \u20B950,00,00,000
- **VIP Users**: No limit

## 4. Processing Times

### 4.1 Standard Processing
- **Bank Transfer**: 1-3 business days
- **UPI**: Instant to 2 hours
- **Wallet**: Instant

### 4.2 Express Processing (Additional Charges)
- **Bank Transfer**: Same day (\u20B9100 extra)
- **UPI**: Instant (\u20B950 extra)
- **Wallet**: Instant (\u20B925 extra)

### 4.3 Weekend and Holidays
- Processing may be delayed during weekends and bank holidays
- Emergency withdrawals available for premium users

## 5. Fees and Charges

### 5.1 Standard Fees
- **Bank Transfer**: \u20B925 per transaction
- **UPI Transfer**: \u20B910 per transaction
- **Wallet Transfer**: \u20B95 per transaction

### 5.2 Express Processing Fees
- **Same Day Bank Transfer**: \u20B9100 + standard fees
- **Instant UPI**: \u20B950 + standard fees
- **Instant Wallet**: \u20B925 + standard fees

### 5.3 International Transfers
- **SWIFT Transfer**: \u20B9500 + 0.5% of amount
- **Processing Time**: 3-7 business days
- **Currency Conversion**: As per current exchange rates

## 6. Security Measures

### 6.1 Authentication
- Two-factor authentication required
- Transaction PIN verification
- OTP verification for amounts above \u20B910,000
- Biometric verification for amounts above \u20B91,00,000

### 6.2 Fraud Prevention
- Real-time transaction monitoring
- Suspicious activity detection
- Manual review for large amounts
- Enhanced verification for new accounts

## 7. Restrictions and Prohibitions

### 7.1 Prohibited Activities
- Money laundering activities
- Terrorist financing
- Tax evasion
- Fraudulent transactions
- Unauthorized account access

### 7.2 Account Restrictions
- Suspended accounts cannot withdraw
- Frozen accounts require manual review
- Under investigation accounts are restricted
- Non-compliant accounts are blocked

## 8. Dispute Resolution

### 8.1 Withdrawal Disputes
- Contact customer support within 24 hours
- Provide transaction details and proof
- Investigation period: 3-7 business days
- Resolution time: 7-14 business days

### 8.2 Refund Process
- Automatic refund for failed transactions
- Manual refund for disputed transactions
- Processing time: 3-5 business days
- Notification via email and SMS

## 9. Customer Support

### 9.1 Contact Information
- **Email**: support@company.com
- **Phone**: +91-800-123-4567
- **Live Chat**: Available 24/7
- **WhatsApp**: +91-98765-43210

### 9.2 Support Hours
- **Monday to Friday**: 9:00 AM - 8:00 PM
- **Saturday**: 10:00 AM - 6:00 PM
- **Sunday**: 10:00 AM - 4:00 PM
- **Emergency**: 24/7 for premium users

## 10. Policy Updates

### 10.1 Notification
- Email notification 30 days in advance
- SMS notification 7 days in advance
- In-app notification 24 hours in advance
- Website announcement

### 10.2 Effective Date
- Changes become effective after notification period
- Existing transactions follow old policy
- New transactions follow updated policy
- Grandfather clause for premium users

---

**Last Updated**: ${new Date().toLocaleDateString()}
**Version**: 2.1
**Effective Date**: January 15, 2024`),v=async()=>{c(!0);try{await new Promise(t=>setTimeout(t,1500)),g.success("Withdrawal policy updated successfully")}catch{g.error("Failed to update withdrawal policy")}finally{c(!1)}},u=()=>{d("preview")},w=()=>{d("edit")},k=t=>t.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">$1</h1>').replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">$1</h2>').replace(/^### (.*$)/gim,'<h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">$1</h3>').replace(/^#### (.*$)/gim,'<h4 class="text-base font-medium mb-2 text-gray-600 dark:text-gray-400">$1</h4>').replace(/\*\*(.*?)\*\*/gim,'<strong class="font-semibold">$1</strong>').replace(/\*(.*?)\*/gim,'<em class="italic">$1</em>').replace(/^- (.*$)/gim,'<li class="ml-4 mb-1">\u2022 $1</li>').replace(/^\d+\. (.*$)/gim,'<li class="ml-4 mb-1">$1</li>').replace(/\n\n/gim,'</p><p class="mb-4">').replace(/\n/gim,"<br>").replace(/^(.*)$/gim,'<p class="mb-4 text-gray-600 dark:text-gray-400">$1</p>');return h?e("div",{className:"flex justify-center items-center h-64",children:e(m,{})}):a("div",{className:"space-y-6",children:[a("div",{className:"flex justify-between items-center",children:[a("div",{children:[e("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Withdrawal Policy"}),e("p",{className:"text-gray-600 dark:text-gray-400",children:"Manage and preview withdrawal policy content"})]}),a(i,{onClick:()=>y("/dashboard"),className:"btn btn-outline",children:[e(s,{icon:"ph:arrow-left",className:"mr-2"}),"Back to Dashboard"]})]}),a(B,{className:"p-0",children:[e("div",{className:"border-b border-gray-200 dark:border-gray-700",children:a("nav",{className:"flex space-x-8 px-6",children:[a("button",{onClick:u,className:`py-4 px-1 border-b-2 font-medium text-sm ${n==="preview"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`,children:[e(s,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),a("button",{onClick:w,className:`py-4 px-1 border-b-2 font-medium text-sm ${n==="edit"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`,children:[e(s,{icon:"ph:pencil",className:"mr-2"}),"Edit"]})]})}),e("div",{className:"p-6",children:n==="preview"?e("div",{className:"prose max-w-none",children:e("div",{className:"text-gray-600 dark:text-gray-400",dangerouslySetInnerHTML:{__html:k(l)}})}):a("div",{className:"space-y-6",children:[a("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Last Updated"}),e("input",{type:"date",value:f,onChange:t=>b(t.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"})]}),a("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Content (Markdown)"}),e("textarea",{value:l,onChange:t=>x(t.target.value),rows:20,className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm",placeholder:"Enter your withdrawal policy content in Markdown format..."}),e("p",{className:"mt-2 text-sm text-gray-500 dark:text-gray-400",children:"You can use Markdown formatting for headings, lists, bold text, etc."})]}),a("div",{className:"flex justify-end space-x-3",children:[a(i,{onClick:u,className:"btn btn-outline",children:[e(s,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),e(i,{onClick:v,disabled:o,className:"btn btn-primary",children:o?a(p,{children:[e(m,{}),e("span",{className:"ml-2",children:"Saving..."})]}):a(p,{children:[e(s,{icon:"ph:floppy-disk",className:"mr-2"}),"Save Policy"]})})]})]})})]})]})};export{M as default};
