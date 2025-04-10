/************************************************
 * File: user-panel.js
 ************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const logoutButton = document.getElementById('logoutButton');
    const adminPanelLink = document.getElementById('adminPanelLink');
    const userNameDisplay = document.getElementById('userName');

    if (!token) {
        window.location.href = 'index.html'; // Redirigir si no hay token
    }

    if (userNameDisplay) {
        const storedFullName = localStorage.getItem('fullName');
        userNameDisplay.textContent = storedFullName ? `Bienvenido: ${storedFullName}` : 'Bienvenido';
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('fullName');
            window.location.href = 'index.html';
        });
    }

    if (adminPanelLink) {
        if (userRole === 'admin') {
            adminPanelLink.style.display = 'block';
        } else {
            adminPanelLink.style.display = 'none';
        }
        adminPanelLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin-panel.html';
        });
    }

    // 4. Referencias al formulario y overlays
    const datosForm = document.getElementById('datosForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');
    const countryCodeSelect = document.getElementById('countryCode');
    const countryFlagImg = document.getElementById('countryFlag');

    // Elementos para la fecha de nacimiento
    const birthDiaInput = document.getElementById('birthDia');
    const birthAnioInput = document.getElementById('birthAnio');
    const customMonthSelect = document.querySelector('.custom-month-select');
    const customMonthTrigger = document.querySelector('.custom-month-trigger');
    const customMonthDropdown = document.querySelector('.custom-month-dropdown');
    const selectedBirthMonth = document.getElementById('selectedBirthMonth');
    const birthMesHiddenInput = document.getElementById('birthMesHidden');

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

    function isValidDay(day, month, year) {
        if (!day || !month || !year) return true;
        const daysInMonth = new Date(year, month, 0).getDate();
        return day >= 1 && day <= daysInMonth;
    }

    function isValidMonth(month) {
        return month >= 1 && month <= 12;
    }

    function isValidYear(year) {
        return year >= 1900 && year <= 2100;
    }

    function obtenerFechaNacimiento() {
        const dia = birthDiaInput.value;
        const mes = birthMesHiddenInput.value;
        const anio = birthAnioInput.value;

        if (!dia && !mes && !anio) return null;
        if (!dia || !mes || !anio) {
            showToast('Por favor, completa el día, mes y año de nacimiento.', 'error');
            return null;
        }

        const diaNum = parseInt(dia, 10);
        const mesNum = parseInt(mes, 10);
        const anioNum = parseInt(anio, 10);

        if (!/^\d+$/.test(dia) || !/^\d+$/.test(anio)) {
            showToast('El día y el año de nacimiento deben ser números.', 'error');
            return null;
        }

        if (!isValidMonth(mesNum)) {
            showToast('El mes de nacimiento seleccionado no es válido.', 'error');
            return null;
        }

        if (!isValidYear(anioNum)) {
            showToast('El año de nacimiento debe estar entre 1900 y 2100.', 'error');
            return null;
        }

        if (!isValidDay(diaNum, mesNum, anioNum)) {
            showToast('El día de nacimiento ingresado no es válido para el mes y año seleccionados.', 'error');
            return null;
        }

        const diaFormateado = dia.padStart(2, '0');
        const mesFormateado = mes.padStart(2, '0');
        return `${anio}-${mesFormateado}-${diaFormateado}`;
    }

    function validarNumeroInput(inputElement) {
        inputElement.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    validarNumeroInput(birthDiaInput);
    validarNumeroInput(birthAnioInput);

    if (countryCodeSelect) {
        countryCodeSelect.addEventListener('change', () => {
            const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
            const flagFile = selectedOption.getAttribute('data-flag');
            if (flagFile && countryFlagImg) {
                countryFlagImg.src = `icon/flags/${flagFile}`;
            }
        });
    }

    // Funcionalidad del combobox de meses personalizado
    customMonthTrigger.addEventListener('click', () => {
        customMonthDropdown.classList.toggle('open');
    });

    customMonthDropdown.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const monthValue = event.target.getAttribute('data-value');
            const monthText = event.target.textContent;
            selectedBirthMonth.textContent = monthText;
            birthMesHiddenInput.value = monthValue;
            customMonthDropdown.classList.remove('open');
            birthMesHiddenInput.dispatchEvent(new Event('change'));
        }
    });

    document.addEventListener('click', (event) => {
        if (!customMonthSelect.contains(event.target)) {
            customMonthDropdown.classList.remove('open');
        }
    });

    function validarDiaActual() {
        const dia = parseInt(birthDiaInput.value, 10);
        const mes = parseInt(birthMesHiddenInput.value, 10);
        const anio = parseInt(birthAnioInput.value, 10) || new Date().getFullYear();
        if (!isValidDay(dia, mes, anio)) {
            birthDiaInput.value = '';
            showToast('El día de nacimiento no es válido para el mes y año seleccionados.', 'warning');
        }
    }

    birthAnioInput.addEventListener('change', validarDiaActual);
    birthMesHiddenInput.addEventListener('change', validarDiaActual);

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
        const birthDate = obtenerFechaNacimiento();

        if (!birthDate) {
            loadingOverlay.style.display = 'none';
            return;
        }

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
            showToast(data.message, response.ok);

            if (response.ok) {
                localStorage.setItem('fullName', fullName);
                const userNameEl = document.getElementById('userName');
                if (userNameEl) {
                    userNameEl.textContent = `Bienvenido: ${fullName}`;
                }
                datosForm.reset();
                countryCodeSelect.value = '+57';
                countryFlagImg.src = 'icon/flags/co.png';
                selectedBirthMonth.textContent = 'Mes';
                birthMesHiddenInput.value = '';
            }
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Error al conectar con el servidor', false);
        }
    });
});