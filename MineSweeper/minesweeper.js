let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = []; // "2-2", "3-4", "2-1"

let tilesClicked = 0; //goal to click all tiles except the ones containing mines
let flagEnabled = false;

let gameOver = false;

let gameStarted = false;

let timerInterval;
let elapsedTime = 0;

window.onload = function() {
    startGame();
}


function startTimer() {
    elapsedTime = 0; // Сбрасываем время
    const timerElement = document.getElementById('timer');
    timerElement.textContent = elapsedTime;

    // Запускаем таймер
    timerInterval = setInterval(() => {
        elapsedTime++;
        timerElement.textContent = elapsedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    console.log("Reset")
    stopTimer();
    startTimer();
}

function showWinModal() {
    const modal = document.getElementById('win-modal');
    const closeModal = document.getElementById('close-modal');
    const form = document.getElementById('win-form');
    stopTimer();

    modal.style.display = 'flex';

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    form.onsubmit = async (e) => {
        e.preventDefault();

        const nickname = document.getElementById('nickname').value;

        // Отправка данных на бекенд
        await submitScore(nickname, elapsedTime);

        modal.style.display = 'none';
        await fetchLeaderboard(); // Обновление таблицы лидеров
    };
}


async function submitScore(nickname, time) {
    try {
        const response = await fetch('http://localhost:8087/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nick_name: nickname,
                game_name: 'mine',
                score: time, // Каждый выигрыш увеличивает счет на 1
            }),
        });
        if (!response.ok) {
            throw new Error('Ошибка при отправке данных');
        }
        console.log('Данные успешно отправлены');
    } catch (error) {
        console.error(error);
    }
}

async function fetchLeaderboard() {
    console.log("leader bord loading ")
    try {
        const response = await fetch('http://localhost:8087/high-score/mine', {
            method: 'GET'
        });

        const leaderboard = await response.json();

        const leaderboardBody = document.getElementById('leaderboard-body');
        leaderboardBody.innerHTML = '';

        leaderboard.forEach((record) => {
            const row = document.createElement('tr');
            console.log(record)
            row.innerHTML = `<td>${record.NickName}</td><td>${record.Score}</td>`;
            leaderboardBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке таблицы лидеров:', error);
    }
}


function setMines() {
    // minesLocation.push("2-2");
    // minesLocation.push("2-3");
    // minesLocation.push("5-6");
    // minesLocation.push("3-4");
    // minesLocation.push("1-1");

    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}

function resetGame() {
    // Reset variables
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    flagEnabled = false;
    gameOver = false;

    // Clear the board
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    // Reset mines count display
    document.getElementById("mines-count").innerText = minesCount;

    // Restart the game
    console.log("Timer reset in game reset")
    if (gameStarted) {
        resetTimer()
    }
    startGame();
}


function startGame() {
    fetchLeaderboard()
    document.getElementById("start-button").addEventListener("click", () => {
        if (!gameStarted) {
            resetTimer()
            gameStarted = true
        }
    });
    document.getElementById("mines-count").innerText = minesCount;
    document.getElementById("flag-button").addEventListener("click", setFlag);
    document.getElementById("reset-button").addEventListener("click", resetGame);
    setMines();

    //populate our board
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);
}

function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    }
    else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
    }
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked") || !gameStarted) {
        return;
    }

    let tile = this;
    if (flagEnabled) {
        if (tile.innerText == "") {
            tile.innerText = "🚩";
        }
        else if (tile.innerText == "🚩") {
            tile.innerText = "";
        }
        return;
    }

    if (minesLocation.includes(tile.id)) {
        // alert("GAME OVER");
        gameOver = true;
        stopTimer()
        revealMines();
        return;
    }


    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

}

function revealMines() {
    for (let r= 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";                
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        board[r][c].innerText = "";
        
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }

    if (tilesClicked === rows * columns - minesCount) {

        //tilesClicked === rows * columns - minesCount

        document.getElementById("mines-count").innerText = "Cleared";
        showWinModal()
        gameOver = true;
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}