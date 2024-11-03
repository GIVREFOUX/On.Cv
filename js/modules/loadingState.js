export class LoadingStateManager {
    constructor() {
        this.loadingStates = new Map();
    }

    startLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        this.loadingStates.set(elementId, true);
        element.classList.add('is-loading');
        element.setAttribute('aria-busy', 'true');
    }

    stopLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        this.loadingStates.delete(elementId);
        element.classList.remove('is-loading');
        element.setAttribute('aria-busy', 'false');
    }

    isLoading(elementId) {
        return this.loadingStates.get(elementId) || false;
    }
} 