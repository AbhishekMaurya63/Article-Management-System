   document.getElementById('registrationForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent form from submitting the traditional way

        // Get form data
        const username = document.getElementById('username')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirm_password')?.value || '';

        // Reset validation feedback
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => input.classList.remove('is-invalid'));

        // Validate inputs
        let isValid = true;

        if (username.length < 3) {
            document.getElementById('username').classList.add('is-invalid');
            isValid = false;
        }
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
            document.getElementById('email').classList.add('is-invalid');
            isValid = false;
        }
        if (password.length < 8) {
            document.getElementById('password').classList.add('is-invalid');
            isValid = false;
        }
        if (password !== confirmPassword) {
            document.getElementById('confirm_password').classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) return; // Stop submission if validation fails

        // Prepare data for submission
        const formData = {
            username: username,
            email: email,
            password: password
        };

        try {
            // Send data to the server
            const response = await fetch('api/viewer/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = '/login/'; // Redirect to login page
            } else {
                alert(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });

