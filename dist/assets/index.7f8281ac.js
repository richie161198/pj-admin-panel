import{c as o,j as e}from"./index.93603967.js";import{c as n}from"./code-snippet.2b5fe988.js";import{A as r,a as c,b as t,c as i}from"./accordion.a0bc672f.js";import"./Card.43e3b2ea.js";import"./index.ba6204da.js";function s(){return o(r,{type:"single",collapsible:!0,className:"w-full",children:[o(c,{value:"item-1",children:[e(t,{children:"Is it accessible?"}),e(i,{children:"Yes. It adheres to the WAI-ARIA design pattern."})]}),o(c,{value:"item-2",children:[e(t,{children:"Is it styled?"}),e(i,{children:"Yes. It comes with default styles that matches the other components' aesthetic."})]}),o(c,{value:"item-3",children:[e(t,{children:"Is it animated?"}),e(i,{children:"Yes. It's animated by default, but you can disable it if you prefer."})]})]})}const d=`
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BasicExample() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other
          components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
`,u=()=>e("div",{className:"space-y-5",children:e(n,{title:"Accordions",code:d,children:e(s,{})})});export{u as default};
