import{c as u}from"./code-snippet.2b5fe988.js";import{r as o,j as e,aD as N,aE as i,c as s,aF as M,aG as k,aH as U,aI as C,aJ as S,aK as j,aL as R,aM as A,I as x,aN as p,P as g,f as v,g as b,h}from"./index.93603967.js";import{M as n}from"./Modal.ade8a040.js";import{A as c}from"./Avatar.f8907562.js";import{T as f}from"./Textinput.e3ac0c26.js";import{S as y}from"./Select.0571d771.js";import"./Card.43e3b2ea.js";import"./hidden.de24e25a.js";import"./cleave-phone.us.573a2888.js";const I=R,T=A,H=j,L=k,w=o.exports.forwardRef(({className:a,...t},l)=>e(N,{ref:l,className:i("fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 dark:bg-gray-950/80",a),...t}));w.displayName=N.displayName;const B=o.exports.forwardRef(({className:a,children:t,...l},r)=>s(H,{children:[e(w,{}),s(M,{ref:r,className:i("fixed left-[50%] top-[50%] z-[1010] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full dark:border-gray-800 dark:bg-gray-950",a),...l,children:[t,s(k,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400",children:[e(U,{className:"h-4 w-4"}),e("span",{className:"sr-only",children:"Close"})]})]})]}));B.displayName=M.displayName;const D=({className:a,...t})=>e("div",{className:i("flex flex-col space-y-1.5 text-center sm:text-left",a),...t});D.displayName="DialogHeader";const q=o.exports.forwardRef(({className:a,...t},l)=>e(C,{ref:l,className:i("text-lg font-semibold leading-none tracking-tight",a),...t}));q.displayName=C.displayName;const z=o.exports.forwardRef(({className:a,...t},l)=>e(S,{ref:l,className:i("text-sm text-gray-500 dark:text-gray-400",a),...t}));z.displayName=S.displayName;const P=()=>s(I,{children:[e(T,{children:e("button",{className:"btn btn-primary light ",children:"Basic Modal"})}),e(B,{children:e(D,{children:s("div",{className:" text-center text-gray-600 dark:text-gray-300 space-y-4",children:[e(x,{icon:"ph:check-circle",className:" text-6xl text-green-500 mx-auto"}),e("div",{className:" text-xl font-medium ",children:"Success Message"}),e("div",{className:"  text-sm",children:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dignissimos soluta totam?"}),e(L,{asChild:!0,children:e("button",{className:"btn btn-success ",children:"close"})})]})})})]}),V=`
import React, { useState } from 'react';
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
const BasicModal = () => {
    const [modal1, setModal1] = useState(false);
    return (
        <div className=" space-xy">
            <button
                className="btn btn-primary light"
                onClick={() => setModal1(!modal1)}
            >
                basic modal
            </button>
            <Modal activeModal={modal1} onClose={() => setModal1(!modal1)}>
                <div className=" text-center text-gray-600 dark:text-gray-300 space-y-4">
                    <Icon
                        icon="ph:check-circle"
                        className=" text-6xl text-green-500 mx-auto"
                    />
                    <div className=" text-xl font-medium ">Success Message</div>
                    <div className="  text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        Consequuntur dignissimos soluta totam?
                    </div>
                    <button
                        className="btn btn-success "
                        onClick={() => setModal1(!modal1)}
                    >
                        close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default BasicModal;
`,E=`
import React, { useState } from 'react';
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
const BackdropBlur = () => {
    const [modal2, setModal2] = useState(false);
    return (
        <div className="space-xy">
            <button
                className="btn btn-primary light"
                onClick={() => setModal2(!modal2)}
                isBlur
            >
                Backdrop Blur
            </button>
            <Modal activeModal={modal2} onClose={() => setModal2(!modal2)} isBlur>
                <div className=" text-center text-gray-600 dark:text-gray-300 space-y-4">
                    <Icon
                        icon="ph:check-circle"
                        className=" text-6xl text-green-500 mx-auto"
                    />
                    <div className=" text-xl font-medium ">Success Message</div>
                    <div className="  text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        Consequuntur dignissimos soluta totam?
                    </div>
                    <button
                        className="btn btn-success "
                        onClick={() => setModal2(!modal2)}
                    >
                        close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default BackdropBlur;
`,G=`
import React, { useState } from 'react';
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Radio from "@/components/ui/Radio";

import User1 from "@/assets/images/avatar/avatar.jpg";
import User2 from "@/assets/images/avatar/avatar-1.jpg";
import User3 from "@/assets/images/avatar/avatar-2.jpg";
import User4 from "@/assets/images/avatar/avatar-3.jpg";

const ModalTransition = () => {
    const [modal3, setModal3] = useState(false);
    const [modal4, setModal4] = useState(false);
    const [value, setValue] = useState("C");
    const handleChange = (e) => {
        setValue(e.target.value);
    };
    
    return (
        <>
            <button
                className="btn btn-primary light"
                onClick={() => setModal3(!modal3)}
                isBlur
            >
                Up
            </button>
            <button
                className="btn btn-primary light"
                onClick={() => setModal4(!modal4)}
                isBlur
            >
                Down
            </button>
            <Modal
                title="Active User"
                activeModal={modal3}
                onClose={() => setModal3(!modal3)}
                enterFrom="translate-y-5"
                leaveFrom="translate-y-0"
            >
                <div className=" text-gray-600 dark:text-gray-300 space-y-5">
                    <Select label="alert type" />
                    <Textinput label="Heading" placeholder="Heading.." />
                    <div className="flex flex-wrap space-xy">
                        <Radio
                            label="simple"
                            name="x2"
                            value="D"
                            checked={value === "D"}
                            onChange={handleChange}
                        />
                        <Radio
                            label="advanced"
                            name="x2"
                            value="C"
                            checked={value === "C"}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="md:flex justify-between md:space-y-0 space-y-4">
                        <div className="-space-x-3 flex items-center">
                            <Avatar src={User1} alt="avatar-one" />
                            <Avatar src={User2} alt="avatar-one" />
                            <Avatar src={User3} alt="avatar-one" />
                            <Avatar src={User4} alt="avatar-one" />
                            <div className="h-8 w-8 bg-indigo-500 text-white text-base  font-medium inline-flex   shrink-0 relative rounded-full ring-2  ring-white items-center justify-center">
                                4+
                            </div>
                        </div>
                        <button className="btn btn-primary"> send alert</button>
                    </div>
                </div>
            </Modal>
            <Modal
                activeModal={modal4}
                onClose={() => setModal4(!modal4)}
                enterFrom="-translate-y-5"
                leaveFrom="translate-y-0"
            >
                <div className=" text-gray-600 dark:text-gray-300 space-y-5">
                    <Select label="alert type" />
                    <Textinput label="Heading" placeholder="Heading.." />
                    <div className="flex flex-wrap space-xy">
                        <Radio
                            label="simple"
                            name="x2"
                            value="D"
                            checked={value === "D"}
                            onChange={handleChange}
                        />
                        <Radio
                            label="advanced"
                            name="x2"
                            value="C"
                            checked={value === "C"}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="md:flex justify-between md:space-y-0 space-y-4">
                        <div className="-space-x-3 flex items-center">
                            <Avatar src={User1} alt="avatar-one" />
                            <Avatar src={User2} alt="avatar-one" />
                            <Avatar src={User3} alt="avatar-one" />
                            <Avatar src={User4} alt="avatar-one" />
                            <div className="h-8 w-8 bg-indigo-500 text-white text-base  font-medium inline-flex   shrink-0 relative rounded-full ring-2  ring-white items-center justify-center">
                                4+
                            </div>
                        </div>
                        <button className="btn btn-primary"> send alert</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ModalTransition;
`,J=`
import React, { useState } from 'react';

import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";

const ModalScale = () => {
    const [modal5, setModal5] = useState(false);
    const [modal6, setModal6] = useState(false);
    return (
        <div className="space-xy">
            <button
                className="btn btn-primary light"
                onClick={() => setModal5(!modal5)}
                isBlur
            >
                Scale top
            </button>
            <button
                className="btn btn-primary light"
                onClick={() => setModal6(!modal6)}
                isBlur
            >
                Scale Down
            </button>
            <Modal
                activeModal={modal5}
                onClose={() => setModal5(!modal5)}
                enterFrom="scale-90 translate-y-5"
                leaveFrom="scale-100 translate-y-0"
            >
                <div className=" text-center text-gray-600 dark:text-gray-300 space-y-4">
                    <Icon
                        icon="ph:check-circle"
                        className=" text-6xl text-green-500 mx-auto"
                    />
                    <div className=" text-xl font-medium ">Success Message</div>
                    <div className="  text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        Consequuntur dignissimos soluta totam?
                    </div>
                    <button
                        className="btn btn-success "
                        onClick={() => setModal5(!modal5)}
                    >
                        close
                    </button>
                </div>
            </Modal>
            <Modal
                activeModal={modal6}
                onClose={() => setModal6(!modal6)}
                enterFrom="scale-90 -translate-y-5"
                leaveFrom="scale-100 translate-y-0"
            >
                <div className=" text-center text-gray-600 dark:text-gray-300 space-y-4">
                    <Icon
                        icon="ph:check-circle"
                        className=" text-6xl text-green-500 mx-auto"
                    />
                    <div className=" text-xl font-medium ">Success Message</div>
                    <div className="  text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        Consequuntur dignissimos soluta totam?
                    </div>
                    <button
                        className="btn btn-success "
                        onClick={() => setModal6(!modal6)}
                    >
                        close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ModalScale;
`,K=()=>{const[a,t]=o.exports.useState(!1);return s("div",{className:"space-xy",children:[e("button",{className:"btn btn-primary light",onClick:()=>t(!a),isBlur:!0,children:"Backdrop Blur"}),e(n,{activeModal:a,onClose:()=>t(!a),isBlur:!0,children:s("div",{className:" text-center text-gray-600 dark:text-gray-300 space-y-4",children:[e(x,{icon:"ph:check-circle",className:" text-6xl text-green-500 mx-auto"}),e("div",{className:" text-xl font-medium ",children:"Success Message"}),e("div",{className:"  text-sm",children:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dignissimos soluta totam?"}),e("button",{className:"btn btn-success ",onClick:()=>t(!a),children:"close"})]})})]})},O=()=>{const[a,t]=o.exports.useState(!1),[l,r]=o.exports.useState(!1),[d,$]=o.exports.useState("C"),m=F=>{$(F.target.value)};return s("div",{className:" space-xy",children:[e("button",{className:"btn btn-primary light",onClick:()=>t(!a),isBlur:!0,children:"Up"}),e("button",{className:"btn btn-primary light",onClick:()=>r(!l),isBlur:!0,children:"Down"}),e(n,{title:"Active User",activeModal:a,onClose:()=>t(!a),enterFrom:"translate-y-5",leaveFrom:"translate-y-0",children:s("div",{className:" text-gray-600 dark:text-gray-300 space-y-5",children:[e(y,{label:"alert type"}),e(f,{label:"Heading",placeholder:"Heading.."}),s("div",{className:"flex flex-wrap space-xy",children:[e(p,{label:"simple",name:"x2",value:"D",checked:d==="D",onChange:m}),e(p,{label:"advanced",name:"x2",value:"C",checked:d==="C",onChange:m})]}),s("div",{className:"md:flex justify-between md:space-y-0 space-y-4",children:[s("div",{className:"-space-x-3 flex items-center",children:[e(c,{src:g,alt:"avatar-one"}),e(c,{src:v,alt:"avatar-one"}),e(c,{src:b,alt:"avatar-one"}),e(c,{src:h,alt:"avatar-one"}),e("div",{className:"h-8 w-8 bg-indigo-500 text-white text-base  font-medium inline-flex   shrink-0 relative rounded-full ring-2  ring-white items-center justify-center",children:"4+"})]}),e("button",{className:"btn btn-primary",children:" send alert"})]})]})}),e(n,{activeModal:l,onClose:()=>r(!l),enterFrom:"-translate-y-5",leaveFrom:"translate-y-0",children:s("div",{className:" text-gray-600 dark:text-gray-300 space-y-5",children:[e(y,{label:"alert type"}),e(f,{label:"Heading",placeholder:"Heading.."}),s("div",{className:"flex flex-wrap space-xy",children:[e(p,{label:"simple",name:"x2",value:"D",checked:d==="D",onChange:m}),e(p,{label:"advanced",name:"x2",value:"C",checked:d==="C",onChange:m})]}),s("div",{className:"md:flex justify-between md:space-y-0 space-y-4",children:[s("div",{className:"-space-x-3 flex items-center",children:[e(c,{src:g,alt:"avatar-one"}),e(c,{src:v,alt:"avatar-one"}),e(c,{src:b,alt:"avatar-one"}),e(c,{src:h,alt:"avatar-one"}),e("div",{className:"h-8 w-8 bg-indigo-500 text-white text-base  font-medium inline-flex   shrink-0 relative rounded-full ring-2  ring-white items-center justify-center",children:"4+"})]}),e("button",{className:"btn btn-primary",children:" send alert"})]})]})})]})},X=()=>{const[a,t]=o.exports.useState(!1),[l,r]=o.exports.useState(!1);return s("div",{className:"space-xy",children:[e("button",{className:"btn btn-primary light",onClick:()=>t(!a),isBlur:!0,children:"Scale top"}),e("button",{className:"btn btn-primary light",onClick:()=>r(!l),isBlur:!0,children:"Scale Down"}),e(n,{activeModal:a,onClose:()=>t(!a),enterFrom:"scale-90 translate-y-5",leaveFrom:"scale-100 translate-y-0",children:s("div",{className:" text-center text-gray-600 dark:text-gray-300 space-y-4",children:[e(x,{icon:"ph:check-circle",className:" text-6xl text-green-500 mx-auto"}),e("div",{className:" text-xl font-medium ",children:"Success Message"}),e("div",{className:"  text-sm",children:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dignissimos soluta totam?"}),e("button",{className:"btn btn-success ",onClick:()=>t(!a),children:"close"})]})}),e(n,{activeModal:l,onClose:()=>r(!l),enterFrom:"scale-90 -translate-y-5",leaveFrom:"scale-100 translate-y-0",children:s("div",{className:" text-center text-gray-600 dark:text-gray-300 space-y-4",children:[e(x,{icon:"ph:check-circle",className:" text-6xl text-green-500 mx-auto"}),e("div",{className:" text-xl font-medium ",children:"Success Message"}),e("div",{className:"  text-sm",children:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur dignissimos soluta totam?"}),e("button",{className:"btn btn-success ",onClick:()=>r(!l),children:"close"})]})})]})},le=()=>s("div",{className:" space-y-5",children:[e(u,{title:"Basic Modal",code:V,children:e(P,{})}),e(u,{title:"Backdrop Blur",code:E,children:e(K,{})}),e(u,{title:"Modal Transition",code:G,children:e(O,{})}),e(u,{title:"Modal Scale",code:J,children:e(X,{})})]});export{le as default};
