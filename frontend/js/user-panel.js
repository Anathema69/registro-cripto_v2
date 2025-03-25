document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    console.log("Token recuperado:", token);
    const role = localStorage.getItem('role');
    if (!token || role !== 'user') {
        window.location.href = 'index.html';
        return;
    }
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    document.getElementById('userName').textContent = fullName;

    document.getElementById('btnDatos').addEventListener('click', () => {
        window.location.href = 'user-panel.html';
    });
    document.getElementById('btnOperaciones').addEventListener('click', () => {
        window.location.href = 'user-operations.html';
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        window.location.href = 'index.html';
    });

    // Función para mostrar toast (verde si success, rojo si error)
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

    const datosForm = document.getElementById('datosForm');
    const loadingOverlay = document.getElementById('loadingOverlay');

    datosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Se obtienen los valores ingresados
        const fullNameInput = document.getElementById('fullName').value;
        const telefono = document.getElementById('telefono').value;
        const moneda = document.getElementById('moneda').value;
        const accountNumber = document.getElementById('accountNumber').value;
        const userId = localStorage.getItem('userId');
        if (!userId || !token) {
            showToast('Sesión no válida. Por favor, inicia sesión nuevamente.', false);
            window.location.href = 'index.html';
            return;
        }
        loadingOverlay.style.display = 'flex';
        try {
            const response = await fetch(`/api/user/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Se envían todos los datos, incluido fullName
                body: JSON.stringify({ fullName: fullNameInput, telefono, accountNumber, moneda })
            });
            const data = await response.json();
            loadingOverlay.style.display = 'none';
            // Si response.ok es false, se mostrará el toast en color rojo
            showToast(data.message, response.ok);
            if(response.ok) {
                datosForm.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Error al conectar con el servidor', false);
        }
    });
});
