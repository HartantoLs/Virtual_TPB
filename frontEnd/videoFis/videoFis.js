import { CONFIG } from "../login/config.js"; 
document.body.addEventListener("click", async (event) => {
    if (event.target.closest("a") && event.target.closest("a").classList.contains("trackable")) {
        event.preventDefault();

        const linkElement = event.target.closest("a");
        const actionDescription = linkElement.getAttribute("data-description") || linkElement.textContent;
        const targetUrl = linkElement.href;

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/log-action`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ action: actionDescription })
            });

            if (response.ok) {
                window.location.href = targetUrl;
            } else {
                window.location.href = targetUrl;
            }
        } catch (error) {
            window.location.href = targetUrl;
        }
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const images = [
        '../image/white1.jpg',
        '../image/white2.jpg',
        '../image/white3.jpg',
        '../image/white4.jpg',
        '../image/white5.jpg',
        '../image/wh.jpg',
    ];

    let currentIndex = 0;

    function changeBackgroundImage() {
        document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
        currentIndex = (currentIndex + 1) % images.length;
    }


    changeBackgroundImage();

    setInterval(changeBackgroundImage, 5000);
});


