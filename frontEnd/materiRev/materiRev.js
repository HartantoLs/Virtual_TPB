import { CONFIG } from "../login/config.js";


document.getElementById("materiGerak").onclick = function() {
    window.location.href = "../bookFis/bookFis.html";
    
};

document.getElementById("videoGerak").onclick = function() {
    window.location.href = "../videoFis/videoFis.html";
    
};

document.getElementById("eksperimenGerak").onclick = function() {
    window.location.href = "../eksperimenFisika/eksperimenFisika.html";
    
};

document.body.addEventListener("click", async (event) => {
    if ((event.target.tagName === "A" || event.target.tagName === "BUTTON") && event.target.classList.contains("trackable")) {
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