const staticChacename = "site-static-v12";
const dynamicCacheName = "site-dynamic-v14";
const assets = [
    "/",
    "/index.html",
    "/pages/fallback.html",
    "/manifest.json",
    "js/app.js",
    "js/ui.js",
    "js/materialize.min.js",
    "img/dish.png",
    "css/styles.css",
    "css/materialize.min.css",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2"

];
//limit cache size
const limitCacheSize = (name, size)=>{
    caches.open(name).then((cache)=>{
        cache.keys().then((key)=>{
            if(key.length > size){
                cache.delete(key[0]).then(limitCacheSize(name, size));
            }
        })
    });
}
//install service worker
self.addEventListener('install', evt => {
    //console.log('service worker has been woker installed.')
    evt.waitUntil(
        caches.open(staticChacename).then((cache)=>{
            cache.addAll(assets);
        })
    )
})

//activate service worker
self.addEventListener('activate', evt => {
    //console.log('service worker has been woker activated.')
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticChacename && key !== dynamicCacheName)
                .map(key => caches.delete(key) 
            ))
        })
    )
})

//fetch event 
self.addEventListener('fetch', evt => {
    if(evt.request.url.indexOf('firestore.googleapis.com') == -1)
    evt.respondWith(
        caches.match(evt.request).then((cacheRes)=>{
            return cacheRes || fetch(evt.request).then(fetchRes => {
                caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url,fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 15);
                    return fetchRes;
                } )
            })
        }).catch(()=> caches.match("/pages/fallback.html"))
    );
})