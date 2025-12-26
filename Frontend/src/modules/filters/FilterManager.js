// modules/filters/FilterManager.js
// 🔍 Gestión centralizada de filtros (CORREGIDO)

import stateManager from '../../core/StateManager.js';
import { DOMHelpers } from '../../utils/DOMHelpers.js';

class FilterManager {
    constructor() {
        this.searchInput = null;
        this.filterButtons = [];
        this.init();
    }

    init() {
        // Buscar elementos en el DOM
        this.searchInput = document.getElementById('globalSearch');
        this.filterButtons = Array.from(document.querySelectorAll('.filter-btn'));

        if (!this.searchInput) {
            console.warn('⚠️ Input de búsqueda no encontrado');
            return;
        }

        // Event listener para búsqueda
        this.searchInput.addEventListener('input', (e) => {
            stateManager.setState('filtros.busqueda', e.target.value.toLowerCase());
        });

        // Event listeners para botones de filtro
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tipo = btn.id.replace('btn-', '');
                this.setFilter(tipo);
            });
        });

        // Suscribirse a cambios de filtros
        stateManager.subscribe('filtros', (filtros) => {
            this.updateUI(filtros.tipo);
        });

        console.log('✅ FilterManager inicializado');
    }

    setFilter(tipo) {
        stateManager.setState('filtros.tipo', tipo);
    }

    updateUI(activeTipo) {
        this.filterButtons.forEach(btn => {
            const btnTipo = btn.id.replace('btn-', '');
            
            if (btnTipo === activeTipo) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    reset() {
        stateManager.setState('filtros.tipo', 'all');
        stateManager.setState('filtros.busqueda', '');
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }
}

export default FilterManager;