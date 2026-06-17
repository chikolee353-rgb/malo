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
        if(res.ok){const json=await res.json();tracks.push({id:Date.now()+Math.random(),name:json.name,url:json.url});continue}
      }catch(e){console.warn('Upload failed, falling back to local',e)}
    }
    const data=await fileToDataURL(f)
    tracks.push({id:Date.now()+Math.random(),name:f.name,data})
  }
  storage.set(STORAGE_KEYS.MUSIC,tracks);renderMusic();renderFeatured()
}

function renderMusic(){
  const list=$("#music-list");list.innerHTML='';
  const tracks=storage.get(STORAGE_KEYS.MUSIC)
  tracks.forEach(t=>{
    const el=document.createElement('div')
    const src = t.data || t.url || ''
    el.innerHTML=`<strong>${t.name}</strong><br><audio controls src="${src}"></audio>`
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
        if(res.ok){const json=await res.json();photos.push({id:Date.now()+Math.random(),name:json.name,url:json.url});continue}
      }catch(e){console.warn('Photo upload failed, using local fallback',e)}
    }
    const data=await fileToDataURL(f)
    photos.push({id:Date.now()+Math.random(),name:f.name,data})
  }
  storage.set(STORAGE_KEYS.PHOTOS,photos);renderPhotos();renderFeatured()
}

function renderPhotos(){
  const grid=$("#photo-grid");grid.innerHTML=''
  const photos=storage.get(STORAGE_KEYS.PHOTOS)
  photos.forEach(p=>{
    const img=document.createElement('img');img.src=p.data || p.url;img.alt=p.name
    grid.appendChild(img)
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
        if(res.ok){const json=await res.json();videos.push({id:Date.now()+Math.random(),name:json.name,url:json.url});continue}
      }catch(e){console.warn('Video upload failed, using local fallback',e)}
    }
    const data=await fileToDataURL(f)
    videos.push({id:Date.now()+Math.random(),name:f.name,data})
  }
  storage.set(STORAGE_KEYS.VIDEOS,videos);renderVideos();renderFeatured()
}

function renderVideos(){
  const list=$("#video-list");list.innerHTML=''
  const videos=storage.get(STORAGE_KEYS.VIDEOS)
  videos.forEach(v=>{
    const el=document.createElement('div')
    const src = v.data || v.url || ''
    el.innerHTML=`<strong>${v.name}</strong><br><video controls width="320" src="${src}"></video>`
    list.appendChild(el)
  })
}

// Featured on home
function renderFeatured(){
  const fm=$("#featured-music");fm.innerHTML=''
  storage.get(STORAGE_KEYS.MUSIC).slice(0,3).forEach(t=>{
    const d=document.createElement('div');d.innerHTML=`<strong>${t.name}</strong><br><audio controls src="${t.data}"></audio>`;fm.appendChild(d)
  })
  const fp=$("#featured-photos");fp.innerHTML=''
  storage.get(STORAGE_KEYS.PHOTOS).slice(0,6).forEach(p=>{const img=document.createElement('img');img.src=p.data;fp.appendChild(img)})
  const fv=$("#featured-videos");fv.innerHTML=''
  storage.get(STORAGE_KEYS.VIDEOS).slice(0,3).forEach(v=>{const d=document.createElement('div');d.innerHTML=`<strong>${v.name}</strong><br><video controls width="320" src="${v.data}"></video>`;fv.appendChild(d)})
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
  const ownerNumber='0780242465'
  const msg=`Hello%20Malvin,%0AI%20would%20like%20to%20book%20an%20advert:%0A${items}%0ATotal:%20$${total}%0APlease%20contact%20me.`
  const digits=ownerNumber.replace(/[^0-9]/g,'')
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

  // load existing
  storage.set(STORAGE_KEYS.MUSIC, storage.get(STORAGE_KEYS.MUSIC))
  storage.set(STORAGE_KEYS.PHOTOS, storage.get(STORAGE_KEYS.PHOTOS))
  storage.set(STORAGE_KEYS.VIDEOS, storage.get(STORAGE_KEYS.VIDEOS))
  storage.set(STORAGE_KEYS.CART, storage.get(STORAGE_KEYS.CART))

  renderMusic();renderPhotos();renderVideos();renderCart();renderFeatured()
}

document.addEventListener('DOMContentLoaded',init)
