document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Almacenar token, rol y userId en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.userId);

            // Redirige según el rol
            if (data.role === 'admin') {
                window.location.href = 'admin-panel.html';
            } else {
                window.location.href = 'user-complete.html';
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Error al conectar con el servidor');
    }
});
