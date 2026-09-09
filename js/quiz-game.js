/**
 * quiz-game.js - Juego de selección múltiple
 */

const QuizGame = {
  questions: [
    {
      question: "¿Qué diente usamos para CORTAR alimentos como una manzana?",
      options: ["Incisivo", "Molar", "Canino"],
      correct: 0,
      fact: "¡Correcto! Los incisivos son como tijeras naturales en tu boca. 🍎"
    },
    {
      question: "¿Cuántas veces al día debes cepillarte los dientes?",
      options: ["1 vez", "2 veces", "3 veces"],
      correct: 2,
      fact: "¡Excelente! Cepillarse 3 veces al día mantiene tu sonrisa brillante. ✨"
    },
    {
      question: "¿Qué tipo de diente tiene forma de colmillo suave?",
      options: ["Premolar", "Canino", "Incisivo"],
      correct: 1,
      fact: "¡Sí! Los caninos nos ayudan a desgarrar alimentos. 🦷"
    },
    {
      question: "¿Qué hace el hilo dental?",
      options: [
        "Limpia entre los dientes donde el cepillo no llega",
        "Blanquea los dientes",
        "Fortalece el esmalte"
      ],
      correct: 0,
      fact: "¡Muy bien! El hilo dental llega donde el cepillo no puede. 🧵"
    },
    {
      question: "¿Los molares sirven para...?",
      options: ["Cortar", "Moler alimentos", "Decorar la sonrisa"],
      correct: 1,
      fact: "¡Exacto! Los molares son como moledores que trituran la comida. 🔨"
    },
    {
      question: "¿Cada cuántos meses debes cambiar tu cepillo de dientes?",
      options: ["1 mes", "3 meses", "1 año"],
      correct: 1,
      fact: "¡Correcto! Un cepillo nuevo limpia mejor y es más higiénico. 🪥"
    },
    {
      question: "¿Qué alimento es AMIGO de tus dientes?",
      options: ["Caramelo", "Refresco", "Queso"],
      correct: 2,
      fact: "¡Sí! El queso tiene calcio que fortalece tus dientes. 🧀"
    },
    {
      question: "¿Por qué es importante visitar al dentista?",
      options: [
        "Solo cuando me duele un diente",
        "Cada 6 meses para prevención",
        "Nunca, tengo miedo"
      ],
      correct: 1,
      fact: "¡Muy inteligente! La prevención evita problemas mayores. 👨‍⚕️"
    },
    {
      question: "¿Los premolares aparecen alrededor de qué edad?",
      options: ["5 años", "10 años", "15 años"],
      correct: 1,
      fact: "¡Correcto! Los premolares reemplazan a los dientes de leche. 🌟"
    },
    {
      question: "¿Qué bebida es MEJOR para tus dientes?",
      options: ["Refresco de cola", "Jugo con mucha azúcar", "Agua natural"],
      correct: 2,
      fact: "¡Excelente elección! El agua limpia y no daña el esmalte. 💧"
    }
  ],
  
  state: {
    currentQuestion: 0,
    score: 0,
    answered: false
  },
  
  init() {
    this.state = { currentQuestion: 0, score: 0, answered: false };
    this.renderQuestion();
    this.bindEvents();
  },
  
  renderQuestion() {
    const q = this.questions[this.state.currentQuestion];
    const progress = document.getElementById('quiz-progress');
    const score = document.getElementById('quiz-score');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    
    // Actualizar UI
    if (progress) progress.textContent = `Pregunta ${this.state.currentQuestion + 1}/10`;
    if (score) score.textContent = `⭐ ${this.state.score}`;
    if (questionText) questionText.textContent = q.question;
    
    // Limpiar opciones anteriores
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      optionsContainer.setAttribute('aria-live', 'polite');
      
      q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-label', `Opción ${String.fromCharCode(65 + index)}: ${option}`);
        btn.innerHTML = `<span class="letter">${String.fromCharCode(65 + index)}</span> ${option}`;
        btn.dataset.index = index;
        
        btn.addEventListener('click', () => this.handleAnswer(index, btn));
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
          }
        });
        
        optionsContainer.appendChild(btn);
      });
    }
    
    // Ocultar feedback
    if (feedback) {
      feedback.hidden = true;
      feedback.className = 'feedback';
    }
    
    // Focus en primera opción para accesibilidad
    setTimeout(() => {
      optionsContainer?.querySelector('.option-btn')?.focus();
    }, 100);
  },
  
  handleAnswer(selectedIndex, btnElement) {
    if (this.state.answered) return;
    this.state.answered = true;
    
    const q = this.questions[this.state.currentQuestion];
    const options = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');
    const feedbackMsg = document.getElementById('feedback-message');
    const nextBtn = document.getElementById('next-question');
    
    // Deshabilitar todas las opciones
    options.forEach(btn => btn.disabled = true);
    
    // Marcar respuesta
    if (selectedIndex === q.correct) {
      // Correcta
      btnElement.classList.add('correct');
      this.state.score++;
      SoundManager.play('success');
      
      if (feedbackMsg) {
        feedbackMsg.innerHTML = `✅ ¡Muy bien! ${q.fact}`;
      }
      if (feedback) {
        feedback.className = 'feedback success-animation';
        feedback.hidden = false;
      }
    } else {
      // Incorrecta
      btnElement.classList.add('incorrect');
      // Mostrar la correcta
      options[q.correct]?.classList.add('correct');
      SoundManager.play('error');
      Utils.vibrate([50, 50]);
      
      if (feedbackMsg) {
        feedbackMsg.innerHTML = `💡 Casi. ${q.fact}<br><small>La respuesta correcta era: <strong>${q.options[q.correct]}</strong></small>`;
      }
      if (feedback) {
        feedback.className = 'feedback error';
        feedback.hidden = false;
      }
    }
    
    // Configurar botón siguiente
    if (nextBtn) {
      nextBtn.onclick = () => this.nextQuestion();
      nextBtn.focus();
    }
  },
  
  nextQuestion() {
    this.state.currentQuestion++;
    
    if (this.state.currentQuestion < this.questions.length) {
      this.state.answered = false;
      this.renderQuestion();
    } else {
      this.finishGame();
    }
  },
  
  finishGame() {
    // Calcular estrellas (1 por cada 2 aciertos, mínimo 1)
    const stars = Math.max(1, Math.floor(this.state.score / 2));
    ProgressManager.addStars('quiz', stars);
    ProgressManager.markCompleted('quiz');
    
    // Mostrar resultado final
    const feedback = document.getElementById('feedback');
    const feedbackMsg = document.getElementById('feedback-message');
    
    if (feedback && feedbackMsg) {
      feedback.hidden = false;
      feedback.className = 'feedback success-animation';
      feedbackMsg.innerHTML = `
        🎉 ¡Juego terminado!<br>
        Acertaste <strong>${this.state.score}/10</strong> preguntas.<br>
        Ganaste <strong>⭐ ${stars} estrellas</strong>.<br>
        <button id="quiz-play-again" class="primary-btn" style="margin-top:1rem">🔄 Jugar de nuevo</button>
      `;
      
      // Botón jugar de nuevo
      setTimeout(() => {
        document.getElementById('quiz-play-again')?.addEventListener('click', () => {
          this.init();
        });
      }, 100);
    }
    
    SoundManager.play('celebrate');
    checkCertificateEligibility?.();
  },
  
  showHint() {
    // Pista simple: eliminar una opción incorrecta
    if (this.state.answered) return;
    
    const q = this.questions[this.state.currentQuestion];
    const incorrectOptions = q.options
      .map((opt, idx) => ({ opt, idx }))
      .filter(item => item.idx !== q.correct);
    
    const hintIndex = Utils.random(incorrectOptions).idx;
    const btn = document.querySelector(`.option-btn[data-index="${hintIndex}"]`);
    
    if (btn) {
      btn.style.opacity = '0.5';
      btn.disabled = true;
      btn.innerHTML += ' <small style="color:var(--color-text-light)">(no es esta)</small>';
      SoundManager.play('flip');
    }
  },
  
  restart() {
    if (confirm('¿Reiniciar el juego? Perderás tu progreso en esta ronda.')) {
      this.init();
    }
  },
  
  bindEvents() {
    const hintBtn = document.getElementById('quiz-hint');
    const restartBtn = document.getElementById('quiz-restart');
    
    if (hintBtn) {
      hintBtn.onclick = () => this.showHint();
    }
    
    if (restartBtn) {
      restartBtn.onclick = () => this.restart();
    }
  }
};

// Exportar función de inicialización global
window.quizInit = () => QuizGame.init();