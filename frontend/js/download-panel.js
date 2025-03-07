document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
        window.location.href = 'index.html';
    }

    const fullName = localStorage.getItem('fullName') || 'Admin';
    document.getElementById('userName').textContent = fullName;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        window.location.href = 'index.html';
    });

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

    async function loadUsers(filterText = '') {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const users = await response.json();
            const userList = document.getElementById('userList');
            userList.innerHTML = '';
            const lowerFilter = filterText.toLowerCase();
            const filtered = users.filter(user => user.fullName.toLowerCase().includes(lowerFilter));

            const downloadButton = document.querySelector('.download-form button');
            if (filtered.length === 0) {
                userList.innerHTML = '<p>No hay usuarios registrados</p>';
                downloadButton.disabled = true;
                downloadButton.innerHTML = '<img src="icon/lock.png" alt="Bloqueado" class="btn-icon"> Descargar Reporte';
            } else {
                downloadButton.disabled = false;
                downloadButton.innerHTML = '<img src="icon/xls_icon.png" alt="XLS Icon" class="btn-icon"> Descargar Reporte';
                filtered.forEach(user => {
                    const label = document.createElement('label');
                    label.classList.add('checkbox-container');
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.name = 'usuarios';
                    input.value = user.fullName;
                    const span = document.createElement('span');
                    span.textContent = user.fullName;
                    label.appendChild(input);
                    label.appendChild(span);
                    userList.appendChild(label);
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Error al cargar usuarios', false);
        }
    }

    loadUsers();

    const searchInput = document.getElementById('searchUser');
    searchInput.addEventListener('input', (e) => {
        loadUsers(e.target.value);
        document.getElementById('selectAllUsers').checked = false;
    });

    const selectAllUsers = document.getElementById('selectAllUsers');
    selectAllUsers.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('#userList input[type="checkbox"]');
        checkboxes.forEach(chk => { chk.checked = e.target.checked; });
    });

    async function loadCurrentDate() {
        try {
            const response = await fetch('/api/admin/current-date');
            const data = await response.json();
            document.getElementById('fechaInicio').value = data.currentDate;
            document.getElementById('fechaFin').value = data.currentDate;
        } catch (error) {
            console.error('Error fetching current date:', error);
        }
    }
    loadCurrentDate();

    const downloadForm = document.getElementById('downloadForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    downloadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            showToast('Reporte descargado con éxito', true);
        }, 2000);
    });
});
