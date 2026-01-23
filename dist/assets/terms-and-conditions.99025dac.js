import{b as S,r as l,c as t,j as e,L as g,B as c,I as n,C as b,F as h,Q as f}from"./index.a3fd4963.js";import{a as P,b as T}from"./utilsApi.c40d388b.js";const A=()=>{const v=S(),[d,i]=l.exports.useState("preview"),{data:r,isLoading:x,refetch:u}=P("terms"),[w,{isLoading:m}]=T(),[s,p]=l.exports.useState({title:"Terms and Conditions",lastUpdated:new Date().toISOString().split("T")[0],content:`# Terms and Conditions

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
- All prices in Indian Rupees (\u20B9)
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

*By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.*`});l.exports.useEffect(()=>{var a;r!=null&&r.data&&p({title:r.data.title,lastUpdated:((a=r.data.lastUpdated)==null?void 0:a.split("T")[0])||new Date().toISOString().split("T")[0],content:r.data.content})},[r]);const y=(a,o)=>{p(C=>({...C,[a]:o}))},k=async()=>{var a;try{await w({type:"terms",title:s.title,content:s.content}).unwrap(),f.success("Terms and Conditions updated successfully"),i("preview"),u()}catch(o){f.error(((a=o==null?void 0:o.data)==null?void 0:a.message)||"Failed to update terms and conditions")}},N=a=>a.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>').replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>').replace(/^### (.*$)/gim,'<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>').replace(/^\- (.*$)/gim,'<li class="ml-4 mb-1">\u2022 $1</li>').replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold">$1</strong>').replace(/\n\n/g,'</p><p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/^(?!<[h|l])/gm,'<p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/(<p[^>]*>.*?<\/p>)(?!\s*<[h|l])/g,"$1");return x?t("div",{className:"flex justify-center items-center h-64",children:[e(g,{}),e("p",{className:"ml-3 text-gray-600 dark:text-gray-400",children:"Loading terms and conditions..."})]}):t("div",{className:"space-y-6",children:[t("div",{className:"flex justify-between items-center",children:[t("div",{children:[e("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Terms and Conditions"}),e("p",{className:"text-gray-600 dark:text-gray-400",children:"Manage your terms and conditions content"})]}),t(c,{onClick:()=>v("/dashboard"),className:"btn btn-outline",children:[e(n,{icon:"ph:arrow-left",className:"mr-2"}),"Back to Dashboard"]})]}),e("div",{className:"border-b border-gray-200 dark:border-gray-700",children:t("nav",{className:"-mb-px flex space-x-8",children:[t("button",{onClick:()=>i("preview"),className:`py-2 px-1 border-b-2 font-medium text-sm ${d==="preview"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500"}`,children:[e(n,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),t("button",{onClick:()=>i("edit"),className:`py-2 px-1 border-b-2 font-medium text-sm ${d==="edit"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500"}`,children:[e(n,{icon:"ph:pencil",className:"mr-2"}),"Edit"]})]})}),d==="preview"&&t(b,{children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{children:[e("h2",{className:"text-xl font-semibold text-gray-900 dark:text-white",children:s.title}),t("p",{className:"text-sm text-gray-500",children:["Last updated: ",new Date(s.lastUpdated).toLocaleDateString()]})]}),t(c,{onClick:()=>i("edit"),className:"btn btn-primary",children:[e(n,{icon:"ph:pencil",className:"mr-2"}),"Edit Policy"]})]}),e("div",{className:"prose prose-gray dark:prose-invert max-w-none",dangerouslySetInnerHTML:{__html:N(s.content)}})]}),d==="edit"&&e(b,{title:"Edit Terms and Conditions",children:t("form",{onSubmit:a=>{a.preventDefault(),k()},className:"space-y-6",children:[t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Title"}),e("input",{type:"text",value:s.title,onChange:a=>y("title",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Content"}),e("p",{className:"text-sm text-gray-500 mb-2",children:"Use Markdown formatting"}),e("textarea",{value:s.content,onChange:a=>y("content",a.target.value),rows:20,className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm",required:!0})]}),t("div",{className:"flex justify-end space-x-3",children:[e(c,{type:"button",onClick:()=>{i("preview"),u()},className:"btn btn-outline",children:"Cancel"}),t(c,{type:"button",onClick:()=>i("preview"),className:"btn btn-outline-primary",children:[e(n,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),e(c,{type:"submit",disabled:m,className:"btn btn-primary",children:m?t(h,{children:[e(g,{}),e("span",{className:"ml-2",children:"Saving..."})]}):t(h,{children:[e(n,{icon:"ph:floppy-disk",className:"mr-2"}),"Save Changes"]})})]})]})})]})};export{A as default};
