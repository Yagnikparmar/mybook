const C='mybook-v15',F=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Cache first for instant start, refresh in the background for next time.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{
      if(r&&r.ok){
        const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));
        if(hit&&e.request.mode==='navigate'){
          const a=hit.headers.get('etag'),b=r.headers.get('etag');
          if(a&&b&&a!==b)self.clients.matchAll().then(l=>l.forEach(c=>c.postMessage('update')));
        }
      }
      return r;
    }).catch(()=>hit);
    return hit||net;
  }));
});
