/*******************************************************
 * File: user-history-operations.js
 ******************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded -> user-history-operations.js');

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

    // 2) Mostrar nombre en encabezado
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${fullName}`;
        console.log('2) userNameEl:', userNameEl.textContent);
    }

    // 3) Botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('3) Logout clicked, clearing localStorage');
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 4) Toast de notificación
    const toast = document.getElementById('toast');
    function showToast(message, success = true) {
        if (!toast) {
            console.log('No #toast element to display message:', message);
            return;
        }
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // 5) Referencia a la tabla
    const operationsTable = document.getElementById('operationsTable');
    const operationsTableBody = operationsTable ? operationsTable.querySelector('tbody') : null;

    // (MODAL) Referencias al modal
    const receiptModal = document.getElementById('receiptModal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalReceiptImage = document.getElementById('modalReceiptImage');

    if (modalCloseBtn && receiptModal) {
        modalCloseBtn.addEventListener('click', () => {
            console.log('(MODAL) close button clicked');
            receiptModal.style.display = 'none';
            modalReceiptImage.src = '';
        });
    }

    // 6) Cargar historial
    async function loadOperations() {
        console.log('6) loadOperations() => GET /api/history?userId=' + userId);
        try {
            const resp = await fetch(`/api/history?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('6.1) response status:', resp.status);

            if (!resp.ok) {
                const errText = await resp.text();
                console.log('6.x) not ok =>', errText);
                showToast('Error al cargar historial', false);
                return;
            }

            const data = await resp.json();
            console.log('6.2) data:', data);

            if (!Array.isArray(data)) {
                console.log('6.x) data no es un array =>', data);
                showToast('Respuesta inválida del servidor', false);
                return;
            }

            // Limpia la tabla
            if (operationsTableBody) {
                operationsTableBody.innerHTML = '';
            }

            // Rellena la tabla
            data.forEach((op, idx) => {
                console.log(`6.3) operation[${idx}]:`, op);
                const fechaRegistro = op.createdAt ? new Date(op.createdAt).toLocaleString() : '-';
                const fechaUsuario = op.fecha ? new Date(op.fecha).toLocaleDateString() : '-';
                const cuentaDestino = op.cuentaDestino || '-';
                const canal = op.canal || '-';
                const tipoActivo = op.tipoActivo || '-';
                const activo = op.activo || '-';
                const moneda = op.moneda || '-';
                const monto = op.monto != null ? op.monto : '-';
                const cantidad = op.cantidad != null ? op.cantidad : '-';
                const total = op.total != null ? op.total : '-';
                const receiptImage = op.receiptImage || '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${fechaRegistro}</td>
          <td>${fechaUsuario}</td>
          <td>${cuentaDestino}</td>
          <td>${canal}</td>
          <td>${tipoActivo}</td>
          <td>${activo}</td>
          <td>${moneda}</td>
          <td>${monto}</td>
          <td>${cantidad}</td>
          <td>${total}</td>
          <td>
            <button class="btn-view-receipt" data-image="${receiptImage}">
              Ver imagen
            </button>
          </td>
        `;
                operationsTableBody.appendChild(tr);
            });

            // (MODAL) Manejar clic en "Ver imagen"
            const btnsView = document.querySelectorAll('.btn-view-receipt');
            btnsView.forEach(btn => {
                const imgPath = btn.getAttribute('data-image');
                if (!imgPath) {
                    btn.disabled = true;
                    btn.style.backgroundColor = '#ccc';
                    btn.style.cursor = 'not-allowed';
                }
                btn.addEventListener('click', () => {
                    if (!imgPath) {
                        showToast('No hay constancia', false);
                        return;
                    }
                    console.log('(MODAL) user clicked ver imagen =>', imgPath);
                    // Abre el modal y muestra la imagen
                    modalReceiptImage.src = `/${imgPath}`;
                    receiptModal.style.display = 'block';
                });
            });

        } catch (error) {
            console.log('6.x) loadOperations() => catch error:', error);
            showToast('Error al conectar con el servidor', false);
        }
    }

    // 7) Llamar a la carga
    await loadOperations();

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

});
