// --- CONFIGURACIÓN INICIAL ---
const palos = ['picas', 'trebol', 'corazon', 'diamante'];
const valores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Estado del juego
let nivel = 1;
let puntuacion = 0;
let rachaCorrectas = 0;
let respuestaCorrecta = 0;
let cartasUsadas = [];

// Variables del cronómetro
let timerInterval;
let tiempoRestante = 30;

// Elementos del DOM
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const timerDisplay = document.getElementById('timer');
const gameBoard = document.getElementById('game-board');
const userAnswerInput = document.getElementById('user-answer');
const submitBtn = document.getElementById('submit-btn');
const feedbackDisplay = document.getElementById('feedback');


// --- LÓGICA DEL CRONÓMETRO ---

function iniciarCronometro() {
    tiempoRestante = 30;
    timerDisplay.textContent = tiempoRestante;
    timerDisplay.classList.remove('low-time');

    clearInterval(timerInterval); // Limpiar cualquier cronómetro anterior

    timerInterval = setInterval(() => {
        tiempoRestante--;
        timerDisplay.textContent = tiempoRestante;

        if (tiempoRestante <= 10) {
            timerDisplay.classList.add('low-time');
        }

        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            tiempoAgotado();
        }
    }, 1000);
}

function tiempoAgotado() {
    feedbackDisplay.textContent = `¡Tiempo agotado! La respuesta era ${respuestaCorrecta}`;
    feedbackDisplay.className = 'incorrect';
    rachaCorrectas = 0; // Se reinicia la racha
    actualizarHUD();
    setTimeout(generarPregunta, 2000); // Prepara la siguiente pregunta
}

// --- LÓGICA DEL JUEGO ---

/**
 * Actualiza toda la información visible (puntuación, nivel, etc.)
 */
function actualizarHUD() {
    scoreDisplay.textContent = puntuacion;
    streakDisplay.textContent = nivel<=1 ? `${rachaCorrectas}/3` : `${rachaCorrectas}/5`;
    levelDisplay.textContent = nivel;
}

/**
 * Obtiene el valor numérico de una carta.
 */
function obtenerValorCarta(carta) {
    if (carta.palo === 'corazon' || carta.palo === 'diamante') {
        return -carta.valor;
    }
    return carta.valor;
}

/**
 * Genera una nueva pregunta basada en el nivel actual.
 */
function generarPregunta() {
    gameBoard.innerHTML = '';
    userAnswerInput.value = '';
    feedbackDisplay.textContent = '';
    cartasUsadas = [];
    userAnswerInput.focus(); // Pone el cursor listo para escribir
    
    let numCartas = 0;
    let operaciones = [];

    if (nivel === 1) {
        numCartas = 2;
        operaciones = ['+', '-'];
    } else {
        numCartas = 3 + (nivel - 2); // Nivel 2: 3 cartas, Nivel 3: 4, etc.
        operaciones = ['+', '-', '*']; // Eliminamos la división '/'
    }

    const cartasSeleccionadas = [];
    const operadoresSeleccionados = [];

    for (let i = 0; i < numCartas; i++) {
        let cartaUnica = false;
        let nuevaCarta;
        while (!cartaUnica) {
            const paloAleatorio = palos[Math.floor(Math.random() * palos.length)];
            const valorAleatorio = valores[Math.floor(Math.random() * valores.length)];
            nuevaCarta = { palo: paloAleatorio, valor: valorAleatorio };
            if (!cartasUsadas.some(c => c.palo === nuevaCarta.palo && c.valor === nuevaCarta.valor)) {
                cartaUnica = true;
                cartasUsadas.push(nuevaCarta);
            }
        }
        cartasSeleccionadas.push(nuevaCarta);
    }
    
    for (let i = 0; i < numCartas - 1; i++) {
        const opAleatorio = operaciones[Math.floor(Math.random() * operaciones.length)];
        operadoresSeleccionados.push(opAleatorio);
    }

    // Calcular la respuesta correcta (orden secuencial)
    respuestaCorrecta = obtenerValorCarta(cartasSeleccionadas[0]);
    for (let i = 0; i < operadoresSeleccionados.length; i++) {
        const valorSiguienteCarta = obtenerValorCarta(cartasSeleccionadas[i + 1]);
        switch (operadoresSeleccionados[i]) {
            case '+': respuestaCorrecta += valorSiguienteCarta; break;
            case '-': respuestaCorrecta -= valorSiguienteCarta; break;
            case '*': respuestaCorrecta *= valorSiguienteCarta; break;
        }
    }

    // Mostrar en pantalla
    cartasSeleccionadas.forEach((carta, index) => {
        const img = document.createElement('img');
        img.src = `cartas/${carta.palo}_${carta.valor}.webp`;
        img.className = 'card-image';
        gameBoard.appendChild(img);
        
        if (index < operadoresSeleccionados.length) {
            const opSpan = document.createElement('span');
            opSpan.className = 'operator';
            opSpan.textContent = operadoresSeleccionados[index];
            gameBoard.appendChild(opSpan);
        }
    });

    // Iniciar el cronómetro para la nueva pregunta
    iniciarCronometro();
}

/**
 * Comprueba la respuesta del usuario.
 */
function comprobarRespuesta() {
    clearInterval(timerInterval); // Detener el cronómetro al responder
    const respuestaUsuario = parseInt(userAnswerInput.value);
    
    if (isNaN(respuestaUsuario)) {
        feedbackDisplay.textContent = "Por favor, introduce un número.";
        setTimeout(generarPregunta, 2000);
        return;
    }

    if (respuestaUsuario === respuestaCorrecta) {
        feedbackDisplay.textContent = "¡Correcto!";
        feedbackDisplay.className = 'correct';
        puntuacion += (nivel * 10) + tiempoRestante; // Bonus por tiempo restante
        rachaCorrectas++;
    } else {
        feedbackDisplay.textContent = `Incorrecto. La respuesta era ${respuestaCorrecta}`;
        feedbackDisplay.className = 'incorrect';
        rachaCorrectas = 0;
    }
    
    // Comprobar si sube de nivel
    const rachaNecesaria = nivel === 1 ? 3 : 5;
    if (rachaCorrectas >= rachaNecesaria) {
        nivel++;
        rachaCorrectas = 0;
        feedbackDisplay.textContent = "¡Subiste de nivel!";
    }

    actualizarHUD();
    setTimeout(generarPregunta, 1000);
}

// --- INICIO DEL JUEGO ---
submitBtn.addEventListener('click', comprobarRespuesta);
userAnswerInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        comprobarRespuesta();
    }
});

generarPregunta(); // Generar la primera pregunta al cargar la página