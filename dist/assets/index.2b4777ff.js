import{r as n,j as e,F as a}from"./index.db1e92fc.js";import{c as i}from"./code-snippet.b536687b.js";function c({url:t,className:o="w-full"}){const[r,s]=n.exports.useState(!1);return e("div",{className:"w-full relative",children:e("video",{src:t,onClick:()=>{s(!r)},controls:!0,className:o})})}const l=()=>e(a,{children:e(c,{url:"https://vjs.zencdn.net/v/oceans.mp4"})}),d=`import React from 'react';

import VideoPlayer from "@/components/ui/VideoPlayer";

const Video = () => {
    return (
    <>
        <VideoPlayer url="https://vjs.zencdn.net/v/oceans.mp4" />
    </>
    );
};

export default Video;
`,f=()=>e("div",{className:"div",children:e(i,{title:"Video",code:d,children:e(l,{})})});export{f as default};
