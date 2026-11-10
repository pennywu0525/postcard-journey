(() => {
  'use strict';
  const frames = Array.isArray(window.POSTCARD_FRAMES) ? window.POSTCARD_FRAMES : [];
  const STORE_KEY = 'postcard-journey-photo-studio-v3';
  const SAMPLE_FAV_KEY = 'postcard-journey-example-faves-v4';
  const examples = Array.isArray(window.POSTCARD_EXAMPLES) ? window.POSTCARD_EXAMPLES : [];
  let sampleFavorites = new Set();
  try { sampleFavorites = new Set(JSON.parse(localStorage.getItem(SAMPLE_FAV_KEY) || '[]')); } catch {}
  const MAX_SAVED = 20;
  const W = 1200, H = 860;
  const $ = (id) => document.getElementById(id);
  const canvas = $('postcardCanvas');
  const ctx = canvas.getContext('2d');
  let chosenFrame = frames[0];
  let photo = null;
  let validPostcard = false;
  let saved = readSaved();
  let filteredCountry = 'all';
  let favoritesOnly = false;
  let searchText = '';
  const status = (message) => { $('statusText').textContent = message; };

  function readSaved() {
    try {
      const list = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(list) ? list.filter(x => x && typeof x.id === 'string' && typeof x.image === 'string' && x.image.startsWith('data:image/')).slice(0, MAX_SAVED) : [];
    } catch { return []; }
  }
  function writeSaved() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); return true; }
    catch { return false; }
  }
  function roundedRect(context, x,y,w,h,r,fill,stroke,lineWidth=2) {
    context.beginPath();
    context.roundRect(x,y,w,h,r);
    if(fill){context.fillStyle=fill;context.fill();}
    if(stroke){context.strokeStyle=stroke;context.lineWidth=lineWidth;context.stroke();}
  }
  function drawPhoto(context, image, x,y,w,h) {
    context.save();
    context.beginPath(); context.roundRect(x,y,w,h,8); context.clip();
    if(image){
      const scale=Math.max(w/image.width,h/image.height);
      const dw=image.width*scale, dh=image.height*scale;
      context.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
    } else {
      const grad=context.createLinearGradient(x,y,x+w,y+h);
      grad.addColorStop(0,'#eadcd9'); grad.addColorStop(.52,'#d9e2df'); grad.addColorStop(1,'#cbd6e0');
      context.fillStyle=grad;context.fillRect(x,y,w,h);
      context.fillStyle='#ffffffc9';context.textAlign='center';context.font='bold 42px Arial';
      context.fillText('▧',x+w/2,y+h/2-22);
      context.font='bold 26px "Microsoft JhengHei",sans-serif';context.fillText('上傳你的旅行照片',x+w/2,y+h/2+26);
      context.font='17px Arial';context.fillText('YOUR OWN PHOTO',x+w/2,y+h/2+60);
    }
    context.restore();
  }
  function circles(context, color, count, size, x,y, dx,dy) {
    context.fillStyle=color;
    for(let i=0;i<count;i++){
      context.beginPath();context.arc(x+i*dx,y+i*dy,size,0,Math.PI*2);context.fill();
    }
  }
  function drawStar(context,x,y,r,color) {
    context.save();context.translate(x,y);context.fillStyle=color;context.beginPath();
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5-Math.PI/2, rr=i%2?r*.45:r;
      const px=Math.cos(a)*rr,py=Math.sin(a)*rr;
      if(i===0)context.moveTo(px,py); else context.lineTo(px,py);
    }
    context.closePath();context.fill();context.restore();
  }
  function drawMotifs(context, f) {
    const spots=[[39,42],[1159,65],[42,741],[1153,743],[54,401],[1154,397]];
    context.save();context.globalAlpha=.65;context.strokeStyle=f.accent;context.fillStyle=f.accent;
    if(f.motif==='hearts'){
      context.font='38px Georgia,serif';context.textAlign='center';
      spots.forEach(([x,y],i)=>context.fillText(i%2?'♡':'♥',x,y));
    }else if(f.motif==='flowers'){
      for(const [x,y] of spots){for(let j=0;j<5;j++){
        const t=j*Math.PI*2/5;context.beginPath();context.arc(x+Math.cos(t)*14,y+Math.sin(t)*14,10,0,Math.PI*2);context.fill();
      }context.fillStyle='#fdf8f2';context.beginPath();context.arc(x,y,9,0,Math.PI*2);context.fill();context.fillStyle=f.accent;}
    }else if(f.motif==='waves'){
      context.lineWidth=4;for(const [x,y] of spots){context.beginPath();for(let j=0;j<=30;j++){
        const xx=x-27+j*2, yy=y+Math.sin(j*.45)*7;if(j===0)context.moveTo(xx,yy);else context.lineTo(xx,yy);
      }context.stroke();}
    }else if(f.motif==='leaves'){
      context.lineWidth=3;for(const [x,y] of spots){context.beginPath();context.moveTo(x-14,y+22);context.lineTo(x+16,y-22);context.stroke();
        for(let i=0;i<3;i++){context.beginPath();context.ellipse(x-5+i*10,y+14-i*16,13,6,-Math.PI/4,0,Math.PI*2);context.fill();}}
    }else if(f.motif==='stars'){
      spots.forEach(([x,y],i)=>drawStar(context,x,y,i%2?22:15,f.accent));
    }else if(f.motif==='dots'){
      spots.forEach(([x,y],i)=>circles(context,f.accent,3,i%2?4:6,x-14,y,12,0));
    }else if(f.motif==='confetti'){
      spots.forEach(([x,y])=>{for(let i=0;i<8;i++){context.fillRect(x+(i*13)%44-22,y+(i*19)%40-20,5,10);}});
    }
    context.restore();
  }
  function drawFrameSpecial(context,f) {
    const w=W,h=H;
    if(f.layout==='classic'){
      roundedRect(context,32,27,w-64,h-54,16,null,f.secondary,4);
    }else if(f.layout==='polaroid'){
      roundedRect(context,36,29,w-72,h-58,5,'#ffffff',f.secondary,3);
      context.fillStyle=f.secondary;context.fillRect(86,686,1028,4);
    }else if(f.layout==='airmail'){
      const step=50;for(let x=0;x<W;x+=step){context.save();context.translate(x+step/2,0);context.rotate(Math.PI/4);
        context.fillStyle=Math.floor(x/step)%2===0?f.accent:f.secondary;context.fillRect(-12,-50,23,100);context.restore();
        context.save();context.translate(x+step/2,H);context.rotate(Math.PI/4);
        context.fillStyle=Math.floor(x/step)%2===0?f.secondary:f.accent;context.fillRect(-12,-50,23,100);context.restore();}
      roundedRect(context,51,35,1098,790,6,null,'#e7d7cf',3);
    }else if(f.layout==='film'){
      context.fillStyle='#151b20';context.fillRect(0,0,w,h);
      context.fillStyle='#e9e4da';for(let x=34;x<W;x+=80){roundedRect(context,x,17,35,25,5,'#eee7dd');roundedRect(context,x,H-42,35,25,5,'#eee7dd');}
      context.strokeStyle='#a49c92';context.lineWidth=3;context.strokeRect(80,70,1040,725);
    }else if(f.layout==='stamp'){
      context.save();context.strokeStyle=f.accent;context.setLineDash([2,15]);context.lineWidth=17;
      context.strokeRect(34,35,1131,785);context.restore();roundedRect(context,59,61,1082,735,4,null,f.secondary,4);
    }else if(f.layout==='vintage'){
      roundedRect(context,32,30,w-64,h-60,3,null,f.accent,6);
      roundedRect(context,49,47,w-98,h-94,3,null,f.secondary,3);
      context.save();context.globalAlpha=.10;context.fillStyle=f.accent;
      for(let i=0;i<250;i++){const x=(i*53)%W,y=(i*107)%H;context.fillRect(x,y,3,3);}context.restore();
    }else if(f.layout==='scrapbook'){
      roundedRect(context,28,23,w-56,h-46,10,null,f.secondary,4);
      context.save();context.translate(415,84);context.rotate(-.07);context.globalAlpha=.79;context.fillStyle=f.secondary;context.fillRect(-90,-27,180,54);
      context.strokeStyle=f.accent;context.lineWidth=2;for(let i=-80;i<100;i+=22){context.beginPath();context.moveTo(i,-27);context.lineTo(i+32,27);context.stroke();}context.restore();
      context.save();context.translate(987,665);context.rotate(.13);context.globalAlpha=.80;context.fillStyle=f.secondary;context.fillRect(-65,-22,130,44);context.restore();
    }else if(f.layout==='minimal'){
      roundedRect(context,39,37,w-78,h-74,0,null,f.accent,5);
    }
    drawMotifs(context,f);
  }
  function fitText(context,text,maxWidth,size,min=24,weight='bold'){
    let fontSize=size;
    while(fontSize>min){context.font=`${weight} ${fontSize}px "Microsoft JhengHei",sans-serif`;if(context.measureText(text).width<=maxWidth)break;fontSize-=2;}
    return fontSize;
  }
  function oneLine(context,text,x,y,maxWidth,size,color,weight='bold'){
    context.textAlign='left';context.textBaseline='alphabetic';context.fillStyle=color;
    const s=fitText(context,text,maxWidth,size,20,weight);
    context.font=`${weight} ${s}px "Microsoft JhengHei",sans-serif`;
    let t=text;while(t.length>0&&context.measureText(t).width>maxWidth)t=t.slice(0,-1);
    if(t.length<text.length)t=t.replace(/.$/,'…');
    context.fillText(t,x,y);
  }
  function renderCard(context,canvasW,canvasH,f,image,place,country,note,dateLabel){
    context.save();context.clearRect(0,0,canvasW,canvasH);context.scale(canvasW/W,canvasH/H);
    context.fillStyle=f.paper;context.fillRect(0,0,W,H);
    drawFrameSpecial(context,f);
    const isFilm=f.layout==='film';
    const px=isFilm?105:90,py=isFilm?95:83,pw=isFilm?990:1020,ph=isFilm?575:577;
    drawPhoto(context,image,px,py,pw,ph);
    context.fillStyle=isFilm?'#eae0d7':f.accent;
    context.font='bold 18px Georgia,serif';context.textAlign='left';
    context.fillText('POSTCARD JOURNEY  ✦  A LITTLE JOURNEY',px,699);
    const ink=isFilm?'#f6eee3':'#523f3b';
    oneLine(context,place||'下一站，去哪裡？',px,754,650,42,ink);
    const countryText=country?`${country} · `:'';
    oneLine(context,(countryText+(note||'把這趟旅行的美好，好好收藏起來。')),px,803,940,24,isFilm?'#e6d5d2':'#866d67','normal');
    context.textAlign='right';context.font='italic 19px Georgia,serif';context.fillStyle=f.accent;
    context.fillText(dateLabel||'Made with love ♡',1096,751);
    context.restore();
  }
  function makerValues() {
    return {
      place:$('placeInput').value.trim(),
      country:$('countryInput').value.trim(),
      note:$('noteInput').value.trim(),
      date:new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','.')
    };
  }
  function refreshPreview(){
    if(!chosenFrame)return;
    const v=makerValues();renderCard(ctx,W,H,chosenFrame,photo,v.place,v.country,v.note,v.date);
    const label=photo ? `明信片預覽：${v.place||'尚未填地點'}，邊框 ${chosenFrame.name}` : '明信片預覽，尚未上傳照片';
    canvas.setAttribute('aria-label',label);
    const canExport=!!(photo&&v.place);
    $('downloadBtn').disabled=!canExport;$('saveBtn').disabled=!canExport;
    validPostcard=canExport;
  }
  function makeFrameButtons(){
    const holder=$('frameOptions');holder.replaceChildren();
    for(const f of frames){
      const b=document.createElement('button');b.type='button';b.className='frame-choice';
      b.setAttribute('aria-pressed',String(f.id===chosenFrame.id));
      b.setAttribute('aria-label',`選擇「${f.name}」明信片邊框`);
      const sample=document.createElement('canvas');sample.width=320;sample.height=229;
      renderCard(sample.getContext('2d'),320,229,f,null,'旅行的日子','','','');
      const thumb=document.createElement('img');thumb.className='frame-thumb';thumb.alt='';thumb.src=sample.toDataURL('image/jpeg',.65);
      const lbl=document.createElement('span');lbl.textContent=f.name;
      b.append(thumb,lbl);
      b.addEventListener('click',()=>{chosenFrame=f;document.querySelectorAll('.frame-choice').forEach(ch=>ch.setAttribute('aria-pressed',String(ch===b)));refreshPreview();});
      holder.append(b);
    }
  }
  function loadFile(file){
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
      status('請上傳 JPG、PNG 或 WebP 照片；HEIC 可先在手機轉成 JPG。');return;
    }
    if(file.size>15*1024*1024){status('照片超過 15 MB，請先縮小圖片再上傳。');return;}
    const fileURL=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{photo=image;URL.revokeObjectURL(fileURL);$('uploadName').textContent=file.name;
      refreshPreview();status('照片已上傳！可以再試不同邊框、輸入地點與心情。');};
    image.onerror=()=>{URL.revokeObjectURL(fileURL);status('無法讀取這張照片，請改用 JPG、PNG 或 WebP 格式。');};
    image.src=fileURL;
  }
  function downloadData(href,name){
    const a=document.createElement('a');a.href=href;a.download=name;document.body.append(a);a.click();a.remove();
  }
  function safeFilename(name){return (name||'travel').replace(/[\\/\\:*?"<>|]/g,'-').replace(/\s+/g,'-').slice(0,36)||'travel';}
  function downloadPostcard(){
    if(!validPostcard)return;
    canvas.toBlob(blob=>{
      if(!blob){status('下載失敗，請重新生成。');return;}
      const u=URL.createObjectURL(blob);downloadData(u,`Postcard-${safeFilename(makerValues().place)}.png`);
      setTimeout(()=>URL.revokeObjectURL(u),2500);
      status('下載完成！明信片已存成 PNG 圖片，可以傳給朋友或保留在相簿。');
    },'image/png');
  }
  function savePostcard(){
    if(!validPostcard)return;
    const v=makerValues();
    const entry={id:`postcard-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,place:v.place,
      country:v.country||'我的旅行',note:v.note,frameId:chosenFrame.id,createdAt:v.date,
      favorite:false,image:canvas.toDataURL('image/jpeg',.74)};
    // Only claim a saved card after browser storage actually succeeds.
    const previous=saved;
    saved=[entry,...saved].slice(0,MAX_SAVED);
    if(writeSaved()){
      filteredCountry='all';favoritesOnly=false;searchText='';$('searchInput').value='';
      $('favoritesBtn').setAttribute('aria-pressed','false');renderGallery();
      status('♡ 已儲存到本機收藏牆！同一個瀏覽器重新整理後仍能查看。');
    }else{
      saved=previous;
      status('這張圖片無法存進瀏覽器（可能超過儲存空間）。請先按「下載明信片 PNG」保存到電腦。');
    }
  }
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function renderCountries(){
    const holder=$('countryOptions');holder.replaceChildren();
    const list=['all',...new Set([...examples.map(x=>x.country),...saved.map(x=>x.country)])];
    for(const k of list){const b=el('button','chip',k==='all'?'✦ 全部明信片':k);
      b.type='button';b.setAttribute('aria-pressed',String(filteredCountry===k));
      b.addEventListener('click',()=>{filteredCountry=k;renderGallery();});holder.append(b);}
  }
  function setFavorite(id){
    const item=saved.find(x=>x.id===id);if(!item)return;item.favorite=!item.favorite;
    if(!writeSaved())status('收藏狀態無法寫入瀏覽器。');renderGallery();
  }
  function toggleExampleFavorite(id){
    if(sampleFavorites.has(id))sampleFavorites.delete(id); else sampleFavorites.add(id);
    try {localStorage.setItem(SAMPLE_FAV_KEY,JSON.stringify([...sampleFavorites]));}
    catch {status('範例最愛無法記錄到瀏覽器。');}
    renderGallery();
  }
  function deleteCard(id){
    const card=saved.find(x=>x.id===id);if(!card)return;
    if(!confirm(`確定刪除「${card.place}」的明信片嗎？`))return;
    saved=saved.filter(x=>x.id!==id);
    if(!writeSaved())status('刪除資料無法同步到瀏覽器儲存空間。');renderGallery();
  }
  function openSample(x){
    const dlg=$('sampleDialog');
    $('dialogRegion').textContent=`✦ ${x.country} · ${x.region}`;
    $('dialogTitle').textContent=x.place;
    $('dialogEnglish').textContent=x.eng;
    $('dialogIntro').textContent=x.intro;
    $('dialogTrivia').textContent=x.trivia;
    const f=frames.find(i=>i.id===x.frameId);
    $('dialogFrameName').textContent=`✉ 明信片邊框｜${f?.name||'旅行手帳'}`;
    $('dialogPhoto').src=x.photo;
    $('dialogPhoto').alt=`${x.place} 真實景點攝影照片`;
    $('dialogPhoto').onerror=()=>{$('dialogPhoto').alt='此照片暫時無法連線載入，請點下方照片來源';};
    $('dialogFrame').className=`dialog-photo-frame example-theme-${x.frameId}`;
    $('dialogFactLink').href=x.source;
    $('dialogPhotoLink').href=x.photoPage;
    $('dialogCredit').replaceChildren();
    const creditText=document.createTextNode(`攝影：${x.photographer}｜`);
    const license=document.createElement('a');license.href=x.licurl;license.target='_blank';license.rel='noopener noreferrer';license.textContent=x.license;
    $('dialogCredit').append(creditText,license,document.createTextNode(' · 圖片可能依版面裁切'));
    $('useFrameBtn').onclick=()=>{chosenFrame=f||frames[0];$('placeInput').value=x.place;$('countryInput').value=x.country;
      $('noteInput').value=x.note;makeFrameButtons();refreshPreview();dlg.close();
      status('已幫你套用同款邊框和文字。現在請上傳你自己的照片，就能製作明信片！');
      $('creator').scrollIntoView({behavior:'smooth',block:'start'});};
    if(typeof dlg.showModal==='function')dlg.showModal(); else dlg.setAttribute('open','');
  }
  function renderExampleCard(x){
    const box=el('article',`saved-card example-card example-theme-${x.frameId}`);
    const poster=el('div','example-poster');
    const tape=el('span','example-tape','');tape.setAttribute('aria-hidden','true');
    const visual=el('button','example-visual');visual.type='button';visual.setAttribute('aria-label',`查看${x.place}的完整介紹`);
    const img=el('img','example-img');img.src=x.photo;img.alt=`${x.place}真實照片`;img.loading='lazy';img.referrerPolicy='no-referrer';
    img.onerror=()=>{visual.classList.add('image-unavailable');img.style.display='none';const s=el('span','missing-photo',`✉ ${x.place}照片需連線載入`);visual.append(s);};
    visual.append(img);visual.addEventListener('click',()=>openSample(x));
    poster.append(tape,visual,el('span','example-corner',x.country));
    const body=el('div','saved-content');body.append(el('div','saved-country',`${x.country} · ${x.region}　✦ 景點範例`));
    const head=el('div','saved-head');head.append(el('h3','',x.place));
    const heart=el('button','heart-btn',sampleFavorites.has(x.id)?'♥':'♡');heart.type='button';heart.setAttribute('aria-label',`${sampleFavorites.has(x.id)?'取消最愛':'加入最愛'}：${x.place}`);
    heart.setAttribute('aria-pressed',String(sampleFavorites.has(x.id)));heart.addEventListener('click',()=>toggleExampleFavorite(x.id));head.append(heart);body.append(head);
    body.append(el('div','example-eng',x.eng));
    body.append(el('p','example-note',x.note));
    const foot=el('div','example-footer');foot.append(el('span','example-frame-tag',`▧ ${frames.find(f=>f.id===x.frameId)?.name||'明信片邊框'}`));
    const more=el('button','','看介紹 ↗');more.type='button';more.addEventListener('click',()=>openSample(x));foot.append(more);body.append(foot);
    const photoCredit=el('div','example-credit');
    const a=el('a','',`照片：${x.photographer} · ${x.license} ↗`);a.href=x.photoPage;a.target='_blank';a.rel='noopener noreferrer';photoCredit.append(a);body.append(photoCredit);
    box.append(poster,body);return box;
  }
  function renderPersonalCard(card){
    const box=el('article','saved-card personal-card');const pic=el('img','saved-img');pic.src=card.image;
    pic.alt=`${card.place} 的自製明信片，邊框：${frames.find(f=>f.id===card.frameId)?.name||'自訂'}`;pic.loading='lazy';
    const body=el('div','saved-content');body.append(el('div','saved-country',`${card.country} · ${card.createdAt}　✦ 我的作品`));
    const head=el('div','saved-head');head.append(el('h3','',card.place));
    const heart=el('button','heart-btn',card.favorite?'♥':'♡');heart.type='button';heart.setAttribute('aria-label',`${card.favorite?'取消最愛':'加入最愛'}：${card.place}`);
    heart.setAttribute('aria-pressed',String(!!card.favorite));heart.addEventListener('click',()=>setFavorite(card.id));head.append(heart);body.append(head);
    body.append(el('p','',card.note||'把美好的一天，寫進自己的旅行故事。'));
    const actions=el('div','saved-footer');const down=el('button','','↓ 下載 JPG');down.type='button';down.addEventListener('click',()=>downloadData(card.image,`Postcard-${safeFilename(card.place)}.jpg`));
    const del=el('button','','刪除');del.type='button';del.addEventListener('click',()=>deleteCard(card.id));actions.append(down,del);
    body.append(actions);box.append(pic,body);return box;
  }
  function renderGallery(){
    renderCountries();const holder=$('galleryCards');holder.replaceChildren();
    const needle=searchText.toLocaleLowerCase();
    const matches=(x)=> (filteredCountry==='all'||x.country===filteredCountry)
      && (!needle||[x.place,x.eng||'',x.country,x.region||'',x.note||''].join(' ').toLocaleLowerCase().includes(needle));
    const sampleList=examples.filter(x=>matches(x)&&(!favoritesOnly||sampleFavorites.has(x.id)));
    const myList=saved.filter(x=>matches(x)&&(!favoritesOnly||x.favorite));
    $('countText').textContent=`世界景點範例 ${examples.length} 張・自己製作 ${saved.length} 張｜目前顯示 ${sampleList.length+myList.length} 張。`;
    const list=[...myList.map(x=>({kind:'personal',card:x})),...sampleList.map(x=>({kind:'sample',card:x}))];
    if(!list.length){const empty=el('div','empty');empty.append(el('div','empty-symbol','✉'),
      el('strong','','沒有符合條件的明信片'),el('p','','試試切換「全部明信片」、其他國家或搜尋字詞吧 ♡'));
      holder.append(empty);return;}
    for(const item of list)holder.append(item.kind==='personal'?renderPersonalCard(item.card):renderExampleCard(item.card));
  }
  function resetForm(){
    $('studioForm').reset();photo=null;chosenFrame=frames[0];$('uploadName').textContent='點我選擇一張照片';
    makeFrameButtons();refreshPreview();status('已清空，現在可以製作下一張明信片。');
  }
  function initialize(){
    if(!frames.length){status('無法載入邊框資料，請確認 frames.js 存在。');return;}
    makeFrameButtons();refreshPreview();renderGallery();
    $('photoInput').addEventListener('change',e=>loadFile(e.target.files?.[0]));
    const upload=$('uploadBox');
    upload.addEventListener('dragover',e=>{e.preventDefault();upload.classList.add('dragover');});
    upload.addEventListener('dragleave',()=>upload.classList.remove('dragover'));
    upload.addEventListener('drop',e=>{e.preventDefault();upload.classList.remove('dragover');loadFile(e.dataTransfer.files?.[0]);});
    for(const name of ['placeInput','countryInput','noteInput'])$(name).addEventListener('input',refreshPreview);
    $('studioForm').addEventListener('submit',e=>{e.preventDefault();if(!validPostcard){status('請先上傳照片並填寫旅行地點。');return;}
      refreshPreview();status('✦ 明信片已生成！可以下載 PNG，或存進你的本機收藏牆。');
      $('postcardCanvas').scrollIntoView({behavior:'smooth',block:'center'});
    });
    $('downloadBtn').addEventListener('click',downloadPostcard);
    $('saveBtn').addEventListener('click',savePostcard);
    $('resetBtn').addEventListener('click',resetForm);
    $('searchInput').addEventListener('input',e=>{searchText=e.target.value.trim();renderGallery();});
    $('favoritesBtn').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;$('favoritesBtn').setAttribute('aria-pressed',String(favoritesOnly));renderGallery();});
    $('closeDialog').addEventListener('click',()=>$('sampleDialog').close());
    $('sampleDialog').addEventListener('click',e=>{if(e.target===$('sampleDialog'))$('sampleDialog').close();});
  }
  initialize();
})();
