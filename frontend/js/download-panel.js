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

    // Dropdown toggle for user selection
    if (userDropdownHeader) {
        userDropdownHeader.addEventListener('click', () => {
            userDropdownList.classList.toggle('show');
            userDropdownHeader.focus();
        });
    }

    // Close user dropdown and month dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (userDropdown && !userDropdown.contains(e.target)) {
            userDropdownList.classList.remove('show');
        }
        document.querySelectorAll('.custom-month-select').forEach(select => {
            const dropdown = select.querySelector('.custom-month-dropdown');
            if (dropdown && dropdown.classList.contains('open') && !select.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    });

    // Prevent user dropdown from closing when interacting with list
    if (userDropdownList) {
        userDropdownList.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

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
        if (userDropdownHeader) {
            userDropdownHeader.textContent = selectedUsers.size > 0
                ? `${selectedUsers.size} usuario(s) seleccionado(s)`
                : 'Seleccione usuarios';
        }

        // Update dropdown list selection styles
        const items = userDropdownList ? userDropdownList.querySelectorAll('.multi-select-dropdown-item') : [];
        items.forEach(item => {
            const userId = item.dataset.userId;
            if (selectedUsers.has(userId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Update selected users display
        if (selectedUsersDisplay) {
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
    }

    // Load user list
    async function loadUsers(filterText = '') {
        try {
            const resp = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Error al cargar usuarios');

            if (userDropdownList) {
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
            }
        } catch (err) {
            console.error('Error loadUsers:', err);
            showToast('Error al cargar usuarios', false);
        }
    }

    if (searchUser) {
        loadUsers();
        searchUser.addEventListener('input', (e) => loadUsers(e.target.value));
    }

    // Configuración de los campos de día y año para que solo acepten números
    document.querySelectorAll('input[id$="Dia"], input[id$="Anio"]').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });

    // Configuración de los campos de día para validar rango (1-31)
    document.querySelectorAll('input[id$="Dia"]').forEach(input => {
        input.addEventListener('blur', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val < 1 || val > 31) {
                e.target.value = '';
                showToast('Día debe estar entre 1 y 31', false);
                shakeElement(e.target);
            } else if (e.target.value.length === 1) {
                e.target.value = e.target.value.padStart(2, '0');
            }
        });
    });

    // Configuración de los campos de año para validar rango razonable
    document.querySelectorAll('input[id$="Anio"]').forEach(input => {
        input.addEventListener('blur', (e) => {
            const val = parseInt(e.target.value, 10);
            const currentYear = new Date().getFullYear();
            if (val < 2000 || val > currentYear + 1) {
                e.target.value = '';
                showToast(`Año debe estar entre 2000 y ${currentYear + 1}`, false);
                shakeElement(e.target);
            }
        });
    });

    // Month dropdown functionality for both start and end dates
    document.querySelectorAll('.custom-month-select').forEach(select => {
        const trigger = select.querySelector('.custom-month-trigger');
        const dropdown = select.querySelector('.custom-month-dropdown');
        const monthSpan = trigger.querySelector('span');
        
        // Identificar a qué fecha pertenece este selector de mes
        const isStartDate = monthSpan.id === 'selectedInicioMes';
        const hiddenInput = document.getElementById(isStartDate ? 'fechaInicioMesHidden' : 'fechaFinMesHidden');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            trigger.focus();
        });

        dropdown.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const monthValue = e.target.dataset.value;
                const monthName = e.target.textContent;
                monthSpan.textContent = monthName;
                hiddenInput.value = monthValue;
                dropdown.classList.remove('open');
            });
        });
    });

    // Existing download form submit handler
    if (downloadForm) {
        downloadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate that at least one user is selected
            if (selectedUsers.size === 0 && userDropdownHeader) {
                showToast('Seleccione al menos un usuario', false);
                shakeElement(userDropdown);
                return;
            }
            const userIds = Array.from(selectedUsers.keys());

            // Validate dates using the day, month, and year inputs
            const fechaInicioDiaInput = document.getElementById('fechaInicioDia');
            const fechaInicioMesHidden = document.getElementById('fechaInicioMesHidden');
            const fechaInicioAnioInput = document.getElementById('fechaInicioAnio');

            const fechaFinDiaInput = document.getElementById('fechaFinDia');
            const fechaFinMesHidden = document.getElementById('fechaFinMesHidden');
            const fechaFinAnioInput = document.getElementById('fechaFinAnio');

            const inicioDia = fechaInicioDiaInput.value;
            const inicioMes = fechaInicioMesHidden.value;
            const inicioAnio = fechaInicioAnioInput.value;

            const finDia = fechaFinDiaInput.value;
            const finMes = fechaFinMesHidden.value;
            const finAnio = fechaFinAnioInput.value;

            if (!inicioDia || !inicioMes || !inicioAnio || !finDia || !finMes || !finAnio) {
                showToast('Seleccione fecha inicio y fecha fin completas', false);
                if (!inicioDia) shakeElement(fechaInicioDiaInput);
                if (!inicioMes) shakeElement(document.querySelector('#fechaInicio .custom-month-trigger'));
                if (!inicioAnio) shakeElement(fechaInicioAnioInput);
                if (!finDia) shakeElement(fechaFinDiaInput);
                if (!finMes) shakeElement(document.querySelector('#fechaFin .custom-month-trigger'));
                if (!finAnio) shakeElement(fechaFinAnioInput);
                return;
            }

            const fechaInicio = `${inicioAnio}-${inicioMes.padStart(2, '0')}-${inicioDia.padStart(2, '0')}`;
            const fechaFin = `${finAnio}-${finMes.padStart(2, '0')}-${finDia.padStart(2, '0')}`;

            if (fechaInicio > fechaFin) {
                showToast('La fecha inicio no puede ser mayor a la fecha fin', false);
                shakeElement(document.getElementById('fechaInicio'));
                shakeElement(document.getElementById('fechaFin'));
                return;
            }

            // Show loading overlay
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

                // Download file
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
    }
});