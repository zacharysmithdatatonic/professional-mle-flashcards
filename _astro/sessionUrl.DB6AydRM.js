import{d as r}from"./createLucideIcon.DWfKG5CF.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=r("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=r("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=r("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]),m=()=>{const e=new URLSearchParams(window.location.search).get("index");if(!e)return null;const t=Number.parseInt(e,10);return Number.isFinite(t)&&t>=0?t:null},l=()=>{const e=new URLSearchParams(window.location.search).get("questionId");return e&&e.trim().length>0?e:null},u=(e,t)=>{const n=new URL(window.location.href);e!==null?n.searchParams.set("index",String(e)):n.searchParams.delete("index"),t?n.searchParams.set("questionId",t):n.searchParams.delete("questionId"),window.history.replaceState({},"",n.toString())},w=(e,t,n)=>{const a=t?e.findIndex(o=>o.id===t):-1,s=a>=0?a:typeof n=="number"?n:0;return Math.min(Math.max(s,0),Math.max(e.length-1,0))};export{i as A,c as C,d as a,m as b,l as g,w as r,u as s};
