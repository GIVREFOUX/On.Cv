import { LazyLoader } from './modules/lazyLoading.js';
import { FormHandler } from './modules/formHandler.js';
import { LoadingStateManager } from './modules/loadingState.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading state manager
    const loadingManager = new LoadingStateManager();

    // Initialize lazy loading
    const lazyLoader = new LazyLoader({
        rootMargin: '100px 0px',
        selector: '.lazy-image',
        placeholderSrc: 'assets/images/placeholder.jpg'
    });

    // Initialize form handler
    const formHandler = new FormHandler('contactForm', {
        loadingManager,
        successCallback: (result) => {
            // Custom success handling
            const toast = document.createElement('div');
            toast.className = 'toast toast--success';
            toast.textContent = result.message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        },
        errorCallback: (result) => {
            // Custom error handling
            const toast = document.createElement('div');
            toast.className = 'toast toast--error';
            toast.textContent = result.errors.join('\n');
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    });

    // Listen for lazy loading events
    document.addEventListener('imageLoaded', (e) => {
        console.log('Image loaded successfully:', e.detail.src);
    });

    document.addEventListener('imageError', (e) => {
        console.error('Image failed to load:', e.detail.src);
    });

    // Test if CSS is loaded
    const style = getComputedStyle(document.body);
    if (style.backgroundColor !== 'rgb(255, 250, 250)') { // var(--first-color-lighten)
        console.error('CSS not loaded properly!');
    }
}); 