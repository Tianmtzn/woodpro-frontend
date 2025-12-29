// modules/kanban/KanbanBoard.js
// 🎨 Componente principal del tablero Kanban (CORREGIDO)

import stateManager from '../../core/StateManager.js';
import apiClient from '../../core/APIClient.js';
import KanbanCard from './KanbanCard.js';
import dragDropManager from './DragDropManager.js';
import { DOMHelpers } from '../../utils/DOMHelpers.js';

const STAGES = [
    { name: "Diseño y Prep.", id: "diseno", limit: 5 },
    { name: "Corte / CNC", id: "corte", limit: 3 },
    { name: "Canteado", id: "canteado", limit: 3 },
    { name: "Ensamble", id: "ensamble", limit: 4 },
    { name: "Acabado / Barniz", id: "acabado", limit: 2 },
    { name: "Instalación", id: "instalacion", limit: 5 },
    { name: "Listo / Cobro", id: "listo", limit: 20 }
];

class KanbanBoard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.columns = new Map();
        this.init();
    }

    init() {
        this.render();
        this.setupDragDrop();
        this.subscribeToState();
        
        // Cargar datos iniciales
        if (stateManager.getState('pedidos').length === 0) {
            apiClient.obtenerPedidos();
        }

    }

    render() {
        if (!this.container) {
            console.error('Contenedor del tablero no encontrado');
            return;
        }

        DOMHelpers.clearChildren(this.container);

        STAGES.forEach(stage => {
            const column = document.createElement('div');
            column.id = `col-${stage.id}`;
            column.className = 'column';
            
            column.innerHTML = `
                <div class="column-header">
                    <span>${stage.name}</span>
                    <span class="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full" id="count-${stage.id}">0</span>
                </div>
                
                <div class="task-list cards-container" 
                     id="${stage.id}" 
                     data-stage="${stage.id}"
                     data-limit="${stage.limit}">
                    <div class="empty-state">No hay pedidos</div>
                </div>
                
                <button class="add-btn-column" data-stage="${stage.id}">
                    + Añadir Pedido
                </button>
            `;

            this.container.appendChild(column);
            
            const list = column.querySelector('.task-list');
            this.columns.set(stage.id, {
                element: column,
                list: list,
                counter: column.querySelector(`#count-${stage.id}`),
                limit: stage.limit
            });

            // Configurar drop zone para esta columna
            dragDropManager.setupDropZone(list, (data, target) => {
                dragDropManager.handleKanbanDrop(data, target);
            });
        });

        // Evento para botones "Añadir"
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn-column')) {
                const stage = e.target.dataset.stage;
                this.openQuickAdd(stage);
            }
        });
    }

    subscribeToState() {
        stateManager.subscribe('pedidos', () => {
            this.updateBoard();
        });

        stateManager.subscribe('filtros', () => {
            this.updateBoard();
        });
    }

    updateBoard() {
        const pedidosFiltrados = stateManager.getPedidosFiltrados();
        
        // Limpiar todas las listas
        this.columns.forEach(col => {
            DOMHelpers.clearChildren(col.list);
            col.list.innerHTML = '<div class="empty-state">No hay pedidos</div>';
        });

        // Agrupar por etapa
        const pedidosPorEtapa = this.groupByStage(pedidosFiltrados);

        // Renderizar tarjetas
        pedidosPorEtapa.forEach((pedidos, stageId) => {
            const col = this.columns.get(stageId);
            if (!col) return;

            DOMHelpers.clearChildren(col.list);
            
            pedidos.forEach(pedido => {
                const card = KanbanCard.create(pedido);
                
                // Configurar como draggable
                dragDropManager.setupDraggable(card, pedido);
                
                col.list.appendChild(card);
            });
        });

        this.updateCounters();
    }

    groupByStage(pedidos) {
        const grupos = new Map();
        
        pedidos.forEach(pedido => {
            const etapaId = pedido.etapa.toLowerCase();
            if (!grupos.has(etapaId)) {
                grupos.set(etapaId, []);
            }
            grupos.get(etapaId).push(pedido);
        });
        
        return grupos;
    }

    updateCounters() {
        this.columns.forEach((col, stageId) => {
            const cards = col.list.querySelectorAll('.card-pro');
            const visibleCount = Array.from(cards).filter(c => !c.classList.contains('hidden')).length;
            
            col.counter.innerText = visibleCount > col.limit 
                ? `${visibleCount}/${col.limit}` 
                : visibleCount;
            
            // Bottleneck visual
            if (visibleCount > col.limit) {
                col.element.classList.add('bottleneck');
            } else {
                col.element.classList.remove('bottleneck');
            }
            
            // Empty state
            const emptyState = col.list.querySelector('.empty-state');
            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }

    openQuickAdd(stage) {
    console.log('🔧 Quick add para:', stage);

    const drawer = document.getElementById("orderDrawer");
    const overlay = document.getElementById("drawerOverlay");

    if (!drawer || !overlay) {
        console.error("Drawer u overlay no encontrados en el DOM");
        return;
    }

    // abrir
    overlay.classList.add("open");
    drawer.classList.add("open");

    drawer.innerHTML = `
        <div class="p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Nuevo pedido</h2>
            <button id="btnCloseDrawer" class="text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <div class="text-sm text-slate-600 mb-4">
            Etapa inicial: <span class="font-bold">${stage}</span>
        </div>

        <div class="grid gap-3">
            <label class="text-xs font-bold text-slate-400">Cliente</label>
            <input id="qaCliente" class="w-full border rounded-lg p-2" placeholder="Nombre del cliente" />

            <label class="text-xs font-bold text-slate-400">Descripción</label>
            <textarea id="qaDesc" class="w-full border rounded-lg p-2" rows="3" placeholder="Notas del pedido..."></textarea>

            <div class="flex gap-2 mt-2">
            <button id="btnGuardarQuickAdd" class="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold">
                Guardar
            </button>
            <button id="btnCancelarQuickAdd" class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold">
                Cancelar
            </button>
            </div>
        </div>
        </div>
    `;

    const close = () => {
        overlay.classList.remove("open");
        drawer.classList.remove("open");
    };

        drawer.querySelector("#btnCloseDrawer").addEventListener("click", close);
        drawer.querySelector("#btnCancelarQuickAdd").addEventListener("click", close);
        overlay.onclick = close;

        drawer.querySelector("#btnGuardarQuickAdd").addEventListener("click", () => {
        const cliente = drawer.querySelector("#qaCliente").value.trim();
        const desc = drawer.querySelector("#qaDesc").value.trim();

        if (!cliente) {
            alert("Pon el nombre del cliente.");
            return;
        }

        const nuevoPedido = {
            id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
            cliente_mueble: cliente,
            descripcion: desc,          // extra, por si luego la muestras en la card/drawer
            etapa: stage,               // "diseno", "corte", etc.
            prioridad: "p-normal",      // 👈 importante para tu CSS/KanbanCard
            bloqueado: false,
            deadline: "",               // o null
            tareas: [],                 // 👈 importante para el progreso
            fecha_creacion: new Date().toISOString()
        };

        stateManager.agregarPedido(nuevoPedido);
        close();
        });


    }

}

export default KanbanBoard;