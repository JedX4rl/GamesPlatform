let board = []
let rows = 9,
	columns = 9,
	minesCount = 10
let minesLocation = []
let tilesClicked = 0
let gameOver = false
let timerInterval
let elapsedTime = 0
let isFirstClick = true

window.onload = function () {
	initializeGame()
}

function initializeGame() {
	document.getElementById('start-button').addEventListener('click', startGame)
	document
		.getElementById('difficulty')
		.addEventListener('change', updateDifficulty)

	document.getElementById('message-overlay').style.display = 'block'
	document.getElementById('board').style.display = 'none'
}

function updateDifficulty() {
	const difficulty = document.getElementById('difficulty').value
	switch (difficulty) {
		case 'easy':
			rows = 9
			columns = 9
			minesCount = 10
			break
		case 'medium':
			rows = 16
			columns = 16
			minesCount = 40
			break
		case 'hard':
			rows = 24
			columns = 24
			minesCount = 99
			break
	}
}

function startGame() {
	resetGame()
	setMines()
	populateBoard()
	startTimer()
	fetchLeaderboard()
	document.getElementById('message-overlay').style.display = 'none'
	document.getElementById('board').style.display = 'grid'
	gameOver = false
}

function resetGame() {
	board = []
	minesLocation = []
	tilesClicked = 0
	gameOver = false
	isFirstClick = true

	const boardContainer = document.getElementById('board')
	boardContainer.innerHTML = ''
	boardContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
	boardContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`
	document.getElementById('timer').textContent = '0'
	stopTimer()
	document.getElementById('board').style.display = 'none'
	document.getElementById('message-overlay').style.display = 'block'
}

function setMines() {
	while (minesLocation.length < minesCount) {
		const r = Math.floor(Math.random() * rows)
		const c = Math.floor(Math.random() * columns)
		const id = `${r}-${c}`
		if (!minesLocation.includes(id)) {
			minesLocation.push(id)
		}
	}
}

function populateBoard() {
	const boardContainer = document.getElementById('board')
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < columns; c++) {
			const tile = document.createElement('div')
			tile.id = `${r}-${c}`
			tile.classList.add('tile')
			tile.addEventListener('click', () => clickTile(tile))
			tile.addEventListener('contextmenu', e => {
				e.preventDefault()
				toggleFlag(tile)
			})
			boardContainer.appendChild(tile)
		}
	}
}

function clickTile(tile) {
	if (gameOver || tile.classList.contains('tile-clicked')) return

	if (tile.classList.contains('tile-flag')) return

	if (isFirstClick) {
		ensureSafeStart(tile.id)
		isFirstClick = false
	}

	if (minesLocation.includes(tile.id)) {
		tile.innerHTML = '<span class="icon">💣</span>'
		tile.classList.add('tile-bomb')
		revealMines()
		gameOver = true
		stopTimer()
		return
	}

	tile.classList.add('tile-clicked')
	tilesClicked++

	const mineCount = countAdjacentMines(tile.id)
	if (mineCount > 0) {
		tile.textContent = mineCount
		tile.classList.add(`tile-${mineCount}`)
	} else {
		revealAdjacentTiles(tile.id)
	}

	if (tilesClicked === rows * columns - minesCount) {
		stopTimer()
		gameOver = true
		revealMines()
		showWinModal(elapsedTime)
	}
}

function ensureSafeStart(firstClickId) {
	const [r, c] = firstClickId.split('-').map(Number)
	const safeZone = []

	// Определяем все 8 соседних ячеек + текущую
	for (let dr = -1; dr <= 1; dr++) {
		for (let dc = -1; dc <= 1; dc++) {
			const nr = r + dr
			const nc = c + dc
			if (nr >= 0 && nr < rows && nc >= 0 && nc < columns) {
				safeZone.push(`${nr}-${nc}`)
			}
		}
	}

	// Убираем мины из безопасной зоны
	minesLocation = minesLocation.filter(mine => !safeZone.includes(mine))

	// Добавляем новые мины в случайные доступные ячейки
	while (minesLocation.length < minesCount) {
		const randomR = Math.floor(Math.random() * rows)
		const randomC = Math.floor(Math.random() * columns)
		const newMine = `${randomR}-${randomC}`
		if (!minesLocation.includes(newMine) && !safeZone.includes(newMine)) {
			minesLocation.push(newMine)
		}
	}
}

function placeAdditionalMine() {
	let placed = false
	while (!placed) {
		const r = Math.floor(Math.random() * rows)
		const c = Math.floor(Math.random() * columns)
		const id = `${r}-${c}`
		if (!minesLocation.includes(id)) {
			minesLocation.push(id)
			placed = true
		}
	}
}

function toggleFlag(tile) {
	if (tile.classList.contains('tile-clicked')) return
	tile.classList.toggle('tile-flag')
	tile.innerHTML = tile.classList.contains('tile-flag')
		? '<span class="icon">🚩</span>'
		: ''
}

function countAdjacentMines(id) {
	const [r, c] = id.split('-').map(Number)
	let count = 0
	;[-1, 0, 1].forEach(dr => {
		;[-1, 0, 1].forEach(dc => {
			const nr = r + dr
			const nc = c + dc
			if (
				nr >= 0 &&
				nr < rows &&
				nc >= 0 &&
				nc < columns &&
				minesLocation.includes(`${nr}-${nc}`)
			) {
				count++
			}
		})
	})
	return count
}

function revealAdjacentTiles(id) {
	const [r, c] = id.split('-').map(Number)
	;[-1, 0, 1].forEach(dr => {
		;[-1, 0, 1].forEach(dc => {
			const nr = r + dr
			const nc = c + dc
			if (nr >= 0 && nr < rows && nc >= 0 && nc < columns) {
				const adjacentTile = document.getElementById(`${nr}-${nc}`)
				if (adjacentTile && !adjacentTile.classList.contains('tile-clicked')) {
					clickTile(adjacentTile)
				}
			}
		})
	})
}

function revealMines() {
	minesLocation.forEach(id => {
		const mineTile = document.getElementById(id)
		if (mineTile && !mineTile.classList.contains('tile-clicked')) {
			mineTile.innerHTML = '<span class="icon">💣</span>'
			mineTile.classList.add('tile-bomb')
		}
	})
}

function startTimer() {
	const timerElement = document.getElementById('timer')
	elapsedTime = 0
	timerElement.textContent = elapsedTime
	timerInterval = setInterval(() => {
		elapsedTime++
		timerElement.textContent = elapsedTime
	}, 1000)
}

function showWinModal(time) {
	stopTimer()
	document.querySelector('#win-modal #moves').textContent =
		'Сапёр был пройден всего за ' + time + ' сек.'

	const modal = document.getElementById('win-modal')
	const closeModal = document.getElementById('close-modal')
	const form = document.getElementById('win-form')

	modal.style.display = 'flex'

	closeModal.onclick = () => {
		modal.style.display = 'none'
	}

	form.onsubmit = async e => {
		e.preventDefault()

		const nickname = document.getElementById('nickname').value

		modal.style.display = 'none'

		showSaveNotification()

		try {
			await submitScore(nickname, time)
		} catch (error) {
			console.error('Ошибка при сохранении результата:', error)
		}

		await fetchLeaderboard()
	}

	window.onclick = event => {
		if (event.target === modal) {
			modal.style.display = 'none'
		}
	}
}

function showSaveNotification() {
	const notification = document.getElementById('save-notification')

	notification.style.display = 'block'

	setTimeout(() => {
		notification.style.display = 'none'
	}, 4000)
}

async function submitScore(nickname, time) {
	try {
		const response = await fetch('http://localhost:8087/submit-mine-score', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				nick_name: nickname,
				game_name: 'maze',
				score: time,
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
		const response = await fetch('http://localhost:8087/get_mine-score')

		if (!response.ok) {
			throw new Error('Ошибка при получении таблицы лидеров')
		}
		const data = await response.json()
		const leaderboardBody = document.getElementById('leaderboard-body')
		leaderboardBody.innerHTML = ''
		data.forEach(entry => {
			const row = document.createElement('tr')
			const nameCell = document.createElement('td')
			nameCell.textContent = entry.NickName
			const scoreCell = document.createElement('td')
			scoreCell.textContent = entry.Score + ' сек'
			row.appendChild(nameCell)
			row.appendChild(scoreCell)
			leaderboardBody.appendChild(row)
		})
	} catch (error) {
		console.error('Ошибка при обновлении таблицы лидеров:', error)
	}
}

function stopTimer() {
	clearInterval(timerInterval)
}
