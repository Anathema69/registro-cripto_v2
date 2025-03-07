document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión activa
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
        if (role === 'admin') {
            window.location.href = 'admin-panel.html';
        } else if (role === 'user') {
            window.location.href = 'user-panel.html';
        }
    }

    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    const toast = document.getElementById('toast');

    // Función para mostrar toast de éxito
    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // Función para aplicar animación shake (definida en CSS)
    function shakeForm(formElement) {
        formElement.classList.add('shake');
        setTimeout(() => {
            formElement.classList.remove('shake');
        }, 500);
    }

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active-tab');
        signupTab.classList.remove('active-tab');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active-tab');
        loginTab.classList.remove('active-tab');
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Manejo del login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('fullName', data.fullName);
                showToast('Login exitoso', true);
                setTimeout(() => {
                    if (data.role === 'admin') {
                        window.location.href = 'admin-panel.html';
                    } else {
                        window.location.href = 'user-panel.html';
                    }
                }, 1000);
            } else {
                // Si ocurre error en el login, se aplica la animación shake
                shakeForm(loginForm);
            }
        } catch (error) {
            console.error('Error:', error);
            shakeForm(loginForm);
        }
    });

    // Manejo del signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password, role: 'user' })
            });
            const data = await response.json();
            if (response.ok) {
                showToast(data.message, true);
                signupForm.style.display = 'none';
                loginForm.style.display = 'block';
                loginTab.classList.add('active-tab');
                signupTab.classList.remove('active-tab');
                signupForm.reset();
            } else {
                shakeForm(signupForm);
            }
        } catch (error) {
            console.error('Error:', error);
            shakeForm(signupForm);
        }
    });
});
