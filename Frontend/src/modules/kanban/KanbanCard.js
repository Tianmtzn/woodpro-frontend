// modules/kanban/KanbanCard.js
// 🃏 Componente de tarjeta individual (CORREGIDO)

import eventBus from '../../core/EventBus.js';

class KanbanCard {
    
    static create(pedido) {
        const { id, cliente_mueble, deadline, prioridad, tareas, etapa } = pedido;
        
        // Calcular progreso
        const completadas = (tareas || []).filter(t => t.completada).length;
        const total = tareas?.length || 0;
        const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
        const colorBarra = porcentaje === 100 ? 'bg-green-500' : 'bg-amber-500';

        const card = document.createElement('div');
        card.id = `pedido-${id}`;
        card.className = `card-pro ${prioridad || 'p-normal'}`;
        card.setAttribute('data-cliente', cliente_mueble.toLowerCase());
        card.setAttribute('data-prioridad', prioridad || 'p-normal');
        card.setAttribute('data-deadline', deadline || '');
        card.draggable = true;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-slate-800 text-sm">${cliente_mueble}</span>
                <span class="text-[10px] text-slate-400">ID: #${id}</span>
            </div>
            
            <div class="flex flex-wrap gap-1 mb-3">
                <span class="chip bg-amber-50 text-amber-600 border border-amber-200">📅 ${deadline || 'S/F'}</span>
                ${prioridad === 'p-high' ? '<span class="chip bg-red-100 text-red-600">⚠️ URGENTE</span>' : ''}
            </div>

            <div class="mt-2">
                <div class="flex justify-between text-[9px] text-slate-500 mb-1 font-bold">
                    <span>PROGRESO</span>
                    <span>${porcentaje}%</span>
                </div>
                <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div class="${colorBarra} h-full transition-all duration-500" 
                         style="width: ${porcentaje}%"></div>
                </div>
            </div>

            <div class="mt-3 flex items-center text-[10px] text-slate-400 italic">
                📍 ${etapa.toUpperCase()}
            </div>
        `;

        // Click para abrir drawer
        card.addEventListener('click', (e) => {
            // Prevenir si está en drag
            if (card.classList.contains('dragging')) return;
            
            eventBus.emit('openDrawer', pedido);
        });

        return card;
    }

    // Actualizar solo el progreso sin recrear la tarjeta
    static updateProgress(cardElement, tareas) {
        const completadas = (tareas || []).filter(t => t.completada).length;
        const total = tareas?.length || 0;
        const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
        
        const progressBar = cardElement.querySelector('.bg-amber-500, .bg-green-500');
        const progressText = cardElement.querySelector('.text-[9px].text-slate-500 span:last-child');
        
        if (progressBar) {
            progressBar.style.width = `${porcentaje}%`;
            progressBar.className = porcentaje === 100 
                ? 'bg-green-500 h-full transition-all duration-500'
                : 'bg-amber-500 h-full transition-all duration-500';
        }
        
        if (progressText) {
            progressText.innerText = `${porcentaje}%`;
        }
    }
}

export default KanbanCard;