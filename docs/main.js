(()=>{
'use strict';
const data=window.LAB_DATA,pubs=window.LAB_PUBLICATIONS,others=window.LAB_OTHERS;
const page=document.body.dataset.page||'home';
let lang=new URLSearchParams(location.search).get('lang');
try{lang=(lang==='ja'||lang==='en')?lang:(localStorage.getItem('hirauchi-language')||'en')}catch{lang=lang||'en'}
if(lang!=='ja')lang='en';
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const t=(ja,en)=>lang==='ja'?ja:en;
const pUrl=(p,hash='')=>(p==='home'?'index':p)+'.html?lang='+lang+hash;
const menu=['Home','Research','Members','Publications','News','Contact'];
const dateString=s=>{const[y,m,d]=s.split('-');return t(`${y}.${m}.${d}`,new Date(`${s}T12:00:00`).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}))};
function nav(){
  const active=page==='profile'?'members':page;
  const japaneseMenu={Home:'ホーム',Research:'研究内容',Members:'メンバー',Publications:'論文・出版物',News:'お知らせ',Contact:'連絡先'};
  return `<a class="skip-link" href="#main">${t('本文に移動','Skip to content')}</a>
  <header class="site-header">
    <div class="site-container header-inner">
      <a class="brand" href="${pUrl('home')}" aria-label="${t('平内研究室 ホーム','Hirauchi Laboratory Home')}">
        <svg class="brand-mark" viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M2 10 15 3l15 7M2 19l13-7 15 7M2 28l13-7 15 7M2 37l13-7 15 7" stroke="currentColor" stroke-width="1.1"/></svg>
        <span><span class="brand-name">${t('平内研究室','Hirauchi Laboratory')}</span><span class="brand-affiliation">${t('静岡大学 理学部 地球科学科','SHIZUOKA UNIVERSITY · GEOSCIENCES')}</span></span>
      </a>
      <nav class="primary-nav" id="primary-navigation" aria-label="${t('メインメニュー','Main navigation')}">
        ${menu.map(x=>`<a class="nav-link ${active===x.toLowerCase()?'active':''}" ${page===x.toLowerCase()?'aria-current="page"':''} href="${pUrl(x.toLowerCase())}">${t(japaneseMenu[x],x)}</a>`).join('')}
      </nav>
      <div class="language-switch" role="group" aria-label="${t('言語切り替え','Language selection')}">
        <button type="button" class="language-button" data-lang="en" lang="en" aria-pressed="${lang==='en'}">EN</button>
        <span aria-hidden="true">/</span>
        <button type="button" class="language-button" data-lang="ja" lang="ja" aria-pressed="${lang==='ja'}">日本語</button>
      </div>
      <button class="menu-toggle" id="menu-toggle" type="button" aria-label="${t('メニューを開く','Open menu')}" aria-controls="primary-navigation" aria-expanded="false"><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
    </div>
  </header>`;
}
function footer(){
  return `<footer class="site-footer"><div class="site-container footer-inner">
    <div><p class="footer-name">Hirauchi Laboratory</p><p class="footer-affiliation">${t('静岡大学 理学部 地球科学科','Department of Geosciences, Faculty of Science, Shizuoka University')}</p></div>
    <p class="copyright">© Hirauchi Laboratory, Shizuoka University</p>
  </div></footer>`;
}
function pageHead(title,desc=''){
  const japanese={Research:'研究内容',Members:'メンバー',Profile:'プロフィール',Publications:'論文・出版物',News:'お知らせ',Contact:'連絡先'}[title];
  return `<div class="page-head"><div class="site-container"><div class="eyebrow">HIRAUCHI LABORATORY</div><h1 lang="${lang}">${t(japanese,title)}</h1>${desc?`<p class="page-intro">${desc}</p>`:''}</div></div>`;
}
function newsRow(n){
  const categories={Conference:t('学会発表','Conference'),Publication:t('論文掲載','Publication'),Grant:t('研究費','Grant')};
  return `<li class="news-item"><a class="news-link" href="${pUrl('news','#'+n.id)}"><time datetime="${n.date}">${n.date.replaceAll('-','.')}</time><span class="news-category">${categories[n.type]||esc(n.type)}</span><span class="news-row-title">${esc(n.title[lang])}</span><span class="news-arrow" aria-hidden="true">↗</span></a></li>`;
}
function home(){
  const configured=window.LAB_SITE.homeSlideshow?.photos;
  const photos=configured?.length?configured:[window.LAB_SITE.homePhoto];
  const multiple=photos.length>1,initial=multiple?Math.min(window.LAB_HOME_SLIDESHOW?.index||0,photos.length-1):0;
  const photo=photos[initial];
  const photoImages=photos.map((p,i)=>`<img${multiple?` class="home-slide${i===initial?' is-active':''}" aria-hidden="${i!==initial}"`:''} ${i===initial?'src':'data-src'}="${esc(p.src)}"${p.srcset?` ${i===initial?'srcset':'data-srcset'}="${esc(p.srcset)}" sizes="(max-width:700px) 1000px, (max-width:1328px) calc(100vw - 88px), 1240px"`:''} style="--photo-position:${esc(p.position||'center')};--photo-position-mobile:${esc(p.mobilePosition||p.position||'center')}" width="${esc(p.width||1600)}" height="${esc(p.height||900)}" alt="${esc(p.alt[lang])}" decoding="async"${i===initial?' fetchpriority="high"':''}>`).join('');
  const controls=multiple?`<div class="slideshow-controls" role="group" aria-label="${t('研究写真の操作','Research photo controls')}"><div class="slideshow-dots">${photos.map((p,i)=>`<button type="button" class="slideshow-dot" data-slide="${i}" aria-pressed="${i===initial}" aria-label="${esc(t(`写真${i+1}を表示：${p.caption.ja}`,`Show photo ${i+1}: ${p.caption.en}`))}"><span aria-hidden="true"></span></button>`).join('')}</div><button type="button" class="slideshow-toggle"><span class="slideshow-toggle-icon" aria-hidden="true">Ⅱ</span><span class="slideshow-toggle-label">${t('一時停止','Pause')}</span></button></div><span class="slideshow-status" role="status" aria-live="polite"></span>`:'';
  const latest=[...data.news].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  return `<main id="main" class="main-area">
    <section class="home-hero site-container" aria-labelledby="hero-title">
      <figure${multiple?` class="hero-slideshow" data-home-slideshow role="group" aria-roledescription="${t('スライドショー','slideshow')}" aria-label="${t('研究写真','Research photographs')}"`:''}>
        <div class="hero-stage">
          <div class="photo-frame">${photoImages}</div>
          ${photo.isPlaceholder?`<div class="photo-badge" aria-hidden="true">${esc(photo.kind)}<span>${esc(photo.caption[lang])}</span></div>`:''}
          <div class="hero-copy"><p class="eyebrow" lang="en">STRUCTURAL GEOLOGY · ROCK RHEOLOGY</p><h1 class="hero-title" id="hero-title" lang="en">Deformation, fluids, and rheology at subduction plate boundaries</h1></div>
        </div>
        <figcaption class="photo-caption${multiple?' slideshow-caption':''}"><span class="photo-kind" data-slide-kind>${esc(photo.kind)}</span><span class="photo-description" data-slide-caption>${esc(photo.caption[lang])}</span>${controls}</figcaption>
      </figure>
      <div class="hero-support">
        <div class="hero-description"><p class="hero-subtitle" lang="${lang}">${t('岩石に刻まれた変形の<span style="white-space:nowrap">記録</span>と<span style="white-space:nowrap">高圧実験</span>から、<span style="white-space:nowrap">流体</span>が左右する<span style="white-space:nowrap">プレート</span>境界の力学を読み解く。','Understanding how rocks deform, react, weaken, and fail—from natural shear zones to high-pressure experiments.')}</p></div>
        <div class="hero-action"><a class="text-link" href="${pUrl('research')}"><span>${t('研究内容を見る','Explore our research')}</span><span class="link-arrow" aria-hidden="true">→</span></a></div>
      </div>
    </section>
    <section class="news-section site-container" aria-labelledby="news-title">
      <div class="news-layout">
        <div class="news-heading"><div class="eyebrow">${t('研究室からのお知らせ','UPDATES FROM THE LAB')}</div><h2 id="news-title">${t('最新ニュース','Latest News')}</h2><p>${t('最新の5件を掲載','The latest from our laboratory')}</p><a class="text-link" href="${pUrl('news')}"><span>${t('すべてのニュース','All news')}</span><span class="link-arrow" aria-hidden="true">→</span></a></div>
        <ul class="news-list" id="home-news">${latest.map(newsRow).join('')}</ul>
      </div>
    </section>
  </main>`;
}
function researchBody(r,theme){
  if(lang!=='ja')return `<div class="research-paras" lang="${lang}">${r[lang].map(s=>`<p>${s}</p>`).join('')}</div>`;
  const blocks=[];
  let paragraphs=[];
  const flush=()=>{if(paragraphs.length){blocks.push(`<div class="research-paras" lang="ja">${paragraphs.join('')}</div>`);paragraphs=[]}};
  r.ja.forEach((text,index)=>{
    paragraphs.push(`<p>${text}</p>`);
    const figure=window.LAB_RESEARCH_GALLERY?.render(theme,index+1)||'';
    if(figure){flush();blocks.push(figure)}
  });
  flush();
  return `<div class="research-body">${blocks.join('')}</div>`;
}
function research(){return `<main id="main" class="main-area">${pageHead('Research',t('フィールド調査と高圧変形実験を通して、沈み込みプレート境界の形成、弱化、地震・非地震性すべりを探ります。','Four research themes connecting natural shear zones, fluid–rock reactions, slow earthquakes, and the rheology of hydrous minerals.'))}<div class="site-container research-entries">${data.research.map((r,i)=>`<article class="research-entry"><div class="research-aside"><div class="research-num">${r.no}</div></div><div class="research-content"><h2 lang="${lang}">${esc(t(r.jaTitle,r.title))}</h2><p class="research-secondary-title" lang="${t('en','ja')}">${esc(t(r.title,r.jaTitle))}</p>${researchBody(r,i+1)}</div></article>`).join('')}</div></main>`}
function personRow(member){const[level,ja,en,jaRes,enRes]=member;return `<div class="person-item"><div class="person-name">${lang==='ja'?esc(ja):esc(en)}<span class="name-local">${lang==='ja'?esc(en):esc(ja)}</span></div><div class="person-desc">${esc(lang==='ja'?jaRes:enRes)}</div></div>`}
function memberSection(title,members,small=false){return `<section class="member-section ${small?'members-section-small':''}"><h2>${title}</h2><div>${members.map(personRow).join('')}</div></section>`}
function members(){return `<main id="main" class="main-area">${pageHead('Members')}<div class="site-container members-list"><section class="member-section"><h2>${t('教員','Principal Investigator')}</h2><div class="professor-card"><div><div class="person-name"><a href="${pUrl('profile')}">${t('平内 健一','Ken-ichi Hirauchi')}<span class="name-local">${t('Ken-ichi Hirauchi','平内 健一')}</span></a></div><div class="person-desc">${t('静岡大学 理学部 地球科学科 教授','Professor, Department of Geosciences, Faculty of Science, Shizuoka University')}</div></div><a class="profile-link" href="${pUrl('profile')}">${t('プロフィールを見る','View profile')} ↗</a></div></section><section class="member-section"><h2>${t('大学院生','Graduate Students')}</h2><div class="group-label">${t('修士1年（M1）',"Master's Students (M1)")}</div>${data.names.filter(n=>n[0]==='M1').map(personRow).join('')}</section><section class="member-section"><h2>${t('学部生','Undergraduate Students')}</h2><div class="group-label">${t('学部4年（B4）','Undergraduate Students (B4)')}</div>${data.names.filter(n=>n[0]==='B4').map(personRow).join('')}<div class="group-label" style="margin-top:26px">${t('学部3年（B3）','Third-Year Students (B3)')}</div>${data.names.filter(n=>n[0]==='B3').map(personRow).join('')}</section></div></main>`}
function cvEntry(dt,s,extra=''){return `<div class="cv-entry"><div class="cv-date">${dt}</div><div class="cv-title">${s}</div>${extra?`<div class="cv-extra">${extra}</div>`:''}</div>`}
function cvSection(ja,en,inner){
  return `<section class="profile-section${ja==='研究費'?' grants-section':''}"${ja==='研究費'?' id="research-grants"':''}><h2>${t(ja,en)}</h2><div>${inner}</div></section>`;
}
function grantHTML(g){
  const meta=g[6];
  const grantTitle=lang==='ja'?'「'+g[4]+'」':g[5];
  const details=meta?`<div class="grant-details"><a href="${esc(meta.url)}" target="_blank" rel="noopener">${t('課題番号：','Grant No. ')}${esc(meta.number)}</a></div>`:'';
  return `<div class="cv-entry grant-entry" ${meta?`data-grant="${esc(meta.number)}"`:''}><div class="cv-date">${esc(lang==='ja'?g[0]:g[1])}</div><div class="cv-title"><strong>${esc(lang==='ja'?g[2]:g[3])}</strong></div><div class="cv-extra">${esc(grantTitle)}</div>${details}</div>`;
}
function profile(){const d=data.profile;const education=d.education.map(e=>cvEntry(e.date[lang],e.text[lang],e.extra[lang])).join('');const rows=arr=>arr.map(e=>cvEntry(lang==='ja'?e[0]:e[1],lang==='ja'?e[2]:e[3])).join('');const grants=d.grants.map(grantHTML).join('');const memberships=`<ul class="cv-bullets">${d.memberships.map(m=>`<li>${m[lang]}</li>`).join('')}</ul>`;return `<main id="main" class="main-area">${pageHead('Profile')}<div class="site-container"><div class="profile-top"><h2 class="person-heading" lang="${lang}">${t('平内 健一','Ken-ichi Hirauchi')}</h2><p class="person-heading-secondary" lang="${t('en','ja')}">${t('Ken-ichi Hirauchi','平内 健一')}</p><p class="profile-position">${t('教授｜静岡大学 理学部 地球科学科','Professor | Department of Geosciences, Faculty of Science, Shizuoka University')}</p></div><div class="profile-sections">${cvSection('学歴・学位','Education',education)}${cvSection('職歴','Academic Appointments',rows(d.appointments))}${cvSection('海外研究歴','Visiting Appointment',rows(d.visiting))}${cvSection('受賞歴','Honors & Awards',rows(d.awards))}${cvSection('研究費','Research Grants',`<p class="grant-count">${t(`研究代表者として採択された主な競争的研究費（${d.grants.length}件）`,`Selected grants as Principal Investigator (${d.grants.length} grants)`)}</p>${grants}`)}${cvSection('学会活動・編集委員','Professional Service',rows(d.service))}${cvSection('所属学会','Professional Memberships',memberships)}</div></div></main>`}
function authorHTML(authorStr){let parts=authorStr.split(';').map(a=>a.trim());let jp=parts.every(a=>/[\u3400-\u9fff]/.test(a));let joined=parts.map((s,i)=>{const n=esc(s).replace(/Hirauchi, K\.-i\./g,'<strong>Hirauchi, K.-i.</strong>').replace(/平内健一/g,'<strong>平内健一</strong>');if(jp)return n; if(i===0)return n;return (i===parts.length-1?' and ':', ')+n}).join(jp?'・':'');return joined}
function pubHTML(pub){return `<p class="pub-item"><span class="pub-authors">${authorHTML(pub.authors)}</span> (${pub.year}). <span class="pub-title">${esc(pub.title)}.</span> <span class="pub-journal">${esc(pub.journal)}</span>${pub.details?`, ${esc(pub.details)}.`:'.'} ${pub.doi?`<a class="doi-link" href="https://doi.org/${encodeURI(pub.doi)}" target="_blank" rel="noopener" aria-label="Open DOI for ${esc(pub.title)}">DOI ↗</a>`:''}</p>`}
function publications(){const grouped={};pubs.forEach(p=>(grouped[p.year]??=[]).push(p));let pubList=Object.keys(grouped).sort((a,b)=>Number(b)-Number(a)).map(y=>`<div class="pub-year"><h3>${y}</h3><div>${grouped[y].map(pubHTML).join('')}</div></div>`).join('');let extra='';if(lang==='ja'){for(let [key,title] of [['papers','その他の論文'],['chapter','著書・分担執筆'],['reports','報告書など']]){extra+=`<section class="pub-section"><h2>${title}</h2><div class="other-pub-list">${others[key].map(pubHTML).join('')}</div></section>`}}return `<main id="main" class="main-area">${pageHead('Publications')}<div class="site-container"><div class="pubs-top-note">${t('査読付き論文38編を新しい順に掲載しています。各論文のDOIから出版社のページに移動できます。','38 peer-reviewed journal articles, listed by year in reverse chronological order. Follow DOI links to the publishers’ pages.')}</div><section class="pub-section"><h2>${t('査読付き論文','Peer-reviewed Journal Articles')}</h2>${pubList}</section>${extra}</div></main>`}
function news(){return `<main id="main" class="main-area">${pageHead('News',t('論文掲載、学会発表、研究費などの最新情報。','Publications, conference presentations, grants, and other updates from the lab.'))}<div class="site-container full-news">${data.news.map(n=>`<article class="news-article" id="${n.id}"><div><time datetime="${n.date}">${dateString(n.date)}</time><div class="news-tags">${n.type}</div></div><div><h2>${n.title[lang]}</h2>${n.paragraphs[lang].map(s=>`<p>${s}</p>`).join('')}<a class="detail-link" href="${n.url}" rel="noopener" target="_blank">${n.link[lang]} ↗</a></div></article>`).join('')}</div></main>`}
function contact(){return `<main id="main" class="main-area">${pageHead('Contact')}<div class="site-container contact-layout"><div><h2>${t('平内研究室','Hirauchi Laboratory')}</h2><div class="contact-details"><div class="contact-row"><span class="contact-label">${t('所属','Affiliation')}</span>${t('静岡大学 理学部 地球科学科','Department of Geosciences, Faculty of Science, Shizuoka University')}</div><div class="contact-row"><span class="contact-label">${t('所在地','Address')}</span>${t('〒422-8529<br>静岡県静岡市駿河区大谷836','836 Ohya, Suruga-ku, Shizuoka 422-8529, Japan')}</div><div class="contact-row"><span class="contact-label">Phone / Fax</span>Phone: ${t('054-238-4735','+81-54-238-4735')}<br>Fax: ${t('054-238-0491','+81-54-238-0491')}</div><div class="contact-row"><span class="contact-label">E-mail</span>hirauchi.kenichi(@)shizuoka.ac.jp<br><span class="contact-note">${t('メール送信時は (@) を @ に置き換えてください。','Please replace (@) with @ when sending an email.')}</span></div></div></div><aside class="contact-card"><div class="contact-card-title">${t('アクセス案内','Getting here')}</div><p>${t('静岡キャンパスまでの交通案内やキャンパスマップについては、静岡大学の公式サイトをご覧ください。','For campus directions and maps, please visit the official Shizuoka University website.')}</p><a class="plain-external" href="https://www.shizuoka.ac.jp/access/index.html" target="_blank" rel="noopener">${t('静岡大学アクセス案内','Shizuoka University Access')} ↗</a></aside></div></main>`}
const renderMap={home,research,members,profile,publications,news,contact};
function closeMenu(){
  document.querySelector('#primary-navigation')?.classList.remove('is-open');
  const toggle=document.querySelector('#menu-toggle');
  toggle?.setAttribute('aria-expanded','false');
  toggle?.setAttribute('aria-label',t('メニューを開く','Open menu'));
}
function render(){
  if(page==='home')window.LAB_HOME_SLIDESHOW?.destroy();
  if(page==='research')window.LAB_RESEARCH_GALLERY?.destroy();
  document.documentElement.lang=lang;
  document.body.classList.toggle('lang-ja',lang==='ja');
  document.title=`${page==='home'?'Hirauchi Laboratory':page.charAt(0).toUpperCase()+page.slice(1)+' | Hirauchi Laboratory'} — Shizuoka University`;
  document.querySelector('#app').innerHTML=nav()+(renderMap[page]||home)()+footer();
  document.querySelectorAll('.language-button').forEach(button=>button.addEventListener('click',()=>{
    if(lang===button.dataset.lang)return;
    lang=button.dataset.lang;
    try{localStorage.setItem('hirauchi-language',lang)}catch{}
    const url=new URL(location.href);url.searchParams.set('lang',lang);
    try{history.replaceState({},'',url.href)}catch{/* Local file privacy settings may limit history access. */}
    render();
    document.querySelector(`.language-button[data-lang="${lang}"]`)?.focus();
    scrollToHash();
  }));
  const toggle=document.querySelector('#menu-toggle');
  toggle.addEventListener('click',()=>{
    const open=document.querySelector('#primary-navigation').classList.toggle('is-open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?t('メニューを閉じる','Close menu'):t('メニューを開く','Open menu'));
  });
  if(page==='home')window.LAB_HOME_SLIDESHOW?.mount(document.querySelector('[data-home-slideshow]'));
  if(page==='research')window.LAB_RESEARCH_GALLERY?.mount();
}
function scrollToHash(){
  if(!location.hash)return;
  try{const anchor=decodeURIComponent(location.hash.slice(1));requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView({block:'start'}))}catch{}
}
render();
scrollToHash();
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.querySelector('#primary-navigation')?.classList.contains('is-open')){
    closeMenu();document.querySelector('#menu-toggle').focus();
  }
});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu()});
window.matchMedia('(min-width:981px)').addEventListener('change',closeMenu);
window.addEventListener('popstate',()=>{
  const value=new URLSearchParams(location.search).get('lang');
  if(value==='ja'||value==='en'){lang=value;render();scrollToHash()}
});
})();
