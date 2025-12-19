import{b as S,r as p,c as t,j as e,L as g,B as c,I as s,F as h,Q as b}from"./index.2de9f08c.js";import{C as x}from"./Card.fafc6053.js";import{u as I,a as D}from"./utilsApi.9b65bde9.js";const G=()=>{const f=S(),[l,o]=p.exports.useState("preview"),{data:n,isLoading:v,error:U,refetch:u}=I("grievance"),[k,{isLoading:m}]=D(),[r,y]=p.exports.useState({title:"Grievance Policy",lastUpdated:new Date().toISOString().split("T")[0],content:`# Grievance Policy

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

Last updated: ${new Date().toLocaleDateString()}`});p.exports.useEffect(()=>{var a;n!=null&&n.data&&y({title:n.data.title,lastUpdated:((a=n.data.lastUpdated)==null?void 0:a.split("T")[0])||new Date().toISOString().split("T")[0],content:n.data.content})},[n]);const d=(a,i)=>{y(P=>({...P,[a]:i}))},w=async()=>{var a;try{await k({type:"grievance",title:r.title,content:r.content}).unwrap(),b.success("Grievance policy updated successfully"),o("preview"),u()}catch(i){console.error("Failed to update grievance policy:",i),b.error(((a=i==null?void 0:i.data)==null?void 0:a.message)||"Failed to update grievance policy")}},N=()=>{o("preview"),u()},C=a=>a.replace(/^# (.*$)/gim,'<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>').replace(/^## (.*$)/gim,'<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>').replace(/^### (.*$)/gim,'<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>').replace(/^\- (.*$)/gim,'<li class="ml-4 mb-1">\u2022 $1</li>').replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold">$1</strong>').replace(/\n\n/g,'</p><p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/^(?!<[h|l])/gm,'<p class="mb-4 text-gray-600 dark:text-gray-400">').replace(/(<p[^>]*>.*?<\/p>)(?!\s*<[h|l])/g,"$1");return v?t("div",{className:"flex justify-center items-center h-64",children:[e(g,{}),e("p",{className:"ml-3 text-gray-600 dark:text-gray-400",children:"Loading Grievance policy..."})]}):t("div",{className:"space-y-6",children:[t("div",{className:"flex justify-between items-center",children:[t("div",{children:[e("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Grievance Policy"}),e("p",{className:"text-gray-600 dark:text-gray-400",children:"Manage your grievance policy content and settings"})]}),e("div",{className:"flex space-x-3",children:t(c,{onClick:()=>f("/dashboard"),className:"btn btn-outline",children:[e(s,{icon:"ph:arrow-left",className:"mr-2"}),"Back to Dashboard"]})})]}),e("div",{className:"border-b border-gray-200 dark:border-gray-700",children:t("nav",{className:"-mb-px flex space-x-8",children:[t("button",{onClick:()=>o("preview"),className:`py-2 px-1 border-b-2 font-medium text-sm ${l==="preview"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`,children:[e(s,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),t("button",{onClick:()=>o("edit"),className:`py-2 px-1 border-b-2 font-medium text-sm ${l==="edit"?"border-blue-500 text-blue-600 dark:text-blue-400":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`,children:[e(s,{icon:"ph:pencil",className:"mr-2"}),"Edit"]})]})}),l==="preview"&&e("div",{className:"space-y-6",children:t(x,{children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{children:[e("h2",{className:"text-xl font-semibold text-gray-900 dark:text-white",children:r.title}),t("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:["Last updated: ",new Date(r.lastUpdated).toLocaleDateString()]})]}),t(c,{onClick:()=>o("edit"),className:"btn btn-primary",children:[e(s,{icon:"ph:pencil",className:"mr-2"}),"Edit Policy"]})]}),e("div",{className:"prose prose-gray dark:prose-invert max-w-none",dangerouslySetInnerHTML:{__html:C(r.content)}})]})}),l==="edit"&&e("div",{className:"space-y-6",children:e(x,{title:"Edit Grievance Policy",children:t("form",{onSubmit:a=>{a.preventDefault(),w()},className:"space-y-6",children:[t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Title"}),e("input",{type:"text",value:r.title,onChange:a=>d("title",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Last Updated"}),e("input",{type:"date",value:r.lastUpdated,onChange:a=>d("lastUpdated",a.target.value),className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white",required:!0})]}),t("div",{children:[e("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:"Policy Content"}),e("div",{className:"mb-2",children:e("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Use Markdown formatting. Supports headers (# ## ###), lists (-), bold (**text**), and paragraphs."})}),e("textarea",{value:r.content,onChange:a=>d("content",a.target.value),rows:20,className:"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm",placeholder:"Enter your Grievance policy content using Markdown formatting...",required:!0})]}),t("div",{className:"flex justify-end space-x-3",children:[e(c,{type:"button",onClick:N,className:"btn btn-outline",children:"Cancel"}),t(c,{type:"button",onClick:()=>o("preview"),className:"btn btn-outline-primary",children:[e(s,{icon:"ph:eye",className:"mr-2"}),"Preview"]}),e(c,{type:"submit",disabled:m,className:"btn btn-primary",children:m?t(h,{children:[e(g,{}),e("span",{className:"ml-2",children:"Saving..."})]}):t(h,{children:[e(s,{icon:"ph:floppy-disk",className:"mr-2"}),"Save Changes"]})})]})]})})})]})};export{G as default};
