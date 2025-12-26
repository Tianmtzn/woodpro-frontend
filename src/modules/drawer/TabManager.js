// modules/drawer/TabManager.js
// 🗂️ Gestor de pestañas del drawer

import { DOMHelpers } from '../../utils/DOMHelpers.js';

class TabManager {
    constructor(container) {
        this.container = container;
        this.currentTab = 'resumen';
        this.tabs = new Map();
    }

    // ✅ Registrar una pestaña
    register(tabName, renderFunction) {
        this.tabs.set(tabName, renderFunction);
    }

    // ✅ Cambiar de pestaña
    switchTo(tabName) {
        if (!this.tabs.has(tabName)) {
            console.warn(`Tab "${tabName}" no está registrada`);
            return;
        }

        this.currentTab = tabName;
        this.updateUI();
        this.renderContent(tabName);
    }

    // 🎨 Actualizar la UI de los botones
    updateUI() {
        const buttons = DOMHelpers.$$('.tab-btn', this.container);
        
        buttons.forEach(btn => {
            const isActive = btn.dataset.tab === this.currentTab;
            
            if (isActive) {
                btn.classList.add('active', 'border-b-2', 'border-amber-500', 'text-slate-800', 'font-bold');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.remove('active', 'border-b-2', 'border-amber-500', 'text-slate-800', 'font-bold');
                btn.classList.add('text-slate-400');
            }
        });
    }

    // 🎨 Renderizar el contenido de la pestaña activa
    renderContent(tabName) {
        const contentContainer = DOMHelpers.$('#drawer-content', this.container);
        if (!contentContainer) return;

        const renderFunction = this.tabs.get(tabName);
        if (renderFunction) {
            contentContainer.innerHTML = renderFunction();
        }
    }

    // 🔄 Re-renderizar la pestaña actual
    refresh() {
        this.renderContent(this.currentTab);
    }

    // ✅ Obtener la pestaña actual
    getCurrent() {
        return this.currentTab;
    }
}

export default TabManager;