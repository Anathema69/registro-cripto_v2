document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            const toastEl = document.getElementById('registerToast');
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
            // Redirige al login sin requerir interacción adicional, después de 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Error al conectar con el servidor');
    }
});
