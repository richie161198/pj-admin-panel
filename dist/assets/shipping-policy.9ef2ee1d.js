import{b as P,r as d,c as t,j as e,L as h,B as l,I as o,C as y,F as b,Q as x}from"./index.575d0a96.js";import{a as I,b as D}from"./utilsApi.f1d4bfa5.js";const L=()=>{const f=P(),[c,s]=d.exports.useState("preview"),{data:r,isLoading:v,error:T,refetch:p}=I("shipping"),[S,{isLoading:m}]=D(),[i,g]=d.exports.useState({title:"Shipping Policy",lastUpdated:new Date().toISOString().split("T")[0],content:`# Shipping Policy

## Shipping Information

We offer shipping services across India with multiple delivery options to suit your needs.

### Shipping Methods
- Standard Shipping (5-7 business days)
- Express Shipping (2-3 business days)
- Same Day Delivery (available in select cities)
- International Shipping (10-15 business days)

### Shipping Charges
- Free shipping on orders above \u20B950,000
- Standard shipping: \u20B9200 per order
- Express shipping: \u20B9500 per order
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

Last updated: ${new Date().toLocaleDateString()}`});d.exports.useEffect(()=>{var a;r!=null&&r.data&&g({title:r.data.title,lastUpdated:((a=r.data.lastUpdated)==null?void 0:a.split("T")[0])||new Date().toISOString().split("T")[0],content:r.data.content})},[r]);const u=(a,n)=>{g(C=>({...C,[a]:n}))},k=async()=>{var a;try{await S({type:"shipping",title:i.title,content:i.content}).unwrap(),x.success("Shipping policy updated successfully"),s("preview"),p()}catch(n){console.error("Failed to update shipping policy:",n),x.error(((a=n==null?void 0:n.data)==null?void 0:a.message)||"Failed to update shipping policy")}},w=()=>{s("preview"),p()},N=a=>a.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>').replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>').replace(/^### (.*$)/gim,'<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>').replace(/^\- (.*$)/gim,'<li class="ml-4 mb-1">\u2022 $1</li>').replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold">$1</strong>').replace(/\n\n/g,'</p><p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/^(?!<[h|l])/gm,'<p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/(<p[^>]*>.*?<\/p>)(?!\s*<[h|l])/g,"$1");return v?t("div",{className:"flex justify-center items-center h-64",children:[e(h,{}),e("p",{className:"ml-3 text-gray-600 dark:text-gray-400",children:"Loading shipping policy..."})]}):t("div",{className:"space-y-6",children:[t("div",{className:"flex justify-between items-center",children:[t("div",{children:[e("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Shipping Policy"}),e("p",{className:"text-gray-600 dark:text-gray-400",children:"Manage your shipping policy content"})]}),t(l,{onClick:()=>f("/dashboard"),className:"btn btn-outline",children:[e(o,{icon:"ph:arrow-left",className:"mr-2"}),"Back to Dashboard"]})]}),e("div",{className:"border-b border-gray-200 dark:border-gray-700",children:t("nav",{className:"-mb-px flex space-x-8",children:[t("button",{onClick:()=>s("preview"),className:`py-2 px-1 border-b-2 font-medium text-sm ${c==="preview"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,children:[e(o,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),t("button",{onClick:()=>s("edit"),className:`py-2 px-1 border-b-2 font-medium text-sm ${c==="edit"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,children:[e(o,{icon:"ph:pencil",className:"mr-2"}),"Edit"]})]})}),c==="preview"&&t(y,{children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{children:[e("h2",{className:"text-xl font-semibold text-gray-900 dark:text-white",children:i.title}),t("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:["Last updated: ",new Date(i.lastUpdated).toLocaleDateString()]})]}),t(l,{onClick:()=>s("edit"),className:"btn btn-primary",children:[e(o,{icon:"ph:pencil",className:"mr-2"}),"Edit Policy"]})]}),e("div",{className:"prose prose-gray dark:prose-invert max-w-none",dangerouslySetInnerHTML:{__html:N(i.content)}})]}),c==="edit"&&e(y,{title:"Edit Shipping Policy",children:t("form",{onSubmit:a=>{a.preventDefault(),k()},className:"space-y-6",children:[t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Title"}),e("input",{type:"text",value:i.title,onChange:a=>u("title",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Content"}),e("p",{className:"text-sm text-gray-500 dark:text-gray-400 mb-2",children:"Use Markdown formatting. Supports headers (# ## ###), lists (-), bold (**text**), and paragraphs."}),e("textarea",{value:i.content,onChange:a=>u("content",a.target.value),rows:20,className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm",required:!0})]}),t("div",{className:"flex justify-end space-x-3",children:[e(l,{type:"button",onClick:w,className:"btn btn-outline",children:"Cancel"}),t(l,{type:"button",onClick:()=>s("preview"),className:"btn btn-outline-primary",children:[e(o,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),e(l,{type:"submit",disabled:m,className:"btn btn-primary",children:m?t(b,{children:[e(h,{}),e("span",{className:"ml-2",children:"Saving..."})]}):t(b,{children:[e(o,{icon:"ph:floppy-disk",className:"mr-2"}),"Save Changes"]})})]})]})})]})};export{L as default};
