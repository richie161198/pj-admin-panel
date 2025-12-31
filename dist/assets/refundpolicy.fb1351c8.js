import{b as I,r as d,c as t,j as e,L as h,B as l,I as o,C as y,F as b,Q as f}from"./index.db1e92fc.js";import{u as E,a as D}from"./utilsApi.9330bd36.js";const A=()=>{const x=I(),[M,v]=d.exports.useState(!1),[c,n]=d.exports.useState("preview"),{data:i,isLoading:k,error:T,refetch:u}=E("return"),[w,{isLoading:m}]=D(),[r,g]=d.exports.useState({title:"Refund & Return Policy",lastUpdated:new Date().toISOString().split("T")[0],content:`# Refund & Return Policy

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

*For questions about this policy, please contact our customer service team.*`});d.exports.useEffect(()=>{var a;i!=null&&i.data&&g({title:i.data.title,lastUpdated:((a=i.data.lastUpdated)==null?void 0:a.split("T")[0])||new Date().toISOString().split("T")[0],content:i.data.content})},[i]);const p=(a,s)=>{g(R=>({...R,[a]:s}))},C=async()=>{var a;try{await w({type:"return",title:r.title,content:r.content}).unwrap(),f.success("Return policy updated successfully"),n("preview"),u()}catch(s){console.error("Failed to update return policy:",s),f.error(((a=s==null?void 0:s.data)==null?void 0:a.message)||"Failed to update return policy")}},N=()=>{n("preview"),u()},S=()=>{v(!0),n("edit")},P=a=>a.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>').replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>').replace(/^### (.*$)/gim,'<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>').replace(/^\- (.*$)/gim,'<li class="ml-4 mb-1">\u2022 $1</li>').replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold">$1</strong>').replace(/\n\n/g,'</p><p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/^(?!<[h|l])/gm,'<p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/(<p[^>]*>.*?<\/p>)(?!\s*<[h|l])/g,"$1");return k?t("div",{className:"flex justify-center items-center h-64",children:[e(h,{}),e("p",{className:"ml-3 text-gray-600 dark:text-gray-400",children:"Loading shipping policy..."})]}):t("div",{className:"space-y-6",children:[t("div",{className:"flex justify-between items-center",children:[t("div",{children:[e("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Refund & Return Policy"}),e("p",{className:"text-gray-600 dark:text-gray-400",children:"Manage your refund and return policy content"})]}),e("div",{className:"flex space-x-3",children:t(l,{onClick:()=>x("/dashboard"),className:"btn btn-outline",children:[e(o,{icon:"ph:arrow-left",className:"mr-2"}),"Back to Dashboard"]})})]}),e("div",{className:"border-b border-gray-200 dark:border-gray-700",children:t("nav",{className:"-mb-px flex space-x-8",children:[t("button",{onClick:()=>n("preview"),className:`py-2 px-1 border-b-2 font-medium text-sm ${c==="preview"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`,children:[e(o,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),t("button",{onClick:()=>n("edit"),className:`py-2 px-1 border-b-2 font-medium text-sm ${c==="edit"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`,children:[e(o,{icon:"ph:pencil",className:"mr-2"}),"Edit"]})]})}),c==="preview"&&e("div",{className:"space-y-6",children:t(y,{children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{children:[e("h2",{className:"text-xl font-semibold text-gray-900 dark:text-white",children:r.title}),t("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:["Last updated: ",new Date(r.lastUpdated).toLocaleDateString()]})]}),t(l,{onClick:S,className:"btn btn-primary",children:[e(o,{icon:"ph:pencil",className:"mr-2"}),"Edit Policy"]})]}),e("div",{className:"prose prose-gray dark:prose-invert max-w-none",dangerouslySetInnerHTML:{__html:P(r.content)}})]})}),c==="edit"&&e("div",{className:"space-y-6",children:e(y,{title:"Edit Refund Policy",children:t("form",{onSubmit:a=>{a.preventDefault(),C()},className:"space-y-6",children:[t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Title"}),e("input",{type:"text",value:r.title,onChange:a=>p("title",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Last Updated"}),e("input",{type:"date",value:r.lastUpdated,onChange:a=>p("lastUpdated",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Content"}),e("div",{className:"mb-2",children:e("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Use Markdown formatting. Supports headers (# ## ###), lists (-), bold (**text**), and paragraphs."})}),e("textarea",{value:r.content,onChange:a=>p("content",a.target.value),rows:20,className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm",placeholder:"Enter your refund policy content using Markdown formatting...",required:!0})]}),t("div",{className:"flex justify-end space-x-3",children:[e(l,{type:"button",onClick:N,className:"btn btn-outline",children:"Cancel"}),t(l,{type:"button",onClick:()=>n("preview"),className:"btn btn-outline-primary",children:[e(o,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),e(l,{type:"submit",disabled:m,className:"btn btn-primary",children:m?t(b,{children:[e(h,{}),e("span",{className:"ml-2",children:"Saving..."})]}):t(b,{children:[e(o,{icon:"ph:floppy-disk",className:"mr-2"}),"Save Changes"]})})]})]})})})]})};export{A as default};
