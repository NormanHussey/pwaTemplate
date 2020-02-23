// Select the install button and store it in a variable
const installButton = document.querySelector('#installButton');

// Check for the ability to load a service worker in the browser
if ('serviceWorker' in navigator) {
    // Add a listener for the load event
    window.addEventListener('load', function () {
        // Register the service worker (sw.js) with the browser
        // This returns a promise
        navigator.serviceWorker.register('./sw.js')
        .then(function (response) {
            // If the promise is successful, log it out to the console. This is for debugging purposes only and should be removed when the app goes to production
            console.log('SW Registration Successful!', response);
        }).catch(function (error) {
            // If the promise is rejected, catch the error so that it does not hold up the application and log it to the console
            console.log('SW Registration Unsuccessful!', error);
        });
    });
}

// Prepare a variable to store the install prompt event
let deferredPrompt;

// Add a listener to the event that calls before an install prompt is about to happen
window.addEventListener('beforeinstallprompt', function (event) {
    // Prevent the default install prompt from popping up
    // When working in a Chrome browser, this is not technically necessary because Chrome has its own install prompt event which will pop up automatically and ask the user if they want to install the app
    // However, other browsers do not have this prompt so we are going to make our own custom prompt event that will work on every browser
    // Therefore, we must prevent Chrome from using its default so that we don't have multiple prompts firing and so that the user experience is the same on every browser
    event.preventDefault();
    // This log is for debugging purposes and should be removed before production
    console.log('before install prompt fired');
    // Store the prompt into the variable we created
    deferredPrompt = event;
    // Unhide the install button so that the user may interact with it
    // Browsers other than Chrome require that the user must interact with the page in some way before they will offer the option of performing an install so therefore we must provide some interaction for those that want to install our app
    // In this case, I have just made a button with display none on it initially and then I remove the display none once the install prompt has been stored in our variable
    // If we don't do something like this then it is possible that the user might be able to click the install button before the install prompt is ready and therefore will never be able to trigger that prompt
    // You can choose any method you like to show the button, such as modal popup perhaps, and you may even want to wait a set period of time before showing that it doesn't disrupt the user while they are in the middle of a task. This will depend on your app's functionality and is up to your discretion and styling sensibility.
    installButton.classList.remove('hidden');
});

// Add a listener for when the install button has been clicked
installButton.addEventListener('click', function () {
    // Call the prompt function on the install event that we stored in a variable
    // This is what will trigger the browser's popup asking the user if they wish to install the app
    deferredPrompt.prompt();
    // The prompt will return a promise containing an outcome variable based on whether the user agreed to the install or not
    deferredPrompt.userChoice.then(function(choiceResult) {
        // This if statement is not necessary and in this case, is used for debugging purposes
        // However, depending on your app, you may want to add some functionality at this point
        // For example, you could fire some analytics at this point to let you know when a user has decided to install your app or you might want to show the user something (like a modal popup perhaps) that thanks them for installing the app
        // This entirely up to you but make sure to remove the console log before the app goes to production
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        }
        // Set the install event variable to null because we no longer need it
        // It is important to know that if a user declines the install then you are not able to ask them again until the page is reloaded. This is a built-in aspect of browser security/privacy and cannot be changed. 
        deferredPrompt = null;
    });
    // Now that the installation prompt has been finished (whether it was accepted or not) hide the install button again because it no longer has any functionality
    installButton.classList.add('hidden');
});

// We have one more loose end to tie up. If the user has installed the app and is now using our PWA, we need to make sure the install button remains hidden. Otherwise, they will be presented with an install button every time they open the app even though they have already installed it. The button wouldn't work of course so it would be pretty bad app design to have a button that doesn't work. Not to mention, this would probably confuse the user as to whether they successfully installed the app.
// The window.matchMedia() function checks for certain properties on the window itself. For example, you can use this function if you need to check whether the user is currently in a specific screen-size or screen orientation (like portrait or landscape). It's like a CSS media query but for Javascript.
// In our case, we are going to check if the window is in the "standalone" display mode which only occurs when it is being run as a PWA.
if (window.matchMedia('(display-mode: standalone)').matches) {  
    // If the window is in standalone mode then our user has installed in this app and is currently using it as a PWA
    // Therefore, we want to hide the install button so that they never see it after installation.
    installButton.classList.add('hidden');
}