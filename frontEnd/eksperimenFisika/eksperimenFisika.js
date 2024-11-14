import { CONFIG } from "../login/config.js";

const object = document.getElementById('carToy');
const finishLine = document.getElementById('finishLine');
const timeDisplay = document.getElementById('time');
const speedDisplay = document.getElementById('speed');
const distanceDisplay = document.getElementById('distance');
const simulation = document.getElementById('simulation');
const simulationWidth = simulation.clientWidth;

let position = 0;
let speed = 0;
let time = 0;
let distance = 0;
let start = false;
let finishPosition = 0;
let objectStartPosition = 0;
let carPosition = 0;
let gameSound = new Audio("../audio/soundTrack.mp3");
let audioPlay = false;

const popupButton = document.getElementById('guideButton');
const popup = document.getElementById('popup');
const closeButton = document.querySelector('.close-button');

popupButton.addEventListener('click', () => {
    popup.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    popup.style.display = 'none';
});

document.body.addEventListener("click", async (event) => {
    if ((event.target.tagName === "A" || event.target.tagName === "BUTTON") && event.target.classList.contains("trackable")) {
        const actionDescription = event.target.getAttribute("data-description") || "Aksi tanpa deskripsi";

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/log-action`, { // Gunakan CONFIG.BASE_URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ action: actionDescription })
            });

            if (response.ok) {
                console.log("Action logged successfully");
            } else {
                console.error("Failed to log action");
            }
        } catch (error) {
            console.error("Error logging action:", error);
        }
    }
});

window.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

function showCustomAlert(message) {
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('custom-alert-message');
    alertMessage.textContent = message;
    customAlert.classList.remove('hidden');
    customAlert.classList.add('show');
}

document.getElementById('custom-alert').addEventListener('click', function() {
    const customAlert = document.getElementById('custom-alert');
    customAlert.classList.remove('show');
    setTimeout(() => {
        customAlert.classList.add('hidden');
    }, 400);
});

function showFalseAlert(message) {
    const falseAlert = document.getElementById('false-alert');
    const alertMessage = document.getElementById('false-alert-message');
    alertMessage.textContent = message;
    falseAlert.classList.remove('hidden');
    falseAlert.classList.add('show');
}

document.getElementById('false-alert').addEventListener('click', function() {
    const falseAlert = document.getElementById('false-alert');
    falseAlert.classList.remove('show');
    setTimeout(() => {
        falseAlert.classList.add('hidden');
    }, 400);
});

function showWinnerAlert(message) {
    const winnerAlert = document.getElementById('winner-alert');
    const alertMessage = document.getElementById('winner-alert-message');
    alertMessage.textContent = message;
    winnerAlert.classList.remove('hidden');
    winnerAlert.classList.add('show');
}

document.getElementById('winner-alert').addEventListener('click', function() {
    const winnerAlert = document.getElementById('winner-alert');
    winnerAlert.classList.remove('show');
    setTimeout(() => {
        winnerAlert.classList.add('hidden');
    }, 400);
});

var buttons = document.querySelectorAll("button");
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        this.classList.toggle("clicked");
        setTimeout(() => {
            this.classList.remove("clicked");
        }, 100);
    });
});

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', function() {
    startGame();
});

const checkButton = document.getElementById('checkButton');
checkButton.addEventListener('click', function() {
    check();
});

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', function() {
    resetGame();
    gameSound.pause();
    audioPlay = false;
});

function startGame() {
    start = true;
    showCustomAlert("GAME START");

    if (!audioPlay) {
        gameSound.play();
        audioPlay = true;
    }

    gameSound.addEventListener('ended', function() {
        gameSound.play();
    });

    finishPosition = Math.floor(Math.random() * (0.25 * simulationWidth)) + (0.5 * simulationWidth);
    finishLine.style.left = finishPosition + 'px';
    finishLine.classList.add('visible');

    objectStartPosition = Math.floor(Math.random() * (0.05 * simulationWidth));
    object.style.left = objectStartPosition + 'px';
    object.classList.add('visible');

    const distance = finishPosition - objectStartPosition;
    document.getElementById('goalDistance').textContent = "You are " + distance + " px away from the goal.";
}

function resetGame() {
    object.classList.remove('visible');
    finishLine.classList.remove('visible');
    start = false;
    position = 0;
    speed = 0;
    time = 0;
    distance = 0;
    finishPosition = 0;
    objectStartPosition = 0;
    document.getElementById('goalDistance').textContent = "Distant to Goal";
    stopMusic();
    document.getElementById('speedRes').textContent = "Speed";
    document.getElementById('timeRes').textContent = "Time";
    document.getElementById('distanceRes').textContent = "Distance";
}

function check() {
    if (!start) {
        showCustomAlert("Game belum dimulai");
    } else {
        speed = parseFloat(document.getElementById('speed').value);
        time = parseFloat(document.getElementById('time').value);
        if (speed < 1 || speed > 40) {
            showFalseAlert('Masukan kecepatan dari 1px/s sampai 40px/s');
            return;
        }
        if (time < 1 || time > 20) {
            showFalseAlert('Masukan waktu dari 1s sampai 20s');
            return;
        }
        document.getElementById('speedRes').textContent = "Speed : " + speed + "px/s";
        document.getElementById('timeRes').textContent = "Time : " + time + "s";
        document.getElementById('distanceRes').textContent = "Distance : " + speed * time + "px";
        let distanceInput = speed * time;
        let currentLeft = parseInt(object.style.left, 10) || 0;
        let carPosition = currentLeft + distanceInput;
        object.style.left = carPosition + "px";
        let newDistance = finishPosition - carPosition;
        distance = newDistance;
        document.getElementById('goalDistance').textContent = "You are " + distance + " px away from the goal.";
        if (distance === 0) {
            showWinnerAlert("CONGRATS, YOU'VE WON THE GAME");
            let winSound = new Audio("../audio/win.mp3");
            winSound.play();
            gameSound.pause();
            audioPlay = false;
            saveGameResult("win", 0);
        } else if (distance < 0) {
            showFalseAlert("YOU'VE PASS THE LINE, GAME OVER");
            let wrongSound = new Audio("../audio/wrong.mp3");
            wrongSound.play();
            saveGameResult("lose", distance);
        } else if (distance < -10) {
            alert("You've fallen to another planet");
            resetGame();
        }
    }
}

function stopMusic() {
    gameSound.pause();
    gameSound.currentTime = 0;
    audioPlay = false;
}

// Fungsi untuk menyimpan hasil permainan
async function saveGameResult(result, distance) {
    try {
        const response = await fetch(`${CONFIG.BASE_URL}/save-game-result`, { // Gunakan CONFIG.BASE_URL
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                result: result,
                distance_to_finish: distance
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save game result");
        }
        console.log("Game result saved successfully");
    } catch (error) {
        console.error("Error saving game result:", error);
    }
}

// Fungsi untuk mengambil riwayat permainan dari server
async function fetchGameHistory() {
    try {
        const response = await fetch(`${CONFIG.BASE_URL}/user-game-history`); // Gunakan CONFIG.BASE_URL
        if (!response.ok) {
            throw new Error("Failed to fetch game history");
        }

        const historyData = await response.json();
        const gameHistoryList = document.getElementById('gameHistoryList');
        gameHistoryList.innerHTML = ""; // Clear previous history

        if (historyData.length === 0) {
            const noHistory = document.createElement('tr');
            noHistory.innerHTML = "<td colspan='3'>No game history available.</td>";
            gameHistoryList.appendChild(noHistory);
        } else {
            historyData.forEach((game) => {
                const row = document.createElement('tr');
                if (game.result === 'win') {
                    row.classList.add('win');
                } else {
                    row.classList.add('lose');
                }

                row.innerHTML = `
                    <td>${game.result}</td>
                    <td>${game.distance_to_finish} px</td>
                    <td>${new Date(game.timestamp).toLocaleString()}</td>
                `;
                
                gameHistoryList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error fetching game history:", error);
    }
}

// Tombol dropdown handler
document.addEventListener("DOMContentLoaded", function() {
    const dropdownButton = document.querySelector('.dropdown-btn');
    const dropdownContent = document.getElementById('historySection');
    dropdownContent.style.display = 'none';
    dropdownButton.addEventListener('click', function() {
        const isVisible = dropdownContent.style.display === 'block';
        dropdownContent.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            fetchGameHistory(); // Fetch game history when dropdown is opened
        }
    });
});
