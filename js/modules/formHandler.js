export class FormHandler {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.loadingManager = options.loadingManager;
        this.options = {
            endpoint: 'php/contact.php',
            successCallback: null,
            errorCallback: null,
            ...options
        };

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupValidation();
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                input.classList.add('is-invalid');
            });

            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                if (input.checkValidity()) {
                    input.classList.add('is-valid');
                }
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.loadingManager?.isLoading(this.form.id)) {
            return;
        }

        try {
            this.loadingManager?.startLoading(this.form.id);
            
            const formData = new FormData(this.form);
            const response = await fetch(this.options.endpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.handleSuccess(result);
            } else {
                this.handleError(result);
            }
        } catch (error) {
            this.handleError({ errors: ['Network error occurred. Please try again.'] });
        } finally {
            this.loadingManager?.stopLoading(this.form.id);
        }
    }

    handleSuccess(result) {
        this.form.reset();
        this.options.successCallback?.(result) || alert(result.message);
    }

    handleError(result) {
        const errorMessage = result.errors?.join('\n') || 'An error occurred';
        this.options.errorCallback?.(result) || alert(errorMessage);
    }
} 