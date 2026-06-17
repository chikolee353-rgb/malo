const STORAGE_KEYS = {MUSIC:'musicTracks',PHOTOS:'photos',VIDEOS:'videos',CART:'cart'}

function $(s){return document.querySelector(s)}
function $all(s){return Array.from(document.querySelectorAll(s))}

// Tabs / nav behavior
function activateTabByName(tab){
  // if a .tab with that id exists, show/hide tabs
  const tabEl = document.getElementById(tab)
  if(tabEl && tabEl.classList.contains('tab')){
    $all('nav button').forEach(x=>x.classList.toggle('active', x.dataset.tab===tab))
    $all('.tab').forEach(t=>t.classList.toggle('active', t.id===tab))
    // scroll into view
    tabEl.scrollIntoView({behavior:'smooth'})
    return
  }
  // otherwise try to find any section with that id and scroll to it
  if(tabEl){ tabEl.scrollIntoView({behavior:'smooth'}); return }
  const el = document.querySelector('#'+tab)
  if(el) el.scrollIntoView({behavior:'smooth'})
}

$all('nav button').forEach(b=>b.addEventListener('click',()=>{ activateTabByName(b.dataset.tab) }))

// Storage helpers
const storage = {
  get(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return[]}},
  set(key,val){localStorage.setItem(key,JSON.stringify(val))}
}

// Utilities
function fileToDataURL(file){return new Promise((res,rej)=>{
  const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)
})}

let USE_SERVER = false
async function checkServer(){
  try{
    const r = await fetch('/api/ping')
    if(r.ok){USE_SERVER=true;console.log('Server available for uploads')}
  }catch(e){USE_SERVER=false}
}

// Music
async function handleMusic(files){
  const tracks=storage.get(STORAGE_KEYS.MUSIC)
  for(const f of files){
    if(USE_SERVER){
      try{
        const form=new FormData();form.append('file',f)
        const res=await fetch(`/api/upload?type=music`,{method:'POST',body:form})
        if(res.ok){const json=await res.json();tracks.push({id:Date.now()+Math.random(),name:json.name,url:json.url,createdAt:Date.now(),likes:0,comments:[]});continue}
      }catch(e){console.warn('Upload failed, falling back to local',e)}
    }
    const data=await fileToDataURL(f)
    tracks.push({id:Date.now()+Math.random(),name:f.name,data,createdAt:Date.now(),likes:0,comments:[]})
  }
  storage.set(STORAGE_KEYS.MUSIC,tracks);renderMusic();renderFeatured()
}

function renderMusic(){
  const list=$("#music-list");list.innerHTML='';
  const tracks=storage.get(STORAGE_KEYS.MUSIC)
  tracks.forEach(t=>{
    const el=document.createElement('div');el.className='media-item'
    const src = t.data || t.url || ''
    el.innerHTML=`
      <div class="media-header"><strong>${t.name}</strong><span class="type-badge">Music</span></div>
      <div class="media-wrapper"><audio controls src="${src}"></audio></div>
      <div class="item-actions">
        <button class="like-button" data-id="${t.id}">Like <span>${t.likes||0}</span></button>
        <button class="comment-toggle" data-id="${t.id}">Comments <span>${(t.comments||[]).length}</span></button>
      </div>
      <div class="comments hidden" id="comments-${t.id}">
        <div class="comment-list">${(t.comments||[]).map(c=>`<div class="comment"><strong>${c.name}:</strong> ${c.text}</div>`).join('')}</div>
        <form class="comment-form" data-id="${t.id}">
          <input type="text" name="comment" placeholder="Add a comment" autocomplete="off" />
          <button type="submit">Post</button>
        </form>
      </div>`
    list.appendChild(el)
  })
}

// Photos
async function handlePhotos(files){
  const photos=storage.get(STORAGE_KEYS.PHOTOS)
  for(const f of files){
    if(USE_SERVER){
      try{
        const form=new FormData();form.append('file',f)
        const res=await fetch(`/api/upload?type=photos`,{method:'POST',body:form})
        if(res.ok){const json=await res.json();photos.push({id:Date.now()+Math.random(),name:json.name,url:json.url,createdAt:Date.now(),likes:0,comments:[]});continue}
      }catch(e){console.warn('Photo upload failed, using local fallback',e)}
    }
    const data=await fileToDataURL(f)
    photos.push({id:Date.now()+Math.random(),name:f.name,data,createdAt:Date.now(),likes:0,comments:[]})
  }
  storage.set(STORAGE_KEYS.PHOTOS,photos);renderPhotos();renderFeatured()
}

