// 홈 팝업 배너 렌더 — 데이터는 src/data/popups.ts (게시 기간 서버 판정)
// - 이미지는 열릴 때 data-src → src 로 넣어 첫 화면(LCP)을 막지 않는다.
// - '오늘 하루 보지 않기'는 localStorage(KST 날짜), 저장소가 막혀 있으면 이번 방문만 닫힌다.
// - Lenis(홈 스크롤 연출)가 팝업 안 스크롤·스와이프를 가로채지 않게 data-lenis-prevent.
import { html, raw } from 'hono/html'
import { activePopups } from './data/popups'

const CSS = `
.gp-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,13,15,.62);overscroll-behavior:contain;opacity:0;transition:opacity .25s var(--ease)}
.gp-overlay[hidden]{display:none}
.gp-overlay.is-open{opacity:1}
.gp-dialog{position:relative;width:min(420px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--paper);border:1.5px solid var(--ink);box-shadow:7px 7px 0 var(--sky);font-family:var(--sans);outline:none}
.gp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px 10px 16px;border-bottom:1px solid var(--line)}
.gp-title{font-size:15px;font-weight:700;color:var(--ink);margin:0;letter-spacing:-.01em}
.gp-count{font-size:12px;color:var(--ink-mute);font-variant-numeric:tabular-nums;margin-left:auto}
.gp-x{width:40px;height:40px;border:0;background:none;color:var(--ink);font-size:22px;line-height:1;cursor:pointer;display:grid;place-items:center}
.gp-x:hover{color:var(--seal)}
.gp-body{position:relative;flex:1 1 auto;min-height:0}
.gp-track{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;height:min(calc(100dvh - 170px),calc(min(420px,100vw - 32px) * 1.62));max-height:680px;background:var(--sky-mist)}
.gp-track::-webkit-scrollbar{display:none}
.gp-slide{flex:0 0 100%;scroll-snap-align:center;display:flex;align-items:center;justify-content:center;margin:0}
.gp-slide a{display:block;height:100%;width:100%}
.gp-slide img{display:block;width:100%;height:100%;object-fit:contain}
.gp-nav{width:36px;height:36px;border:1.5px solid var(--ink);background:rgba(252,253,254,.92);color:var(--ink);font-size:18px;cursor:pointer;display:grid;place-items:center}
.gp-nav:hover{background:var(--sky)}
.gp-nav[disabled]{opacity:.3;cursor:default}
.gp-dots{display:flex;justify-content:center;align-items:center;gap:4px;padding:6px 0 0}.gp-dots .gp-nav{margin:0 8px}
.gp-dot{width:28px;height:28px;border:0;background:none;cursor:pointer;display:grid;place-items:center;padding:0}
.gp-dot::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--line);border:1px solid var(--ink-mute)}
.gp-dot[aria-current="true"]::before{background:var(--ink);border-color:var(--ink)}
.gp-foot{display:flex;border-top:1px solid var(--line);margin-top:4px}
.gp-foot button{flex:1;min-height:46px;border:0;background:none;font:inherit;font-size:14px;color:var(--ink-soft);cursor:pointer}
.gp-foot button+button{border-left:1px solid var(--line);color:var(--ink);font-weight:700}
.gp-foot button:hover{background:var(--sky-mist)}
.gp-overlay :focus-visible{outline:2px solid var(--sky-deep);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.gp-overlay{transition:none}.gp-track{scroll-behavior:auto}}
`

