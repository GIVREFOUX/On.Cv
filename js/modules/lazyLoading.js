export class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            loadingClass: 'loading',
            loadedClass: 'loaded',
            errorClass: 'error',
            selector: '.lazy-image',
            placeholderSrc: 'assets/images/placeholder.jpg',
            ...options
        };
        
        this.observer = null;
        this.retryCount = new Map();
        this.maxRetries = 3;
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.observerCallback(entries),
                {
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                }
            );
            
            this.observe();
            this.setupMutationObserver();
        } else {
            this.loadAllImages();
        }
    }
    
    setupMutationObserver() {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        const lazyImages = node.querySelectorAll(this.options.selector);
                        lazyImages.forEach(image => this.observe());
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    observe() {
        const images = document.querySelectorAll(this.options.selector);
        images.forEach(image => {
            if (image.classList.contains(this.options.loadedClass)) return;
            
            // Set placeholder if not already set
            if (!image.src) {
                image.src = this.options.placeholderSrc;
            }
            
            image.classList.add(this.options.loadingClass);
            this.observer.observe(image);
        });
    }
    
    observerCallback(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }
    
    async loadImage(image) {
        const src = image.dataset.src;
        if (!src) return;
        
        try {
            await this.preloadImage(src);
            image.src = src;
            image.classList.remove(this.options.loadingClass);
            image.classList.add(this.options.loadedClass);
            this.emit('imageLoaded', { image, src });
        } catch (error) {
            const retryCount = this.retryCount.get(src) || 0;
            if (retryCount < this.maxRetries) {
                this.retryCount.set(src, retryCount + 1);
                setTimeout(() => this.loadImage(image), 1000 * (retryCount + 1));
            } else {
                image.classList.remove(this.options.loadingClass);
                image.classList.add(this.options.errorClass);
                this.emit('imageError', { image, src, error });
            }
        }
    }
    
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }
    
    loadAllImages() {
        const images = document.querySelectorAll(this.options.selector);
        images.forEach(image => this.loadImage(image));
    }
    
    emit(eventName, data) {
        const event = new CustomEvent(eventName, { 
            detail: data,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }
    
    refresh() {
        this.observe();
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
} 