/**
 * utilidades.js - Funciones compartidas para la app Sonrisa Saludable
 */

// ===== GESTIÓN DE SONIDOS =====
const SoundManager = {
  enabled: true,
  
  init() {
    // Verificar preferencia guardada
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
    this.updateButton();
  },
  
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    this.updateButton();
    return this.enabled;
  },
  
  updateButton() {
    const btn = document.getElementById('toggle-sound');
    if (btn) {
      btn.innerHTML = this.enabled ? '🔊' : '🔇';
      btn.setAttribute('aria-label', this.enabled ? 'Desactivar sonidos' : 'Activar sonidos');
    }
  },
  
  play(type) {
    if (!this.enabled) return;
    
    // En producción, aquí cargarías archivos de audio reales
    // Para demo, usamos Web Audio API básico o console
    const sounds = {
      success: () => console.log('🔊 Sonido: éxito'),
      error: () => console.log('🔊 Sonido: error'),
      flip: () => console.log('🔊 Sonido: voltear carta'),
      drop: () => console.log('🔊 Sonido: soltar'),
      celebrate: () => console.log('🔊 Sonido: celebración'),
    };
    
    if (sounds[type]) sounds[type]();
  }
};

// ===== GESTIÓN DE PROGRESO =====
const ProgressManager = {
  data: {
    stars: 0,
    completedGames: [],
    quizStars: 0,
    memoryStars: 0,
    dragStars: 0,
    sortStars: 0,
    playerName: ''
  },
  
  init() {
    const saved = localStorage.getItem('dentalGameProgress');
    if (saved) {
      try {
        this.data = { ...this.data, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error cargando progreso:', e);
      }
    }
    this.updateUI();
  },
  
  save() {
    localStorage.setItem('dentalGameProgress', JSON.stringify(this.data));
    this.updateUI();
  },
  
  addStars(game, amount) {
    const key = `${game}Stars`;
    if (this.data[key] !== undefined) {
      this.data[key] = Math.min(this.data[key] + amount, 10);
      this.data.stars = Math.min(
        this.data.quizStars + 
        this.data.memoryStars + 
        this.data.dragStars + 
        this.data.sortStars, 
        40
      );
      this.save();
      return this.data[key];
    }
    return 0;
  },
  
  markCompleted(game) {
    if (!this.data.completedGames.includes(game)) {
      this.data.completedGames.push(game);
      this.save();
    }
  },
  
  setPlayerName(name) {
    this.data.playerName = name.trim() || 'Jugador';
    this.save();
  },
  
  updateUI() {
    // Actualizar resumen en home
    const totalStars = document.getElementById('total-stars');
    const completedGames = document.getElementById('completed-games');
    
    if (totalStars) totalStars.textContent = this.data.stars;
    if (completedGames) completedGames.textContent = this.data.completedGames.length;
    
    // Actualizar estrellas por juego
    const updates = [
      { id: 'quiz-stars', value: this.data.quizStars },
      { id: 'memory-stars', value: this.data.memoryStars },
      { id: 'drag-stars', value: this.data.dragStars },
      { id: 'sort-stars', value: this.data.sortStars }
    ];
    
    updates.forEach(({ id, value }) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `⭐ ${value}/10`;
    });
  },
  
  reset() {
    if (confirm('¿Seguro que quieres reiniciar todo tu progreso?')) {
      localStorage.removeItem('dentalGameProgress');
      this.data = {
        stars: 0,
        completedGames: [],
        quizStars: 0,
        memoryStars: 0,
        dragStars: 0,
        sortStars: 0,
        playerName: ''
      };
      this.updateUI();
      return true;
    }
    return false;
  }
};

