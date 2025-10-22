// --- CONFIGURACIÓN INICIAL ---
const palos = ["picas", "trebol", "corazon", "diamante"];
const valores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Estado del juego
let nivel;
let puntuacion;
let rachaCorrectas;
let vidas;
let respuestaCorrecta;
let cartasUsadas;

// Variables del cronómetro
let timerInterval;
let tiempoRestante = 45;
const rachaNecesaria = 3; // Cambiado a 3 para subir de nivel cada 3 respuestas correctas

// Elementos del DOM
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
//const livesContainer = document.getElementById("lives-container");
const timerDisplay = document.getElementById("timer");
const gameBoard = document.getElementById("game-board");
const userAnswerInput = document.getElementById("user-answer");
const submitBtn = document.getElementById("submit-btn");
const feedbackDisplay = document.getElementById("feedback");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreDisplay = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const rachaDisplay = document.getElementById("streak");

// --- LÓGICA DEL JUEGO ---

function iniciarJuego() {
  nivel = 1;
  puntuacion = 0;
  rachaCorrectas = 0;
  vidas = 3;

  gameOverScreen.classList.add("hidden");
  submitBtn.disabled = false;
  userAnswerInput.disabled = false;

  actualizarHUD();
  generarPregunta();
}

function actualizarHUD() {
  scoreDisplay.textContent = puntuacion;
  levelDisplay.textContent = nivel;
  rachaDisplay.textContent = `${rachaCorrectas}/${rachaNecesaria}`;
  console.log(`Racha actual: ${rachaCorrectas}/${rachaNecesaria}`);

  /* Dibuja los corazones
  livesContainer.innerHTML = "";
  for (let i = 0; i < vidas; i++) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = "♥";
    livesContainer.appendChild(heart);
  }*/
}

function finDelJuego() {
  clearInterval(timerInterval);
  finalScoreDisplay.textContent = puntuacion;
  gameOverScreen.classList.remove("hidden");
  submitBtn.disabled = true;
  userAnswerInput.disabled = true;
}

function obtenerValorCarta(carta) {
  if (carta.palo === "corazon" || carta.palo === "diamante") {
    return -carta.valor;
  }
  return carta.valor;
}

function calcularResultadoCorrecto(numeros, operadores) {
  let nums = [...numeros];
  let ops = [...operadores];

  let i = 0;
  while (i < ops.length) {
    if (ops[i] === "*") {
      nums.splice(i, 2, nums[i] * nums[i + 1]);
      ops.splice(i, 1);
    } else {
      i++;
    }
  }

  let resultadoFinal = nums[0];
  for (let j = 0; j < ops.length; j++) {
    if (ops[j] === "+") {
      resultadoFinal += nums[j + 1];
    } else if (ops[j] === "-") {
      resultadoFinal -= nums[j + 1];
    }
  }
  return resultadoFinal;
}

function generarPregunta() {
  gameBoard.innerHTML = "";
  userAnswerInput.value = "";
  feedbackDisplay.textContent = "";
  cartasUsadas = [];
  userAnswerInput.focus();

  let numCartas = nivel === 1 ? 2 : 3 + (nivel - 2);
  let operacionesPosibles = nivel === 1 ? ["+", "-"] : ["+", "-", "*"];

  const cartasSeleccionadas = [];
  for (let i = 0; i < numCartas; i++) {
    let cartaUnica = false;
    let nuevaCarta;
    while (!cartaUnica) {
      nuevaCarta = {
        palo: palos[Math.floor(Math.random() * palos.length)],
        valor: valores[Math.floor(Math.random() * valores.length)],
      };
      if (
        !cartasUsadas.some(
          (c) => c.palo === nuevaCarta.palo && c.valor === nuevaCarta.valor,
        )
      ) {
        cartaUnica = true;
        cartasUsadas.push(nuevaCarta);
      }
    }
    cartasSeleccionadas.push(nuevaCarta);
  }

  const operadoresSeleccionados = Array.from(
    { length: numCartas - 1 },
    () =>
      operacionesPosibles[
        Math.floor(Math.random() * operacionesPosibles.length)
      ],
  );

  const valoresNumericos = cartasSeleccionadas.map((c) => obtenerValorCarta(c));
  respuestaCorrecta = calcularResultadoCorrecto(
    valoresNumericos,
    operadoresSeleccionados,
  );

  cartasSeleccionadas.forEach((carta, index) => {
    const img = document.createElement("img");
    img.src = `cartas/${carta.palo}_${carta.valor}.webp`;
    img.className = "card-image";
    gameBoard.appendChild(img);
    if (index < operadoresSeleccionados.length) {
      const opSpan = document.createElement("span");
      opSpan.className = "operator";
      opSpan.textContent = operadoresSeleccionados[index];
      gameBoard.appendChild(opSpan);
    }
  });

  iniciarCronometro();
}

function comprobarRespuesta() {
  clearInterval(timerInterval);
  const respuestaUsuario = parseInt(userAnswerInput.value);

  if (isNaN(respuestaUsuario)) {
    feedbackDisplay.textContent = "Por favor, introduce un número.";
    setTimeout(generarPregunta, 1500);
    return;
  }

  if (respuestaUsuario === respuestaCorrecta) {
    feedbackDisplay.textContent = "¡Correcto!";
    feedbackDisplay.className = "correct";
    puntuacion += 10;
    rachaCorrectas++;
  } else {
    feedbackDisplay.textContent = `Incorrecto. La respuesta era ${respuestaCorrecta}`;
    feedbackDisplay.className = "incorrect";
    rachaCorrectas = 0;
    //vidas--; // Pierde una vida

    if (vidas <= 0) {
      actualizarHUD();
      setTimeout(finDelJuego, 4000);
      return;
    }
  }

  if (rachaCorrectas >= rachaNecesaria) {
    nivel++;
    rachaCorrectas = 0;
    vidas = 3; // Regenera las vidas al subir de nivel
    feedbackDisplay.textContent = "¡Subiste de nivel! ¡Vidas regeneradas!";
  }

  actualizarHUD();
  setTimeout(generarPregunta, 3000);
}

// --- CRONÓMETRO ---
function iniciarCronometro() {
  tiempoRestante = 45;
  timerDisplay.textContent = tiempoRestante;
  timerDisplay.classList.remove("low-time");
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tiempoRestante--;
    timerDisplay.textContent = tiempoRestante;
    if (tiempoRestante <= 10) {
      timerDisplay.classList.add("low-time");
    }
    if (tiempoRestante <= 0) {
      clearInterval(timerInterval);
      tiempoAgotado();
    }
  }, 1000);
}

function tiempoAgotado() {
  //vidas--; // Perder una vida por tiempo agotado
  feedbackDisplay.textContent = `¡Tiempo agotado! La respuesta era ${respuestaCorrecta}`;
  feedbackDisplay.className = "incorrect";
  rachaCorrectas = 0;

  if (vidas <= 0) {
    actualizarHUD();
    setTimeout(finDelJuego, 4000);
    return;
  }

  actualizarHUD();
  setTimeout(generarPregunta, 4000);
}

// --- EVENTOS Y ARRANQUE ---
submitBtn.addEventListener("click", comprobarRespuesta);
userAnswerInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    comprobarRespuesta();
  }
});
restartBtn.addEventListener("click", iniciarJuego);

iniciarJuego(); // Inicia el juego al cargar la página
