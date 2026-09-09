/**
 * main.js - Navegación corregida y robusta
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🦷 Sonrisa Saludable - Iniciando...');
  
  // ===== INICIALIZAR UTILIDADES =====
  if (typeof SoundManager !== 'undefined') SoundManager.init();
  if (typeof ProgressManager !== 'undefined') ProgressManager.init();
  if (typeof Accessibility !== 'undefined') Accessibility.init();
  
  // ===== FUNCIÓN DE NAVEGACIÓN PRINCIPAL =====
  window.navigateToGame = function(gameId) {
    console.log('🎮 Navegando a:', gameId);
    
    // 1. Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
      screen.hidden = true;
      screen.setAttribute('aria-hidden', 'true');
    });
    
    // 2. Mostrar pantalla de home por defecto
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
      homeScreen.classList.remove('active');
      homeScreen.hidden = true;
      homeScreen.setAttribute('aria-hidden', 'true');
    }
    
    // 3. Mostrar el juego seleccionado
    const gameScreen = document.getElementById(`${gameId}-screen`);
    if (gameScreen) {
      gameScreen.classList.add('active');
      gameScreen.hidden = false;
      gameScreen.setAttribute('aria-hidden', 'false');
      
      // 4. Inicializar el juego específico
      initializeGame(gameId);
      
      // 5. Scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // 6. Actualizar mensaje de Dentín
      updateDentinMessage(gameId);
      
      console.log('✅ Juego cargado:', gameId);
    } else {
      console.error('❌ No se encontró la pantalla:', gameId);
    }
  };
  
  // ===== INICIALIZAR JUEGO SEGÚN ID =====
  function initializeGame(gameId) {
    const initFunctions = {
      'quiz': () => { if (typeof quizInit === 'function') quizInit(); },
      'memory': () => { if (typeof memoryInit === 'function') memoryInit(); },
      'drag-teeth': () => { if (typeof dragTeethInit === 'function') dragTeethInit(); },
      'food-sort': () => { if (typeof foodSortInit === 'function') foodSortInit(); }
    };
    
    if (initFunctions[gameId]) {
      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(initFunctions[gameId], 100);
    }
  }
  
  // ===== VOLVER AL HOME =====
  window.navigateToHome = function() {
    console.log('🏠 Volviendo al home');
    
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
      screen.hidden = true;
      screen.setAttribute('aria-hidden', 'true');
    });
    
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
      homeScreen.classList.add('active');
      homeScreen.hidden = false;
      homeScreen.setAttribute('aria-hidden', 'false');
    }
    
    updateDentinMessage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // ===== ACTUALIZAR MENSAJE DE DENTÍN =====
  function updateDentinMessage(screen) {
    const messages = {
      'home': '¡Hola! Soy Dentín 👋<br>¿Listo para aprender sobre tu sonrisa?',
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
  }
  
  // ===== BIND DE BOTONES DEL MENÚ PRINCIPAL =====
  function bindMenuButtons() {
    const menuButtons = document.querySelectorAll('[data-game]');
    console.log('🔘 Botones de menú encontrados:', menuButtons.length);
    
    menuButtons.forEach(button => {
      // Remover listeners previos para evitar duplicados
      button.replaceWith(button.cloneNode(true));
    });
    
    // Volver a seleccionar y agregar listeners
    document.querySelectorAll('[data-game]').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const gameId = this.getAttribute('data-game');
        console.log('🖱️ Click en juego:', gameId);
        navigateToGame(gameId);
      });
      
      // Soporte para teclado (Enter y Space)
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }
  
  // ===== BIND DE BOTONES "VOLVER" =====
  function bindBackButtons() {
    document.querySelectorAll('[data-back="home"]').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        navigateToHome();
      });
    });
  }
  
  // ===== MODAL DE PADRES =====
  function bindParentsModal() {
    const parentsBtn = document.getElementById('parents-mode');
    const parentsModal = document.getElementById('parents-modal');
    
    if (parentsBtn && parentsModal) {
      parentsBtn.addEventListener('click', () => {
        parentsModal.showModal();
      });
      
      const closeBtn = parentsModal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          parentsModal.close();
        });
      }
      
      parentsModal.addEventListener('click', (e) => {
        if (e.target === parentsModal) parentsModal.close();
      });
    }
  }
  
  // ===== CERTIFICADO =====
  function bindCertificate() {
    const printBtn = document.getElementById('print-cert');
    const playAgainBtn = document.getElementById('play-again');
    
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
    
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        navigateToHome();
      });
    }
    
    // Fecha del certificado
    const certDate = document.getElementById('cert-date');
    if (certDate) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      certDate.textContent = new Date().toLocaleDateString('es-ES', options);
    }
  }
  
  // ===== INICIALIZAR TODO =====
  function init() {
    bindMenuButtons();
    bindBackButtons();
    bindParentsModal();
    bindCertificate();
    
    // Asegurar que solo home sea visible al inicio
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'home-screen') {
        screen.classList.remove('active');
        screen.hidden = true;
        screen.setAttribute('aria-hidden', 'true');
      }
    });
    
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
      homeScreen.classList.add('active');
      homeScreen.hidden = false;
      homeScreen.setAttribute('aria-hidden', 'false');
    }
    
    console.log('✅ Navegación inicializada correctamente');
  }
  
  // Ejecutar inicialización
  init();
});