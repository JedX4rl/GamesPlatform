let boxes = document.querySelectorAll('.box')

// Инициализация переменных
let turn = 'X'
let isGameOver = false
let gameMode = 'two-player' // 'single' или 'two-player'

// Инициализация игры при загрузке страницы
window.onload = function () {
    initializeGame()
}

function initializeGame() {
    // Добавление обработчиков событий для каждой ячейки
    boxes.forEach(box => {
        box.innerHTML = ''
        box.classList.remove('X', 'O', 'clicked')
        box.style.color = '' // Сброс цвета
        box.addEventListener('click', () => {
            if (!isGameOver && box.innerHTML === '') {
                makeMove(box, turn)
                checkWin()
                checkDraw()
                if (!isGameOver) {
                    changeTurn()
                    if (gameMode === 'single' && turn === 'O') {
                        computerMove()
                    }
                }
            }
        })
    })

    // Обработчик изменения режима игры
    document.getElementById('game-mode').addEventListener('change', e => {
        gameMode = e.target.value === 'single' ? 'single' : 'two-player'
        resetGame()
    })

    // Обработчик кнопки "Новая игра"
    document.getElementById('start-button').addEventListener('click', startGame)

    // Обработчики модального окна и кнопок
    document.getElementById('close-modal').addEventListener('click', closeModal)
    document.getElementById('save-score').addEventListener('click', saveScore)

    // Загрузка таблицы лидеров
    // loadLeaderboard()
}

function startGame() {
    resetGame()
    document.getElementById('message-overlay').style.display = 'none'
    document.getElementById('board').style.display = 'grid'
    isGameOver = false
    turn = 'X'
    // Сброс классов и содержимого ячеек
    boxes.forEach(box => {
        box.innerHTML = ''
        box.classList.remove('X', 'O', 'clicked')
        box.style.removeProperty('background-color')
        box.style.color = ''
    })
    document.getElementById('game-result').textContent = ''
}

function makeMove(box, currentTurn) {
    box.innerHTML = currentTurn
    box.classList.add('clicked')
    box.classList.add(currentTurn)
    // Установка цвета сразу
    if (currentTurn === 'X') {
        box.style.color = 'red'
    } else {
        box.style.color = 'green'
    }
}

function changeTurn() {
    turn = turn === 'X' ? 'O' : 'X'
}

function checkWin() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]

    for (let condition of winConditions) {
        const [a, b, c] = condition
        if (
            boxes[a].innerHTML !== '' &&
            boxes[a].innerHTML === boxes[b].innerHTML &&
            boxes[a].innerHTML === boxes[c].innerHTML
        ) {
            isGameOver = true
            displayWin(boxes[a].innerHTML)
            highlightWinningBoxes(condition)
            break
        }
    }
}

function highlightWinningBoxes(condition) {
    condition.forEach(index => {
        boxes[index].style.backgroundColor = '#08D9D6'
        boxes[index].style.color = '#000'
    })
}

function checkDraw() {
    if (!isGameOver) {
        let isDraw = true
        boxes.forEach(box => {
            if (box.innerHTML === '') isDraw = false
        })

        if (isDraw) {
            isGameOver = true
            displayDraw()
        }
    }
}

function displayWin(winner) {
    const gameResult = document.getElementById('game-result')
    gameResult.textContent = `Игрок ${winner} выиграл игру!`
}

function displayDraw() {
    const gameResult = document.getElementById('game-result')
    gameResult.textContent = `Игра закончилась вничью!`
}

function closeModal() {
    document.getElementById('win-modal').style.display = 'none'
}

function saveScore() {
    const playerNameInput = document.getElementById('player-name')
    const playerName = playerNameInput.value.trim()

    if (playerName === '') {
        alert('Пожалуйста, введите имя игрока.')
        return
    }

    // Определение результата игры
    let result
    if (document.getElementById('modal-title').textContent === 'Победа!') {
        const message = document.getElementById('modal-message').textContent // "Игрок X выиграл игру!"
        const winner = message.split(' ')[1] // "X"
        result = winner
    } else {
        result = 'Draw'
    }

    // Отправка данных на бэкенд
    submitScore(playerName, result)
        .then(() => {
            showSaveNotification()
            closeModal()
            resetGame()
        })
        .catch(error => {
            console.error('Ошибка при сохранении результата:', error)
            closeModal() // Закрыть модальное окно даже при ошибке
        })
}

function showSaveNotification() {
    const notification = document.getElementById('save-notification')
    notification.style.display = 'block'
    setTimeout(() => {
        notification.style.display = 'none'
    }, 4000)
}

function computerMove() {
    // Простая логика компьютера: выбор случайной пустой ячейки
    let emptyBoxes = []
    if (!isGameOver) {
        boxes.forEach((box, index) => {
            if (box.innerHTML === '') {
                emptyBoxes.push(index)
            }
        })

        if (emptyBoxes.length > 0) {
            let randomIndex =
                emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)]
            let box = boxes[randomIndex]
            setTimeout(() => {
                makeMove(box, turn)
                checkWin()
                checkDraw()
                if (!isGameOver) {
                    changeTurn()
                }
            }, 500)
        }
    }
}

function resetGame() {
    isGameOver = false
    turn = 'X'
    document.getElementById('message-overlay').style.display = 'block'
    document.getElementById('board').style.display = 'none'
    document.getElementById('game-result').textContent = ''
    boxes.forEach(box => {
        box.innerHTML = ''
        box.classList.remove('X', 'O', 'clicked')
        box.style.removeProperty('background-color')
        box.style.color = ''
    })
    closeModal()
}
