// modules/drawer/OrderDrawer.js
// 📋 Panel lateral completo con todas las funcionalidades

import stateManager from '../../core/StateManager.js';
import apiClient from '../../core/APIClient.js';
import eventBus from '../../core/EventBus.js';
import { DOMHelpers } from '../../utils/DOMHelpers.js';
import { showSuccess, showError } from '../../utils/ErrorHandler.js';

class OrderDrawer {
    constructor() {
        this.drawer = document.getElementById('orderDrawer');
        this.overlay = document.getElementById('drawerOverlay');
        this.currentTab = 'resumen';
        this.currentPedido = null;
        this.uploadedFiles = [];
        
        this.init();
    }

    init() {
        // Escuchar evento de apertura
        eventBus.on('openDrawer', (pedido) => {
            this.open(pedido);
        });

        // Cerrar con overlay o ESC
        this.overlay?.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.drawer.classList.contains('open')) {
                this.close();
            }
        });
    }

    open(pedido) {
        this.currentPedido = pedido;
        this.currentTab = 'resumen';
        this.uploadedFiles = pedido.archivos || [];
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
        
        this.currentPedido = null;
    }

    render() {
        const { id, cliente_mueble } = this.currentPedido;

        this.drawer.innerHTML = `
            <div class="p-6 h-full flex flex-col">
                <!-- HEADER -->
                <div class="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                    <div class="flex-1 pr-4">
                        <label class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Proyecto / Cliente
                        </label>
                        <input type="text" 
                               id="drawer-nombre"
                               value="${cliente_mueble}" 
                               class="w-full text-2xl font-bold text-slate-800 border-none bg-transparent 
                                      focus:ring-2 focus:ring-amber-500/20 rounded px-2 -ml-2 transition-all
                                      hover:bg-slate-50">
                        <div class="text-[10px] text-slate-400 mt-1">ID: #${id}</div>
                    </div>
                    <button id="drawer-close" 
                            class="text-3xl text-slate-400 hover:text-slate-700 transition-colors leading-none">
                        &times;
                    </button>
                </div>
                
                <!-- TABS -->
                <div class="flex gap-6 border-b border-slate-200 mb-6">
                    <button data-tab="resumen" 
                            class="tab-btn pb-3 text-sm font-semibold border-b-2 border-amber-500 text-slate-800">
                        Resumen
                    </button>
                    <button data-tab="materiales" 
                            class="tab-btn pb-3 text-sm font-semibold text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition-colors">
                        Materiales
                    </button>
                    <button data-tab="archivos" 
                            class="tab-btn pb-3 text-sm font-semibold text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition-colors">
                        Archivos
                    </button>
                </div>

                <!-- CONTENIDO -->
                <div id="drawer-content" class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    ${this.renderTab('resumen')}
                </div>

                <!-- FOOTER -->
                <div class="border-t border-slate-200 pt-4 mt-4">
                    <button id="btn-delete" 
                            class="w-full py-2.5 px-4 border-2 border-red-200 text-red-600 text-sm font-semibold 
                                   rounded-lg hover:bg-red-50 hover:border-red-300 transition-all
                                   flex items-center justify-center gap-2">
                        <span class="text-lg">🗑️</span>
                        <span>Eliminar Pedido</span>
                    </button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTab(tabName) {
        if (tabName === 'resumen') {
            return this.renderResumenTab();
        } else if (tabName === 'materiales') {
            return this.renderMaterialesTab();
        } else if (tabName === 'archivos') {
            return this.renderArchivosTab();
        }
        return '';
    }

    renderResumenTab() {
        const { id, deadline, prioridad, notas, tareas } = this.currentPedido;

        const tareasHtml = (tareas || []).map((tarea, idx) => `
            <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-2 hover:bg-slate-100 transition-colors">
                <input type="checkbox" 
                       ${tarea.completada ? 'checked' : ''} 
                       data-tarea-index="${idx}"
                       class="tarea-checkbox w-4 h-4 accent-amber-500 cursor-pointer rounded">
                <span class="flex-1 text-sm ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-700'}">
                    ${tarea.nombre}
                </span>
                ${tarea.completada ? '<span class="text-green-500 text-xs">✓</span>' : ''}
            </div>
        `).join('');

        return `
            <div id="content-resumen" class="space-y-6">
                <!-- Descripción/Notas -->
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wide">
                        Descripción / Notas
                    </label>
                    <textarea id="drawer-notas"
                              placeholder="Agrega notas sobre este pedido..."
                              class="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 bg-white 
                                     focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    >${notas || ''}</textarea>
                </div>

                <!-- Prioridad y Fecha -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wide">
                            Prioridad
                        </label>
                        <select id="drawer-prioridad" 
                                class="w-full text-sm border border-slate-200 rounded-lg bg-white px-3 py-2
                                       focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer">
                            <option value="p-low" ${prioridad === 'p-low' ? 'selected' : ''}>🟢 Baja</option>
                            <option value="p-normal" ${prioridad === 'p-normal' ? 'selected' : ''}>🟡 Normal</option>
                            <option value="p-high" ${prioridad === 'p-high' ? 'selected' : ''}>🔴 Alta (Urgente)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wide">
                            Fecha Límite
                        </label>
                        <input type="date" 
                               id="drawer-deadline" 
                               value="${deadline || ''}"
                               class="w-full text-sm border border-slate-200 rounded-lg bg-white px-3 py-2
                                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    </div>
                </div>

                <!-- Tareas de Producción -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Tareas de Producción
                        </label>
                        <button id="btn-add-tarea" 
                                class="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
                            <span class="text-lg leading-none">+</span>
                            <span>Añadir</span>
                        </button>
                    </div>
                    <div id="tareas-list" class="space-y-2">
                        ${tareasHtml || '<p class="text-xs text-slate-400 italic py-4 text-center">No hay tareas aún. Haz click en "Añadir" para crear una.</p>'}
                    </div>
                </div>

                <!-- Historial (placeholder) -->
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wide">
                        Historial
                    </label>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            <span class="text-green-500">✓</span>
                            <span>Pedido recibido · Diseño</span>
                            <span class="ml-auto text-slate-400">Hace 2 días</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            <span class="text-amber-500">⏱️</span>
                            <span>Fase actual: ${this.currentPedido.etapa}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMaterialesTab() {
        return `
            <div id="content-materiales" class="space-y-4">
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🌲</div>
                    <p class="text-slate-500 text-sm mb-2">Gestión de Materiales</p>
                    <p class="text-slate-400 text-xs">Próximamente: inventario, costos y control de stock</p>
                </div>
            </div>
        `;
    }

    renderArchivosTab() {
        const filesHtml = this.uploadedFiles.map((file, idx) => {
            const icon = file.type?.includes('pdf') ? '📄' : '🖼️';
            const size = file.size ? (file.size / 1024 / 1024).toFixed(2) : '0.00';
            
            return `
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${icon}</span>
                        <div>
                            <p class="text-sm font-semibold text-slate-700">${file.name}</p>
                            <p class="text-xs text-slate-400">${size} MB</p>
                        </div>
                    </div>
                    <button data-file-index="${idx}" 
                            class="btn-remove-file text-slate-400 hover:text-red-500 transition-colors text-xl leading-none">
                        &times;
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div id="content-archivos" class="space-y-4">
                <!-- Dropzone -->
                <div id="dropzone" 
                     class="dropzone-container border-2 border-dashed border-slate-300 rounded-lg p-8 text-center 
                            cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                    <div class="text-slate-400 text-5xl mb-3">📄</div>
                    <p class="text-slate-600 text-sm font-medium mb-1">
                        Sube aquí tus <span class="text-amber-600 font-bold">PDFs o Renders</span>
                    </p>
                    <p class="text-slate-400 text-xs">Arrastra archivos o haz click para seleccionar</p>
                    <input type="file" id="fileInput" class="hidden" multiple accept=".pdf,.png,.jpg,.jpeg">
                </div>

                <!-- Lista de archivos -->
                <div id="fileList" class="space-y-2">
                    ${filesHtml || '<p class="text-xs text-slate-400 italic text-center py-4">No hay archivos subidos</p>'}
                </div>
            </div>
        `;
    }

    attachEvents() {
        const { id } = this.currentPedido;

        // Cerrar drawer
        DOMHelpers.$('#drawer-close')?.addEventListener('click', () => this.close());

        // Cambiar tabs
        DOMHelpers.$$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Actualizar nombre del pedido
        DOMHelpers.$('#drawer-nombre')?.addEventListener('blur', async (e) => {
            const newName = e.target.value.trim();
            if (newName && newName !== this.currentPedido.cliente_mueble) {
                await apiClient.actualizarPedido(id, { cliente_mueble: newName });
                this.currentPedido.cliente_mueble = newName;
                showSuccess('✅ Nombre actualizado');
            }
        });

        // Actualizar prioridad
        DOMHelpers.$('#drawer-prioridad')?.addEventListener('change', async (e) => {
            await apiClient.actualizarPedido(id, { prioridad: e.target.value });
            showSuccess('✅ Prioridad actualizada');
        });

        // Actualizar deadline
        DOMHelpers.$('#drawer-deadline')?.addEventListener('change', async (e) => {
            await apiClient.actualizarPedido(id, { deadline: e.target.value });
            showSuccess('✅ Fecha actualizada');
        });

        // Actualizar notas
        DOMHelpers.$('#drawer-notas')?.addEventListener('blur', async (e) => {
            await apiClient.actualizarPedido(id, { notas: e.target.value });
            showSuccess('✅ Notas guardadas');
        });

        // Toggle tareas
        DOMHelpers.$$('.tarea-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const index = parseInt(e.target.dataset.tareaIndex);
                const tareas = [...this.currentPedido.tareas];
                tareas[index].completada = e.target.checked;
                
                await apiClient.actualizarPedido(id, { tareas });
                this.currentPedido.tareas = tareas;
                
                // Re-renderizar solo las tareas
                this.refreshTareas();
                showSuccess(e.target.checked ? '✅ Tarea completada' : '⏳ Tarea pendiente');
            });
        });

        // Añadir nueva tarea
        DOMHelpers.$('#btn-add-tarea')?.addEventListener('click', () => {
            this.addTarea();
        });

        // Eliminar pedido
        DOMHelpers.$('#btn-delete')?.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de eliminar el pedido "${this.currentPedido.cliente_mueble}"?\n\nEsta acción no se puede deshacer.`)) {
                await apiClient.eliminarPedido(id);
                this.close();
                showSuccess('🗑️ Pedido eliminado');
            }
        });

        // Gestión de archivos (solo si estamos en la pestaña de archivos)
        this.attachFileEvents();
    }

    attachFileEvents() {
        const dropzone = DOMHelpers.$('#dropzone');
        const fileInput = DOMHelpers.$('#fileInput');

        if (!dropzone || !fileInput) return;

        // Click en dropzone
        dropzone.addEventListener('click', () => fileInput.click());

        // Drag & drop
        ['dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropzone.addEventListener('dragover', () => {
            dropzone.classList.add('border-amber-500', 'bg-amber-50');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-amber-500', 'bg-amber-50');
        });

        dropzone.addEventListener('drop', (e) => {
            dropzone.classList.remove('border-amber-500', 'bg-amber-50');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // Input de archivos
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Eliminar archivos
        DOMHelpers.$$('.btn-remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.fileIndex);
                this.removeFile(index);
            });
        });
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            // Validar tamaño (máx 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showError(`❌ ${file.name} es muy grande (máx 10MB)`);
                return;
            }

            // Validar tipo
            const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                showError(`❌ ${file.name} no es un tipo válido (PDF, PNG, JPG)`);
                return;
            }

            this.uploadedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            });
        });

        // Re-renderizar la pestaña de archivos
        this.switchTab('archivos');
        showSuccess(`✅ ${files.length} archivo(s) agregado(s)`);
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.switchTab('archivos');
        showSuccess('🗑️ Archivo eliminado');
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Actualizar botones
        DOMHelpers.$$('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            
            if (isActive) {
                btn.classList.add('border-amber-500', 'text-slate-800');
                btn.classList.remove('border-transparent', 'text-slate-400');
            } else {
                btn.classList.remove('border-amber-500', 'text-slate-800');
                btn.classList.add('border-transparent', 'text-slate-400');
            }
        });

        // Actualizar contenido
        const content = DOMHelpers.$('#drawer-content');
        if (content) {
            content.innerHTML = this.renderTab(tabName);
            this.attachEvents();
        }
    }

    refreshTareas() {
        const tareasList = DOMHelpers.$('#tareas-list');
        if (!tareasList) return;

        const { tareas } = this.currentPedido;
        const tareasHtml = (tareas || []).map((tarea, idx) => `
            <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-2 hover:bg-slate-100 transition-colors">
                <input type="checkbox" 
                       ${tarea.completada ? 'checked' : ''} 
                       data-tarea-index="${idx}"
                       class="tarea-checkbox w-4 h-4 accent-amber-500 cursor-pointer rounded">
                <span class="flex-1 text-sm ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-700'}">
                    ${tarea.nombre}
                </span>
                ${tarea.completada ? '<span class="text-green-500 text-xs">✓</span>' : ''}
            </div>
        `).join('');

        tareasList.innerHTML = tareasHtml || '<p class="text-xs text-slate-400 italic py-4 text-center">No hay tareas</p>';
        
        // Re-attachar eventos de checkboxes
        DOMHelpers.$$('.tarea-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const index = parseInt(e.target.dataset.tareaIndex);
                const tareas = [...this.currentPedido.tareas];
                tareas[index].completada = e.target.checked;
                
                await apiClient.actualizarPedido(this.currentPedido.id, { tareas });
                this.currentPedido.tareas = tareas;
                this.refreshTareas();
                showSuccess(e.target.checked ? '✅ Tarea completada' : '⏳ Tarea pendiente');
            });
        });
    }

    addTarea() {
        const nombreTarea = prompt('Nombre de la tarea:');
        if (!nombreTarea || !nombreTarea.trim()) return;

        const tareas = this.currentPedido.tareas || [];
        tareas.push({
            nombre: nombreTarea.trim(),
            completada: false
        });

        apiClient.actualizarPedido(this.currentPedido.id, { tareas });
        this.currentPedido.tareas = tareas;
        this.refreshTareas();
        showSuccess('✅ Tarea agregada');
    }
}

export default OrderDrawer;