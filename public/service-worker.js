//used template from course work
const CACHE_NAME = "budget-tracker-v1";
const DATA_CACHE_NAME = 'data-budgettracker-cache';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/js/index.js",
    "/js/idb.js",
    "/css/styles.css",
    "/manifest.json",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png"

];

// Install the service worker
self.addEventListener('install', function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('Your files were precached successfully');
        return cache.addAll(FILES_TO_CACHE)
      })
    );
self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList =>{
            return Promise.all(
                keyList.map(key =>{
                if(key!== CACHE_NAME && key!== DATA_CACHE_NAME)
                {
                    console.log("Removing old cache data", key);
                    return caches.delete(key);
                }
                })
                );
           })
    );
           self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/transaction')) {
      console.log("[Service Worker] Fetch (data)", e.request.url);
        e.respondWith(
          caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
              return fetch(e.request)
                .then(response => {
                  // If internet connection is established
                  if (response.status === 200) {
                      //copy files and cache
                    cache.put(e.request.url, response.clone());
                  }
    
                  return response;
                })
                //if there is no internet it will catch error
                .catch(err => {
                    //since no internet it will view the chached data that matches the req.
                  return cache.match(e.request);
                });
            })
            //if error occurs log error
            .catch(err => console.log(err))
        );
    
        return;
      }
    
      e.respondWith(
        fetch(e.request).catch(function() {
          return caches.match(e.request).then(function(response) {
            if (response) {
              return response;
            } else if (e.request.headers.get('accept').includes('text/html')) {
              // return the cached home page for all requests for html pages
              return caches.match('/');
            }
          });
        })
      );
  
});