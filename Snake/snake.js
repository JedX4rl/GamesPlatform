const gameBoard = document.querySelector('#gameBoard')
const ctx = gameBoard.getContext('2d')
const scoreText = document.querySelector('#scoreText')
const resetBtn = document.querySelector('#resetBtn')
const diffSelect = document.querySelector('#diffSelect')
const mainBtn = document.querySelector('#mainBtn')
const gameContainer = document.querySelector('#gameContainer')
const messageOverlay = document.querySelector('#message-overlay')
const sessionRecordText = document.querySelector('#sessionRecordText')

const boardBackground = 'lightgrey'
const snakeColor = 'green'
const snakeBorder = 'darkgreen'
const foodColor = 'red'
const unitSize = 25

// Настройки сложности: размеры поля и скорость (в миллисекундах)
const difficultySettings = {
	Easy: { width: 400, height: 400, speed: 150 },
	Medium: { width: 500, height: 500, speed: 100 },
	Hard: { width: 600, height: 600, speed: 75 },
}

// Хранение рекордов за сессию для каждой сложности
let sessionRecords = {
	Easy: 0,
	Medium: 0,
	Hard: 0,
}

let gameInterval // Идентификатор интервала игры
let running = false
let xVelocity = unitSize
let yVelocity = 0
let foodX
let foodY
let score = 0
let snake = [
	{ x: unitSize * 4, y: 0 },
	{ x: unitSize * 3, y: 0 },
	{ x: unitSize * 2, y: 0 },
	{ x: unitSize, y: 0 },
	{ x: 0, y: 0 },
]

let lastDirection = { x: xVelocity, y: yVelocity } // Предыдущее направление
let pendingDirection = null // Буфер для следующего направления
let currentSettings = difficultySettings['Medium'] // Текущие настройки

window.addEventListener('keydown', changeDirection)
resetBtn.addEventListener('click', resetGame)

// Инициализируем отображение рекорда за сессию для текущей сложности
sessionRecordText.textContent = `Ваш рекорд за сессию: ${sessionRecords['Medium']}`

function gameStart() {
	running = true
	scoreText.textContent = score
	fetchLeaderboard()
	createFood()
	drawFood()
	drawSnake()
	messageOverlay.style.display = 'none' // Скрываем начальное сообщение
	gameInterval = setInterval(gameLoop, currentSettings.speed) // Запускаем цикл игры
}

function gameLoop() {
	if (pendingDirection) {
		// Применяем буферное направление
		const { x, y } = pendingDirection
		// Проверяем, чтобы новое направление не было противоположным предыдущему
		if (
			(x !== 0 || y !== 0) &&
			(x !== -lastDirection.x || y !== -lastDirection.y)
		) {
			xVelocity = x
			yVelocity = y
			lastDirection = { x: xVelocity, y: yVelocity }
		}
		pendingDirection = null // Сбрасываем буфер
	}

	clearBoard()
	drawFood()
	moveSnake()
	drawSnake()
	checkGameOver()
}

function showWinModal() {
	const modal = document.getElementById('win-modal')
	const closeModal = document.getElementById('close-modal')
	const form = document.getElementById('win-form')
	const newRecordSpan = document.getElementById('newRecord')

	newRecordSpan.textContent = score

	modal.style.display = 'flex'

	closeModal.onclick = () => {
		modal.style.display = 'none'
	}

	window.onclick = event => {
		if (event.target == modal) {
			modal.style.display = 'none'
		}
	}

	form.onsubmit = async e => {
		e.preventDefault()

		const nickname = document.getElementById('nickname').value

		// Отправка данных на бекенд
		await submitScore(nickname, score)

		modal.style.display = 'none'
		showSaveNotification()

		await fetchLeaderboard()
	}
}

async function submitScore(nickname, score) {
	try {
		const response = await fetch('http://localhost:8087/submit-score', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				nick_name: nickname,
				game_name: 'snake',
				score: score,
			}),
		})
		if (!response.ok) {
			throw new Error('Ошибка при отправке данных')
		}
		console.log('Данные успешно отправлены')
	} catch (error) {
		console.error(error)
	}
}

async function fetchLeaderboard() {
	try {
		const response = await fetch('http://localhost:8087/high-score/snake', {
			method: 'GET',
		})

		const leaderboard = await response.json()

		const leaderboardBody = document.getElementById('leaderboard-body')
		leaderboardBody.innerHTML = ''

		leaderboard.forEach(record => {
			const row = document.createElement('tr')
			row.innerHTML = `<td>${record.NickName}</td><td>${record.Score}</td>`
			leaderboardBody.appendChild(row)
		})
	} catch (error) {
		console.error('Ошибка при загрузке таблицы лидеров:', error)
	}
}

function clearBoard() {
	ctx.fillStyle = boardBackground
	ctx.fillRect(0, 0, gameBoard.width, gameBoard.height)
}

function createFood() {
	function randomFood(min, max) {
		const randNum =
			Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
		return randNum
	}

	let newFoodX, newFoodY
	let isOnSnake

	do {
		newFoodX = randomFood(0, gameBoard.width - unitSize)
		newFoodY = randomFood(0, gameBoard.height - unitSize)
		isOnSnake = snake.some(
			segment => segment.x === newFoodX && segment.y === newFoodY
		)
	} while (isOnSnake)

	foodX = newFoodX
	foodY = newFoodY
}

