// RAF.studio — radically different HERO compositions v7.5
const s=document.createElement('style');s.id='rafBlueprintHero75';s.textContent=`
body[data-tpl75] .hero{min-height:88vh}body[data-tpl75] .heroContent{min-height:88vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}body[data-tpl75] #heroT{font-family:var(--tpl75-font),sans-serif}
/* cinema / filmstrip: bottom cinematic */
body[data-tpl75="cinema"] .heroContent,body[data-tpl75="filmstrip"] .heroContent{justify-content:flex-end;padding-bottom:7vh;max-width:1250px}body[data-tpl75="cinema"] #heroT,body[data-tpl75="filmstrip"] #heroT{font-size:clamp(78px,10vw,165px);line-height:.74;max-width:1100px}body[data-tpl75="filmstrip"] .hero:before{content:"";position:absolute;z-index:3;inset:16px 0;border-block:7px dashed #fff5;pointer-events:none}
/* wedding / portrait: editorial split */
body[data-tpl75="wedding"] .heroMedia,body[data-tpl75="portrait"] .heroMedia{left:52%;width:48%;inset-block:5vh}body[data-tpl75="wedding"] .heroMedia{border-radius:240px 240px 8px 8px;overflow:hidden}body[data-tpl75="portrait"] .heroMedia{left:8%;width:40%;border-radius:48% 48% 8px 8px;overflow:hidden}body[data-tpl75="wedding"] .heroContent{width:48%;margin:0;padding-right:5vw}body[data-tpl75="portrait"] .heroContent{width:45%;margin-left:53%}body[data-tpl75="wedding"] #heroT,body[data-tpl75="portrait"] #heroT{font-weight:400;font-size:clamp(60px,7vw,116px);line-height:.88}
/* documentary / darkroom: brutal oversized */
body[data-tpl75="documentary"] .heroContent,body[data-tpl75="darkroom"] .heroContent{justify-content:flex-end;padding-bottom:4vh}body[data-tpl75="documentary"] #heroT,body[data-tpl75="darkroom"] #heroT{font-size:clamp(92px,13vw,210px);line-height:.68;text-transform:uppercase;max-width:1300px}body[data-tpl75="documentary"] .heroMedia img{filter:grayscale(.6) contrast(1.25) brightness(.5)}
/* luxury: centered framed visual */
body[data-tpl75="luxury"] .hero{padding:4vh 5vw}body[data-tpl75="luxury"] .heroMedia{inset:4vh 6vw;border-radius:32px;overflow:hidden}body[data-tpl75="luxury"] .heroContent{align-items:center;text-align:center;max-width:940px;margin:auto}body[data-tpl75="luxury"] #heroT{font-weight:400;font-size:clamp(68px,8vw,132px)}
/* grid / minimal: image is side object, lots of white space */
body[data-tpl75="grid"] .hero,body[data-tpl75="minimal"] .hero{min-height:70vh}body[data-tpl75="grid"] .heroContent,body[data-tpl75="minimal"] .heroContent{min-height:70vh;width:46%}body[data-tpl75="grid"] .heroMedia{left:50%;width:50%;inset:5vh 3vw 5vh 50%}body[data-tpl75="minimal"] .heroMedia{left:66%;width:30%;inset:8vh 7vw 8vh 66%;border-radius:3px;overflow:hidden}body[data-tpl75="minimal"] #heroT{font-size:clamp(56px,7vw,105px);letter-spacing:-.07em}
/* motion / social: right typography, video-like crop */
body[data-tpl75="motion"] .heroContent,body[data-tpl75="social"] .heroContent{width:48%;margin-left:52%;padding-left:4vw}body[data-tpl75="motion"] #heroT,body[data-tpl75="social"] #heroT{font-size:clamp(76px,9vw,150px);text-transform:uppercase;line-height:.75}
/* magazine: headline as cover */
body[data-tpl75="magazine"] .heroContent{justify-content:flex-start;padding-top:11vh}body[data-tpl75="magazine"] #heroT{font-size:clamp(82px,12vw,190px);line-height:.68;max-width:1250px}body[data-tpl75="magazine"] #heroD{margin-left:30vw;max-width:430px}
/* product / agency: 45-55 split with framed media */
body[data-tpl75="studio"] .heroContent,body[data-tpl75="agency"] .heroContent{width:43%;padding-right:4vw}body[data-tpl75="studio"] .heroMedia,body[data-tpl75="agency"] .heroMedia{left:47%;width:50%;inset-block:6vh;border-radius:26px;overflow:hidden}body[data-tpl75="studio"] #heroT,body[data-tpl75="agency"] #heroT{font-size:clamp(62px,7vw,120px)}
/* analog: offset story */
body[data-tpl75="analog"] .heroContent{max-width:760px;margin-left:7vw}body[data-tpl75="analog"] .heroMedia img{filter:sepia(.25) saturate(.8) brightness(.55)}body[data-tpl75="analog"] #heroT{font-size:clamp(64px,8vw,128px);font-weight:400}
/* monochrome */
body[data-tpl75="monochrome"] .heroMedia img{filter:grayscale(1) contrast(1.2) brightness(.5)}body[data-tpl75="monochrome"] .heroContent{justify-content:flex-end;padding-bottom:5vh}body[data-tpl75="monochrome"] #heroT{font-size:clamp(78px,10vw,160px)}
/* split frame */
body[data-tpl75="split"] .heroMedia{width:50%}body[data-tpl75="split"] .heroContent{width:50%;margin-left:50%;padding-left:6vw;background:var(--tpl75-bg)}
/* gallery/fullscreen: almost no copy */
body[data-tpl75="gallery"] .heroContent{align-items:center;text-align:center;max-width:920px;margin:auto}body[data-tpl75="fullscreen"] .heroContent{justify-content:flex-end;padding-bottom:5vh}body[data-tpl75="fullscreen"] #heroD,body[data-tpl75="fullscreen"] .actions{display:none!important}body[data-tpl75="fullscreen"] #heroT{font-size:clamp(55px,7vw,110px)}
/* architecture */
body[data-tpl75="architecture"] .heroContent{width:40%;justify-content:flex-end;padding-bottom:7vh}body[data-tpl75="architecture"] .heroMedia{left:44%;width:56%;inset-block:4vh}body[data-tpl75="architecture"] #heroT{font-size:clamp(58px,6vw,106px);font-weight:400}
@media(max-width:700px){body[data-tpl75] .hero,body[data-tpl75] .heroContent{min-height:78vh!important}body[data-tpl75] .heroMedia{inset:0!important;left:0!important;right:auto!important;width:100%!important;border-radius:0!important}body[data-tpl75] .heroContent{width:auto!important;margin:0!important;padding:24px!important;justify-content:flex-end!important;align-items:flex-start!important;text-align:left!important;background:linear-gradient(transparent,#000b)!important}body[data-tpl75] #heroT{font-size:clamp(46px,14vw,82px)!important;line-height:.84!important;color:#fff!important}body[data-tpl75] #heroD,body[data-tpl75] #heroK{color:#fff!important}}
`;document.head.appendChild(s);
