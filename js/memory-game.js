/**
 * memory-game.js - Juego de encontrar parejas dentales
 */

const MemoryGame = {
  // Parejas: imagen + texto/función
  pairs: [
    { id: 'incisor', icon: '🦷', text: 'Incisivo: Corta alimentos', fact: 'Los incisivos son los 8 dientes frontales que usamos para morder.' },
    { id: 'canine', icon: '🦷', text: 'Canino: Desgarra alimentos', fact: 'Los caninos tienen forma de colmillo suave y nos ayudan con alimentos duros.' },
    { id: 'premolar', icon: '🦷', text: 'Premolar: Tritura alimentos', fact: 'Los premolares aparecen alrededor de los 10 años y ayudan a triturar.' },
    { id: 'molar', icon: '🦷', text: 'Molar: Muele alimentos', fact: 'Los molares son los más fuertes y grandes, ¡como moledores naturales!' },
    { id: 'brush', icon: '<img src="assets/image/cepillo.png" alt="" width="25" height="25">', text: 'Cepillo: Limpia dientes', fact: 'Cepillarse 2 minutos, 3 veces al día, previene las caries.' },
    { id: 'floss', icon: '🧵', text: 'Hilo dental: Limpia entre dientes', fact: 'El hilo dental llega donde el cepillo no puede.' },
    { id: 'water', icon: '💧', text: 'Agua: Lava y hidrata', fact: 'El agua ayuda a lavar restos de comida y mantiene la boca sana.' },
    { id: 'dentist', icon: '👨‍⚕️', text: 'Dentista: Revisa tu salud', fact: 'Visitar al dentista cada 6 meses detecta problemas a tiempo.' }
  ],
  
  state: {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    locked: false
  },
  
  init() {
    // Reset estado
    this.state = {
      cards: [],
      flipped: [],
      matched: 0,
      moves: 0,
      timer: 0,
      timerInterval: null,
      locked: false
    };
    
    // Crear tablero con pares duplicados y barajados
    const cards = [...this.pairs, ...this.pairs]
      .map((pair, index) => ({ ...pair, uniqueId: `${pair.id}-${index}` }))
      .sort(() => Math.random() - 0.5);
    
    this.state.cards = cards;
    this.renderBoard();
    this.startTimer();
    this.bindEvents();
  },
  
  renderBoard() {
    const board = document.getElementById('memory-board');
    if (!board) return;
    
    board.innerHTML = '';
    board.setAttribute('aria-live', 'polite');
    
    this.state.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('tabindex', '0');
      cardEl.setAttribute('aria-label', `Carta ${index + 1}. Voltear para ver contenido.`);
      cardEl.dataset.id = card.uniqueId;
      cardEl.dataset.type = card.id;
      
      cardEl.innerHTML = `
        <div class="card-face card-front">❓</div>
        <div class="card-face card-back">
          <span class="tooth-icon">${card.icon}</span>
          <span>${card.text.split(':')[0]}</span>
        </div>
      `;
      
      // Eventos
      cardEl.addEventListener('click', () => this.flipCard(cardEl));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.flipCard(cardEl);
        }
      });
      
      board.appendChild(cardEl);
    });
    
    // Reset UI
    const stats = document.getElementById('memory-stats');
    const timer = document.getElementById('memory-timer');
    const fact = document.getElementById('memory-fact');
    
    if (stats) stats.textContent = `Parejas: 0/${this.pairs.length}`;
    if (timer) timer.textContent = '⏱️ 00:00';
    if (fact) fact.hidden = true;
  },
  
  flipCard(cardEl) {
    if (this.state.locked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    
    // Voltear carta
    cardEl.classList.add('flipped');
    SoundManager.play('flip');
    
    this.state.flipped.push(cardEl);
    
    // Si hay 2 cartas volteadas, verificar match
    if (this.state.flipped.length === 2) {
      this.state.locked = true;
      this.state.moves++;
      this.checkMatch();
    }
  },
  
  checkMatch() {
    const [card1, card2] = this.state.flipped;
    const match = card1.dataset.type === card2.dataset.type;
    
    if (match) {
      // ¡Pareja encontrada!
      card1.classList.add('matched');
      card2.classList.add('matched');
      this.state.matched++;
      
      // Mostrar dato educativo
      const pair = this.pairs.find(p => p.id === card1.dataset.type);
      const factEl = document.getElementById('memory-fact');
      const factText = document.getElementById('fact-text');
      
      if (factEl && factText && pair) {
        factText.textContent = pair.fact;
        factEl.hidden = false;
        Utils.fadeIn(factEl);
        setTimeout(() => Utils.fadeOut(factEl), 4000);
      }
      
      SoundManager.play('success');
      
      // Actualizar progreso
      const stats = document.getElementById('memory-stats');
      if (stats) stats.textContent = `Parejas: ${this.state.matched}/${this.pairs.length}`;
      
      // Verificar victoria
      if (this.state.matched === this.pairs.length) {
        this.finishGame();
        return;
      }
    } else {
      // No es pareja - voltear de nuevo
      SoundManager.play('error');
      Utils.vibrate([30, 30]);
      
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        this.state.flipped = [];
        this.state.locked = false;
      }, 1000);
      return;
    }
    
    // Reset para siguiente turno
    this.state.flipped = [];
    this.state.locked = false;
  },
  
  startTimer() {
    this.state.timer = 0;
    const timerEl = document.getElementById('memory-timer');
    
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    
    this.state.timerInterval = setInterval(() => {
      this.state.timer++;
      if (timerEl) {
        timerEl.textContent = `⏱️ ${Utils.formatTime(this.state.timer)}`;
      }
    }, 1000);
  },
  
  stopTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  },
  
  finishGame() {
    this.stopTimer();
    
    // Calcular estrellas basado en tiempo y movimientos
    const timeBonus = this.state.timer < 60 ? 5 : this.state.timer < 120 ? 3 : 1;
    const moveBonus = this.state.moves <= 20 ? 5 : this.state.moves <= 30 ? 3 : 1;
    const stars = Math.min(10, Math.floor((timeBonus + moveBonus) / 2));
    
    ProgressManager.addStars('memory', stars);
    ProgressManager.markCompleted('memory');
    
    // Mostrar celebración
    const factEl = document.getElementById('memory-fact');
    if (factEl) {
      factEl.hidden = false;
      factEl.innerHTML = `
        <p>🎉 ¡Increíble! Completaste el juego en:</p>
        <p><strong>⏱️ ${Utils.formatTime(this.state.timer)}</strong> | 
        <strong>🔄 ${this.state.moves} movimientos</strong></p>
        <p>⭐ Ganaste <strong>${stars} estrellas</strong></p>
        <button id="memory-play-again" class="primary-btn" style="margin-top:0.5rem">🔄 Jugar de nuevo</button>
      `;
      factEl.className = 'educational-fact success-animation';
    }
    
    SoundManager.play('celebrate');
    
    // Botón jugar de nuevo
    setTimeout(() => {
      document.getElementById('memory-play-again')?.addEventListener('click', () => {
        this.init();
      });
    }, 100);
    
    checkCertificateEligibility?.();
  },
  
  restart() {
    if (confirm('¿Reiniciar el juego de memoria?')) {
      this.stopTimer();
      this.init();
    }
  },
  
  bindEvents() {
    const restartBtn = document.getElementById('memory-restart');
    if (restartBtn) {
      restartBtn.onclick = () => this.restart();
    }
  }
};

window.memoryInit = () => MemoryGame.init();