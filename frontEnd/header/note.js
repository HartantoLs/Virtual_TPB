import CONFIG from "../login/config.js";
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
let isTouching = false;


function adjustCanvasSize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
adjustCanvasSize();


function startDrawing(e) {
    painting = true;
    draw(e);
}


function endDrawing() {
    painting = false;
    ctx.beginPath();
}


function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

document.body.addEventListener("drop", async (event) => {
    if (event.target.classList.contains("trackable")) {
        const actionDescription = event.target.getAttribute("data-description") || "Aksi tanpa deskripsi";

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/log-action`, {
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

canvas.addEventListener('mousedown', (e) => {
    startDrawing(e);
});
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
        startDrawing(e);
    }
});
canvas.addEventListener('touchend', (e) => {
    if (painting) {
        e.preventDefault();
        endDrawing();
    }
});
canvas.addEventListener('touchmove', (e) => {
    if (painting) {
        e.preventDefault();
        draw(e);
    }
});

document.getElementById('trashButton').addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('action', 'reset');
});
document.getElementById('saveButton').addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('action', 'save');
});

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});
canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const action = e.dataTransfer.getData('action');
    if (action === 'reset') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
    } else if (action === 'save') {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
        alert('Canvas has been saved!');
    }
});

document.getElementById('trashButton').addEventListener('touchstart', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

});

document.getElementById('saveButton').addEventListener('touchstart', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
    alert('Canvas has been saved!');
});