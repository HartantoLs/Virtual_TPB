document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();  // Prevent the default form submission

    // Get the input values
    const username = document.querySelector("input[name='username']").value;
    const password = document.querySelector("input[name='password']").value;

    // Send the data via fetch to the backend
    try {
        const response = await fetch('https://virtual-tpb.vercel.app/register', {
            method: 'POST',  // The method for form submission
            headers: {
                'Content-Type': 'application/json',  // Make sure the backend expects JSON
            },
            body: JSON.stringify({ username, password }),  // Send form data as JSON
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Registration successful:', data);
            // You can redirect or show a success message
            window.location.href = 'https://virtual-tpb-zb9j.vercel.app/login';  // Example redirect to login page
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Registration failed'}`);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred while registering.');
    }
});