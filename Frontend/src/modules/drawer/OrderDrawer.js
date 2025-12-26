// modules/drawer/OrderDrawer.js
// 📋 Panel lateral con tabs (CORREGIDO)

import stateManager from '../../core/StateManager.js';
import apiClient from '../../core/APIClient.js';
import eventBus from '../../core/EventBus.js';
import { DOMHelpers } from '../../utils/DOMHelpers.js';
import { showSuccess } from '../../utils/ErrorHandler.js';

class OrderDrawer {
    constructor() {
        this.drawer = document.getElementById('orderDrawer');
        this.overlay = document.getElementById('drawerOverlay');
        this.currentTab = 'resumen';
        this.currentPedido = null;
        
        this.init();
    }

    init() {
        // Escuchar evento de EventBus
        eventBus.on('openDrawer', (pedido) => {
            this.open(pedido);
        });

        // Cerrar con overlay
        this.overlay?.addEventListener('click', () => this.close());
    }

    open(pedido) {
        this.currentPedido = pedido;
        this.currentTab = 'resumen';
        this.render();
        
        this.drawer.classList.add('open');
        this.overlay.classList.add('open');
        
        stateManager.setState('ui.drawerAbierto', true);
        stateManager.setState('ui.pedidoActual', pedido);
    }

    close() {
        this.drawer.classList.remove('open');
        this.overlay.classList.remove('open');
        
        stateManager.setState('ui.drawerAbierto', false);
        stateManager.setState('ui.pedidoActual', null);
    }

