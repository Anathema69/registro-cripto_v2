document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    const toast = document.getElementById('toast');

    // Muestra toast
    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // Animación "shake" (clase .shake)
    function shakeForm(formElement) {
        formElement.classList.add('shake');
        setTimeout(() => {
            formElement.classList.remove('shake');
        }, 400);
    }

    // Tabs
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active-tab');
        signupTab.classList.remove('active-tab');
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    });
    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active-tab');
        loginTab.classList.remove('active-tab');
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });

    // Manejo login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                // Guarda token y redirige
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
                // Credenciales inválidas => sacudir form
                shakeForm(loginForm);
                showToast(data.message || 'Credenciales inválidas', false);
            }
        } catch (error) {
            console.error('Error:', error);
            shakeForm(loginForm);
            showToast('Error al conectar con el servidor', false);
        }
    });

    // Manejo signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password, role: 'user' })
            });
            const data = await response.json();

            if (response.ok) {
                showToast('Cuenta creada con éxito', true);
                // Muestra el login
                signupForm.style.display = 'none';
                loginForm.style.display = 'flex';
                loginTab.classList.add('active-tab');
                signupTab.classList.remove('active-tab');
                signupForm.reset();
            } else {
                shakeForm(signupForm);
                showToast(data.message || 'Error al crear cuenta', false);
            }
        } catch (error) {
            console.error('Error:', error);
            shakeForm(signupForm);
            showToast('Error al conectar con el servidor', false);
        }
    });
});
