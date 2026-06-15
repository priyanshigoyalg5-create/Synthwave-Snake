const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20; 

let snake;
let dx;
let dy;
let foodX;
let foodY;
let score = 0;
let gameInterval;
let currentPilotName = "GUEST"; // Fallback name

const COLOR_BG_CANVAS = "#11023a";
const COLOR_SNAKE_BODY = "#3fff1f";
const COLOR_FOOD = "#ff1f8f";
const COLOR_EYE = "black";
const COLOR_EYE_HIGHLIGHT = "#fff";

const gameOverlay = document.getElementById("game-overlay");
const startButton = document.getElementById("start-button");
const nameInput = document.getElementById("player-name");

// --- INITIALIZE ON LOAD ---
// Display any scores we already have saved from past games right when opening the page
updateLeaderboardDisplay();

startButton.addEventListener("click", startGame);
// Detect when the user presses a key inside the name input field
nameInput.addEventListener("keydown", function(event) {
    // Check if the pressed key is "Enter"
    if (event.key === "Enter") {
        startGame();
    }
});
function resetGame() {
    snake = [
        {x: 160, y: 200},
        {x: 140, y: 200},
        {x: 120, y: 200}
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    document.getElementById('score').innerHTML = score;
    createFood();
}

function startGame() {
    let typedName = nameInput.value.trim().toUpperCase();

    // ERROR CHECK: If the player typed nothing, block the game from starting
    if (typedName === "") {
        // Apply a glowing red border error effect
        nameInput.style.borderColor = "var(--neon-pink)";
        nameInput.style.boxShadow = "0 0 15px var(--neon-pink)";
        nameInput.placeholder = "NAME REQUIRED!";
        
        // Remove the error styling after 1 second so they can try again
        setTimeout(() => {
            nameInput.style.borderColor = "var(--neon-blue)";
            nameInput.style.boxShadow = "none";
            nameInput.placeholder = "ENTER PILOT NAME";
        }, 1000);
        
        return; // This stops the function right here, preventing the game loop from starting!
    }

    // If a valid name exists, proceed as normal
    currentPilotName = typedName;
    gameOverlay.style.display = "none";
    resetGame();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(main, 100);
}

function main() {
    if (hasGameEnded()) {
        clearInterval(gameInterval);
        
        // NEW CODE: Save our current game data before restarting
        saveCurrentScore(currentPilotName, score);
        
        alert(`Snake CRASH! \n\nFINAL SCORE: ${score}`);
        gameOverlay.style.display = "flex";
        return;
    }

    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
}

// --- NEW LOCAL STORAGE / HIGH SCORE FUNCTIONS ---

// 1. Save data permanently to the browser memory
function saveCurrentScore(name, finalScore) {
    // Fetch old scores or initialize an empty list [] if it's our first time playing
    let scoresList = JSON.getElementById = JSON.parse(localStorage.getItem("snakeHighScores")) || [];
    
    // Add our new score item object to the list
    scoresList.push({ name: name, score: finalScore });
    
    // Sort the list so highest score sits at index 0, second highest next, etc.
    scoresList.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores to prevent massive scrolling
    scoresList = scoresList.slice(0, 10);
    
    // Save the array back into local storage as a string
    localStorage.setItem("snakeHighScores", JSON.stringify(scoresList));
    
    // Update the visual scoreboard sidebar instantly
    updateLeaderboardDisplay();
}

// 2. Fetch scores from memory and convert them into HTML on the left side
// 2. Fetch scores from memory and convert them into HTML on the left side
function updateLeaderboardDisplay() {
    const listContainer = document.getElementById("leaderboard-list");
    let scoresList = JSON.parse(localStorage.getItem("snakeHighScores")) || [];
    
    // Clear the old list structure completely
    listContainer.innerHTML = "";
    
    // If no one has played yet, show a placeholder
    if (scoresList.length === 0) {
        listContainer.innerHTML = "<li style='color: rgba(255,255,255,0.3); text-align:center;'>NO RECORDED RUNS</li>";
        return;
    }
    
    // Loop through our data and build html blocks (including a remove button tracking the index 'i')
    scoresList.forEach((item, i) => {
        const li = document.createElement("li");
        li.className = "leaderboard-item";
        li.innerHTML = `
            <span class="leaderboard-name">${item.name}</span>
            <span class="leaderboard-score">${item.score}</span>
            <button class="remove-score-btn" onclick="deleteScore(${i})">×</button>
        `;
        listContainer.appendChild(li);
    });
}

// NEW FUNCTION: Deletes an item from local storage by its position index
function deleteScore(index) {
    // 1. Grab the current scores array from memory
    let scoresList = JSON.parse(localStorage.getItem("snakeHighScores")) || [];
    
    // 2. Remove 1 item at the specified index position
    scoresList.splice(index, 1);
    
    // 3. Save the modified list back to local storage
    localStorage.setItem("snakeHighScores", JSON.stringify(scoresList));
    
    // 4. Refresh the display instantly so the player sees it disappear
    updateLeaderboardDisplay();
}

// --- BASIC ENGINE FUNCTIONS REMAIN STABLE ---

function clearCanvas() {
    ctx.fillStyle = COLOR_BG_CANVAS;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        ctx.fillStyle = COLOR_SNAKE_BODY;
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
        ctx.strokeStyle = COLOR_BG_CANVAS;
        ctx.strokeRect(part.x, part.y, gridSize, gridSize);

        if (isHead) {
            const eyeOffset = gridSize * 0.25;
            const eyeSize = 4;
            ctx.fillStyle = COLOR_EYE;
            ctx.fillRect(part.x + eyeOffset, part.y + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(part.x + (gridSize - eyeOffset - eyeSize), part.y + eyeOffset, eyeSize, eyeSize);

            ctx.fillStyle = COLOR_EYE_HIGHLIGHT;
            ctx.fillRect(part.x + eyeOffset + 1, part.y + eyeOffset + 1, 1, 1);
            ctx.fillRect(part.x + (gridSize - eyeOffset - eyeSize) + 1, part.y + eyeOffset + 1, 1, 1);
        }
    });
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    const hasEatenFood = snake[0].x === foodX && snake[0].y === foodY;
    if (hasEatenFood) {
        score += 10;
        document.getElementById('score').innerHTML = score;
        createFood();
    } else {
        snake.pop();
    }
}

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    // Standard arrow key codes
    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;

    // NEW: WASD key codes
    const A_KEY = 65;
    const W_KEY = 87;
    const D_KEY = 68;
    const S_KEY = 83;

    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    // Check for Left Arrow OR 'A' key
    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
        dx = -gridSize;
        dy = 0;
    }
    // Check for Up Arrow OR 'W' key
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
        dx = 0;
        dy = -gridSize;
    }
    // Check for Right Arrow OR 'D' key
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
        dx = gridSize;
        dy = 0;
    }
    // Check for Down Arrow OR 'S' key
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}

function randomGridPosition(max) {
    return Math.floor(Math.random() * (max / gridSize)) * gridSize;
}

function createFood() {
    foodX = randomGridPosition(canvas.width);
    foodY = randomGridPosition(canvas.height);
    snake.forEach(function hasSnakeEatenFood(part) {
        if (part.x === foodX && part.y === foodY) createFood();
    });
}

function drawFood() {
    ctx.fillStyle = COLOR_FOOD;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLOR_FOOD;
    ctx.fillRect(foodX, foodY, gridSize, gridSize);
    ctx.shadowBlur = 0;
}

function hasGameEnded() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;
    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}