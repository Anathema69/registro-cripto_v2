document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded -> user-operations.js');

    // 1) Verificar token y rol
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    console.log('1) token:', token, 'role:', role, 'userId:', userId);

    if (!token || role !== 'user') {
        console.log('1.x) No token or role != user => redirect to index');
        window.location.href = 'index.html';
        return;
    }

    // 2) Mostrar nombre en el encabezado
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${fullName}`;
        console.log('2) userName =>', userNameEl.textContent);
    }

    // 3) Botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('3) Logout clicked');
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 4) Referencias de UI
    const toast = document.getElementById('toast');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successOverlay = document.getElementById('successOverlay');

    function showToast(message, success = true) {
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // 5) Wizard de 4 pasos
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4')
    ];
    const stepIndicators = [
        document.getElementById('stepIndicator1'),
        document.getElementById('stepIndicator2'),
        document.getElementById('stepIndicator3'),
        document.getElementById('stepIndicator4')
    ];
    let currentStepIndex = 0;

    function goToStep(index) {
        if (index > currentStepIndex) {
            for (let i = currentStepIndex; i < index; i++) {
                if (!validateStep(i)) return;
            }
        }
        steps.forEach(s => s.style.display = 'none');
        steps[index].style.display = 'block';

        stepIndicators.forEach((indicator, i) => {
            indicator.classList.remove('active', 'completed');
            if (i < index) indicator.classList.add('completed');
            if (i === index) indicator.classList.add('active');
        });
        currentStepIndex = index;
    }

    function validateStep(stepIndex) {
        const step = steps[stepIndex];
        const requiredInputs = step.querySelectorAll('input[required], select[required]');
        let valid = true;
        requiredInputs.forEach(input => {
            input.classList.remove('error-input');
            if (!input.value) {
                valid = false;
                input.classList.add('error-input');
            }
        });
        if (!valid) {
            showToast(`Complete los campos requeridos en el paso ${stepIndex + 1}`, false);
        }
        return valid;
    }

    function nextStep() {
        if (!validateStep(currentStepIndex)) return;
        if (currentStepIndex < steps.length - 1) {
            goToStep(currentStepIndex + 1);
        }
    }
    function prevStep() {
        if (currentStepIndex > 0) {
            goToStep(currentStepIndex - 1);
        }
    }

    // Botones de navegación
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnNext3 = document.getElementById('btnNext3');
    const btnPrev2 = document.getElementById('btnPrev2');
    const btnPrev3 = document.getElementById('btnPrev3');
    const btnPrev4 = document.getElementById('btnPrev4');

    if (btnNext1) btnNext1.addEventListener('click', nextStep);
    if (btnNext2) btnNext2.addEventListener('click', nextStep);
    if (btnNext3) btnNext3.addEventListener('click', nextStep);
    if (btnPrev2) btnPrev2.addEventListener('click', prevStep);
    if (btnPrev3) btnPrev3.addEventListener('click', prevStep);
    if (btnPrev4) btnPrev4.addEventListener('click', prevStep);

    stepIndicators.forEach((indicator, i) => {
        indicator.addEventListener('click', () => goToStep(i));
    });
    goToStep(0);

    // 6) Cálculo automático de Total
    const montoInput = document.getElementById('monto');
    const cantidadInput = document.getElementById('cantidad');
    const totalInput = document.getElementById('total');

    function updateTotal() {
        const monto = parseFloat(montoInput.value) || 0;
        const cantidad = parseFloat(cantidadInput.value) || 0;
        totalInput.value = (monto * cantidad).toFixed(2);
    }
    if (montoInput) montoInput.addEventListener('input', updateTotal);
    if (cantidadInput) cantidadInput.addEventListener('input', updateTotal);

    // 7) Cargar la cuenta de origen (cuentaOrigen) del usuario
    const cuentaOrigenInput = document.getElementById('cuentaOrigen');
    async function loadUserAccount() {
        console.log('7) loadUserAccount => /api/user/' + userId);
        if (!userId || !token) return;
        try {
            const resp = await fetch(`/api/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('7.1) status:', resp.status);
            if (resp.ok) {
                const userData = await resp.json();
                console.log('7.2) userData:', userData);
                if (userData.accountNumber) {
                    cuentaOrigenInput.value = userData.accountNumber;
                    console.log('7.3) Se asignó:', userData.accountNumber);
                }
            } else {
                console.log('7.x) not ok =>', await resp.text());
            }
        } catch (err) {
            console.log('7.x) catch =>', err);
        }
    }
    await loadUserAccount();

    // 8) Íconos en <select> (icon-select)
    const iconSelects = document.querySelectorAll('.icon-select');
    iconSelects.forEach(sel => {
        updateSelectIcon(sel);
        sel.addEventListener('change', () => updateSelectIcon(sel));
    });
    function updateSelectIcon(selectEl) {
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const iconPath = selectedOption.getAttribute('data-icon') || selectEl.getAttribute('data-default-icon') || '';
        selectEl.style.backgroundImage = `url('${iconPath}')`;
    }

    // 9) Registrar operación (multipart/form-data)
    const operationsForm = document.getElementById('operationsForm');
    if (operationsForm) {
        operationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateStep(currentStepIndex)) return;

            loadingOverlay.style.display = 'flex';
            console.log('9) Iniciando registro de operación...');

            const formData = new FormData();

            // Paso 1
            formData.append('canal', document.getElementById('canal').value);
            formData.append('plataforma', document.getElementById('exchange').value);
            formData.append('ordenNum', document.getElementById('ordenNum').value);
            formData.append('tipoActivo', document.getElementById('tipoActivo').value);
            formData.append('activo', document.getElementById('activo').value);
            formData.append('moneda', document.getElementById('moneda').value);
            formData.append('monto', document.getElementById('monto').value);
            formData.append('cantidad', document.getElementById('cantidad').value);
            formData.append('total', document.getElementById('total').value);
            formData.append('comision', document.getElementById('comision').value);

            // Paso 2
            formData.append('titularNombre', document.getElementById('titularNombre').value);
            formData.append('titularTipoID', document.getElementById('titularTipoID').value);
            formData.append('titularDocumento', document.getElementById('titularDocumento').value);
            formData.append('titularDireccion', document.getElementById('titularDireccion').value);

            // Paso 3
            formData.append('terceroNombre', document.getElementById('terceroNombre').value);
            formData.append('terceroTipoID', document.getElementById('terceroTipoID').value);
            formData.append('terceroDocumento', document.getElementById('terceroDocumento').value);

            // Paso 4 - **MODIFICACIÓN AQUÍ PARA LA FECHA**
            const fechaPagoDiaInput = document.getElementById('fechaPagoDia');
            const fechaPagoMesHidden = document.getElementById('fechaPagoMesHidden');
            const fechaPagoAnioInput = document.getElementById('fechaPagoAnio');

            const dia = fechaPagoDiaInput.value;
            const mes = fechaPagoMesHidden.value;
            const anio = fechaPagoAnioInput.value;

            if (!dia || !mes || !anio) {
                showToast('Por favor, seleccione una fecha completa', false);
                loadingOverlay.style.display = 'none';
                return;
            }

            formData.append('fecha', `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
            formData.append('cuentaOrigen', cuentaOrigenInput.value);
            formData.append('cuentaDestino', document.getElementById('cuentaDestino').value);
            formData.append('referenciaPago', document.getElementById('referenciaPago').value);
            formData.append('estadoPago', document.getElementById('estadoPago').value);

            // Imagen opcional
            const receiptImageInput = document.getElementById('receiptImage');
            if (receiptImageInput && receiptImageInput.files.length > 0) {
                formData.append('receiptImage', receiptImageInput.files[0]);
            }

            try {
                console.log('9.1) POST /api/operation/register => about to call');
                const response = await fetch('/api/operation/register', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                console.log('9.2) response status:', response.status);
                const data = await response.json();
                console.log('9.3) data:', data);

                loadingOverlay.style.display = 'none';

                if (response.ok) {
                    console.log('9.4) Operación registrada con éxito');
                    successOverlay.style.display = 'flex';
                    operationsForm.reset();
                    goToStep(0);
                    iconSelects.forEach(s => updateSelectIcon(s));
                    // **RESETEAR EL TEXTO DEL SELECTOR DE MES**
                    const selectedFechaPagoMes = document.getElementById('selectedFechaPagoMes');
                    if (selectedFechaPagoMes) {
                        selectedFechaPagoMes.textContent = 'Mes';
                    }
                    const fechaPagoMesHiddenInput = document.getElementById('fechaPagoMesHidden');
                    if (fechaPagoMesHiddenInput) {
                        fechaPagoMesHiddenInput.value = '';
                    }

                    setTimeout(() => {
                        successOverlay.style.display = 'none';
                    }, 2000);
                } else {
                    console.log('9.x) Error al registrar:', data.message);
                    showToast(data.message || 'Error al registrar la operación', false);
                }
            } catch (error) {
                console.log('9.x) catch => Error al conectar con el servidor:', error);
                loadingOverlay.style.display = 'none';
                showToast('Error al conectar con el servidor', false);
            }
        });
    }

    // **SELECTOR DE MES CUSTOMIZADO**
    const fechaPagoMonthSelect = document.querySelector('#step4 .custom-month-select');
    const fechaPagoMonthTrigger = fechaPagoMonthSelect.querySelector('.custom-month-trigger');
    const fechaPagoMonthDropdown = fechaPagoMonthSelect.querySelector('.custom-month-dropdown');
    const selectedFechaPagoMesSpan = document.getElementById('selectedFechaPagoMes');
    const fechaPagoMesHiddenInput = document.getElementById('fechaPagoMesHidden');

    fechaPagoMonthTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        fechaPagoMonthDropdown.classList.toggle('open');
        fechaPagoMonthTrigger.focus();
    });

    fechaPagoMonthDropdown.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const monthValue = e.target.dataset.value;
            const monthName = e.target.textContent;
            selectedFechaPagoMesSpan.textContent = monthName;
            fechaPagoMesHiddenInput.value = monthValue;
            fechaPagoMonthDropdown.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!fechaPagoMonthSelect.contains(e.target)) {
            fechaPagoMonthDropdown.classList.remove('open');
        }
    });
});