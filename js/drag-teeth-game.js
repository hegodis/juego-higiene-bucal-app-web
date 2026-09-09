/**
 * drag-teeth-game.js - Juego de colocar dientes en la boca
 */

const DragTeethGame = {
  // Configuración de posiciones válidas
  validPositions: {
    'upper': ['incisor', 'incisor', 'canine', 'canine'],
    'lower': ['incisor', 'incisor', 'canine', 'canine']
  },
  
  state: {
    placed: 0,
    totalSlots: 8,
    showHints: false,
    draggedItem: null
  },
  
  init() {
    this.state = { placed: 0, totalSlots: 8, showHints: false, draggedItem: null };
    this.renderSlots();
    this.bindDragEvents();
    this.bindUI();
    this.updateProgress();
  },
  
  renderSlots() {
    // Resetear slots
    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.classList.remove('filled', 'valid-drop');
      slot.dataset.filled = 'false';
    });
    
    // Si hay hints activados, mostrar indicadores
    if (this.state.showHints) {
      document.querySelectorAll('.slot').forEach(slot => {
        slot.classList.add('valid-drop');
        const type = slot.dataset.type;
        slot.innerHTML = `<small style="font-size:0.7rem">${type === 'incisor' ? '🦷' : '🦷'}</small>`;
      });
    }
  },
  
  bindDragEvents() {
    // Elementos arrastrables
    document.querySelectorAll('.draggable-tooth').forEach(tooth => {
      tooth.addEventListener('dragstart', (e) => this.handleDragStart(e, tooth));
      tooth.addEventListener('dragend', (e) => this.handleDragEnd(e, tooth));
      
      // Soporte táctil básico
      tooth.addEventListener('touchstart', (e) => this.handleTouchStart(e, tooth), { passive: true });
      tooth.addEventListener('touchmove', (e) => this.handleTouchMove(e, tooth), { passive: false });
      tooth.addEventListener('touchend', (e) => this.handleTouchEnd(e, tooth));
    });
    
    // Zonas de drop (slots)
    document.querySelectorAll('.slot').forEach(slot => {
      slot.addEventListener('dragover', (e) => this.handleDragOver(e, slot));
      slot.addEventListener('dragleave', (e) => this.handleDragLeave(e, slot));
      slot.addEventListener('drop', (e) => this.handleDrop(e, slot));
    });
  },
  
  handleDragStart(e, tooth) {
    this.state.draggedItem = tooth;
    tooth.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tooth.dataset.type);
    SoundManager.play('flip');
  },
  
  handleDragEnd(e, tooth) {
    tooth.classList.remove('dragging');
    this.state.draggedItem = null;
    // Remover indicadores visuales
    document.querySelectorAll('.slot.valid-drop').forEach(s => s.classList.remove('valid-drop'));
  },
  
  handleDragOver(e, slot) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (this.state.showHints) {
      const expectedType = slot.dataset.type;
      const draggedType = this.state.draggedItem?.dataset.type;
      
      if (expectedType === draggedType) {
        slot.classList.add('valid-drop');
      } else {
        slot.classList.remove('valid-drop');
      }
    }
  },
  
  handleDragLeave(e, slot) {
    if (!slot.contains(e.relatedTarget)) {
      slot.classList.remove('valid-drop');
    }
  },
  
  handleDrop(e, slot) {
    e.preventDefault();
    
    if (!this.state.draggedItem) return;
    
    const draggedType = this.state.draggedItem.dataset.type;
    const expectedType = slot.dataset.type;
    const isFilled = slot.dataset.filled === 'true';
    
    if (isFilled) {
      this.showFeedback('¡Ese lugar ya tiene un diente! Busca otro espacio. 😊', false);
      Utils.vibrate([30]);
      return;
    }
    
    if (draggedType === expectedType) {
      // ¡Colocación correcta!
      slot.innerHTML = `<span style="font-size:1.8rem">🦷</span>`;
      slot.classList.add('filled');
      slot.dataset.filled = 'true';
      
      // Desactivar el diente arrastrado
      this.state.draggedItem.style.opacity = '0.4';
      this.state.draggedItem.draggable = false;
      
      this.state.placed++;
      this.updateProgress();
      
      SoundManager.play('success');
      this.showFeedback('¡Perfecto! Ese diente va justo ahí. 🎉', true);
      
      // Verificar victoria
      if (this.state.placed === this.state.totalSlots) {
        setTimeout(() => this.finishGame(), 800);
      }
    } else {
      // Colocación incorrecta
      SoundManager.play('error');
      Utils.vibrate([50, 50]);
      this.showFeedback(`💡 Pista: Los <strong>${this.getTypeName(expectedType)}</strong> van en esta posición. ¡Intenta de nuevo!`, false);
    }
    
    // Limpiar estado
    this.state.draggedItem.classList.remove('dragging');
    this.state.draggedItem = null;
    document.querySelectorAll('.slot.valid-drop').forEach(s => s.classList.remove('valid-drop'));
  },
  
  // Soporte táctil simplificado
  handleTouchStart(e, tooth) {
    this.state.draggedItem = tooth;
    tooth.classList.add('dragging');
    tooth.dataset.touchStartX = e.touches[0].clientX;
    tooth.dataset.touchStartY = e.touches[0].clientY;
  },
  
  handleTouchMove(e, tooth) {
    if (!this.state.draggedItem) return;
    e.preventDefault();
    
    // Mover elemento visualmente
    const touch = e.touches[0];
    const dx = touch.clientX - parseFloat(tooth.dataset.touchStartX || 0);
    const dy = touch.clientY - parseFloat(tooth.dataset.touchStartY || 0);
    
    tooth.style.transform = `translate(${dx}px, ${dy}px)`;
    tooth.style.zIndex = '1000';
    
    // Detectar slot bajo el dedo
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = elemBelow?.closest('.slot');
    
    document.querySelectorAll('.slot.valid-drop').forEach(s => s.classList.remove('valid-drop'));
    
    if (slot && this.state.showHints) {
      if (slot.dataset.type === tooth.dataset.type) {
        slot.classList.add('valid-drop');
      }
    }
  },
  
  handleTouchEnd(e, tooth) {
    if (!this.state.draggedItem) return;
    
    const touch = e.changedTouches[0];
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = elemBelow?.closest('.slot');
    
    // Resetear estilo
    tooth.style.transform = '';
    tooth.style.zIndex = '';
    
    if (slot) {
      // Simular drop
      this.handleDrop({ preventDefault: () => {} }, slot);
    }
    
    tooth.classList.remove('dragging');
    this.state.draggedItem = null;
    document.querySelectorAll('.slot.valid-drop').forEach(s => s.classList.remove('valid-drop'));
  },
  
  getTypeName(type) {
    const names = {
      'incisor': 'incisivos',
      'canine': 'caninos',
      'premolar': 'premolares',
      'molar': 'molares'
    };
    return names[type] || type;
  },
  
  showFeedback(message, isSuccess) {
    const feedback = document.getElementById('drag-feedback');
    const msgEl = document.getElementById('drag-message');
    
    if (feedback && msgEl) {
      msgEl.innerHTML = message;
      feedback.className = `feedback ${isSuccess ? 'success-animation' : 'error'}`;
      feedback.hidden = false;
      
      if (!isSuccess) {
        setTimeout(() => {
          feedback.hidden = true;
        }, 4000);
      }
    }
  },
  
  updateProgress() {
    const progress = document.getElementById('drag-progress');
    if (progress) {
      progress.textContent = `Dientes colocados: ${this.state.placed}/${this.state.totalSlots}`;
    }
  },
  
  toggleHints() {
    this.state.showHints = !this.state.showHints;
    const btn = document.getElementById('drag-hint');
    
    if (btn) {
      btn.textContent = this.state.showHints ? '💡 Ocultar pistas' : '💡 Mostrar pistas';
    }
    
    this.renderSlots();
    SoundManager.play('flip');
  },
  
  finishGame() {
    const stars = 10; // Completar todos = máximo de estrellas
    ProgressManager.addStars('drag-teeth', stars);
    ProgressManager.markCompleted('drag-teeth');
    
    const feedback = document.getElementById('drag-feedback');
    const completeBtn = document.getElementById('drag-complete');
    
    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'feedback success-animation';
      feedback.innerHTML = `
        <p>🎉 ¡Sonrisa completada! Has colocado todos los dientes correctamente.</p>
        <p>⭐ Ganaste <strong>${stars} estrellas</strong></p>
        <p style="margin-top:0.5rem"><small>Recuerda: Cada tipo de diente tiene una función especial para ayudarte a comer y sonreír. 🦷✨</small></p>
        <button id="drag-play-again" class="primary-btn" style="margin-top:0.5rem">🔄 Jugar de nuevo</button>
      `;
    }
    
    if (completeBtn) completeBtn.hidden = false;
    
    SoundManager.play('celebrate');
    
    setTimeout(() => {
      document.getElementById('drag-play-again')?.addEventListener('click', () => {
        this.init();
        if (completeBtn) completeBtn.hidden = true;
      });
    }, 100);
    
    checkCertificateEligibility?.();
  },
  
  restart() {
    if (confirm('¿Reiniciar el juego? Los dientes volverán a su lugar.')) {
      // Reactivar dientes
      document.querySelectorAll('.draggable-tooth').forEach(tooth => {
        tooth.style.opacity = '1';
        tooth.draggable = true;
      });
      this.init();
      document.getElementById('drag-complete')?.setAttribute('hidden', 'true');
    }
  },
  
  bindUI() {
    const hintBtn = document.getElementById('drag-hint');
    const restartBtn = document.getElementById('drag-restart');
    
    if (hintBtn) hintBtn.onclick = () => this.toggleHints();
    if (restartBtn) restartBtn.onclick = () => this.restart();
  }
};

window.dragTeethInit = () => DragTeethGame.init();