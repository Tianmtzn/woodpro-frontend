// modules/kanban/DragDropManager.js
// 🖱️ Gestor centralizado de Drag & Drop

import apiClient from '../../core/APIClient.js';
import eventBus from '../../core/EventBus.js';

class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.draggedData = null;
        this.init();
    }

    init() {
        // Escuchar eventos globales de drag
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    // 🎯 Configurar zona de drop
    setupDropZone(element, onDrop) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            // Solo remover si realmente salimos del elemento
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-over');
            }
        });

        element.addEventListener('drop', async (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            if (onDrop && this.draggedData) {
                await onDrop(this.draggedData, element);
            }
        });
    }

    // 🎯 Configurar elemento draggable
    setupDraggable(element, data) {
        element.setAttribute('draggable', 'true');
        element.dataset.dragData = JSON.stringify(data);
    }

    // 📦 Inicio del drag
    handleDragStart(e) {
        if (!e.target.draggable) return;

        this.draggedElement = e.target;
        
        // Obtener datos del elemento
        try {
            this.draggedData = JSON.parse(e.target.dataset.dragData || '{}');
        } catch {
            this.draggedData = { id: e.target.id };
        }

        // Efectos visuales
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.id);
        
        // Emitir evento
        eventBus.emit('dragStart', this.draggedData);
    }

    // 📦 Fin del drag
    handleDragEnd(e) {
        if (!e.target.draggable) return;

        e.target.classList.remove('dragging');
        
        // Limpiar clases de todas las drop zones
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Emitir evento
        eventBus.emit('dragEnd', this.draggedData);
        
        // Limpiar estado
        this.draggedElement = null;
        this.draggedData = null;
    }

    // 📦 Handler para drop en columnas del Kanban
    async handleKanbanDrop(pedidoData, targetColumn) {
        const pedidoId = pedidoData.id;
        const newStage = targetColumn.id;

        if (!pedidoId || !newStage) {
            console.warn('Datos insuficientes para el drop');
            return;
        }

        // Actualizar en el backend
        const result = await apiClient.actualizarPedido(pedidoId, { etapa: newStage });
        
        if (result.success) {
            eventBus.emit('pedidoMovido', { pedidoId, newStage });
        }
    }
}

// Exportar instancia singleton
const dragDropManager = new DragDropManager();
export default dragDropManager;