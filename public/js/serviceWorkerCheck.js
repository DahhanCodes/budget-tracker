function sWCheck() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(() => console.log('Service Worker registered successfully.'))
            .catch(function (err) {
                console.log('Service Worker registration failed:', error)
            }
            );
    }
};