function renderPhotos(){
  const grid=$("#photo-grid");grid.innerHTML=''
  const photos=storage.get(STORAGE_KEYS.PHOTOS)
  photos.forEach(p=>{
    const item=document.createElement('div');item.className='media-item'
    item.innerHTML=`
      <div class="media-header"><strong>${p.name}</strong><span class="type-badge">Photo</span></div>
      <div class="media-wrapper"><img class="media-photo" src="${p.data || p.url}" alt="${p.name}" /></div>
      <div class="item-actions">
        <button class="like-button" data-id="${p.id}">Like <span>${p.likes||0}</span></button>
        <button class="comment-toggle" data-id="${p.id}">Comments <span>${(p.comments||[]).length}</span></button>
      </div>
      <div class="comments hidden" id="comments-${p.id}">
        <div class="comment-list">${(p.comments||[]).map(c=>`<div class="comment"><strong>${c.name}:</strong> ${c.text}</div>`).join('')}</div>
        <form class="comment-form" data-id="${p.id}">
          <input type="text" name="comment" placeholder="Add a comment" autocomplete="off" />
          <button type="submit">Post</button>
        </form>
      </div>`
    grid.appendChild(item)
  })
}

// Videos
async function handleVideos(files){
  const videos=storage.get(STORAGE_KEYS.VIDEOS)
  for(const f of files){
    if(USE_SERVER){
      try{
        const form=new FormData();form.append('file',f)
        const res=await fetch(`/api/upload?type=videos`,{method:'POST',body:form})
        if(res.ok){const json=await res.json();videos.push({id:Date.now()+Math.random(),name:json.name,url:json.url,createdAt:Date.now(),likes:0,comments:[]});continue}
      }catch(e){console.warn('Video upload failed, using local fallback',e)}
    }
    const data=await fileToDataURL(f)
    videos.push({id:Date.now()+Math.random(),name:f.name,data,createdAt:Date.now(),likes:0,comments:[]})
  }
  storage.set(STORAGE_KEYS.VIDEOS,videos);renderVideos();renderFeatured()
}

function renderVideos(){
  const list=$("#video-list");list.innerHTML=''
  const videos=storage.get(STORAGE_KEYS.VIDEOS)
  videos.forEach(v=>{
    const el=document.createElement('div');el.className='media-item'
    const src = v.data || v.url || ''
    el.innerHTML=`
      <div class="media-header"><strong>${v.name}</strong><span class="type-badge">Video</span></div>
      <div class="media-wrapper"><video controls width="100%" src="${src}"></video></div>
      <div class="item-actions">
        <button class="like-button" data-id="${v.id}">Like <span>${v.likes||0}</span></button>
        <button class="comment-toggle" data-id="${v.id}">Comments <span>${(v.comments||[]).length}</span></button>
      </div>
      <div class="comments hidden" id="comments-${v.id}">
        <div class="comment-list">${(v.comments||[]).map(c=>`<div class="comment"><strong>${c.name}:</strong> ${c.text}</div>`).join('')}</div>
        <form class="comment-form" data-id="${v.id}">
          <input type="text" name="comment" placeholder="Add a comment" autocomplete="off" />
          <button type="submit">Post</button>
        </form>
      </div>`
    list.appendChild(el)
  })
}

