// utils/ErrorHandler.js
// ⚠️ Sistema centralizado de notificaciones de error

class ErrorHandler {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    initContainer() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('error-container')) {
            const container = document.createElement('div');
            container.id = 'error-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-md';
            document.body.appendChild(container);
            this.container = container;
        }
    }

    show(message, type = 'error', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `
            p-4 rounded-lg shadow-lg border flex items-start gap-3
            transform transition-all duration-300 translate-x-0
            ${type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
            ${type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
        `;

        const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : '⚡';

        notification.innerHTML = `
            <span class="text-2xl">${icon}</span>
            <div class="flex-1">
                <p class="font-semibold text-sm">${type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Aviso'}</p>
                <p class="text-xs mt-1">${message}</p>
            </div>
            <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
        `;

        this.container.appendChild(notification);

        // Auto-remover después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    error(message) {
        this.show(message, 'error');
    }

    success(message) {
        this.show(message, 'success');
    }

    warning(message) {
        this.show(message, 'warning');
    }
}

const errorHandler = new ErrorHandler();

// Exportar funciones helper
export const showError = (msg) => errorHandler.error(msg);
export const showSuccess = (msg) => errorHandler.success(msg);
export const showWarning = (msg) => errorHandler.warning(msg);

export default errorHandler;