const JS = `(function(){
var o=document.getElementById('gosu-popup');if(!o)return;
var K='gosu-popup-hide',today=new Date(Date.now()+324e5).toISOString().slice(0,10);
try{if(localStorage.getItem(K)===today)return}catch(e){}
var d=o.querySelector('.gp-dialog'),t=o.querySelector('.gp-track'),s=[].slice.call(o.querySelectorAll('.gp-slide')),dots=[].slice.call(o.querySelectorAll('.gp-dot')),
pv=o.querySelector('.gp-prev'),nx=o.querySelector('.gp-next'),cnt=o.querySelector('.gp-count'),last=null,i=0;
function cur(){return Math.round(t.scrollLeft/Math.max(1,t.clientWidth))}
function sync(){i=Math.min(s.length-1,Math.max(0,cur()));dots.forEach(function(b,k){b.setAttribute('aria-current',k===i?'true':'false')});
if(pv){pv.disabled=i===0;nx.disabled=i===s.length-1}if(cnt)cnt.textContent=(i+1)+' / '+s.length}
function go(k){k=Math.max(0,Math.min(s.length-1,k));t.scrollTo({left:k*t.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function close(hide){if(hide){try{localStorage.setItem(K,today)}catch(e){}}
o.classList.remove('is-open');o.hidden=true;document.removeEventListener('keydown',key,true);if(last&&last.focus)try{last.focus({preventScroll:true})}catch(e){}}
function key(e){if(e.key==='Escape'){e.preventDefault();close(false);return}
if(e.key==='ArrowRight'&&s.length>1&&!/INPUT|TEXTAREA/.test(e.target.tagName)){go(i+1)}
if(e.key==='ArrowLeft'&&s.length>1){go(i-1)}
if(e.key==='Tab'){var f=[].slice.call(d.querySelectorAll('button:not([disabled]),a[href]')).filter(function(x){return x.offsetParent!==null});if(!f.length)return;
var a=f[0],z=f[f.length-1];if(e.shiftKey&&(document.activeElement===a||document.activeElement===d)){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}}
function open(){o.querySelectorAll('img[data-src]').forEach(function(m){m.src=m.getAttribute('data-src');m.removeAttribute('data-src')});
last=document.activeElement;o.hidden=false;requestAnimationFrame(function(){o.classList.add('is-open')});sync();d.focus({preventScroll:true});document.addEventListener('keydown',key,true)}
var tm;t.addEventListener('scroll',function(){clearTimeout(tm);tm=setTimeout(sync,60)},{passive:true});
if(pv){pv.addEventListener('click',function(){go(i-1)});nx.addEventListener('click',function(){go(i+1)})}
dots.forEach(function(b,k){b.addEventListener('click',function(){go(k)})});
o.querySelector('.gp-x').addEventListener('click',function(){close(false)});
o.querySelector('.gp-close').addEventListener('click',function(){close(false)});
o.querySelector('.gp-today').addEventListener('click',function(){close(true)});
o.addEventListener('click',function(e){if(e.target===o)close(false)});
window.addEventListener('resize',function(){if(!o.hidden)go(i)});
function later(){setTimeout(open,700)}
if(document.readyState==='complete')later();else window.addEventListener('load',later,{once:true});
})();`

export function homePopup(now: Date = new Date()) {
  const items = activePopups(now)
  if (!items.length) return ''
  const many = items.length > 1
  return html`<style>${raw(CSS)}</style>
<div class="gp-overlay" id="gosu-popup" hidden data-lenis-prevent>
  <div class="gp-dialog" role="dialog" aria-modal="true" aria-labelledby="gp-title" tabindex="-1">
    <div class="gp-head">
      <h2 class="gp-title" id="gp-title">고수치과 안내</h2>
      ${many ? html`<span class="gp-count" aria-live="polite">1 / ${items.length}</span>` : ''}
      <button type="button" class="gp-x" aria-label="팝업 닫기">×</button>
    </div>
    <div class="gp-body">
      <div class="gp-track" tabindex="0" aria-label="안내 이미지 ${items.length}장, 옆으로 넘겨 보기">
        ${items.map((p, k) => html`<figure class="gp-slide" aria-roledescription="slide" aria-label="${k + 1} / ${items.length}"><a href="${p.src}" target="_blank" rel="noopener" title="크게 보기(새 창)"><img data-src="${p.src}" alt="${p.alt}" width="${p.width}" height="${p.height}" decoding="async"></a></figure>`)}
      </div>
    </div>
    ${many ? html`<div class="gp-dots"><button type="button" class="gp-nav gp-prev" aria-label="이전 안내">‹</button>${items.map((_, k) => html`<button type="button" class="gp-dot" aria-label="${k + 1}번째 안내 보기" aria-current="${k === 0 ? 'true' : 'false'}"></button>`)}<button type="button" class="gp-nav gp-next" aria-label="다음 안내">›</button></div>` : ''}
    <div class="gp-foot">
      <button type="button" class="gp-today">오늘 하루 보지 않기</button>
      <button type="button" class="gp-close">닫기</button>
    </div>
  </div>
</div>
<script>${raw(JS)}</script>`
}
