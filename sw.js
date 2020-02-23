// Provide a name and version number for the cache that your service worker will be using
const cacheName = 'cache-v1';
// Store all the assets of your app into an array so that it can be stored in the device's cache. This must include every HTML page, CSS file, and script file as well as any other assets you are using (images, music, etc.).
// Make sure to include the initial './' (as has been done below) as that is also recognized by the browser as the beginning of your page/app
const assets = [
    './',
    './index.html',
    './styles/styles.css',
    './scripts/setupPWA.js',
    './scripts/script.js',
    './assets/android-chrome-192x192.png',
    './assets/android-chrome-512x512.png',
    './assets/apple-touch-icon.png',
    './assets/favicon-16x16.png',
    './assets/favicon-32x32.png',
    './assets/favicon.ico',
    './assets/icon-192x192.png',
    './assets/icon-512x512.png',
];

// Add a listener to the install event which is triggered by the install button (this button's functionality is located in setupPWA.js)
self.addEventListener('install', function (event) {
    // This log is for debugging purposes and should be removed when the app goes to production
    console.log('Service Worker Install Event Fired!');
    // The waitUntil() function works similarly to jQuery's .when() function in that it will wait until all the promises have been returned before it fires the event. It is a very well-named function!
    event.waitUntil(
        // We use the .open() method to open the cached that we have named (yet another well-named function) in order to start placing our assets into it
        // This will return a promise
        caches.open(cacheName)
            .then(function (cache) {
                // When the promise is returned (ie. the cache has been opened), we will add all of our assets into it (vanilla Javascript truly has some great function names)
                return cache.addAll(assets);
                // Once this is complete, our assets are now stored on locally on the device therefore allowing our app to work offline
            })
    );
});

// Add a listener to the fetch event. Fetch is essentially vanilla Javascript's version of jQuery's $.ajax. Therefore this event will be fired when the app goes to search the internet for its assets
self.addEventListener('fetch', function (event) {
    // The respondWith() method of the fetch event prevents the browser's default fetch handling (similar to event.preventDefault()), and allows you to provide a custom promise to deal with the response.
    // Without this intervention, anytime the device is offline the app will automatically search the internet and then fail to load the assets when it can't get access rather than searching for the assets that we've already conveniently stored locally on the device's cache.
    event.respondWith(
        // The .match() function checks to see if the assets stored on the cache match the ones that fetch is looking for
        // This returns a promise
        caches.match(event.request)
            .then(function (cachedResource) {
                // Once the promise is returned, we need to check if it is successful.
                // The return function below is really just an IF statement that has been shortened
                // If the assets in the cache DO match the ones that fetch was requesting then return them
                // OR IF they DO NOT match (or are not present) then go to the internet and fetch them (in other words, proceed with the default behaviour that we interrupted with the .respondWith() function)
                return cachedResource || fetch(event.request);
            })
        );
});