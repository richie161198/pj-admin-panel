import{c as t,j as e}from"./index.db93dc89.js";import{c as n}from"./code-snippet.6b7bfbb2.js";import{I as p}from"./InputGroup.b210a888.js";import"./cleave-phone.us.c8f4dd47.js";const r=()=>t("div",{className:" space-y-4",children:[e(p,{type:"text",label:"Prepend Addon",placeholder:"Username",prepend:"@"}),e(p,{type:"text",placeholder:"Username",label:"Append Addon",append:"@facebook.com"}),e(p,{type:"text",placeholder:"Username",label:"Between input:",prepend:"$",append:"120"})]}),d=`
import InputGroup from "@/components/ui/InputGroup";
const BasicInputGroup = () => {
    return (
        <div className=" space-y-4">
            <InputGroup
                type="text"
                label="Prepend Addon"
                placeholder="Username"
                prepend="@"
            />
            <InputGroup
                type="text"
                placeholder="Username"
                label="Append Addon"
                append="@facebook.com"
            />
            <InputGroup
                type="text"
                placeholder="Username"
                label="Between input:"
                prepend="$"
                append="120"
            />
        </div>
    );
};
export default BasicInputGroup;
`,o=`
import InputGroup from "@/components/ui/InputGroup";
const BasicInputGroup = () => {
    return (
        <>
        <InputGroup
                type="text"
                label="Prepend Addon"
                placeholder="Username"
                prepend="@"
                merged
            />
            <InputGroup
                type="text"
                placeholder="Username"
                label="Append Addon"
                append="@facebook.com"
                merged
            />
            <InputGroup
                type="text"
                placeholder="Username"
                label="Between input:"
                prepend="$"
                append="120"
                merged
            />
        </>
    );
};
export default BasicInputGroup;
`,a=()=>t("div",{className:" space-y-4",children:[e(p,{type:"text",label:"Prepend Addon",placeholder:"Username",prepend:"@",merged:!0}),e(p,{type:"text",placeholder:"Username",label:"Append Addon",append:"@facebook.com",merged:!0}),e(p,{type:"text",placeholder:"Username",label:"Between input:",prepend:"$",append:"120",merged:!0})]}),m=()=>t("div",{className:" space-y-5",children:[e(n,{title:"Input Group",code:d,children:e(r,{})}),e(n,{title:"Merged Addon",code:o,children:e(a,{})})]});export{m as default};