function drawFood() {
	ctx.fillStyle = foodColor
	ctx.fillRect(foodX, foodY, unitSize, unitSize)
}

function moveSnake() {
	const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity }

	snake.unshift(head)

	if (snake[0].x === foodX && snake[0].y === foodY) {
		score += 1
		scoreText.textContent = score
		createFood()
	} else {
		snake.pop()
	}
}

function drawSnake() {
	ctx.fillStyle = snakeColor
	ctx.strokeStyle = snakeBorder
	snake.forEach(snakePart => {
		ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize)
		ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize)
	})
}

function changeDirection(event) {
	const keyPressed = event.keyCode
	const LEFT = 37,
		UP = 38,
		RIGHT = 39,
		DOWN = 40
	const W = 87,
		A = 65,
		S = 83,
		D = 68

	let newX = 0
	let newY = 0

	switch (keyPressed) {
		case LEFT:
		case A:
			newX = -unitSize
			newY = 0
			break
		case UP:
		case W:
			newX = 0
			newY = -unitSize
			break
		case RIGHT:
		case D:
			newX = unitSize
			newY = 0
			break
		case DOWN:
		case S:
			newX = 0
			newY = unitSize
			break
		default:
			return // Игнорируем остальные клавиши
	}

	// Проверяем, чтобы новое направление не было противоположным текущему
	if (
		(newX === -lastDirection.x && newY === -lastDirection.y) ||
		(newX === 0 && newY === 0)
	) {
		return
	}

	// Устанавливаем новое направление в буфер
	pendingDirection = { x: newX, y: newY }
}

function checkGameOver() {
	if (
		snake[0].x < 0 ||
		snake[0].x >= gameBoard.width ||
		snake[0].y < 0 ||
		snake[0].y >= gameBoard.height
	) {
		endGame()
	}

	for (let i = 1; i < snake.length; i++) {
		if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
			endGame()
		}
	}
}

function endGame() {
	running = false
	clearInterval(gameInterval) // Останавливаем цикл игры

	const currentDifficulty = getCurrentDifficulty()

	// Проверяем, побит ли рекорд за сессию для текущей сложности
	if (score > sessionRecords[currentDifficulty]) {
		sessionRecords[currentDifficulty] = score
		sessionRecordText.textContent = `Ваш рекорд за сессию: ${sessionRecords[currentDifficulty]}`
		displayGameOver(true)
	} else {
		displayGameOver(false)
	}
}

function displayGameOver(isNewRecord) {
	ctx.font = '3rem Arial'
	ctx.fillStyle = 'black'
	ctx.textAlign = 'center'
	ctx.fillText('GAME OVER!', gameBoard.width / 2, gameBoard.height / 2)
	if (isNewRecord) {
		showWinModal()
	}
}

function resetGame() {
	if (running) {
		clearInterval(gameInterval) // Останавливаем текущий цикл игры, если он запущен
	}

	document.getElementById('gameBoard').style.display = 'block'
	// Получаем выбранную сложность
	const selectedDifficulty = diffSelect.value
	currentSettings = difficultySettings[selectedDifficulty]

	// Устанавливаем размер канваса через атрибуты и CSS
	gameBoard.width = currentSettings.width
	gameBoard.height = currentSettings.height
	gameBoard.style.width = `${currentSettings.width}px`
	gameBoard.style.height = `${currentSettings.height}px`

	// Сбрасываем параметры игры
	score = 0
	scoreText.textContent = score // Обновить отображение счёта
	xVelocity = unitSize
	yVelocity = 0
	lastDirection = { x: xVelocity, y: yVelocity }
	pendingDirection = null // Сбрасываем буфер направления
	snake = [
		{ x: unitSize * 4, y: 0 },
		{ x: unitSize * 3, y: 0 },
		{ x: unitSize * 2, y: 0 },
		{ x: unitSize, y: 0 },
		{ x: 0, y: 0 },
	]

	clearBoard() // Очистить доску перед началом новой игры
	createFood() // Создаем еду для новой игры
	drawFood() // Рисуем еду
	drawSnake() // Рисуем змейку

	// Обновляем отображение рекорда за сессию для текущей сложности
	const currentDifficulty = getCurrentDifficulty()
	sessionRecordText.textContent = `Ваш рекорд за сессию: ${sessionRecords[currentDifficulty]}`

	messageOverlay.style.display = 'none' // Скрываем начальное сообщение
	gameStart() // Запускаем игру
}

function getCurrentDifficulty() {
	const difficultyMap = {
		400: 'Easy',
		500: 'Medium',
		600: 'Hard',
	}
	return difficultyMap[currentSettings.width] || 'Medium'
}

function showSaveNotification() {
	const notification = document.getElementById('save-notification')

	notification.style.display = 'block'

	setTimeout(() => {
		notification.style.display = 'none'
	}, 4000)
}

// Функция для отображения начального сообщения (можно вызвать при необходимости)
function showInitialMessage() {
	messageOverlay.style.display = 'block'
	gameContainer.style.display = 'none'
}

// Обновляем отображение при загрузке страницы
window.onload = function () {
	initializeGame()
}

function initializeGame() {
	resetBtn.addEventListener('click', resetGame)
	diffSelect.addEventListener('change', () => {
		// Обновляем отображение рекорда при смене сложности
		const currentDifficulty = getCurrentDifficulty()
		sessionRecordText.textContent = `Ваш рекорд за сессию: ${sessionRecords[currentDifficulty]}`
	})
}
