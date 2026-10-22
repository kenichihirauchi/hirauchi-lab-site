/* Homeだけで読み込む、小さな写真スライドショー。ライブラリは不要です。 */
(()=>{
  'use strict';
  const state={index:0,paused:false};
  let cleanup=()=>{};

  function mount(root){
    cleanup();
    if(!root)return;
    const config=window.LAB_SITE.homeSlideshow;
    const photos=config.photos;
    const images=[...root.querySelectorAll('.home-slide')];
    if(images.length<2)return;
    const dots=[...root.querySelectorAll('.slideshow-dot')];
    const toggle=root.querySelector('.slideshow-toggle');
    const label=toggle.querySelector('.slideshow-toggle-label');
    const icon=toggle.querySelector('.slideshow-toggle-icon');
    const status=root.querySelector('.slideshow-status');
    const lang=document.documentElement.lang==='ja'?'ja':'en';
    const t=(ja,en)=>lang==='ja'?ja:en;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const interval=Math.max(1000,Number(config.intervalMs)||5000);
    const configuredFade=Number(config.fadeMs);
    const fade=Math.min(interval,Math.max(0,Number.isFinite(configuredFade)?configuredFade:1000));
    root.style.setProperty('--slide-fade',`${fade}ms`);
    let current=Math.min(state.index,images.length-1),timer=null,disposed=false,request=0,ready=false;
    const loading=new Map(),failed=new Set();

    function clearTimer(){clearTimeout(timer);timer=null}
    function controls(){
      const reduced=motion.matches;
      toggle.disabled=reduced;
      label.textContent=reduced?t('自動切替なし','Auto off'):state.paused?t('再生','Play'):t('一時停止','Pause');
      icon.textContent=reduced?'—':state.paused?'▶':'Ⅱ';
      toggle.setAttribute('aria-label',reduced?t('動きを減らす設定により自動切り替えは無効です','Automatic rotation is disabled by your reduced motion preference'):state.paused?t('写真の自動切り替えを再生','Start automatic photo rotation'):t('写真の自動切り替えを一時停止','Pause automatic photo rotation'));
      root.dataset.playState=reduced?'reduced-motion':state.paused?'paused':document.hidden?'hidden':'playing';
    }
    function load(index){
      if(loading.has(index))return loading.get(index);
      const img=images[index];
      const promise=new Promise(resolve=>{
        const done=ok=>{img.removeEventListener('load',onLoad);img.removeEventListener('error',onError);resolve(ok)};
        const onLoad=()=>done(true),onError=()=>{failed.add(index);dots[index].disabled=true;done(false)};
        img.addEventListener('load',onLoad,{once:true});img.addEventListener('error',onError,{once:true});
        if(img.dataset.srcset){img.srcset=img.dataset.srcset;delete img.dataset.srcset}
        if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src}
        if(img.complete){if(img.naturalWidth>0)done(true);else if(img.getAttribute('src'))onError()}
      }).then(async ok=>{if(ok&&img.decode)try{await img.decode()}catch{}return ok});
      loading.set(index,promise);
      return promise;
    }
    function next(){
      for(let offset=1;offset<images.length;offset++){
        const index=(current+offset)%images.length;
        if(!failed.has(index))return index;
      }
      return current;
    }
    function schedule(){
      clearTimer();controls();
      if(disposed||!ready||state.paused||motion.matches||document.hidden)return;
      const index=next();
      if(index!==current)timer=setTimeout(()=>show(next()),interval);
    }
    async function show(index,manual=false){
      clearTimer();
      const token=++request;
      const ok=await load(index);
      if(disposed||token!==request)return;
      if(!manual&&ready&&(state.paused||motion.matches||document.hidden)){schedule();return}
      if(!ok){
        if(manual)status.textContent=t('写真を読み込めませんでした。別の丸印を選んでください。','This photo could not be loaded. Choose another dot.');
        schedule();return;
      }
      images.forEach((img,i)=>{img.classList.toggle('is-active',i===index);img.setAttribute('aria-hidden',String(i!==index))});
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
      current=index;state.index=index;ready=true;
      root.dataset.activeSlide=String(index+1);
      root.querySelector('[data-slide-kind]').textContent=photos[index].kind||'';
      root.querySelector('[data-slide-caption]').textContent=photos[index].caption[lang];
      if(manual)status.textContent=t(`写真${index+1} / ${images.length}：${photos[index].caption.ja}`,`Photo ${index+1} of ${images.length}: ${photos[index].caption.en}`);
      schedule();
      // 現在の写真と、その次の1枚だけを先に読み込みます。
      if(!motion.matches&&!state.paused&&!document.hidden){const index=next();if(index!==current)load(index)}
    }
    dots.forEach((dot,index)=>dot.addEventListener('click',()=>show(index,true)));
    toggle.addEventListener('click',()=>{if(motion.matches)return;state.paused=!state.paused;schedule();if(!state.paused){const index=next();if(index!==current)load(index)}});
    const onVisibility=()=>schedule();
    const onMotion=()=>schedule();
    document.addEventListener('visibilitychange',onVisibility);
    motion.addEventListener('change',onMotion);
    cleanup=()=>{disposed=true;++request;clearTimer();document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion)};
    controls();
    show(Math.min(state.index,images.length-1));
  }

  window.LAB_HOME_SLIDESHOW={mount,get index(){return state.index},destroy(){cleanup();cleanup=()=>{}}};
})();
