document.getElementById('validar-codigo').addEventListener('click', () => {
    const codigoInput = document.getElementById('codigo-input').value.trim();
    const result = validateCode(codigoInput);
    const validationTimeElement = document.getElementById('validation-time');
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    if (result.valid) {
        validationTimeElement.textContent = `Código válido validado el: ${formattedDate}`;
        addMoreCards(result.type); // Generar las raspaditas según el tipo de código
    } else {
        validationTimeElement.textContent = `Código inválido: ${result.message}`;
    }
});

// Función para validar el código
function validateCode(codigo) {
    if (codigosGanar.includes(codigo)) {
        return { valid: true, message: 'Código ganador. Generando nuevas raspaditas.', type: 'ganar' };
    } 
    if (codigosPerder.includes(codigo)) {
        return { valid: true, message: 'Código perdedor. Generando nuevas raspaditas.', type: 'perder' };
    }
    
    return { valid: false, message: 'Código inválido.' };
}

// Generación de las raspaditas
function addMoreCards(resultType) {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = ''; // Limpiar cualquier tarjeta existente

    const prizes = generatePrizes(resultType); // Obtener premios aleatorios según el tipo de código

    // Crear 9 tarjetas (disposición vertical)
    for (let i = 0; i < 9; i++) {
        const cardId = `card${i + 1}`;
        const canvasId = `canvas${i + 1}`;
        const prizeImage = prizes[i];

        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.id = cardId;

        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId;
        newCanvas.className = 'scratch-canvas';
        newCanvas.width = 200;
        newCanvas.height = 200;

        const newPrize = document.createElement('div');
        newPrize.className = 'prize hidden';

        const newImage = document.createElement('img');
        newImage.alt = `Billete ${i + 1}`;
        newImage.className = 'prize-image';

        newPrize.appendChild(newImage);
        newCard.appendChild(newCanvas);
        newCard.appendChild(newPrize);
        cardsContainer.appendChild(newCard);

        // Inicializar la tarjeta para raspar
        initScratchCard(canvasId, cardId, prizeImage);
    }
}

// Función para inicializar cada tarjeta de rascar
function initScratchCard(canvasId, cardId, prizeImage) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const prize = document.querySelector(`#${cardId} .prize img`);
    prize.src = prizeImage;

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = 'imagen_tapada.png'; // Imagen tapada al principio

    loadBrushPattern(ctx, (pattern) => {
        let isScratched = false; // Para verificar si se ha rasgado
        let scratchesLeft = 9; // Total de 9 tarjetas

        function scratch(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = pattern;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();
        }

        function scratchAutomatically() {
            const interval = setInterval(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                scratch(x, y);
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                document.querySelector(`#${cardId} .prize`).style.visibility = 'visible';
                isScratched = true;
                scratchesLeft--;

                // Verificar si todos los raspados han terminado
                if (scratchesLeft === 0) {
                    checkIfWin(resultType);
                }
            }, 5000);
        }

        canvas.addEventListener('click', () => {
            if (!isScratched) {
                scratchAutomatically();
            }
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!isScratched) {
                scratchAutomatically();
            }
        }, { passive: false });
    });
}

// Función para cargar el patrón de raspado
function loadBrushPattern(ctx, callback) {
    const img = new Image();
    img.onload = function() {
        const pattern = ctx.createPattern(img, 'repeat');
        callback(pattern);
    };
    img.src = 'brush.png'; // Imagen del patrón de raspado
}

// Función para generar premios aleatorios según el tipo de código
function generatePrizes(resultType) {
    const prizeImages = ['billete8.png', 'suerte_laproxima.png'];

    let prizes = [];

    if (resultType === 'ganar') {
        // Generar entre 1 o 2 filas ganadoras (dos iguales y uno de "suerte la próxima" en cada fila)
        let winningRows = getRandomInt(1, 3); // Entre 1 y 2 filas ganadoras

        for (let i = 0; i < 3; i++) {
            const randomPrize = prizeImages[getRandomInt(0, prizeImages.length - 1)];
            const luckyPosition = getRandomInt(0, 3); // Posición aleatoria para "suerte la próxima"

            const rowPrizes = [];
            // Generar filas con premios aleatorios
            for (let j = 0; j < 3; j++) {
                if (j === luckyPosition && winningRows > 0) {
                    rowPrizes.push('suerte_laproxima.png');
                } else {
                    rowPrizes.push(randomPrize);
                }
            }

            if (winningRows > 0) {
                // Asegurarse de que haya 2 billetes iguales y 1 "suerte la próxima"
                const winnerPosition = getRandomInt(0, 3); // Posición para "suerte la próxima"
                rowPrizes[winnerPosition] = 'suerte_laproxima.png';
                winningRows--; // Disminuir el contador de filas ganadoras
            }

            prizes.push(...rowPrizes); // Añadir la fila de premios a las raspaditas
        }
    } else if (resultType === 'perder') {
        // Generar premios aleatorios para "perder", asegurando 2 billetes iguales y uno de suerte la próxima en cada fila
        for (let i = 0; i < 3; i++) {
            const randomPrize = prizeImages[getRandomInt(0, prizeImages.length - 1)];
            const luckyPosition = getRandomInt(0, 3); // Posición aleatoria para "suerte la próxima"
            
            const rowPrizes = [];
            // Llenar la fila con dos premios iguales y uno de "suerte la próxima"
            for (let j = 0; j < 3; j++) {
                if (j === luckyPosition) {
                    rowPrizes.push('suerte_laproxima.png');
                } else {
                    rowPrizes.push(randomPrize);
                }
            }

            prizes.push(...rowPrizes); // Añadir la fila de premios a las raspaditas
        }
    }

    return prizes;
}

// Función para mostrar mensaje de victoria o derrota
function showMessage(message) {
    const cardsContainer = document.getElementById('cards-container');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;
    
    // Eliminar cualquier mensaje previo
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Asegurarse que el mensaje aparezca al final de las tarjetas
    cardsContainer.appendChild(messageElement);
}

// Función para verificar si el jugador ganó
function checkIfWin(resultType) {
    const prizes = [];
    const prizeImages = document.querySelectorAll('.prize img');
    prizeImages.forEach(img => prizes.push(img.src));

    if (resultType === 'ganar') {
        // Todos los premios deben ser iguales para ganar
        if (prizes[0] === prizes[1] && prizes[1] === prizes[2] && prizes[0] !== 'suerte_laproxima.png') {
            showMessage("¡Felicidades, has ganado! Los 3 billetes son iguales.");
        } else {
            showMessage("¡Lo siento! Los billetes no son iguales.");
        }
    } else if (resultType === 'perder') {
        // Asegurarse de que uno de los premios sea "suerte la próxima"
        showMessage("¡Lo siento! Todos los billetes son 'Suerte la próxima'.");
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
