import{b as S,r as d,c as t,j as e,L as g,B as c,I as l,C as y,F as f,Q as b}from"./index.51fda1b3.js";import{a as P,b as O}from"./utilsApi.fe011a03.js";const M=()=>{const x=S(),[s,i]=d.exports.useState("preview"),{data:n,isLoading:v,refetch:u}=P("cancellation"),[w,{isLoading:m}]=O(),[r,p]=d.exports.useState({title:"Cancellation Policy",lastUpdated:new Date().toISOString().split("T")[0],content:`# Cancellation Policy

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

Last updated: ${new Date().toLocaleDateString()}`});d.exports.useEffect(()=>{var a;n!=null&&n.data&&p({title:n.data.title,lastUpdated:((a=n.data.lastUpdated)==null?void 0:a.split("T")[0])||new Date().toISOString().split("T")[0],content:n.data.content})},[n]);const h=(a,o)=>{p(k=>({...k,[a]:o}))},C=async()=>{var a;try{await w({type:"cancellation",title:r.title,content:r.content}).unwrap(),b.success("Cancellation policy updated successfully"),i("preview"),u()}catch(o){b.error(((a=o==null?void 0:o.data)==null?void 0:a.message)||"Failed to update cancellation policy")}},N=a=>a.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>').replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>').replace(/^### (.*$)/gim,'<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>').replace(/^\- (.*$)/gim,'<li class="ml-4 mb-1">\u2022 $1</li>').replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold">$1</strong>').replace(/\n\n/g,'</p><p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/^(?!<[h|l])/gm,'<p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/(<p[^>]*>.*?<\/p>)(?!\s*<[h|l])/g,"$1");return v?t("div",{className:"flex justify-center items-center h-64",children:[e(g,{}),e("p",{className:"ml-3 text-gray-600 dark:text-gray-400",children:"Loading cancellation policy..."})]}):t("div",{className:"space-y-6",children:[t("div",{className:"flex justify-between items-center",children:[t("div",{children:[e("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Cancellation Policy"}),e("p",{className:"text-gray-600 dark:text-gray-400",children:"Manage your cancellation policy content"})]}),t(c,{onClick:()=>x("/dashboard"),className:"btn btn-outline",children:[e(l,{icon:"ph:arrow-left",className:"mr-2"}),"Back to Dashboard"]})]}),e("div",{className:"border-b border-gray-200 dark:border-gray-700",children:t("nav",{className:"-mb-px flex space-x-8",children:[t("button",{onClick:()=>i("preview"),className:`py-2 px-1 border-b-2 font-medium text-sm ${s==="preview"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500"}`,children:[e(l,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),t("button",{onClick:()=>i("edit"),className:`py-2 px-1 border-b-2 font-medium text-sm ${s==="edit"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500"}`,children:[e(l,{icon:"ph:pencil",className:"mr-2"}),"Edit"]})]})}),s==="preview"&&t(y,{children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{children:[e("h2",{className:"text-xl font-semibold text-gray-900 dark:text-white",children:r.title}),t("p",{className:"text-sm text-gray-500",children:["Last updated: ",new Date(r.lastUpdated).toLocaleDateString()]})]}),t(c,{onClick:()=>i("edit"),className:"btn btn-primary",children:[e(l,{icon:"ph:pencil",className:"mr-2"}),"Edit Policy"]})]}),e("div",{className:"prose prose-gray dark:prose-invert max-w-none",dangerouslySetInnerHTML:{__html:N(r.content)}})]}),s==="edit"&&e(y,{title:"Edit Cancellation Policy",children:t("form",{onSubmit:a=>{a.preventDefault(),C()},className:"space-y-6",children:[t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Title"}),e("input",{type:"text",value:r.title,onChange:a=>h("title",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Content"}),e("p",{className:"text-sm text-gray-500 mb-2",children:"Use Markdown formatting"}),e("textarea",{value:r.content,onChange:a=>h("content",a.target.value),rows:20,className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm",required:!0})]}),t("div",{className:"flex justify-end space-x-3",children:[e(c,{type:"button",onClick:()=>{i("preview"),u()},className:"btn btn-outline",children:"Cancel"}),t(c,{type:"button",onClick:()=>i("preview"),className:"btn btn-outline-primary",children:[e(l,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),e(c,{type:"submit",disabled:m,className:"btn btn-primary",children:m?t(f,{children:[e(g,{}),e("span",{className:"ml-2",children:"Saving..."})]}):t(f,{children:[e(l,{icon:"ph:floppy-disk",className:"mr-2"}),"Save Changes"]})})]})]})})]})};export{M as default};
