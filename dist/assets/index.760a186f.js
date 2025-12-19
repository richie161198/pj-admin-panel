import{r as i,j as e,F as n}from"./index.2de9f08c.js";import{c as a}from"./code-snippet.d8d25304.js";import"./Card.fafc6053.js";function c({url:t,className:o="w-full"}){const[r,s]=i.exports.useState(!1);return e("div",{className:"w-full relative",children:e("video",{src:t,onClick:()=>{s(!r)},controls:!0,className:o})})}const l=()=>e(n,{children:e(c,{url:"https://vjs.zencdn.net/v/oceans.mp4"})}),d=`import React from 'react';

import VideoPlayer from "@/components/ui/VideoPlayer";

const Video = () => {
    return (
    <>
        <VideoPlayer url="https://vjs.zencdn.net/v/oceans.mp4" />
    </>
    );
};

export default Video;
`,V=()=>e("div",{className:"div",children:e(a,{title:"Video",code:d,children:e(l,{})})});export{V as default};
