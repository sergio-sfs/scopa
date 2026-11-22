const CACHE='scopa-v2';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:'reload'}).then(r=>c.put(f,r))))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
// Prima la rete (max 3 s), se offline o lenta usa la copia salvata
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request,{cache:'no-cache'}).then(r=>{if(r&&r.ok&&new URL(e.request.url).origin===location.origin)c.put(e.request,r.clone());return r;});
    if(!hit)return net;
    return Promise.race([net.catch(()=>hit),new Promise(res=>setTimeout(()=>res(hit),3000))]);
  })());
});
