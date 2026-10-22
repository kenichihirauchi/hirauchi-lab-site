/* Researchの日本語図の表示と拡大。外部ライブラリや通信は不要です。 */
(()=>{
  'use strict';
  const figures=window.LAB_RESEARCH_FIGURES;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imageURL=f=>'assets/research/'+encodeURIComponent(f.file);
  const sourceText=f=>f.sourceJournal?esc(f.source).replace(esc(f.sourceJournal),'<i>'+esc(f.sourceJournal)+'</i>'):esc(f.source);
  let cleanup=()=>{};

  function render(theme,afterParagraph){
    if(document.documentElement.lang!=='ja')return '';
    const selected=figures.filter(f=>f.theme===theme&&f.afterParagraph===afterParagraph);
    if(!selected.length)return '';
    return `<div class="research-figures" lang="ja">${selected.map(f=>`<figure class="research-figure" id="research-figure-${f.id}" data-figure="${f.id}"><a class="research-figure-link" href="${imageURL(f)}" target="_blank" rel="noopener" data-research-zoom="${f.id}" aria-label="拡大表示：${esc(f.title)}" title="クリックして拡大表示"><img src="${imageURL(f)}"${f.width&&f.height?` width="${f.width}" height="${f.height}"`:''} loading="lazy" decoding="async" alt="${esc(f.title)}"></a><figcaption><p class="research-figure-description"><strong class="research-figure-number">図${f.number}</strong>　${esc(f.description)}</p>${f.abbreviations?`<p class="research-figure-abbreviations">略号：${esc(f.abbreviations)}</p>`:''}<p class="research-figure-source">${esc(f.sourceLabel||'出典')}：${sourceText(f)}<br>${f.reference?`<span class="research-figure-reference">引用文献：${esc(f.reference)}</span><br>`:''}<a href="${esc(f.doi)}" target="_blank" rel="noopener">${esc(f.doi)}</a>${f.licenseURL?`<br><a class="research-figure-license" href="${esc(f.licenseURL)}" target="_blank" rel="noopener">${esc(f.license)}</a>`:''}</p>${f.copyright||f.journalURL?`<p class="research-figure-source research-figure-rights">${f.copyright?`<span class="research-figure-copyright">${esc(f.copyright)}</span>`:''}${f.journalURL?`${f.copyright?'<br>':''}Journal website: <a class="research-figure-journal" href="${esc(f.journalURL)}" target="_blank" rel="noopener">${esc(f.journalURL)}</a>`:''}</p>`:''}</figcaption></figure>`).join('')}</div>`;
  }

  function mount(){
    cleanup();
    const links=[...document.querySelectorAll('[data-research-zoom]')];
    if(document.documentElement.lang!=='ja'||!links.length)return;
    const dialog=document.createElement('dialog');
    dialog.className='research-figure-dialog';
    dialog.setAttribute('aria-labelledby','research-figure-dialog-title');
    dialog.innerHTML='<div class="figure-dialog-header"><h2 id="research-figure-dialog-title"></h2><button type="button" class="figure-dialog-close" aria-label="拡大表示を閉じる">閉じる ×</button></div><div class="figure-dialog-actions"><button type="button" class="figure-dialog-zoom" aria-pressed="false">原寸で表示</button><a class="figure-dialog-original" target="_blank" rel="noopener">画像を別タブで開く ↗</a></div><div class="figure-dialog-viewport" tabindex="0" aria-label="研究図。原寸表示では左右・上下にスクロールできます。"><img class="figure-dialog-image" alt=""></div>';
    document.body.append(dialog);
    const title=dialog.querySelector('h2'),image=dialog.querySelector('img');
    const viewport=dialog.querySelector('.figure-dialog-viewport');
    const zoom=dialog.querySelector('.figure-dialog-zoom'),close=dialog.querySelector('.figure-dialog-close');
    const original=dialog.querySelector('.figure-dialog-original');
    let opener=null,nativeWidthFromImage=false;
    const setNativeWidth=()=>{if(nativeWidthFromImage&&image.naturalWidth)image.style.setProperty('--figure-native-width',image.naturalWidth+'px')};
    image.addEventListener('load',setNativeWidth);
    function resetZoom(){dialog.classList.remove('is-native-size');zoom.setAttribute('aria-pressed','false');zoom.textContent='原寸で表示';viewport.scrollTo(0,0)}
    function onClose(){document.body.classList.remove('figure-viewer-open');if(opener?.isConnected)opener.focus({preventScroll:true});opener=null}
    function open(event){
      if(typeof dialog.showModal!=='function'||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      const f=figures.find(f=>f.id===event.currentTarget.dataset.researchZoom);
      if(!f)return;
      event.preventDefault();opener=event.currentTarget;
      title.textContent=f.title;image.alt=f.title;
      image.removeAttribute('width');image.removeAttribute('height');image.style.removeProperty('--figure-native-width');
      nativeWidthFromImage=!(f.width&&f.height);
      if(!nativeWidthFromImage){image.width=f.width;image.height=f.height;image.style.setProperty('--figure-native-width',f.width+'px')}
      image.src=imageURL(f);setNativeWidth();original.href=imageURL(f);
      resetZoom();document.body.classList.add('figure-viewer-open');dialog.showModal();close.focus();
    }
    links.forEach(link=>link.addEventListener('click',open));
    close.addEventListener('click',()=>dialog.close());
    zoom.addEventListener('click',()=>{const native=dialog.classList.toggle('is-native-size');zoom.setAttribute('aria-pressed',String(native));zoom.textContent=native?'全体幅に合わせる':'原寸で表示';viewport.scrollTo(0,0)});
    dialog.addEventListener('close',onClose);
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const focusable=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus()}
    });
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
    cleanup=()=>{links.forEach(link=>link.removeEventListener('click',open));dialog.removeEventListener('close',onClose);if(dialog.open)dialog.close();document.body.classList.remove('figure-viewer-open');dialog.remove();opener=null};
  }

  window.LAB_RESEARCH_GALLERY={render,mount,destroy(){cleanup();cleanup=()=>{}}};
})();