// Featured on home
function renderFeatured(){
  const fm=$("#featured-music");fm.innerHTML=''
  const musicItems=storage.get(STORAGE_KEYS.MUSIC).slice(0,3)
  if(musicItems.length===0){fm.innerHTML='<div class="media-item"><div class="media-header"><strong>No featured music yet</strong></div><div class="media-wrapper"><p>Upload music in the Music tab to see it here.</p></div></div>'}
  else{musicItems.forEach(t=>{
    const d=document.createElement('div');d.className='media-item';d.innerHTML=`<div class="media-header"><strong>${t.name}</strong><span class="type-badge">Music</span></div><div class="media-wrapper"><audio controls src="${t.data || t.url}"></audio></div>`;fm.appendChild(d)
  })}

  const fp=$("#featured-photos");fp.innerHTML=''
  const photoItems=storage.get(STORAGE_KEYS.PHOTOS).slice(0,6)
  if(photoItems.length===0){fp.innerHTML='<div class="media-item"><div class="media-header"><strong>No featured photos yet</strong></div><div class="media-wrapper"><p>Upload photos in the Photos tab to see them here.</p></div></div>'}
  else{photoItems.forEach(p=>{const d=document.createElement('div');d.className='media-item';d.innerHTML=`<div class="media-header"><strong>${p.name}</strong><span class="type-badge">Photo</span></div><div class="media-wrapper"><img class="media-photo" src="${p.data || p.url}" alt="${p.name}" /></div>`;fp.appendChild(d)})}

  const fv=$("#featured-videos");fv.innerHTML=''
  const videoItems=storage.get(STORAGE_KEYS.VIDEOS).slice(0,3)
  if(videoItems.length===0){fv.innerHTML='<div class="media-item"><div class="media-header"><strong>No featured videos yet</strong></div><div class="media-wrapper"><p>Upload videos in the Videos tab to see them here.</p></div></div>'}
  else{videoItems.forEach(v=>{const d=document.createElement('div');d.className='media-item';d.innerHTML=`<div class="media-header"><strong>${v.name}</strong><span class="type-badge">Video</span></div><div class="media-wrapper"><video controls width="100%" src="${v.data || v.url}"></video></div>`;fv.appendChild(d)})}
}

function updateStorageItem(key,item){
  const items = storage.get(key).map(x=>x.id===item.id?item:x)
  storage.set(key,items)
}

function normalizeStorageList(key){
  const items = storage.get(key).map(item=>({
    ...item,
    createdAt:item.createdAt||Date.now(),
    likes:item.likes||0,
    comments:Array.isArray(item.comments)?item.comments:[]
  }))
  storage.set(key, items)
}

function toggleLike(id){
  [STORAGE_KEYS.MUSIC,STORAGE_KEYS.PHOTOS,STORAGE_KEYS.VIDEOS].forEach(key=>{
    const items=storage.get(key)
    const item=items.find(x=>String(x.id)===String(id))
    if(item){
      item.likes=(item.likes||0)+1
      updateStorageItem(key,item)
    }
  })
  renderMusic();renderPhotos();renderVideos();renderCommunity();renderFeatured()
}

function toggleComments(id){
  const section=document.getElementById(`comments-${id}`)
  if(section) section.classList.toggle('hidden')
}

function addComment(id,text){
  [STORAGE_KEYS.MUSIC,STORAGE_KEYS.PHOTOS,STORAGE_KEYS.VIDEOS].forEach(key=>{
    const items=storage.get(key)
    const item=items.find(x=>String(x.id)===String(id))
    if(item){
      item.comments=item.comments||[]
      item.comments.push({name:'Guest',text})
      updateStorageItem(key,item)
    }
  })
  renderMusic();renderPhotos();renderVideos();renderCommunity();renderFeatured()
}

function renderCommunity(){
  const feed=$("#community-feed");feed.innerHTML=''
  const combined=[
    ...storage.get(STORAGE_KEYS.MUSIC).map(i=>({...i,type:'Music'})),
    ...storage.get(STORAGE_KEYS.PHOTOS).map(i=>({...i,type:'Photo'})),
    ...storage.get(STORAGE_KEYS.VIDEOS).map(i=>({...i,type:'Video'}))
  ].sort((a,b)=>b.createdAt - a.createdAt)
  combined.forEach(item=>{
    const src=item.data||item.url||''
    let mediaHTML=''
    if(item.type==='Music') mediaHTML=`<audio controls src="${src}"></audio>`
    else if(item.type==='Photo') mediaHTML=`<img class="media-photo" src="${src}" alt="${item.name}" />`
    else if(item.type==='Video') mediaHTML=`<video controls width="100%" src="${src}"></video>`
    const el=document.createElement('div');el.className='media-item'
    el.innerHTML=`
      <div class="media-header"><strong>${item.name}</strong><span class="type-badge">${item.type}</span></div>
      <div class="media-wrapper">${mediaHTML}</div>
      <div class="item-actions">
        <button class="like-button" data-id="${item.id}">Like <span>${item.likes||0}</span></button>
        <button class="comment-toggle" data-id="${item.id}">Comments <span>${(item.comments||[]).length}</span></button>
      </div>
      <div class="comments hidden" id="comments-${item.id}">
        <div class="comment-list">${(item.comments||[]).map(c=>`<div class="comment"><strong>${c.name}:</strong> ${c.text}</div>`).join('')}</div>
        <form class="comment-form" data-id="${item.id}">
          <input type="text" name="comment" placeholder="Add a comment" autocomplete="off" />
          <button type="submit">Post</button>
        </form>
      </div>`
    feed.appendChild(el)
  })
}

