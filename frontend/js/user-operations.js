/*******************************************************
 * File: user-operations.js
 ******************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded -> user-operations.js');

    // === 1. Verificar token y rol ===
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (!token || role !== 'user') {
        console.log('No token or role != user, redirecting to index');
        window.location.href = 'index.html';
        return;
    }

    // === 2. Mostrar nombre en el encabezado ===
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${fullName}`;
    }

    // === 3. Botón logout ===
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout clicked');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('fullName');
            window.location.href = 'index.html';
        });
    }

    // === 4. Referencias a elementos de UI ===
    const toast = document.getElementById('toast');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successOverlay = document.getElementById('successOverlay');

    // === 5. Función para mostrar toast ===
    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // === 6. Wizard de 4 pasos ===
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
        // Si intenta saltar pasos, validamos los intermedios
        if (index > currentStepIndex) {
            for (let i = currentStepIndex; i < index; i++) {
                if (!validateStep(i)) return;
            }
        }
        // Oculta todos los pasos
        steps.forEach(s => s.style.display = 'none');
        // Muestra el paso actual
        steps[index].style.display = 'block';

        // Actualiza indicadores
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
    // Arranca en el paso 0
    goToStep(0);

    // === 7. Cálculo automático de Total ===
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

    // === 8. Cargar la cuenta de origen (cuentaOrigen) del usuario ===
    const cuentaOrigenInput = document.getElementById('cuentaOrigen');

    async function loadUserAccount() {
        console.log('1) loadUserAccount() -> userId:', userId);
        if (!userId || !token) {
            console.log('1.x) No userId or token found, skip loadUserAccount');
            return;
        }
        try {
            console.log(`1.1) fetch GET /api/user/${userId} -> about to call`);
            const resp = await fetch(`/api/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('1.2) fetch GET /api/user/:id -> response status:', resp.status);

            if (resp.ok) {
                const userData = await resp.json();
                console.log('1.3) userData:', userData);
                if (userData.accountNumber) {
                    cuentaOrigenInput.value = userData.accountNumber;
                    console.log('1.4) Se asignó accountNumber:', userData.accountNumber);
                } else {
                    console.log('1.4) userData.accountNumber no existe');
                }
            } else {
                const errorText = await resp.text();
                console.log('1.x) GET /api/user/:id no OK:', errorText);
            }
        } catch (err) {
            console.log('1.x) loadUserAccount() -> catch error:', err);
        }
    }

    // Llamar a la carga de cuenta
    await loadUserAccount();

    // === 9. Manejo de íconos en <select> con la clase .icon-select ===
    const iconSelects = document.querySelectorAll('.icon-select');
    iconSelects.forEach(selectEl => {
        updateSelectIcon(selectEl);
        selectEl.addEventListener('change', () => {
            updateSelectIcon(selectEl);
        });
    });

    function updateSelectIcon(selectEl) {
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const iconPath = selectedOption.getAttribute('data-icon') || '';
        // Ajusta la imagen como background
        selectEl.style.backgroundImage = `url('${iconPath}')`;
    }

    // === 10. Registrar operación (POST /api/operation/register) ===
    const operationsForm = document.getElementById('operationsForm');
    if (operationsForm) {
        operationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateStep(currentStepIndex)) return;

            loadingOverlay.style.display = 'flex';
            console.log('2) Iniciando registro de operación...');

            // Recopilar datos
            const canal = document.getElementById('canal').value;
            const exchange = document.getElementById('exchange').value;
            const ordenNum = document.getElementById('ordenNum').value;
            const tipoActivo = document.getElementById('tipoActivo').value;
            const activo = document.getElementById('activo').value;
            const moneda = document.getElementById('moneda').value;
            const monto = document.getElementById('monto').value;
            const cantidad = document.getElementById('cantidad').value;
            const total = document.getElementById('total').value;
            const comision = document.getElementById('comision').value;

            const titularNombre = document.getElementById('titularNombre').value;
            const titularTipoID = document.getElementById('titularTipoID').value;
            const titularDocumento = document.getElementById('titularDocumento').value;
            const titularDireccion = document.getElementById('titularDireccion').value;

            const terceroNombre = document.getElementById('terceroNombre').value;
            const terceroTipoID = document.getElementById('terceroTipoID').value;
            const terceroDocumento = document.getElementById('terceroDocumento').value;

            const cuentaDestino = document.getElementById('cuentaDestino').value;
            const referenciaPago = document.getElementById('referenciaPago').value;
            const estadoPago = document.getElementById('estadoPago').value;
            const fecha = document.getElementById('fechaPago').value;
            const cuentaOrigen = cuentaOrigenInput.value;

            try {
                console.log('2.1) fetch POST /api/operation/register -> about to call');
                const response = await fetch('/api/operation/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        canal,
                        plataforma: exchange,
                        ordenNum,
                        tipoActivo,
                        activo,
                        moneda,
                        monto,
                        cantidad,
                        total,
                        comision,
                        titularNombre,
                        titularTipoID,
                        titularDocumento,
                        titularDireccion,
                        terceroNombre,
                        terceroTipoID,
                        terceroDocumento,
                        cuentaOrigen,
                        cuentaDestino,
                        referenciaPago,
                        estadoPago,
                        fecha
                    })
                });

                console.log('2.2) fetch POST /api/operation/register -> response status:', response.status);
                const data = await response.json();
                console.log('2.3) data:', data);

                loadingOverlay.style.display = 'none';

                if (response.ok) {
                    // Éxito
                    console.log('2.4) Operación registrada con éxito');
                    successOverlay.style.display = 'flex';
                    operationsForm.reset();
                    goToStep(0);
                    iconSelects.forEach(s => updateSelectIcon(s));

                    setTimeout(() => {
                        successOverlay.style.display = 'none';
                    }, 2000);
                } else {
                    // Error en la respuesta
                    console.log('2.x) Error al registrar la operación:', data.message);
                    showToast(data.message || 'Error al registrar la operación', false);
                }
            } catch (error) {
                // Error de red / fetch
                console.log('2.x) catch -> Error al conectar con el servidor:', error);
                loadingOverlay.style.display = 'none';
                showToast('Error al conectar con el servidor', false);
            }
        });
    }
});