// ===== MANEJO DE NAVEGACIÓN =====
const Navigation = {
  currentScreen: 'home',
  
  show(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
      screen.hidden = true;
    });
    
    // Mostrar la solicitada
    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
      target.classList.add('active');
      target.hidden = false;
      this.currentScreen = screenId;
      
      // Actualizar mensaje de Dientín según pantalla
      this.updateDentinMessage(screenId);
      
      // Scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  
  updateDentinMessage(screen) {
    const messages = {
      'home': '¡Hola! Soy Dientín 👋<br>¿Listo para aprender sobre tu sonrisa?',
      'quiz': '🤔 Lee con atención y elige la mejor respuesta. ¡Tú puedes!',
      'memory': '🧠 ¡Concentración! Encuentra las parejas de dientes.',
      'drag-teeth': '🦷 Arrastra cada diente a su lugar correcto. ¡Observa bien!',
      'food-sort': '🍎 ¿Sabes qué alimentos cuidan tu sonrisa? ¡Clasifícalos!',
      'certificate': '🎉 ¡Increíble! Eres un Experto en Sonrisas. ¡Orgulloso de ti!'
    };
    
    const msgEl = document.getElementById('dentin-message');
    if (msgEl && messages[screen]) {
      msgEl.innerHTML = messages[screen];
    }
  },
  
  bindButtons() {
    // Botones de navegación principal
    document.querySelectorAll('[data-game]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const game = e.currentTarget.dataset.game;
        Navigation.show(game);
        // Inicializar juego si tiene función init
        if (typeof window[`${game.replace('-', '')}Init`] === 'function') {
          window[`${game.replace('-', '')}Init`]();
        }
      });
    });
    
    // Botones "Volver"
    document.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.back;
        Navigation.show(target === 'home' ? 'home' : target);
      });
    });
  }
};

// ===== ACCESIBILIDAD =====
const Accessibility = {
  highContrast: false,
  
  init() {
    // Verificar preferencia guardada
    const saved = localStorage.getItem('highContrast');
    if (saved === 'true') {
      this.toggle();
    }
    
    // Bind button
    const btn = document.getElementById('toggle-contrast');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
    
    // Soporte teclado para tarjetas de juego
    this.setupKeyboardNavigation();
  },
  
  toggle() {
    this.highContrast = !this.highContrast;
    document.body.classList.toggle('high-contrast', this.highContrast);
    localStorage.setItem('highContrast', this.highContrast);
    
    const btn = document.getElementById('toggle-contrast');
    if (btn) {
      btn.setAttribute('aria-pressed', this.highContrast);
    }
  },
  
  setupKeyboardNavigation() {
    // Permitir navegar con flechas en grids de opciones
    document.addEventListener('keydown', (e) => {
      const focusable = document.activeElement;
      if (!focusable) return;
      
      const grid = focusable.closest('.options-grid, .memory-board, .teeth-palette, .items-palette');
      if (!grid) return;
      
      const items = Array.from(grid.querySelectorAll('button, [draggable], .memory-card'))
        .filter(el => !el.disabled && !el.classList.contains('matched'));
      
      const currentIndex = items.indexOf(focusable);
      if (currentIndex === -1) return;
      
      let nextIndex;
      const cols = grid.classList.contains('memory-board') ? 4 : 
                   grid.classList.contains('options-grid') ? 1 : 
                   grid.classList.contains('teeth-palette') || grid.classList.contains('items-palette') ? 3 : 1;
      
      switch(e.key) {
        case 'ArrowRight':
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(currentIndex + cols, items.length - 1);
          break;
        case 'ArrowUp':
          nextIndex = Math.max(currentIndex - cols, 0);
          break;
        default:
          return;
      }
      
      e.preventDefault();
      items[nextIndex]?.focus();
    });
  }
};

// ===== UTILIDADES GENERALES =====
const Utils = {
  // Retraso promesificado para animaciones
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Elemento aleatorio de un array
  random: (arr) => arr[Math.floor(Math.random() * arr.length)],
  
  // Barajar array (Fisher-Yates)
  shuffle: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  
  // Formato de tiempo MM:SS
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  },
  
  // Mostrar/ocultar con animación
  fadeIn: (el) => {
    el.hidden = false;
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });
  },
  
  fadeOut: (el) => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.hidden = true;
      el.style.opacity = '1';
    }, 300);
  },
  
  // Vibración háptica (si está disponible)
  vibrate: (pattern = [50]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
};

// Exportar para uso global (vanilla JS)
window.SoundManager = SoundManager;
window.ProgressManager = ProgressManager;
window.Navigation = Navigation;
window.Accessibility = Accessibility;
window.Utils = Utils;