// app.js
// 🚀 Punto de entrada de la aplicación (CORREGIDO)

import KanbanBoard from './modules/kanban/KanbanBoard.js';
import OrderDrawer from './modules/drawer/OrderDrawer.js';
import FilterManager from './modules/filters/FilterManager.js';
import stateManager from './core/StateManager.js';

class App {
    constructor() {
        this.modules = {};
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando WOOD PRO v2.0...');

        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        try {
            // Verificar que los elementos necesarios existen
            const board = document.getElementById('board');
            const drawer = document.getElementById('orderDrawer');
            const overlay = document.getElementById('drawerOverlay');

            if (!board) {
                console.error('❌ Elemento #board no encontrado');
                return;
            }

            if (!drawer || !overlay) {
                console.error('❌ Elementos del drawer no encontrados');
                return;
            }

            // Inicializar módulos
            console.log('📋 Inicializando Kanban...');
            this.modules.kanban = new KanbanBoard('board');

            console.log('📋 Inicializando Drawer...');
            this.modules.drawer = new OrderDrawer();

            console.log('🔍 Inicializando Filtros...');
            this.modules.filters = new FilterManager();

            console.log('✅ Aplicación iniciada correctamente');
            console.log('Estado inicial:', stateManager.getState());

        } catch (error) {
            console.error('❌ Error al iniciar aplicación:', error);
        }
    }

    // Método helper para debugging
    getState() {
        return stateManager.getState();
    }

    // Método helper para reiniciar
    restart() {
        console.log('🔄 Reiniciando aplicación...');
        this.modules = {};
        this.start();
    }
}

// Iniciar aplicación
const app = new App();

// Exponer globalmente para debugging
window.WOOD_PRO = app;
window.STATE = stateManager;

console.log('💡 Debug disponible en: window.WOOD_PRO y window.STATE');