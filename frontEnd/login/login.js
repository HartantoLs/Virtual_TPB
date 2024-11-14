import CONFIG from "./config.js";
console.log("login.js berhasil dimuat"); 
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    console.log("Form submitted"); 
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    try {
        const response = await fetch(`${CONFIG.BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", 
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (response.ok) {
            
            const data = await response.json();
            // alert("Login successful");
            // redirect to dashboard
            window.location.href = `${CONFIG.BASE_URL}/dashboard`;
        } else {
            const error = await response.json();
            alert(`Login failed: ${error.error}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while logging in.");
    }
});