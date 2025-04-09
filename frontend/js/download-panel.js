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

    const userDropdown = document.getElementById('userDropdown');
    const userDropdownHeader = document.getElementById('userDropdownHeader');
    const userDropdownList = document.getElementById('userDropdownList');
    const selectedUsersDisplay = document.getElementById('selectedUsersDisplay');
    const searchUser = document.getElementById('searchUser');
    const downloadForm = document.getElementById('downloadForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');

    let allUsers = [];
    const selectedUsers = new Map();

    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 400);
    }

    // Dropdown toggle
    userDropdownHeader.addEventListener('click', () => {
        userDropdownList.classList.toggle('show');
        userDropdownHeader.focus();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
            userDropdownList.classList.remove('show');
        }
    });

    // Prevent dropdown from closing when interacting with list
    userDropdownList.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    function createUserItem(user) {
        const item = document.createElement('div');
        item.classList.add('multi-select-dropdown-item');
        item.dataset.userId = user._id;
        item.textContent = user.fullName;

        item.addEventListener('click', (e) => {
            if (selectedUsers.has(user._id)) {
                selectedUsers.delete(user._id);
                item.classList.remove('selected');
            } else {
                selectedUsers.set(user._id, user.fullName);
                item.classList.add('selected');
            }
            updateSelectedUsers();
        });

        return item;
    }

    function updateSelectedUsers() {
        // Update header text
        userDropdownHeader.textContent = selectedUsers.size > 0 
            ? `${selectedUsers.size} usuario(s) seleccionado(s)` 
            : 'Seleccione usuarios';

        // Update dropdown list selection styles
        const items = userDropdownList.querySelectorAll('.multi-select-dropdown-item');
        items.forEach(item => {
            const userId = item.dataset.userId;
            if (selectedUsers.has(userId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Update selected users display
        selectedUsersDisplay.innerHTML = '';
        selectedUsers.forEach((name, id) => {
            const tag = document.createElement('div');
            tag.classList.add('selected-user-tag');
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            
            const removeSpan = document.createElement('span');
            removeSpan.textContent = '×';
            removeSpan.classList.add('selected-user-tag-remove');
            removeSpan.addEventListener('click', () => {
                selectedUsers.delete(id);
                const userItem = userDropdownList.querySelector(`.multi-select-dropdown-item[data-user-id="${id}"]`);
                if (userItem) userItem.classList.remove('selected');
                updateSelectedUsers();
            });

            tag.appendChild(nameSpan);
            tag.appendChild(removeSpan);
            selectedUsersDisplay.appendChild(tag);
        });
    }

    // Cargar lista de usuarios
    async function loadUsers(filterText = '') {
        try {
            const resp = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Error al cargar usuarios');

            userDropdownList.innerHTML = '';
            allUsers = data;
            const lowerFilter = filterText.toLowerCase();
            const filtered = data.filter(u => u.fullName.toLowerCase().includes(lowerFilter));

            filtered.forEach(user => {
                const userItem = createUserItem(user);
                userDropdownList.appendChild(userItem);

                // Restore previously selected users
                if (selectedUsers.has(user._id)) {
                    userItem.classList.add('selected');
                }
            });
        } catch (err) {
            console.error('Error loadUsers:', err);
            showToast('Error al cargar usuarios', false);
        }
    }

    loadUsers();
    searchUser.addEventListener('input', (e) => loadUsers(e.target.value));

    // Existing download form submit handler remains the same as in the previous version
    downloadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado al menos un usuario
        if (selectedUsers.size === 0) {
            showToast('Seleccione al menos un usuario', false);
            shakeElement(userDropdown);
            return;
        }
        const userIds = Array.from(selectedUsers.keys());

        // Validar fechas
        const fechaInicioInput = document.getElementById('fechaInicio');
        const fechaFinInput = document.getElementById('fechaFin');
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