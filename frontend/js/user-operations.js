document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'user') {
        window.location.href = 'index.html';
    }
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    document.getElementById('userName').textContent = fullName;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        window.location.href = 'index.html';
    });

    const toast = document.getElementById('toast');
    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    const operationsForm = document.getElementById('operationsForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    operationsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = document.getElementById('monto').value;
        const plataforma = document.getElementById('plataforma').value;
        const fecha = document.getElementById('fecha').value;
        if (!monto || !plataforma || !fecha) {
            showToast('Faltan datos', false);
            return;
        }
        loadingOverlay.style.display = 'flex';
        try {
            const response = await fetch('/api/operation/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ monto, plataforma, fecha })
            });
            const data = await response.json();
            loadingOverlay.style.display = 'none';
            showToast(data.message, response.ok);
            if(response.ok) {
                operationsForm.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Error al conectar con el servidor', false);
        }
    });
});
