import{a_ as R,a$ as T,b0 as $e,b1 as Ke,p as f,r as u,j as c,c as ee,B as S,F as vt}from"./index.93603967.js";import{c as H}from"./code-snippet.2b5fe988.js";import{F as j}from"./Fileinput.40fec251.js";import"./Card.43e3b2ea.js";var ht=new Map([["aac","audio/aac"],["abw","application/x-abiword"],["arc","application/x-freearc"],["avif","image/avif"],["avi","video/x-msvideo"],["azw","application/vnd.amazon.ebook"],["bin","application/octet-stream"],["bmp","image/bmp"],["bz","application/x-bzip"],["bz2","application/x-bzip2"],["cda","application/x-cdf"],["csh","application/x-csh"],["css","text/css"],["csv","text/csv"],["doc","application/msword"],["docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],["eot","application/vnd.ms-fontobject"],["epub","application/epub+zip"],["gz","application/gzip"],["gif","image/gif"],["heic","image/heic"],["heif","image/heif"],["htm","text/html"],["html","text/html"],["ico","image/vnd.microsoft.icon"],["ics","text/calendar"],["jar","application/java-archive"],["jpeg","image/jpeg"],["jpg","image/jpeg"],["js","text/javascript"],["json","application/json"],["jsonld","application/ld+json"],["mid","audio/midi"],["midi","audio/midi"],["mjs","text/javascript"],["mp3","audio/mpeg"],["mp4","video/mp4"],["mpeg","video/mpeg"],["mpkg","application/vnd.apple.installer+xml"],["odp","application/vnd.oasis.opendocument.presentation"],["ods","application/vnd.oasis.opendocument.spreadsheet"],["odt","application/vnd.oasis.opendocument.text"],["oga","audio/ogg"],["ogv","video/ogg"],["ogx","application/ogg"],["opus","audio/opus"],["otf","font/otf"],["png","image/png"],["pdf","application/pdf"],["php","application/x-httpd-php"],["ppt","application/vnd.ms-powerpoint"],["pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation"],["rar","application/vnd.rar"],["rtf","application/rtf"],["sh","application/x-sh"],["svg","image/svg+xml"],["swf","application/x-shockwave-flash"],["tar","application/x-tar"],["tif","image/tiff"],["tiff","image/tiff"],["ts","video/mp2t"],["ttf","font/ttf"],["txt","text/plain"],["vsd","application/vnd.visio"],["wav","audio/wav"],["weba","audio/webm"],["webm","video/webm"],["webp","image/webp"],["woff","font/woff"],["woff2","font/woff2"],["xhtml","application/xhtml+xml"],["xls","application/vnd.ms-excel"],["xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],["xml","application/xml"],["xul","application/vnd.mozilla.xul+xml"],["zip","application/zip"],["7z","application/x-7z-compressed"],["mkv","video/x-matroska"],["mov","video/quicktime"],["msg","application/vnd.ms-outlook"]]);function U(e,t){var r=yt(e);if(typeof r.path!="string"){var n=e.webkitRelativePath;Object.defineProperty(r,"path",{value:typeof t=="string"?t:typeof n=="string"&&n.length>0?n:e.name,writable:!1,configurable:!1,enumerable:!0})}return r}function yt(e){var t=e.name,r=t&&t.lastIndexOf(".")!==-1;if(r&&!e.type){var n=t.split(".").pop().toLowerCase(),i=ht.get(n);i&&Object.defineProperty(e,"type",{value:i,writable:!1,configurable:!1,enumerable:!0})}return e}var bt=[".DS_Store","Thumbs.db"];function xt(e){return R(this,void 0,void 0,function(){return T(this,function(t){return te(e)&&Ft(e.dataTransfer)?[2,At(e.dataTransfer,e.type)]:Dt(e)?[2,wt(e)]:Array.isArray(e)&&e.every(function(r){return"getFile"in r&&typeof r.getFile=="function"})?[2,Ct(e)]:[2,[]]})})}function Ft(e){return te(e)}function Dt(e){return te(e)&&te(e.target)}function te(e){return typeof e=="object"&&e!==null}function wt(e){return be(e.target.files).map(function(t){return U(t)})}function Ct(e){return R(this,void 0,void 0,function(){var t;return T(this,function(r){switch(r.label){case 0:return[4,Promise.all(e.map(function(n){return n.getFile()}))];case 1:return t=r.sent(),[2,t.map(function(n){return U(n)})]}})})}function At(e,t){return R(this,void 0,void 0,function(){var r,n;return T(this,function(i){switch(i.label){case 0:return e.items?(r=be(e.items).filter(function(a){return a.kind==="file"}),t!=="drop"?[2,r]:[4,Promise.all(r.map(Ot))]):[3,2];case 1:return n=i.sent(),[2,He(Xe(n))];case 2:return[2,He(be(e.files).map(function(a){return U(a)}))]}})})}function He(e){return e.filter(function(t){return bt.indexOf(t.name)===-1})}function be(e){if(e===null)return[];for(var t=[],r=0;r<e.length;r++){var n=e[r];t.push(n)}return t}function Ot(e){if(typeof e.webkitGetAsEntry!="function")return We(e);var t=e.webkitGetAsEntry();return t&&t.isDirectory?et(t):We(e)}function Xe(e){return e.reduce(function(t,r){return $e($e([],Ke(t),!1),Ke(Array.isArray(r)?Xe(r):[r]),!1)},[])}function We(e){var t=e.getAsFile();if(!t)return Promise.reject("".concat(e," is not a File"));var r=U(t);return Promise.resolve(r)}function Et(e){return R(this,void 0,void 0,function(){return T(this,function(t){return[2,e.isDirectory?et(e):St(e)]})})}function et(e){var t=e.createReader();return new Promise(function(r,n){var i=[];function a(){var l=this;t.readEntries(function(p){return R(l,void 0,void 0,function(){var v,w,C;return T(this,function(x){switch(x.label){case 0:if(p.length)return[3,5];x.label=1;case 1:return x.trys.push([1,3,,4]),[4,Promise.all(i)];case 2:return v=x.sent(),r(v),[3,4];case 3:return w=x.sent(),n(w),[3,4];case 4:return[3,6];case 5:C=Promise.all(p.map(Et)),i.push(C),a(),x.label=6;case 6:return[2]}})})},function(p){n(p)})}a()})}function St(e){return R(this,void 0,void 0,function(){return T(this,function(t){return[2,new Promise(function(r,n){e.file(function(i){var a=U(i,e.fullPath);r(a)},function(i){n(i)})})]})})}var jt=function(e,t){if(e&&t){var r=Array.isArray(t)?t:t.split(","),n=e.name||"",i=(e.type||"").toLowerCase(),a=i.replace(/\/.*$/,"");return r.some(function(l){var p=l.trim().toLowerCase();return p.charAt(0)==="."?n.toLowerCase().endsWith(p):p.endsWith("/*")?a===p.replace(/\/.*$/,""):i===p})}return!0};function Ue(e){return kt(e)||Pt(e)||rt(e)||_t()}function _t(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Pt(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function kt(e){if(Array.isArray(e))return xe(e)}function Ye(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),r.push.apply(r,n)}return r}function Ge(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?Ye(Object(r),!0).forEach(function(n){tt(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Ye(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function tt(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function W(e,t){return Tt(e)||Rt(e,t)||rt(e,t)||It()}function It(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function rt(e,t){if(!!e){if(typeof e=="string")return xe(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return xe(e,t)}}function xe(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function Rt(e,t){var r=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(r!=null){var n=[],i=!0,a=!1,l,p;try{for(r=r.call(e);!(i=(l=r.next()).done)&&(n.push(l.value),!(t&&n.length===t));i=!0);}catch(v){a=!0,p=v}finally{try{!i&&r.return!=null&&r.return()}finally{if(a)throw p}}return n}}function Tt(e){if(Array.isArray(e))return e}var Mt="file-invalid-type",Nt="file-too-large",Lt="file-too-small",zt="too-many-files",Bt=function(t){t=Array.isArray(t)&&t.length===1?t[0]:t;var r=Array.isArray(t)?"one of ".concat(t.join(", ")):t;return{code:Mt,message:"File type must be ".concat(r)}},Ze=function(t){return{code:Nt,message:"File is larger than ".concat(t," ").concat(t===1?"byte":"bytes")}},qe=function(t){return{code:Lt,message:"File is smaller than ".concat(t," ").concat(t===1?"byte":"bytes")}},$t={code:zt,message:"Too many files"};function nt(e,t){var r=e.type==="application/x-moz-file"||jt(e,t);return[r,r?null:Bt(t)]}function ot(e,t,r){if(E(e.size))if(E(t)&&E(r)){if(e.size>r)return[!1,Ze(r)];if(e.size<t)return[!1,qe(t)]}else{if(E(t)&&e.size<t)return[!1,qe(t)];if(E(r)&&e.size>r)return[!1,Ze(r)]}return[!0,null]}function E(e){return e!=null}function Kt(e){var t=e.files,r=e.accept,n=e.minSize,i=e.maxSize,a=e.multiple,l=e.maxFiles,p=e.validator;return!a&&t.length>1||a&&l>=1&&t.length>l?!1:t.every(function(v){var w=nt(v,r),C=W(w,1),x=C[0],M=ot(v,n,i),N=W(M,1),L=N[0],z=p?p(v):null;return x&&L&&!z})}function re(e){return typeof e.isPropagationStopped=="function"?e.isPropagationStopped():typeof e.cancelBubble<"u"?e.cancelBubble:!1}function X(e){return e.dataTransfer?Array.prototype.some.call(e.dataTransfer.types,function(t){return t==="Files"||t==="application/x-moz-file"}):!!e.target&&!!e.target.files}function Je(e){e.preventDefault()}function Ht(e){return e.indexOf("MSIE")!==-1||e.indexOf("Trident/")!==-1}function Wt(e){return e.indexOf("Edge/")!==-1}function Ut(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:window.navigator.userAgent;return Ht(e)||Wt(e)}function D(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(n){for(var i=arguments.length,a=new Array(i>1?i-1:0),l=1;l<i;l++)a[l-1]=arguments[l];return t.some(function(p){return!re(n)&&p&&p.apply(void 0,[n].concat(a)),re(n)})}}function Yt(){return"showOpenFilePicker"in window}function Gt(e){if(E(e)){var t=Object.entries(e).filter(function(r){var n=W(r,2),i=n[0],a=n[1],l=!0;return it(i)||(console.warn('Skipped "'.concat(i,'" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.')),l=!1),(!Array.isArray(a)||!a.every(at))&&(console.warn('Skipped "'.concat(i,'" because an invalid file extension was provided.')),l=!1),l}).reduce(function(r,n){var i=W(n,2),a=i[0],l=i[1];return Ge(Ge({},r),{},tt({},a,l))},{});return[{description:"Files",accept:t}]}return e}function Zt(e){if(E(e))return Object.entries(e).reduce(function(t,r){var n=W(r,2),i=n[0],a=n[1];return[].concat(Ue(t),[i],Ue(a))},[]).filter(function(t){return it(t)||at(t)}).join(",")}function qt(e){return e instanceof DOMException&&(e.name==="AbortError"||e.code===e.ABORT_ERR)}function Jt(e){return e instanceof DOMException&&(e.name==="SecurityError"||e.code===e.SECURITY_ERR)}function it(e){return e==="audio/*"||e==="video/*"||e==="image/*"||e==="text/*"||/\w+\/[-+.\w]+/g.test(e)}function at(e){return/^.*\.[\w]+$/.test(e)}var Vt=["children"],Qt=["open"],Xt=["refKey","role","onKeyDown","onFocus","onBlur","onClick","onDragEnter","onDragOver","onDragLeave","onDrop"],er=["refKey","onChange","onClick"];function tr(e){return or(e)||nr(e)||st(e)||rr()}function rr(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function nr(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function or(e){if(Array.isArray(e))return Fe(e)}function ye(e,t){return sr(e)||ar(e,t)||st(e,t)||ir()}function ir(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function st(e,t){if(!!e){if(typeof e=="string")return Fe(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return Fe(e,t)}}function Fe(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function ar(e,t){var r=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(r!=null){var n=[],i=!0,a=!1,l,p;try{for(r=r.call(e);!(i=(l=r.next()).done)&&(n.push(l.value),!(t&&n.length===t));i=!0);}catch(v){a=!0,p=v}finally{try{!i&&r.return!=null&&r.return()}finally{if(a)throw p}}return n}}function sr(e){if(Array.isArray(e))return e}function Ve(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?Ve(Object(r),!0).forEach(function(n){De(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Ve(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function De(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ne(e,t){if(e==null)return{};var r=lr(e,t),n,i;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],!(t.indexOf(n)>=0)&&(!Object.prototype.propertyIsEnumerable.call(e,n)||(r[n]=e[n]))}return r}function lr(e,t){if(e==null)return{};var r={},n=Object.keys(e),i,a;for(a=0;a<n.length;a++)i=n[a],!(t.indexOf(i)>=0)&&(r[i]=e[i]);return r}var Ce=u.exports.forwardRef(function(e,t){var r=e.children,n=ne(e,Vt),i=ct(n),a=i.open,l=ne(i,Qt);return u.exports.useImperativeHandle(t,function(){return{open:a}},[a]),c(u.exports.Fragment,{children:r(d(d({},l),{},{open:a}))})});Ce.displayName="Dropzone";var lt={disabled:!1,getFilesFromEvent:xt,maxSize:1/0,minSize:0,multiple:!0,maxFiles:0,preventDropOnDocument:!0,noClick:!1,noKeyboard:!1,noDrag:!1,noDragEventsBubbling:!1,validator:null,useFsAccessApi:!0,autoFocus:!1};Ce.defaultProps=lt;Ce.propTypes={children:f.exports.func,accept:f.exports.objectOf(f.exports.arrayOf(f.exports.string)),multiple:f.exports.bool,preventDropOnDocument:f.exports.bool,noClick:f.exports.bool,noKeyboard:f.exports.bool,noDrag:f.exports.bool,noDragEventsBubbling:f.exports.bool,minSize:f.exports.number,maxSize:f.exports.number,maxFiles:f.exports.number,disabled:f.exports.bool,getFilesFromEvent:f.exports.func,onFileDialogCancel:f.exports.func,onFileDialogOpen:f.exports.func,useFsAccessApi:f.exports.bool,autoFocus:f.exports.bool,onDragEnter:f.exports.func,onDragLeave:f.exports.func,onDragOver:f.exports.func,onDrop:f.exports.func,onDropAccepted:f.exports.func,onDropRejected:f.exports.func,onError:f.exports.func,validator:f.exports.func};var we={isFocused:!1,isFileDialogActive:!1,isDragActive:!1,isDragAccept:!1,isDragReject:!1,acceptedFiles:[],fileRejections:[]};function ct(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=d(d({},lt),e),r=t.accept,n=t.disabled,i=t.getFilesFromEvent,a=t.maxSize,l=t.minSize,p=t.multiple,v=t.maxFiles,w=t.onDragEnter,C=t.onDragLeave,x=t.onDragOver,M=t.onDrop,N=t.onDropAccepted,L=t.onDropRejected,z=t.onFileDialogCancel,oe=t.onFileDialogOpen,Ae=t.useFsAccessApi,Oe=t.autoFocus,ie=t.preventDropOnDocument,Ee=t.noClick,ae=t.noKeyboard,Se=t.noDrag,A=t.noDragEventsBubbling,se=t.onError,B=t.validator,$=u.exports.useMemo(function(){return Zt(r)},[r]),je=u.exports.useMemo(function(){return Gt(r)},[r]),le=u.exports.useMemo(function(){return typeof oe=="function"?oe:Qe},[oe]),Y=u.exports.useMemo(function(){return typeof z=="function"?z:Qe},[z]),h=u.exports.useRef(null),F=u.exports.useRef(null),ut=u.exports.useReducer(cr,we),_e=ye(ut,2),ce=_e[0],y=_e[1],pt=ce.isFocused,Pe=ce.isFileDialogActive,G=u.exports.useRef(typeof window<"u"&&window.isSecureContext&&Ae&&Yt()),ke=function(){!G.current&&Pe&&setTimeout(function(){if(F.current){var s=F.current.files;s.length||(y({type:"closeDialog"}),Y())}},300)};u.exports.useEffect(function(){return window.addEventListener("focus",ke,!1),function(){window.removeEventListener("focus",ke,!1)}},[F,Pe,Y,G]);var _=u.exports.useRef([]),Ie=function(s){h.current&&h.current.contains(s.target)||(s.preventDefault(),_.current=[])};u.exports.useEffect(function(){return ie&&(document.addEventListener("dragover",Je,!1),document.addEventListener("drop",Ie,!1)),function(){ie&&(document.removeEventListener("dragover",Je),document.removeEventListener("drop",Ie))}},[h,ie]),u.exports.useEffect(function(){return!n&&Oe&&h.current&&h.current.focus(),function(){}},[h,Oe,n]);var O=u.exports.useCallback(function(o){se?se(o):console.error(o)},[se]),Re=u.exports.useCallback(function(o){o.preventDefault(),o.persist(),V(o),_.current=[].concat(tr(_.current),[o.target]),X(o)&&Promise.resolve(i(o)).then(function(s){if(!(re(o)&&!A)){var g=s.length,m=g>0&&Kt({files:s,accept:$,minSize:l,maxSize:a,multiple:p,maxFiles:v,validator:B}),b=g>0&&!m;y({isDragAccept:m,isDragReject:b,isDragActive:!0,type:"setDraggedFiles"}),w&&w(o)}}).catch(function(s){return O(s)})},[i,w,O,A,$,l,a,p,v,B]),Te=u.exports.useCallback(function(o){o.preventDefault(),o.persist(),V(o);var s=X(o);if(s&&o.dataTransfer)try{o.dataTransfer.dropEffect="copy"}catch{}return s&&x&&x(o),!1},[x,A]),Me=u.exports.useCallback(function(o){o.preventDefault(),o.persist(),V(o);var s=_.current.filter(function(m){return h.current&&h.current.contains(m)}),g=s.indexOf(o.target);g!==-1&&s.splice(g,1),_.current=s,!(s.length>0)&&(y({type:"setDraggedFiles",isDragActive:!1,isDragAccept:!1,isDragReject:!1}),X(o)&&C&&C(o))},[h,C,A]),Z=u.exports.useCallback(function(o,s){var g=[],m=[];o.forEach(function(b){var K=nt(b,$),I=ye(K,2),pe=I[0],fe=I[1],de=ot(b,l,a),Q=ye(de,2),ge=Q[0],me=Q[1],ve=B?B(b):null;if(pe&&ge&&!ve)g.push(b);else{var he=[fe,me];ve&&(he=he.concat(ve)),m.push({file:b,errors:he.filter(function(mt){return mt})})}}),(!p&&g.length>1||p&&v>=1&&g.length>v)&&(g.forEach(function(b){m.push({file:b,errors:[$t]})}),g.splice(0)),y({acceptedFiles:g,fileRejections:m,type:"setFiles"}),M&&M(g,m,s),m.length>0&&L&&L(m,s),g.length>0&&N&&N(g,s)},[y,p,$,l,a,v,M,N,L,B]),q=u.exports.useCallback(function(o){o.preventDefault(),o.persist(),V(o),_.current=[],X(o)&&Promise.resolve(i(o)).then(function(s){re(o)&&!A||Z(s,o)}).catch(function(s){return O(s)}),y({type:"reset"})},[i,Z,O,A]),P=u.exports.useCallback(function(){if(G.current){y({type:"openDialog"}),le();var o={multiple:p,types:je};window.showOpenFilePicker(o).then(function(s){return i(s)}).then(function(s){Z(s,null),y({type:"closeDialog"})}).catch(function(s){qt(s)?(Y(s),y({type:"closeDialog"})):Jt(s)?(G.current=!1,F.current?(F.current.value=null,F.current.click()):O(new Error("Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."))):O(s)});return}F.current&&(y({type:"openDialog"}),le(),F.current.value=null,F.current.click())},[y,le,Y,Ae,Z,O,je,p]),Ne=u.exports.useCallback(function(o){!h.current||!h.current.isEqualNode(o.target)||(o.key===" "||o.key==="Enter"||o.keyCode===32||o.keyCode===13)&&(o.preventDefault(),P())},[h,P]),Le=u.exports.useCallback(function(){y({type:"focus"})},[]),ze=u.exports.useCallback(function(){y({type:"blur"})},[]),Be=u.exports.useCallback(function(){Ee||(Ut()?setTimeout(P,0):P())},[Ee,P]),k=function(s){return n?null:s},ue=function(s){return ae?null:k(s)},J=function(s){return Se?null:k(s)},V=function(s){A&&s.stopPropagation()},ft=u.exports.useMemo(function(){return function(){var o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},s=o.refKey,g=s===void 0?"ref":s,m=o.role,b=o.onKeyDown,K=o.onFocus,I=o.onBlur,pe=o.onClick,fe=o.onDragEnter,de=o.onDragOver,Q=o.onDragLeave,ge=o.onDrop,me=ne(o,Xt);return d(d(De({onKeyDown:ue(D(b,Ne)),onFocus:ue(D(K,Le)),onBlur:ue(D(I,ze)),onClick:k(D(pe,Be)),onDragEnter:J(D(fe,Re)),onDragOver:J(D(de,Te)),onDragLeave:J(D(Q,Me)),onDrop:J(D(ge,q)),role:typeof m=="string"&&m!==""?m:"presentation"},g,h),!n&&!ae?{tabIndex:0}:{}),me)}},[h,Ne,Le,ze,Be,Re,Te,Me,q,ae,Se,n]),dt=u.exports.useCallback(function(o){o.stopPropagation()},[]),gt=u.exports.useMemo(function(){return function(){var o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},s=o.refKey,g=s===void 0?"ref":s,m=o.onChange,b=o.onClick,K=ne(o,er),I=De({accept:$,multiple:p,type:"file",style:{display:"none"},onChange:k(D(m,q)),onClick:k(D(b,dt)),tabIndex:-1},g,F);return d(d({},I),K)}},[F,r,p,q,n]);return d(d({},ce),{},{isFocused:pt&&!n,getRootProps:ft,getInputProps:gt,rootRef:h,inputRef:F,open:k(P)})}function cr(e,t){switch(t.type){case"focus":return d(d({},e),{},{isFocused:!0});case"blur":return d(d({},e),{},{isFocused:!1});case"openDialog":return d(d({},we),{},{isFileDialogActive:!0});case"closeDialog":return d(d({},e),{},{isFileDialogActive:!1});case"setDraggedFiles":return d(d({},e),{},{isDragActive:t.isDragActive,isDragAccept:t.isDragAccept,isDragReject:t.isDragReject});case"setFiles":return d(d({},e),{},{acceptedFiles:t.acceptedFiles,fileRejections:t.fileRejections});case"reset":return d({},we);default:return e}}function Qe(){}const ur="/assets/upload.504e0aae.svg",pr=()=>{const[e,t]=u.exports.useState([]),{getRootProps:r,getInputProps:n,isDragAccept:i}=ct({accept:{"image/*":[]},onDrop:a=>{t(a.map(l=>Object.assign(l,{preview:URL.createObjectURL(l)})))}});return c("div",{children:ee("div",{className:"w-full text-center border-dashed border border-gray-400 rounded-lg py-[52px] flex flex-col justify-center items-center",children:[e.length===0&&ee("div",{...r({className:"dropzone"}),children:[c("input",{className:"hidden",...n()}),c("img",{src:ur,alt:"",className:"mx-auto mb-4"}),i?c("p",{className:"text-sm text-gray-500 dark:text-gray-300 ",children:"Drop the files here ..."}):c("p",{className:"text-sm text-gray-500 dark:text-gray-300 f",children:"Drop files here or click to upload."})]}),c("div",{className:"flex space-x-4",children:e.map((a,l)=>c("div",{className:"mb-4 flex-none",children:c("div",{className:"h-[300px] w-[300px] mx-auto mt-6 rounded-lg",children:c("img",{src:a.preview,className:" object-contain h-full w-full block rounded-lg",onLoad:()=>{URL.revokeObjectURL(a.preview)}})})},l))})]})})},fr=()=>{const[e,t]=u.exports.useState(null),r=n=>{t(n.target.files[0])};return ee("div",{className:"flex space-x-3",children:[c(j,{selectedFile:e,onChange:r,children:c(S,{div:!0,icon:"ph:upload",text:"Choose File",iconClass:"text-2xl",className:"bg-gray-100 dark:bg-gray-700 dark:text-gray-300  text-gray-600 btn-sm"})}),c(j,{selectedFile:e,onChange:r,children:c(S,{div:!0,icon:"ph:upload",text:"Choose File",iconClass:"text-2xl",className:"bg-indigo-500  text-white btn-sm"})}),c(j,{selectedFile:e,onChange:r,children:c(S,{div:!0,icon:"ph:upload",text:"Choose File",iconClass:"text-2xl",className:"btn-outline-primary btn-sm"})}),c(j,{selectedFile:e,onChange:r,children:c(S,{icon:"ph:upload",className:"btn-info h-10 w-10  rounded-full items-center justify-center p-0"})})]})},dr=`
import React, { useState } from 'react';
import Fileinput from "@/components/ui/Fileinput";
import Button from "@/components/ui/Button";
const BasicInputFile = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
  return (
    <>
    <Fileinput selectedFile={selectedFile} onChange={handleFileChange}>
    <Button
        div
        icon="ph:upload"
        text="Choose File"
        iconClass="text-2xl"
        className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300  text-gray-600 btn-sm"
    />
</Fileinput>
<Fileinput selectedFile={selectedFile} onChange={handleFileChange}>
    <Button
        div
        icon="ph:upload"
        text="Choose File"
        iconClass="text-2xl"
        className="bg-indigo-500  text-white btn-sm"
    />
</Fileinput>
<Fileinput selectedFile={selectedFile} onChange={handleFileChange}>
    <Button
        div
        icon="ph:upload"
        text="Choose File"
        iconClass="text-2xl"
        className="btn-outline-primary btn-sm"
    />
</Fileinput>
<Fileinput selectedFile={selectedFile} onChange={handleFileChange}>
    <Button
        icon="ph:upload"
        className="btn-info h-10 w-10  rounded-full items-center justify-center p-0"
    />
</Fileinput>
    </>
  )
}
export default BasicInputFile
`,gr=`
import Fileinput from "@/components/ui/Fileinput";
import Button from "@/components/ui/Button";
const MultipleSelectFiles = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const handleFileChangeMultiple = (e) => {
        const files = e.target.files;
        const filesArray = Array.from(files).map((file) => file);
        setSelectedFiles(filesArray);
    };
  return (
    <>
    <Fileinput
       multiple
       selectedFiles={selectedFiles}
       onChange={handleFileChangeMultiple}>
    <Button
        div
        icon="ph:upload"
        text="Choose File"
        iconClass="text-2xl"
        className="bg-gray-100  text-gray-600 dark:bg-gray-700 dark:text-gray-300 btn-sm"/>
    </Fileinput>
    </>
  )
}
export default MultipleSelectFiles
`,mr=`
import React, { useState } from 'react';
import Button from "@/components/ui/Button";
import Fileinput from "@/components/ui/Fileinput";
const BasicInputPreview = () => {
    const [selectedFile2, setSelectedFile2] = useState(null);
    const handleFileChange2 = (e) => {
        setSelectedFile2(e.target.files[0]);
    };
  return (
    <>
    <Fileinput
    name="basic"
    selectedFile={selectedFile2}
    onChange={handleFileChange2}
    preview
>
    <Button
        div
        icon="ph:upload"
        text="Choose File"
        iconClass="text-2xl"
        className="bg-gray-100  dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
    />
</Fileinput>
    </>
  )
}
export default BasicInputPreview
`,vr=`
import React, { useState } from 'react';
import Fileinput from "@/components/ui/Fileinput";
import Button from "@/components/ui/Button";
const MultipleFilePreview = () => {
    const [selectedFiles2, setSelectedFiles2] = useState([]);
    const handleFileChangeMultiple2 = (e) => {
        const files = e.target.files;
        const filesArray = Array.from(files).map((file) => file);
        setSelectedFiles2(filesArray);
    };
  return (
    <>
    <Fileinput
    selectedFiles={selectedFiles2}
    onChange={handleFileChangeMultiple2}
    multiple
    preview
>
    <Button
        div
        icon="ph:upload"
        text="Choose File"
        iconClass="text-2xl"
        className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
    />
</Fileinput>
    </>
  )
}
export default MultipleFilePreview
`,hr=`
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import uploadSvgImage from "@/assets/images/svg/upload.svg";
const DropZone = () => {
  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });
  return (
    <div>
      <div className="w-full text-center border-dashed border border-gray-400 rounded-lg py-[52px] flex flex-col justify-center items-center">
        {files.length === 0 && (
          <div {...getRootProps({ className: "dropzone" })}>
            <input className="hidden" {...getInputProps()} />
            <img src={uploadSvgImage} alt="" className="mx-auto mb-4" />
            {isDragAccept ? (
              <p className="text-sm text-gray-500 dark:text-gray-300 ">
                Drop the files here ...
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-300 f">
                Drop files here or click to upload.
              </p>
            )}
          </div>
        )}
        <div className="flex space-x-4">
          {files.map((file, i) => (
            <div key={i} className="mb-4 flex-none">
              <div className="h-[300px] w-[300px] mx-auto mt-6 rounded-lg">
                <img
                  src={file.preview}
                  className=" object-contain h-full w-full block rounded-lg"
                  onLoad={() => {
                    URL.revokeObjectURL(file.preview);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default DropZone;
`,yr=()=>{const[e,t]=u.exports.useState([]);return c(vt,{children:c(j,{multiple:!0,selectedFiles:e,onChange:n=>{const i=n.target.files,a=Array.from(i).map(l=>l);t(a)},children:c(S,{div:!0,icon:"ph:upload",text:"Choose File",iconClass:"text-2xl",className:"bg-gray-100  text-gray-600 dark:bg-gray-700 dark:text-gray-300 btn-sm"})})})},br=()=>{const[e,t]=u.exports.useState(null);return c(j,{name:"basic",selectedFile:e,onChange:n=>{t(n.target.files[0])},preview:!0,children:c(S,{div:!0,icon:"ph:upload",text:"Choose File",iconClass:"text-2xl",className:"bg-gray-100  dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"})})},xr=()=>{const[e,t]=u.exports.useState([]);return c(j,{selectedFiles:e,onChange:n=>{const i=n.target.files,a=Array.from(i).map(l=>l);t(a)},multiple:!0,preview:!0,children:c(S,{div:!0,icon:"ph:upload",text:"Choose File",iconClass:"text-2xl",className:"bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"})})},Ar=()=>ee("div",{className:" space-y-5",children:[c(H,{title:"Basic Input File",code:dr,children:c(fr,{})}),c(H,{title:"Multiple Select",code:gr,children:c(yr,{})}),c(H,{title:"Basic input with preview",code:mr,children:c(br,{})}),c(H,{title:"multiple file with preview",code:vr,children:c(xr,{})}),c("div",{className:"xl:col-span-2 col-span-1",children:c(H,{title:"File upload",code:hr,children:c(pr,{})})})]});export{Ar as default};
