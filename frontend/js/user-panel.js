/************************************************
 * File: user-panel.js
 ************************************************/
document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar token y rol
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (!token || role !== 'user') {
        window.location.href = 'index.html';
        return;
    }

    // Muestra en el header: "Bienvenido: {Nombre}" si existe en localStorage
    const storedFullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${storedFullName}`;
    }

    // 2. Botones de la barra lateral
    const btnDatos = document.getElementById('btnDatos');
    if (btnDatos) {
        btnDatos.addEventListener('click', () => {
            window.location.href = 'user-panel.html';
        });
    }
    const btnOperaciones = document.getElementById('btnOperaciones');
    if (btnOperaciones) {
        btnOperaciones.addEventListener('click', () => {
            window.location.href = 'user-operations.html';
        });
    }

    // 3. Botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('fullName');
            window.location.href = 'index.html';
        });
    }

    // 4. Referencias al formulario y overlays
    const datosForm = document.getElementById('datosForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');
    const countryCodeSelect = document.getElementById('countryCode');
    const countryFlagImg = document.getElementById('countryFlag');

    // Función para mostrar toast
    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // 5. Cambia la bandera cuando cambia el select del código de país
    if (countryCodeSelect) {
        countryCodeSelect.addEventListener('change', () => {
            const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
            const flagFile = selectedOption.getAttribute('data-flag');
            if (flagFile && countryFlagImg) {
                countryFlagImg.src = `icon/flags/${flagFile}`;
            }
        });
    }

    const monthTrigger = document.querySelector('.custom-month-trigger');
    const monthDropdown = document.querySelector('.custom-month-dropdown');
    const monthButtons = document.querySelectorAll('.custom-month-dropdown button');
    const selectedMonth = document.getElementById('selectedBirthMonth');
    const hiddenMonthInput = document.getElementById('birthMesHidden');

    monthTrigger.addEventListener('click', function() {
        monthDropdown.classList.toggle('open');
    });

    monthButtons.forEach(button => {
        button.addEventListener('click', function() {
            const monthValue = this.getAttribute('data-value');
            const monthName = this.textContent;
            selectedMonth.textContent = monthName;
            hiddenMonthInput.value = monthValue;
            monthDropdown.classList.remove('open');
        });
    });

    document.addEventListener('click', function(event) {
        if (!monthTrigger.contains(event.target) && !monthDropdown.contains(event.target)) {
            monthDropdown.classList.remove('open');
        }
    });

    // 6. Manejo del submit del formulario
    datosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!userId || !token) {
            showToast('Sesión no válida. Por favor, inicia sesión nuevamente.', false);
            window.location.href = 'index.html';
            return;
        }

        loadingOverlay.style.display = 'flex';

        const fullName = document.getElementById('fullName').value.trim();
        const code = document.getElementById('countryCode').value;
        const phoneNum = document.getElementById('phoneNumber').value.trim();
        const accountNumber = document.getElementById('accountNumber').value.trim();

        const day = document.getElementById('birthDia').value;
        const month = document.getElementById('birthMesHidden').value;
        const year = document.getElementById('birthAnio').value;

        const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const telefono = `${code} ${phoneNum}`;

        try {
            const response = await fetch(`/api/user/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName,
                    telefono,
                    accountNumber,
                    birthDate
                })
            });

            const data = await response.json();
            loadingOverlay.style.display = 'none';

            if (response.ok) {
                localStorage.setItem('fullName', fullName);
                if (userNameEl) {
                    userNameEl.textContent = `Bienvenido: ${fullName}`;
                }
                datosForm.reset();
                countryCodeSelect.value = '+57';
                countryFlagImg.src = 'icon/flags/co.png';
                showToast(data.message, true);
            } else {
                showToast(data.message, false);
            }
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Error al conectar con el servidor', false);
        }
    });
});