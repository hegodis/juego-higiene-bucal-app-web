/**
 * food-sort-game.js - Juego de clasificar alimentos amigos/enemigos
 */

const FoodSortGame = {
  state: {
    sorted: 0,
    total: 0,
    placed: { good: [], bad: [] }
  },
  
  init() {
    this.state = { sorted: 0, total: 0, placed: { good: [], bad: [] } };
    
    // Contar elementos clasificables
    this.state.total = document.querySelectorAll('.draggable-item:not(.sorted)').length;
    
    this.bindDragEvents();
    this.bindUI();
    this.updateProgress();
  },
  
  bindDragEvents() {
    // Elementos arrastrables
    document.querySelectorAll('.draggable-item').forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
      item.addEventListener('dragend', (e) => this.handleDragEnd(e, item));
      
      // Soporte táctil
      item.addEventListener('touchstart', (e) => this.handleTouchStart(e, item), { passive: true });
      item.addEventListener('touchmove', (e) => this.handleTouchMove(e, item), { passive: false });
      item.addEventListener('touchend', (e) => this.handleTouchEnd(e, item));
    });
    
    // Zonas de drop
    document.querySelectorAll('.drop-area').forEach(zone => {
      zone.addEventListener('dragover', (e) => this.handleDragOver(e, zone));
      zone.addEventListener('dragleave', (e) => this.handleDragLeave(e, zone));
      zone.addEventListener('drop', (e) => this.handleDrop(e, zone));
    });
  },
  
  handleDragStart(e, item) {
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('item/type', item.dataset.type);
    e.dataTransfer.setData('item/name', item.dataset.name);
    e.dataTransfer.setData('item/fact', item.dataset.fact);
    SoundManager.play('flip');
  },
  
  handleDragEnd(e, item) {
    item.classList.remove('dragging');
  },
  
  handleDragOver(e, zone) {
    e.preventDefault();
    zone.classList.add('drag-over');
  },
  
  handleDragLeave(e, zone) {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove('drag-over');
    }
  },
  
  handleDrop(e, zone) {
    e.preventDefault();
    zone.classList.remove('drag-over');
    
    const itemType = e.dataTransfer.getData('item/type');
    const itemName = e.dataTransfer.getData('item/name');
    const itemFact = e.dataTransfer.getData('item/fact');
    const zoneType = zone.closest('.sort-zone').dataset.type;
    
    // Encontrar el elemento original
    const draggedItem = document.querySelector(`.draggable-item[data-name="${itemName}"]:not(.sorted)`);
    if (!draggedItem) return;
    
    if (itemType === zoneType) {
      // ¡Clasificación correcta!
      this.markAsSorted(draggedItem, zone);
      SoundManager.play('success');
      this.showFeedback(`✅ ¡Bien! ${itemFact}`, true);
    } else {
      // Incorrecta
      SoundManager.play('error');
      Utils.vibrate([50, 50]);
      
      const correction = zoneType === 'good' 
        ? `El ${itemName} no es tan amigable con los dientes. 🤔`
        : `¡El ${itemName} SÍ cuida tu sonrisa! 😊`;
      
      this.showFeedback(`💡 ${correction}<br><small>${itemFact}</small>`, false);
    }
  },
  
  // Soporte táctil
  handleTouchStart(e, item) {
    item.dataset.touchStartX = e.touches[0].clientX;
    item.dataset.touchStartY = e.touches[0].clientY;
    item.classList.add('dragging');
  },
  
  handleTouchMove(e, item) {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - parseFloat(item.dataset.touchStartX || 0);
    const dy = touch.clientY - parseFloat(item.dataset.touchStartY || 0);
    
    item.style.transform = `translate(${dx}px, ${dy}px)`;
    item.style.zIndex = '1000';
    
    // Detectar zona bajo el dedo
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = elemBelow?.closest('.drop-area');
    
    document.querySelectorAll('.drop-area.drag-over').forEach(z => z.classList.remove('drag-over'));
    if (zone) zone.classList.add('drag-over');
  },
  
  handleTouchEnd(e, item) {
    const touch = e.changedTouches[0];
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = elemBelow?.closest('.drop-area');
    
    item.style.transform = '';
    item.style.zIndex = '';
    item.classList.remove('dragging');
    
    if (zone) {
      const zoneType = zone.closest('.sort-zone').dataset.type;
      const itemType = item.dataset.type;
      
      if (itemType === zoneType) {
        this.markAsSorted(item, zone);
        SoundManager.play('success');
        this.showFeedback(`✅ ¡Bien! ${item.dataset.fact}`, true);
      } else {
        SoundManager.play('error');
        Utils.vibrate([50, 50]);
        const correction = zoneType === 'good' 
          ? `El ${item.dataset.name} no es tan amigable con los dientes. 🤔`
          : `¡El ${item.dataset.name} SÍ cuida tu sonrisa! 😊`;
        this.showFeedback(`💡 ${correction}<br><small>${item.dataset.fact}</small>`, false);
      }
    }
    
    document.querySelectorAll('.drop-area.drag-over').forEach(z => z.classList.remove('drag-over'));
  },
  
  markAsSorted(item, zone) {
    // Mover visualmente el item a la zona
    const clone = item.cloneNode(true);
    clone.classList.add('sorted');
    clone.style.transform = '';
    clone.style.zIndex = '';
    clone.draggable = false;
    clone.style.cursor = 'default';
    
    // Remover eventos del clone
    clone.replaceWith(clone.cloneNode(true));
    
    zone.appendChild(clone);
    item.classList.add('sorted');
    item.style.opacity = '0.4';
    item.draggable = false;
    
    this.state.sorted++;
    this.state.placed[zone.closest('.sort-zone').dataset.type].push(item.dataset.name);
    this.updateProgress();
    
    // Verificar si terminó
    if (this.state.sorted === this.state.total) {
      setTimeout(() => this.finishGame(), 1000);
    }
  },
  
  showFeedback(message, isSuccess) {
    const feedback = document.getElementById('sort-feedback');
    const msgEl = document.getElementById('sort-message');
    
    if (feedback && msgEl) {
      msgEl.innerHTML = message;
      feedback.className = `feedback ${isSuccess ? 'success-animation' : 'error'}`;
      feedback.hidden = false;
      
      if (!isSuccess) {
        setTimeout(() => { feedback.hidden = true; }, 4000);
      }
    }
  },
  
  updateProgress() {
    const progress = document.getElementById('sort-progress');
    if (progress) {
      progress.textContent = `Clasificados: ${this.state.sorted}/${this.state.total}`;
    }
  },
  
  verifyClassification() {
    // Verificar elementos no clasificados
    const unsorted = document.querySelectorAll('.draggable-item:not(.sorted)');
    
    if (unsorted.length > 0) {
      this.showFeedback(`💡 Aún faltan ${unsorted.length} alimentos por clasificar. ¡Sigue intentando!`, false);
      return;
    }
    
    // Si todos están clasificados, verificar corrección
    let correct = 0;
    document.querySelectorAll('.draggable-item.sorted').forEach(item => {
      const zone = item.closest('.sort-zone');
      if (zone && item.dataset.type === zone.dataset.type) {
        correct++;
      }
    });
    
    if (correct === this.state.total) {
      this.finishGame();
    } else {
      this.showFeedback(`🤔 Tienes ${correct}/${this.state.total} correctos. Revisa los que están en la zona equivocada.`, false);
    }
  },
  
  finishGame() {
    const stars = 10;
    ProgressManager.addStars('food-sort', stars);
    ProgressManager.markCompleted('food-sort');
    
    const feedback = document.getElementById('sort-feedback');
    
    if (feedback) {
      feedback.hidden = false;
      feedback.className = 'feedback success-animation';
      feedback.innerHTML = `
        <p>🎉 ¡Excelente! Has clasificado todos los alimentos correctamente.</p>
        <p>⭐ Ganaste <strong>${stars} estrellas</strong></p>
        <p style="margin-top:0.5rem">
          <strong>🥗 Recuerda:</strong><br>
          • Los alimentos naturales como frutas y verduras son amigos de tus dientes 🍎🥕<br>
          • El agua es la mejor bebida para tu sonrisa 💧<br>
          • Los dulces y refrescos deben ser ocasionales 🍬<br>
          • ¡Cepillarse después de comer es clave!
        </p>
        <button id="sort-play-again" class="primary-btn" style="margin-top:0.5rem">🔄 Jugar de nuevo</button>
      `;
    }
    
    SoundManager.play('celebrate');
    
    setTimeout(() => {
      document.getElementById('sort-play-again')?.addEventListener('click', () => {
        this.init();
      });
    }, 100);
    
    checkCertificateEligibility?.();
  },
  
  restart() {
    if (confirm('¿Reiniciar el juego de clasificación?')) {
      // Restaurar elementos
      document.querySelectorAll('.draggable-item').forEach(item => {
        item.classList.remove('sorted');
        item.style.opacity = '1';
        item.draggable = true;
      });
      
      // Limpiar zonas
      document.querySelectorAll('.drop-area').forEach(zone => {
        zone.querySelectorAll('.draggable-item.sorted').forEach(el => el.remove());
      });
      
      this.init();
    }
  },
  
  bindUI() {
    const checkBtn = document.getElementById('sort-check');
    const restartBtn = document.getElementById('sort-restart');
    
    if (checkBtn) checkBtn.onclick = () => this.verifyClassification();
    if (restartBtn) restartBtn.onclick = () => this.restart();
  }
};

window.foodSortInit = () => FoodSortGame.init();