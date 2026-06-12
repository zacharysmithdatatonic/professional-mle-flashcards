import{r as U}from"./index.Bs6cAnji.js";import{g as E,a as z,u as A,j as l,c as I,e as D,b as K,s as m,m as v,f as O,C as M,D as j}from"./createLucideIcon.CrfeYrM_.js";function V(r){return E("MuiCircularProgress",r)}z("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","track","circle","circleDisableShrink"]);const e=44,x=j`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,h=j`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,W=typeof x!="string"?M`
        animation: ${x} 1.4s linear infinite;
      `:null,B=typeof h!="string"?M`
        animation: ${h} 1.4s ease-in-out infinite;
      `:null,G=r=>{const{classes:s,variant:a,color:o,disableShrink:p}=r,u={root:["root",a,`color${D(o)}`],svg:["svg"],track:["track"],circle:["circle",p&&"circleDisableShrink"]};return K(u,V,s)},Z=m("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(r,s)=>{const{ownerState:a}=r;return[s.root,s[a.variant],s[`color${D(a.color)}`]]}})(v(({theme:r})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:r.transitions.create("transform")}},{props:{variant:"indeterminate"},style:W||{animation:`${x} 1.4s linear infinite`}},...Object.entries(r.palette).filter(O()).map(([s])=>({props:{color:s},style:{color:(r.vars||r).palette[s].main}}))]}))),q=m("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),H=m("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(r,s)=>{const{ownerState:a}=r;return[s.circle,a.disableShrink&&s.circleDisableShrink]}})(v(({theme:r})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:r.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:({ownerState:s})=>s.variant==="indeterminate"&&!s.disableShrink,style:B||{animation:`${h} 1.4s ease-in-out infinite`}}]}))),J=m("circle",{name:"MuiCircularProgress",slot:"Track"})(v(({theme:r})=>({stroke:"currentColor",opacity:(r.vars||r).palette.action.activatedOpacity}))),X=U.forwardRef(function(s,a){const o=A({props:s,name:"MuiCircularProgress"}),{className:p,color:u="primary",disableShrink:R=!1,enableTrackSlot:C=!1,min:w,max:N,size:d=40,style:F,thickness:t=3.6,value:f=o.min??0,variant:P="indeterminate",...T}=o,S=w??0,k=N??100,i={...o,color:u,disableShrink:R,size:d,thickness:t,value:f,variant:P,enableTrackSlot:C},n=G(i),g={},b={},c={};if(P==="determinate"){const y=2*Math.PI*((e-t)/2),$=k-S;g.strokeDasharray=y.toFixed(3),g.strokeDashoffset=$>0?`${((k-f)/$*y).toFixed(3)}px`:`${y.toFixed(3)}px`,b.transform="rotate(-90deg)",c["aria-valuenow"]=f,c["aria-valuemin"]=S,c["aria-valuemax"]=k}return l.jsx(Z,{className:I(n.root,p),style:{width:d,height:d,...b,...F},ownerState:i,ref:a,role:"progressbar",...c,...T,children:l.jsxs(q,{className:n.svg,ownerState:i,viewBox:`${e/2} ${e/2} ${e} ${e}`,children:[C?l.jsx(J,{className:n.track,ownerState:i,cx:e,cy:e,r:(e-t)/2,fill:"none",strokeWidth:t,"aria-hidden":"true"}):null,l.jsx(H,{className:n.circle,style:g,ownerState:i,cx:e,cy:e,r:(e-t)/2,fill:"none",strokeWidth:t})]})})});export{X as C};
