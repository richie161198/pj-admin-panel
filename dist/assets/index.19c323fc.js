import{j as e,c as t,r as s}from"./index.575d0a96.js";import{c as r}from"./code-snippet.7d441916.js";import{T as a}from"./Textarea.af653a9c.js";const i=()=>e(a,{placeholder:"Type here.."}),o=`
import Textarea from "@/components/ui/Textarea";
const BasicTextarea = () => {
    return (
        <Textarea placeholder="Type here.." />
    );
};
export default BasicTextarea;
`,l=`
import Textarea from "@/components/ui/Textarea";
const DisplayRows = () => {
    return (
        <Textarea placeholder="Type here.." row="6" />
    );
};
export default DisplayRows;
`,c=`
import Textarea from "@/components/ui/Textarea";
const ValidateTextarea = () => {
    const errorMessage = {
        message: "This is invalid",
    };
    return (
        <div className=" space-y-3">
            <Textarea
                id="ValidState"
                placeholder="Type here.."
                validate="This is valid ."
            />
            <Textarea
                id="InvalidState"
                placeholder="Type here.."
                error={errorMessage}
            />
        </div>
    );
};
export default ValidateTextarea;
`,d=()=>e(a,{placeholder:"Type here..",row:"6"}),p=()=>t("div",{className:" space-y-3",children:[e(a,{id:"ValidState",placeholder:"Type here..",validate:"This is valid ."}),e(a,{id:"InvalidState",placeholder:"Type here..",error:{message:"This is invalid"}})]}),m=()=>(s.exports.useState(""),t("div",{className:" space-y-5 ",children:[e(r,{title:"Basic Textarea",code:o,children:e(i,{})}),e(r,{title:"Displayed Rows",code:l,children:e(d,{})}),e(r,{title:"Textarea validation",code:c,children:e(p,{})})]}));export{m as default};
