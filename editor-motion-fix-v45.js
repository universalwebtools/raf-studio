// RAF.studio — editor motion fix v4.5
// Animacje używają indywidualnych translate/scale/rotate, więc nie nadpisują transform pozycji tekstu.
const st=document.createElement('style');st.id='rafEditorMotionFix45';st.textContent=`
@keyframes raf44up{from{opacity:0;translate:0 35px}to{opacity:1;translate:0 0}}
@keyframes raf44down{from{opacity:0;translate:0 -35px}to{opacity:1;translate:0 0}}
@keyframes raf44left{from{opacity:0;translate:45px 0}to{opacity:1;translate:0 0}}
@keyframes raf44right{from{opacity:0;translate:-45px 0}to{opacity:1;translate:0 0}}
@keyframes raf44zin{from{opacity:0;scale:.72}to{opacity:1;scale:1}}
@keyframes raf44zout{from{opacity:0;scale:1.28}to{opacity:1;scale:1}}
@keyframes raf44bounce{0%{opacity:0;translate:0 30px}60%{opacity:1;translate:0 -8px}100%{translate:0 0}}
@keyframes raf44flipx{from{opacity:0;rotate:x 90deg}to{opacity:1;rotate:x 0deg}}
@keyframes raf44flipy{from{opacity:0;rotate:y 90deg}to{opacity:1;rotate:y 0deg}}
@keyframes raf44rotate{from{opacity:0;rotate:-12deg;scale:.85}to{opacity:1;rotate:0deg;scale:1}}
.rafMotionPreview44{transform-origin:center center!important}
`;document.head.appendChild(st);
