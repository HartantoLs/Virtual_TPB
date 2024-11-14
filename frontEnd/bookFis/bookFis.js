import { CONFIG } from "../login/config.js";

document.body.addEventListener("click", async (event) => {
    if (event.target.tagName === "A" && event.target.classList.contains("trackable")) {
        event.preventDefault();

        const actionDescription = event.target.getAttribute("data-description") || event.target.textContent;
        const targetUrl = event.target.href;

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/log-action`, { // Gunakan CONFIG.BASE_URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ action: actionDescription })
            });

            // Terlepas dari keberhasilan atau kegagalan pencatatan aksi, lanjutkan navigasi
            window.location.href = targetUrl;
        } catch (error) {
            // Jika ada error selama proses, tetap lanjutkan navigasi
            window.location.href = targetUrl;
        }
    }
});
