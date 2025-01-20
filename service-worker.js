self.addEventListener("install", (event) => {
  console.log("Service Worker installato.");
  event.waitUntil(
    caches
      .open("v1")
      .then((cache) => {
        return cache.addAll([
          "/",
          "/index.html",
          "css/styles.css",
          "css/forbidden.css",
          "js/animation.js",
          "js/forbidden.js",
          "js/main.js",
          "js/rest.js",
        ]);
      })
      .catch((error) => {
        console.error("Errore durante il caching dei file:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== "v1") {
            console.log("Eliminazione della vecchia cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch((error) => {
          console.error("Fetch fallito per:", event.request.url, error);
          // Puoi restituire una risposta alternativa in caso di errore, ad esempio una pagina offline:
          return new Response(
            `<h1>Offline</h1><p>Impossibile caricare la risorsa: ${event.request.url}</p>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
      );
    })
  );
});
