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
    
    // 5.1) Crear contenedor para vista de tarjetas
    let cardViewContainer = document.querySelector('.card-view');
    if (!cardViewContainer) {
        cardViewContainer = document.createElement('div');
        cardViewContainer.className = 'card-view';
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.appendChild(cardViewContainer);
        }
    }

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

            // Limpia la tabla y vista de tarjetas
            if (operationsTableBody) {
                operationsTableBody.innerHTML = '';
            }
            if (cardViewContainer) {
                cardViewContainer.innerHTML = '';
            }

            // Obtener los encabezados de la tabla
            const tableHeaders = [];
            if (operationsTable) {
                const headerRow = operationsTable.querySelector('thead tr');
                if (headerRow) {
                    headerRow.querySelectorAll('th').forEach(th => {
                        tableHeaders.push(th.textContent.trim());
                    });
                }
            }

            // Rellena la tabla y la vista de tarjetas
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

                // Llenar tabla normal
                if (operationsTableBody) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td data-label="Fecha registro">${fechaRegistro}</td>
                        <td data-label="Fecha usuario">${fechaUsuario}</td>
                        <td data-label="Cuenta destino">${cuentaDestino}</td>
                        <td data-label="Canal">${canal}</td>
                        <td data-label="Tipo">${tipoActivo}</td>
                        <td data-label="Activo">${activo}</td>
                        <td data-label="Moneda">${moneda}</td>
                        <td data-label="Monto">${monto}</td>
                        <td data-label="Cantidad">${cantidad}</td>
                        <td data-label="Total">${total}</td>
                        <td data-label="Constancia">
                            <button class="btn-view-receipt" data-image="${receiptImage}">
                                Ver imagen
                            </button>
                        </td>
                    `;
                    operationsTableBody.appendChild(tr);
                }

                // Crear tarjeta para vista móvil
                if (cardViewContainer) {
                    const card = document.createElement('div');
                    card.className = 'operation-card';
                    
                    // Encabezado de la tarjeta
                    const cardHeader = document.createElement('div');
                    cardHeader.className = 'operation-card-header';
                    
                    const dateHeading = document.createElement('div');
                    dateHeading.className = 'operation-card-date';
                    dateHeading.textContent = `Fecha: ${fechaRegistro}`;
                    
                    const idHeading = document.createElement('div');
                    idHeading.className = 'operation-card-id';
                    idHeading.textContent = `#${idx + 1}`;
                    
                    cardHeader.appendChild(dateHeading);
                    cardHeader.appendChild(idHeading);
                    
                    // Contenido de la tarjeta
                    const cardContent = document.createElement('div');
                    cardContent.className = 'operation-card-content';
                    
                    // Crear campos con sus etiquetas
                    const fields = [
                        { label: 'Fecha usuario', value: fechaUsuario },
                        { label: 'Cuenta destino', value: cuentaDestino },
                        { label: 'Canal', value: canal },
                        { label: 'Tipo', value: tipoActivo },
                        { label: 'Activo', value: activo },
                        { label: 'Moneda', value: moneda },
                        { label: 'Monto', value: monto },
                        { label: 'Cantidad', value: cantidad },
                        { label: 'Total', value: total }
                    ];
                    
                    fields.forEach(field => {
                        const fieldEl = document.createElement('div');
                        fieldEl.className = 'operation-field';
                        
                        const labelEl = document.createElement('div');
                        labelEl.className = 'field-label';
                        labelEl.textContent = field.label;
                        
                        const valueEl = document.createElement('div');
                        valueEl.className = 'field-value';
                        valueEl.textContent = field.value;
                        
                        fieldEl.appendChild(labelEl);
                        fieldEl.appendChild(valueEl);
                        cardContent.appendChild(fieldEl);
                    });
                    
                    // Agregar botón de constancia
                    const fieldEl = document.createElement('div');
                    fieldEl.className = 'operation-field';
                    
                    const labelEl = document.createElement('div');
                    labelEl.className = 'field-label';
                    labelEl.textContent = 'Constancia';
                    
                    const valueEl = document.createElement('div');
                    valueEl.className = 'field-value';
                    
                    const buttonEl = document.createElement('button');
                    buttonEl.className = 'btn-view-receipt';
                    buttonEl.setAttribute('data-image', receiptImage);
                    buttonEl.textContent = 'Ver imagen';
                    
                    valueEl.appendChild(buttonEl);
                    fieldEl.appendChild(labelEl);
                    fieldEl.appendChild(valueEl);
                    cardContent.appendChild(fieldEl);
                    
                    // Ensamblar tarjeta
                    card.appendChild(cardHeader);
                    card.appendChild(cardContent);
                    cardViewContainer.appendChild(card);
                }
            });

            // (MODAL) Manejar clic en "Ver imagen" (para ambas vistas)
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

    // 8) Detección de tamaño de pantalla para cambiar entre vistas
    function handleViewportChange() {
        const viewportWidth = window.innerWidth;
        
        // Ajustar tabla/tarjetas según el ancho
        if (viewportWidth <= 768) { // Para móviles y tablets pequeños
            if (operationsTable) operationsTable.style.display = 'none';
            if (cardViewContainer) cardViewContainer.style.display = 'block';
        } else {
            if (operationsTable) operationsTable.style.display = 'table';
            if (cardViewContainer) cardViewContainer.style.display = 'none';
        }
    }

    // Ejecutar inicialmente
    handleViewportChange();
    
    // Escuchar cambios en el tamaño de ventana
    window.addEventListener('resize', handleViewportChange);

    // 9) Añadir elemento de toast si no existe
    if (!toast) {
        const toastElement = document.createElement('div');
        toastElement.id = 'toast';
        toastElement.className = 'toast';
        document.body.appendChild(toastElement);
    }
});