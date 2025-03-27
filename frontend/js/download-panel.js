document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const fullName = localStorage.getItem('fullName') || 'Admin';
    document.getElementById('userName').textContent = fullName;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    const userList = document.getElementById('userList');
    const selectAllUsers = document.getElementById('selectAllUsers');
    const searchUser = document.getElementById('searchUser');
    const downloadForm = document.getElementById('downloadForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
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

    // Función para aplicar shake a un elemento
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 400);
    }

    // Establecer por defecto la fecha de hoy en los inputs
    const todayStr = new Date().toISOString().slice(0,10);
    const fechaInicioInput = document.getElementById('fechaInicio');
    const fechaFinInput = document.getElementById('fechaFin');
    if (fechaInicioInput) fechaInicioInput.value = todayStr;
    if (fechaFinInput) fechaFinInput.value = todayStr;

    // Cargar lista de usuarios
    async function loadUsers(filterText = '') {
        try {
            const resp = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Error al cargar usuarios');

            userList.innerHTML = '';
            const lowerFilter = filterText.toLowerCase();
            const filtered = data.filter(u => u.fullName.toLowerCase().includes(lowerFilter));

            filtered.forEach(u => {
                const label = document.createElement('label');
                label.classList.add('checkbox-container');
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'usuarios';
                input.value = u._id; // se usa _id
                label.appendChild(input);
                label.append(' ' + u.fullName);
                userList.appendChild(label);
            });
        } catch (err) {
            console.error('Error loadUsers:', err);
            showToast('Error al cargar usuarios', false);
        }
    }

    loadUsers();
    searchUser.addEventListener('input', (e) => loadUsers(e.target.value));

    selectAllUsers.addEventListener('change', (e) => {
        const checkboxes = userList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(chk => { chk.checked = e.target.checked; });
    });

    // Manejo del submit para descargar reporte
    downloadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado al menos un usuario
        const checkboxes = userList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            showToast('Seleccione al menos un usuario', false);
            shakeElement(userList);
            return;
        }
        const userIds = Array.from(checkboxes).map(chk => chk.value);

        // Validar fechas
        const fechaInicio = fechaInicioInput.value;
        const fechaFin = fechaFinInput.value;
        if (!fechaInicio || !fechaFin) {
            showToast('Seleccione fecha inicio y fecha fin', false);
            if (!fechaInicio) shakeElement(fechaInicioInput);
            if (!fechaFin) shakeElement(fechaFinInput);
            return;
        }
        if (fechaInicio > fechaFin) {
            showToast('La fecha inicio no puede ser mayor a la fecha fin', false);
            shakeElement(fechaInicioInput);
            shakeElement(fechaFinInput);
            return;
        }

        // Mostrar overlay de carga
        loadingOverlay.style.display = 'flex';

        try {
            const params = new URLSearchParams();
            userIds.forEach(id => params.append('userIds', id));
            params.append('startDate', fechaInicio);
            params.append('endDate', fechaFin);

            console.log('Descargando reporte con params:', params.toString());

            const resp = await fetch(`/api/admin/report?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!resp.ok) {
                const errorText = await resp.text();
                throw new Error(errorText || 'Error al generar reporte');
            }
            const blob = await resp.blob();

            // Descargar archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_${fechaInicio}_a_${fechaFin}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error download:', error);
            showToast('Error al generar reporte', false);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });
});
