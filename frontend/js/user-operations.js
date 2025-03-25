document.addEventListener('DOMContentLoaded', () => {
    // Verifica token y rol

    const role = localStorage.getItem('role');
    if (!token || role !== 'user') {
        window.location.href = 'index.html';
        return;
    }

    const fullName = localStorage.getItem('fullName') || 'Usuario';
    document.getElementById('userName').textContent = fullName;

    // Botón logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        window.location.href = 'index.html';
    });

    // Toast
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

    // Overlay de carga
    const loadingOverlay = document.getElementById('loadingOverlay');
    // Overlay de éxito
    const successOverlay = document.getElementById('successOverlay');

    // Pasos
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

    // Botones de pasos
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnNext3 = document.getElementById('btnNext3');
    const btnPrev2 = document.getElementById('btnPrev2');
    const btnPrev3 = document.getElementById('btnPrev3');
    const btnPrev4 = document.getElementById('btnPrev4');

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

    // Cálculo automático de total = monto * cantidad
    const montoInput = document.getElementById('monto');
    const cantidadInput = document.getElementById('cantidad');
    const totalInput = document.getElementById('total');

    function updateTotal() {
        const monto = parseFloat(montoInput.value) || 0;
        const cantidad = parseFloat(cantidadInput.value) || 0;
        totalInput.value = (monto * cantidad).toFixed(2);
    }

    // Escucha los eventos
    montoInput.addEventListener('input', updateTotal);
    cantidadInput.addEventListener('input', updateTotal);


    // Cargar la cuenta del usuario en paso 4
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const cuentaOrigenInput = document.getElementById('cuentaOrigen');

    async function loadUserAccount() {
        if (!userId || !token) return;
        try {
            const resp = await fetch(`/api/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (resp.ok) {
                const userData = await resp.json();
                console.log('userData:', userData); // Depuración
                if (userData.accountNumber) {
                    cuentaOrigenInput.value = userData.accountNumber;
                }
            } else {
                console.error('Error al obtener datos del usuario:', resp.statusText);
            }
        } catch (err) {
            console.error('Error al cargar cuenta del usuario:', err);
        }
    }
    loadUserAccount();

    // Registrar operación
    const operationsForm = document.getElementById('operationsForm');
    operationsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep(currentStepIndex)) return;

        loadingOverlay.style.display = 'flex';

        // Recopilar datos
        const canal = document.getElementById('canal').value;
        const plataforma = document.getElementById('plataforma').value;
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

        const cuentaOrigen = cuentaOrigenInput.value;
        const cuentaDestino = document.getElementById('cuentaDestino').value;
        const referenciaPago = document.getElementById('referenciaPago').value;
        const estadoPago = document.getElementById('estadoPago').value;
        const fecha = document.getElementById('fecha').value;

        try {
            const response = await fetch('/api/operation/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    canal,
                    plataforma,
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

            const data = await response.json();
            loadingOverlay.style.display = 'none';

            if (response.ok) {
                // Overlay de éxito
                successOverlay.style.display = 'flex';
                operationsForm.reset();
                goToStep(0);
                setTimeout(() => {
                    successOverlay.style.display = 'none';
                }, 2000);
            } else {
                showToast(data.message || 'Error al registrar la operación', false);
            }
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Error al conectar con el servidor', false);
        }
    });
});
