// utils/LoadingManager.js
// ⏳ Gestor de estados de carga

class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.overlay = null;
        this.initOverlay();
    }

    // 🎨 Inicializar overlay global de carga
    initOverlay() {
        if (document.getElementById('global-loading')) return;

        const overlay = document.createElement('div');
        overlay.id = 'global-loading';
        overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] hidden items-center justify-center';
        overlay.innerHTML = `
            <div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                <div class="relative w-16 h-16">
                    <div class="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p class="text-slate-700 font-semibold text-sm" id="loading-message">Cargando...</p>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    // ✅ Mostrar loading global
    show(message = 'Cargando...') {
        if (!this.overlay) this.initOverlay();
        
        const messageEl = document.getElementById('loading-message');
        if (messageEl) messageEl.textContent = message;
        
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('flex');
    }

    // ✅ Ocultar loading global
    hide() {
        if (!this.overlay) return;
        
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('flex');
    }

    // 🎯 Loading en un elemento específico
    showInElement(element, size = 'md') {
        if (!element) return;

        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-8 h-8',
            lg: 'w-12 h-12'
        };

        const spinner = document.createElement('div');
        spinner.className = `loading-spinner flex items-center justify-center absolute inset-0 bg-white/80 backdrop-blur-sm z-10`;
        spinner.innerHTML = `
            <div class="relative ${sizeClasses[size]}">
                <div class="absolute inset-0 border-2 border-slate-200 rounded-full"></div>
                <div class="absolute inset-0 border-2 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        `;

        // Asegurar que el elemento tenga position relative
        const originalPosition = element.style.position;
        if (!originalPosition || originalPosition === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(spinner);
        this.loadingStates.set(element, spinner);
    }

    // 🎯 Ocultar loading de un elemento específico
    hideInElement(element) {
        if (!element) return;

        const spinner = this.loadingStates.get(element);
        if (spinner) {
            spinner.remove();
            this.loadingStates.delete(element);
        }
    }

    // 🎯 Loading inline (para botones)
    createInlineSpinner(size = 'sm') {
        const sizeClasses = {
            xs: 'w-3 h-3 border',
            sm: 'w-4 h-4 border-2',
            md: 'w-6 h-6 border-2'
        };

        const spinner = document.createElement('div');
        spinner.className = `inline-block ${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin`;
        return spinner;
    }

    // 🎯 Loading para botones
    setButtonLoading(button, isLoading, loadingText = 'Cargando...') {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `
                <span class="flex items-center justify-center gap-2">
                    ${this.createInlineSpinner('sm').outerHTML}
                    <span>${loadingText}</span>
                </span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }

    // 🧹 Limpiar todos los estados
    clearAll() {
        this.hide();
        this.loadingStates.forEach((spinner, element) => {
            spinner.remove();
        });
        this.loadingStates.clear();
    }
}

// Exportar instancia singleton
const loadingManager = new LoadingManager();
export default loadingManager;