    render() {
        const { id, cliente_mueble, deadline, prioridad, notas, tareas } = this.currentPedido;

        this.drawer.innerHTML = `
            <div class="p-6 h-full flex flex-col">
                <!-- HEADER -->
                <div class="flex justify-between items-start border-b pb-4 mb-4">
                    <div class="flex-1 pr-4">
                        <label class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            Nombre del Proyecto / Cliente
                        </label>
                        <input type="text" 
                               id="drawer-nombre"
                               value="${cliente_mueble}" 
                               class="w-full text-xl font-bold text-slate-800 border-none bg-transparent 
                                      focus:ring-2 focus:ring-amber-500/20 rounded px-1 -ml-1 transition-all">
                        <div class="text-[10px] text-slate-400 mt-1">ID Pedido: #${id}</div>
                    </div>
                    <button id="drawer-close" class="text-3xl text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                
                <!-- TABS -->
                <div class="flex gap-4 border-b text-sm mb-4">
                    <button data-tab="resumen" class="tab-btn active border-b-2 border-amber-500 pb-2 font-bold text-slate-800">
                        Resumen
                    </button>
                    <button data-tab="materiales" class="tab-btn text-slate-400 pb-2">
                        Materiales
                    </button>
                    <button data-tab="archivos" class="tab-btn text-slate-400 pb-2">
                        Archivos
                    </button>
                </div>

                <!-- CONTENIDO -->
                <div id="drawer-content" class="flex-1 overflow-y-auto pr-2">
                    ${this.renderTab('resumen')}
                </div>

                <!-- FOOTER -->
                <div class="border-t pt-4 mt-auto">
                    <button id="btn-delete" 
                            class="w-full py-2 px-4 border border-red-200 text-red-500 text-sm font-semibold 
                                   rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                        <span>🗑️</span> Eliminar Pedido
                    </button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTab(tabName) {
        const { id, deadline, prioridad, notas, tareas } = this.currentPedido;

        if (tabName === 'resumen') {
            const tareasHtml = (tareas || []).map((tarea, idx) => `
                <div class="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded border border-slate-100 mb-2">
                    <input type="checkbox" ${tarea.completada ? 'checked' : ''} 
                           data-tarea-index="${idx}"
                           class="tarea-checkbox w-4 h-4 accent-amber-500 cursor-pointer">
                    <span class="${tarea.completada ? 'line-through text-slate-400' : ''}">${tarea.nombre}</span>
                </div>
            `).join('');

            return `
                <div id="content-resumen" class="tab-pane">
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prioridad</label>
                            <select id="drawer-prioridad" class="w-full text-sm border-slate-200 rounded-lg bg-slate-50 focus:ring-amber-500">
                                <option value="p-low" ${prioridad === 'p-low' ? 'selected' : ''}>Baja</option>
                                <option value="p-normal" ${prioridad === 'p-normal' ? 'selected' : ''}>Normal</option>
                                <option value="p-high" ${prioridad === 'p-high' ? 'selected' : ''}>Alta (Urgente)</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha Límite</label>
                            <input type="date" id="drawer-deadline" value="${deadline || ''}"
                                   class="w-full text-sm border-slate-200 rounded-lg bg-slate-50">
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notas del Pedido</label>
                        <textarea id="drawer-notas"
                                  class="w-full border-slate-200 rounded-lg p-3 text-sm h-24 bg-slate-50 focus:ring-amber-500"
                        >${notas || ''}</textarea>
                    </div>

                    <div class="mb-6">
                        <label class="text-[10px] font-bold text-slate-400 uppercase block mb-2">Checklist de Producción</label>
                        ${tareasHtml || '<p class="text-xs text-slate-400 italic">No hay tareas.</p>'}
                    </div>
                </div>
            `;
        }

        if (tabName === 'materiales') {
            return `
                <div id="content-materiales" class="tab-pane">
                    <p class="text-sm text-slate-500 italic">Gestión de materiales próximamente...</p>
                </div>
            `;
        }

        if (tabName === 'archivos') {
            return `
                <div id="content-archivos" class="tab-pane">
                    <div class="dropzone-container">
                        <div class="text-slate-300 text-5xl mb-4">📄</div>
                        <p class="text-slate-500 text-sm">Sube aquí tus <span class="text-slate-700 font-bold">PDFs o Renders</span></p>
                        <input type="file" id="fileInput" class="hidden" multiple>
                    </div>
                    <div id="fileList" class="mt-4 space-y-2"></div>
                </div>
            `;
        }

        return '';
    }

    attachEvents() {
        const { id } = this.currentPedido;

        // Cerrar
        DOMHelpers.$('#drawer-close')?.addEventListener('click', () => this.close());

        // Tabs
        DOMHelpers.$$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Actualizar campos
        const updateField = async (field, value) => {
            await apiClient.actualizarPedido(id, { [field]: value });
            showSuccess('✅ Cambios guardados');
        };

        DOMHelpers.$('#drawer-nombre')?.addEventListener('blur', (e) => {
            updateField('cliente_mueble', e.target.value);
        });

        DOMHelpers.$('#drawer-prioridad')?.addEventListener('change', (e) => {
            updateField('prioridad', e.target.value);
        });

        DOMHelpers.$('#drawer-deadline')?.addEventListener('change', (e) => {
            updateField('deadline', e.target.value);
        });

        DOMHelpers.$('#drawer-notas')?.addEventListener('blur', (e) => {
            updateField('notas', e.target.value);
        });

        // Tareas
        DOMHelpers.$$('.tarea-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const index = parseInt(e.target.dataset.tareaIndex);
                const tareas = [...this.currentPedido.tareas];
                tareas[index].completada = e.target.checked;
                
                await apiClient.actualizarPedido(id, { tareas });
                showSuccess('✅ Tarea actualizada');
            });
        });

        // Eliminar
        DOMHelpers.$('#btn-delete')?.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de eliminar este pedido?')) {
                await apiClient.eliminarPedido(id);
                this.close();
                showSuccess('🗑️ Pedido eliminado');
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Actualizar botones
        DOMHelpers.$$('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            
            if (isActive) {
                btn.classList.add('active', 'border-b-2', 'border-amber-500', 'text-slate-800', 'font-bold');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.remove('active', 'border-b-2', 'border-amber-500', 'text-slate-800', 'font-bold');
                btn.classList.add('text-slate-400');
            }
        });

        // Actualizar contenido
        const content = DOMHelpers.$('#drawer-content');
        if (content) {
            content.innerHTML = this.renderTab(tabName);
            this.attachEvents();
        }
    }
}

export default OrderDrawer;