// Advertisement / Cart
function addToCart(name,price){
  const cart=storage.get(STORAGE_KEYS.CART)
  cart.push({id:Date.now()+Math.random(),name,price:parseFloat(price)})
  storage.set(STORAGE_KEYS.CART,cart);renderCart()
}

function renderCart(){
  const el=$("#cart");el.innerHTML=''
  const cart=storage.get(STORAGE_KEYS.CART)
  if(cart.length===0){el.textContent='Cart is empty';return}
  const ul=document.createElement('ul')
  let total=0
  cart.forEach(item=>{total+=item.price;const li=document.createElement('li');li.textContent=`${item.name} — $${item.price.toFixed(2)}`;ul.appendChild(li)})
  el.appendChild(ul)
  const t=document.createElement('div');t.innerHTML=`<strong>Total: $${total.toFixed(2)}</strong>`;el.appendChild(t)
}

function clearCart(){storage.set(STORAGE_KEYS.CART,[]);renderCart()}

function checkoutWhatsApp(){
  const cart=storage.get(STORAGE_KEYS.CART)
  if(cart.length===0){alert('Cart is empty');return}
  const items=cart.map(c=>`${c.name} ($${c.price.toFixed(2)})`).join('%0A')
  const total=cart.reduce((s,i)=>s+i.price,0).toFixed(2)
  const ownerNumber='+263780242465'
  const msg=`Hello%20Malvin,%0AI%20would%20like%20to%20book%20an%20advert:%0A${items}%0ATotal:%20$${total}%0APlease%20contact%20me.`
  const digits=ownerNumber.replace(/\D/g,'')
  const url=`https://wa.me/${digits}?text=${msg}`
  window.open(url,'_blank')
}

// Init
function init(){
  checkServer()
  // wire inputs
  $('#music-input').addEventListener('change',e=>handleMusic(e.target.files))
  $('#photo-input').addEventListener('change',e=>handlePhotos(e.target.files))
  $('#video-input').addEventListener('change',e=>handleVideos(e.target.files))
  // ad buttons
  $all('.ad button').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.name,b.dataset.price)))
  $('#clear-cart').addEventListener('click',clearCart)
  $('#checkout').addEventListener('click',checkoutWhatsApp)

  // hero CTA buttons: navigate or scroll to section
  $all('.cta').forEach(b=>b.addEventListener('click',()=>{
    const tab=b.dataset.tab
    if(tab) activateTabByName(tab)
  }))

  $('#show-all-music').addEventListener('click',()=>{
    activateTabByName('listen')
    const list=$('#music-list')
    if(list) list.scrollIntoView({behavior:'smooth'})
  })

  $('#show-all-videos').addEventListener('click',()=>{
    activateTabByName('videos')
    const list=$('#video-list')
    if(list) list.scrollIntoView({behavior:'smooth'})
  })

  // comment and like actions
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.like-button')
    if(btn){
      e.preventDefault();const id=btn.dataset.id;toggleLike(id);return
    }
    const cbtn=e.target.closest('.comment-toggle')
    if(cbtn){
      e.preventDefault();const id=cbtn.dataset.id;toggleComments(id);return
    }
  })
  document.addEventListener('submit',e=>{
    const form=e.target.closest('.comment-form')
    if(!form) return
    e.preventDefault();const id=form.dataset.id;const input=form.querySelector('input[name="comment"]')
    if(input && input.value.trim()){addComment(id,input.value.trim());input.value='';}
  })

  // load existing
  normalizeStorageList(STORAGE_KEYS.MUSIC)
  normalizeStorageList(STORAGE_KEYS.PHOTOS)
  normalizeStorageList(STORAGE_KEYS.VIDEOS)
  storage.set(STORAGE_KEYS.CART, storage.get(STORAGE_KEYS.CART))

  renderMusic();renderPhotos();renderVideos();renderCommunity();renderCart();renderFeatured()
}

document.addEventListener('DOMContentLoaded',init)
