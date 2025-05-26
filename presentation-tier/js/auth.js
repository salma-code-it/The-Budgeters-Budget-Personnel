// Auth-related functions
const API_URL = 'http://localhost:3000/api';


async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            // Store user data
            localStorage.setItem('user', JSON.stringify({
                id: data.user.user_id, // Note: Use user_id from the API response
                username: data.user.username,
                email: data.user.email
            }));
            window.location.href = '/dashboard.html';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (data.success) {
            alert('Registration successful!');
            // Optionally, automatically log in the user or redirect to login page
            // For now, let's clear the form and stay on the current page
            document.getElementById('registerForm').reset();
        } else {
             alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Simple tab switching (keeping this as it seems necessary for the HTML structure)
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const forms = document.querySelectorAll('form');
            forms.forEach(form => form.classList.add('hidden'));
            
            const targetForm = tab.dataset.form;
            document.getElementById(targetForm).classList.remove('hidden');
        });
    });
});

// Keeping these helper functions as they might be used elsewhere or useful
function showError(form, message) {
    const errorDiv = form.querySelector('.error-message') || document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    if (!form.querySelector('.error-message')) {
        form.appendChild(errorDiv);
    }
}

function showSuccess(form, message) {
    const successDiv = form.querySelector('.success-message') || document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    if (!form.querySelector('.success-message')) {
        form.appendChild(successDiv);
    }
} 