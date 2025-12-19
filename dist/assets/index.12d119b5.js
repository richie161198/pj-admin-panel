import{r as b,j as e,F as N,c as s,I as a}from"./index.67c6c4a2.js";import{c as i}from"./code-snippet.0998ed1c.js";import"./Card.c3fb850e.js";const l=({children:t,className:m="alert-primary",icon:r,toggle:c,dismissible:n,label:o})=>{const[h,p]=b.exports.useState(!0),d=()=>{p(!1)};return e(N,{children:h?s("div",{className:`alert  flex   items-center space-x-3 rtl:space-x-reverse ${m}`,children:[r&&e("div",{className:"grow-0 text-xl",children:e(a,{icon:r})}),e("div",{className:"grow",children:t||o}),n&&e("div",{className:"flex-none text-xl cursor-pointer",onClick:d,children:e(a,{icon:"ph:x"})}),c&&e("div",{className:"grow-0 text-xl cursor-pointer",onClick:c,children:e(a,{icon:"ph:x"})})]}):null})},A=()=>s("div",{className:"space-y-4",children:[e(l,{label:"This is simple alert",className:"alert-primary"}),e(l,{label:"This is simple alert",className:"alert-secondary"}),e(l,{label:"This is simple alert",className:"alert-success"}),e(l,{label:"This is simple alert",className:"alert-danger"}),e(l,{label:"This is simple alert",className:"alert-warning"}),e(l,{label:"This is simple alert",className:"alert-info"}),e(l,{label:"This is simple alert",className:"alert-light"}),e(l,{label:"This is simple alert",className:"alert-dark"})]}),u=`
import Alert from "@/components/ui/Alert"
const BasicAlert = () => {
  return (
    <>
    <Alert label="This is simple alert" className="alert-primary" />
    <Alert label="This is simple alert" className="alert-secondary" />
    <Alert label="This is simple alert" className="alert-success" />
    <Alert label="This is simple alert" className="alert-danger" />
    <Alert label="This is simple alert" className="alert-warning" />
    <Alert label="This is simple alert" className="alert-info" />
    <Alert label="This is simple alert" className="alert-light" />
    <Alert label="This is simple alert" className="alert-dark" />
    </>
  )
}
export default BasicAlert
`,T=`
import Alert from "@/components/ui/Alert"
const OutlineAlerts = () => {
  return (
    <>
    <Alert label="This is simple alert" className="alert-outline-primary" />
    <Alert label="This is simple alert" className="alert-outline-secondary" />
    <Alert label="This is simple alert" className="alert-outline-success" />
    <Alert label="This is simple alert" className="alert-outline-danger" />
    <Alert label="This is simple alert" className="alert-outline-warning" />
    <Alert label="This is simple alert" className="alert-outline-info" />
    <Alert label="This is simple alert" className="alert-outline-light" />
    <Alert label="This is simple alert" className="alert-outline-dark" />
    </>
  )
}
export default OutlineAlerts
`,g=`
import Alert from "@/components/ui/Alert"
const SoftAlerts = () => {
  return (
    <>
    <Alert label="This is simple alert" className="alert-primary light" />
    <Alert label="This is simple alert" className="alert-secondary light" />
    <Alert label="This is simple alert" className="alert-success light" />
    <Alert label="This is simple alert" className="alert-danger light" />
    <Alert label="This is simple alert" className="alert-warning light" />
    <Alert label="This is simple alert" className="alert-info light" />
    <Alert label="This is simple alert" className="alert-light light" />
    </>
  )
}
export default SoftAlerts
`,f=`
import Alert from "@/components/ui/Alert"
const DismissibleAlert = () => {
  return (
    <>
    <Alert dismissible icon="ph:info" label="This is simple alert"></Alert>
    <Alert dismissible icon="ph:info" className="alert-outline-secondary !text-fuchsia-500" label="This is simple alert"></Alert>
    <Alert dismissible icon="ph:shield-check" className="alert-success light" >This is simple alert </Alert>
    <Alert dismissible icon="ph:warning-diamond" className="alert-danger">This is simple alert </Alert>
    <Alert dismissible icon="ph:seal-warning" className="alert-warning">This is simple alert</Alert>
    <Alert dismissible icon="ph:infinity" className="alert-info"> This is simple alert </Alert>
    </>
  )
}
export default DismissibleAlert
`,x=()=>s("div",{className:" space-y-4",children:[e(l,{label:"This is simple alert",className:"alert-primary light"}),e(l,{label:"This is simple alert",className:"alert-secondary light"}),e(l,{label:"This is simple alert",className:"alert-success light"}),e(l,{label:"This is simple alert",className:"alert-danger light"}),e(l,{label:"This is simple alert",className:"alert-warning light"}),e(l,{label:"This is simple alert",className:"alert-info light"}),e(l,{label:"This is simple alert",className:"alert-light light"})]}),y=()=>s("div",{className:" space-y-4",children:[e(l,{label:"This is simple alert",className:"alert-outline-primary"}),e(l,{label:"This is simple alert",className:"alert-outline-secondary"}),e(l,{label:"This is simple alert",className:"alert-outline-success"}),e(l,{label:"This is simple alert",className:"alert-outline-danger"}),e(l,{label:"This is simple alert",className:"alert-outline-warning"}),e(l,{label:"This is simple alert",className:"alert-outline-info"}),e(l,{label:"This is simple alert",className:"alert-outline-light"}),e(l,{label:"This is simple alert",className:"alert-outline-dark"})]}),w=()=>s("div",{className:"space-y-4",children:[e(l,{dismissible:!0,icon:"ph:info",label:"This is simple alert"}),e(l,{dismissible:!0,icon:"ph:info",className:"alert-outline-secondary !text-fuchsia-500",label:"This is simple alert"}),e(l,{dismissible:!0,icon:"ph:shield-check",className:"alert-success light",children:"This is simple alert "}),e(l,{dismissible:!0,icon:"ph:warning-diamond",className:"alert-danger",children:"This is simple alert "}),e(l,{dismissible:!0,icon:"ph:seal-warning",className:"alert-warning",children:"This is simple alert"}),e(l,{dismissible:!0,icon:"ph:infinity",className:"alert-info",children:" This is simple alert "})]}),D=()=>s("div",{className:"grid xl:grid-cols-2 grid-cols-1 gap-5",children:[e(i,{title:"Basic Alert",code:u,children:e(A,{})}),e(i,{title:"Outline Alerts",code:T,children:e(y,{})}),e(i,{title:"Soft Alerts",code:g,children:e(x,{})}),e(i,{title:"Dismissible Alerts",code:f,children:e(w,{})})]});export{D as default};
