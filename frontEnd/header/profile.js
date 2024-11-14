import CONFIG from "../login/config.js"; 

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

document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username");
    const userInfoText = document.getElementById("userInfoText");
    const passwordForm = document.getElementById("passwordForm");
    const passwordMessage = document.getElementById("passwordMessage");
    const historyList = document.getElementById("historyList");
    const dropdownButtons = document.querySelectorAll(".dropdownButton");
    const logoutButton = document.getElementById("logoutButton"); // Menambahkan referensi ke tombol logout

    // Mengatur event listener untuk dropdown
    dropdownButtons.forEach(button => {
        button.addEventListener("click", () => {
            const dropdownContent = button.nextElementSibling;
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    });

    // Fungsi untuk mengambil data pengguna
    async function fetchUserData() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("User not logged in, no token found.");
                return;
            }

            const response = await fetch(`${CONFIG.BASE_URL}/get-user-data`, { // Gunakan CONFIG.BASE_URL
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error("Failed to fetch user data:", response.status);
                return;
            }

            const data = await response.json();
            userInfoText.textContent = `Username : ${data.username}`;
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    // Fungsi untuk mengubah password
    passwordForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const oldPassword = document.getElementById("oldPassword").value;
        const newPassword = document.getElementById("newPassword").value;

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/change-password`, { // Gunakan CONFIG.BASE_URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const result = await response.json();
            passwordMessage.textContent = result.message;
            passwordMessage.style.color = response.ok ? "green" : "red";
        } catch (error) {
            passwordMessage.textContent = "Gagal mengubah password";
            console.error("Error changing password:", error);
        }
    });

    // Fungsi untuk mengambil riwayat aktivitas
    async function fetchHistory() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("User not logged in, no token found.");
                return;
            }

            const response = await fetch(`${CONFIG.BASE_URL}/user-history`, { // Gunakan CONFIG.BASE_URL
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error("Failed to fetch user history:", response.status);
                return;
            }

            const historyData = await response.json();

            // Clear the existing list before appending new history data
            historyList.innerHTML = "";

            historyData.forEach((item) => {
                const listItem = document.createElement("li");
                listItem.textContent = `${item.action} - ${new Date(item.timestamp).toLocaleString()}`;
                historyList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    }

    // Fungsi untuk logout
    async function logout() {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/logout`, { // Gunakan CONFIG.BASE_URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                // Hapus data di localStorage jika ada
                localStorage.removeItem("token");

                // Arahkan pengguna kembali ke halaman login setelah log out
                window.location.href = `${CONFIG.BASE_URL}/login`; // Sesuaikan dengan URL login Anda
            } else {
                console.error("Failed to log out.");
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }

    logoutButton.addEventListener("click", logout);

    // Memanggil fungsi untuk mengambil data pengguna dan riwayat aktivitas
    fetchUserData();
    fetchHistory();
});
