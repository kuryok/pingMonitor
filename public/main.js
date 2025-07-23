
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const appTitle = document.getElementById('app-title');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const dashboardView = document.getElementById('dashboard-view');
    const settingsView = document.getElementById('settings-view');
    const categoryDetailView = document.getElementById('category-detail-view');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    const categoryDetailTitle = document.getElementById('category-detail-title');
    const categoryDetailMonitorList = document.getElementById('category-detail-monitor-list');

    const themeToggle = document.getElementById('theme-toggle');
    const overallStatusCards = document.getElementById('overall-status-cards');
    const categorySummaryGrid = document.getElementById('category-summary-grid');
    const addMonitorForm = document.getElementById('add-monitor-form');
    const monitorTypeSelect = document.getElementById('monitor-type');
    const portFieldContainer = document.getElementById('port-field-container');
    const portInput = document.getElementById('port-input');
    const appSettingsForm = document.getElementById('app-settings-form');
    const appNameInput = document.getElementById('app-name');

    // Edit Monitor Form Elements
    const editMonitorSection = document.querySelector('.edit-monitor-section');
    const editMonitorForm = document.getElementById('edit-monitor-form');
    const editMonitorIdInput = document.getElementById('edit-monitor-id');
    const editMonitorNameInput = document.getElementById('edit-monitor-name');
    const editMonitorCategorySelect = document.getElementById('edit-monitor-category');
    const editMonitorTypeSelect = document.getElementById('edit-monitor-type');
    const editPortFieldContainer = document.getElementById('edit-port-field-container');
    const editPortInput = document.getElementById('edit-port-input');
    const editMonitorTargetInput = document.getElementById('edit-monitor-target');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Global State ---
    let allMonitors = [];
    let currentView = 'dashboard';
    let appMonitoringName = 'Monitoramento Taguatinga Norte'; // Default name

    // --- Helper Functions ---
    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return `${seconds} segundos atrás`;
        if (minutes < 60) return `${minutes} minutos atrás`;
        if (hours < 24) return `${hours} horas atrás`;
        return `${days} dias atrás`;
    }

    function getWorstStatus(monitors) {
        if (monitors.some(m => m.status === 'DOWN')) return 'DOWN';
        if (monitors.some(m => m.status === 'PENDING')) return 'PENDING';
        return 'UP';
    }

    // --- Theme Switcher ---
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleButton(currentTheme);

    themeToggle.addEventListener('click', () => {
        let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleButton(newTheme);
    });

    function updateThemeToggleButton(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    // --- View Navigation ---
    function showView(viewName, categoryName = null) {
        currentView = viewName;
        dashboardView.classList.remove('active');
        settingsView.classList.remove('active');
        categoryDetailView.classList.remove('active');

        dashboardBtn.classList.remove('active');
        settingsBtn.classList.remove('active');

        // Hide edit form when changing views
        editMonitorSection.style.display = 'none';

        if (viewName === 'dashboard') {
            dashboardView.classList.add('active');
            dashboardBtn.classList.add('active');
            fetchMonitors(); // Refresh dashboard data when navigating to it
        } else if (viewName === 'settings') {
            settingsView.classList.add('active');
            settingsBtn.classList.add('active');
            fetchAppSettings(); // Load settings when navigating to it
        } else if (viewName === 'category-detail' && categoryName) {
            categoryDetailView.classList.add('active');
            renderCategoryDetail(categoryName);
        }
    }

    dashboardBtn.addEventListener('click', () => showView('dashboard'));
    settingsBtn.addEventListener('click', () => showView('settings'));
    backToDashboardBtn.addEventListener('click', () => showView('dashboard'));

    // --- Port Field Visibility (Add Form) ---
    monitorTypeSelect.addEventListener('change', () => {
        if (monitorTypeSelect.value === 'tcp') {
            portFieldContainer.style.display = 'block';
            portInput.required = true;
        } else {
            portFieldContainer.style.display = 'none';
            portInput.required = false;
            portInput.value = ''; // Clear the value
        }
    });

    // --- Port Field Visibility (Edit Form) ---
    editMonitorTypeSelect.addEventListener('change', () => {
        if (editMonitorTypeSelect.value === 'tcp') {
            editPortFieldContainer.style.display = 'block';
            editPortInput.required = true;
        } else {
            editPortFieldContainer.style.display = 'none';
            editPortInput.required = false;
            editPortInput.value = ''; // Clear the value
        }
    });

    // --- Fetch and Display Monitors ---
    function renderCategorySummary(monitors) {
        const categories = {};
        monitors.forEach(m => {
            const category = m.category || 'Outros'; // Default to 'Outros'
            if (!categories[category]) {
                categories[category] = { UP: 0, DOWN: 0, PENDING: 0, TOTAL: 0, monitors: [] };
            }
            categories[category][m.status]++;
            categories[category].TOTAL++;
            categories[category].monitors.push(m);
        });

        categorySummaryGrid.innerHTML = '';
        for (const categoryName in categories) {
            const categoryData = categories[categoryName];
            const worstStatus = getWorstStatus(categoryData.monitors);
            const downCount = categoryData.DOWN;

            const card = document.createElement('div');
            card.className = `category-summary-card ${worstStatus.toLowerCase()}`;
            card.innerHTML = `
                <h3>${categoryName}</h3>
                <div class="status-indicator ${worstStatus}"></div>
                <div class="status-summary">
                    <div class="status-item up">
                        <div class="count">${categoryData.UP}</div>
                        <div class="label">Online</div>
                    </div>
                    <div class="status-item down">
                        <div class="count">${categoryData.DOWN}</div>
                        <div class="label">Offline</div>
                    </div>
                    <div class="status-item pending">
                        <div class="count">${categoryData.PENDING}</div>
                        <div class="label">Pendente</div>
                    </div>
                </div>
                ${downCount > 0 ? `<div class="category-down-alert">${downCount} Offline</div>` : ''}
            `;
            card.addEventListener('click', () => {
                showView('category-detail', categoryName);
            });
            categorySummaryGrid.appendChild(card);
        }
    }

    function renderCategoryDetail(categoryName) {
        categoryDetailTitle.textContent = `Monitores em ${categoryName}`;
        const monitorsToRender = allMonitors.filter(m => (m.category || 'Outros') === categoryName);
        categoryDetailMonitorList.innerHTML = '';
        if (monitorsToRender.length === 0) {
            categoryDetailMonitorList.innerHTML = '<p class="no-monitors-message">Nenhum monitor nesta categoria.</p>';
            return;
        }
        monitorsToRender.forEach(monitor => {
            const card = document.createElement('div');
            card.className = 'monitor-card';
            const statusClass = monitor.status || 'UNKNOWN';
            const latencyText = monitor.latency !== null ? `${monitor.latency}ms` : 'N/A';
            card.innerHTML = `
                <div class="status-indicator ${statusClass}"></div>
                <h3>${monitor.name}</h3>
                <p><strong>Tipo:</strong> ${monitor.type.toUpperCase()}: ${monitor.target}${monitor.port ? `:${monitor.port}` : ''}</p>
                <div class="status-text ${statusClass}">${statusClass === 'UP' ? 'Online' : statusClass === 'DOWN' ? 'Offline' : 'Pendente'}</div>
                <small>Latência: ${latencyText} | Última Verificação: ${monitor.lastCheckedAt ? formatTimeAgo(monitor.lastCheckedAt) : 'N/A'}</small>
                <div class="monitor-actions">
                    <button class="btn btn-sm btn-edit" data-id="${monitor.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-delete" data-id="${monitor.id}"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            `;
            categoryDetailMonitorList.appendChild(card);
        });

        // Add event listeners for edit/delete buttons
        categoryDetailMonitorList.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const monitorId = parseInt(e.currentTarget.dataset.id);
                const monitorToEdit = allMonitors.find(m => m.id === monitorId);
                if (monitorToEdit) {
                    populateEditForm(monitorToEdit);
                    showView('settings'); // Go to settings view to show edit form
                    editMonitorSection.style.display = 'block'; // Show edit form
                    addMonitorForm.style.display = 'none'; // Hide add form
                }
            });
        });

        categoryDetailMonitorList.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const monitorId = parseInt(e.currentTarget.dataset.id);
                if (confirm('Tem certeza que deseja excluir este monitor?')) {
                    await deleteMonitor(monitorId);
                }
            });
        });
    }

    function updateOverallStatus(monitors) {
        const statusCounts = {
            UP: 0,
            DOWN: 0,
            PENDING: 0,
            TOTAL: monitors.length,
        };

        monitors.forEach(m => {
            if (statusCounts[m.status]) {
                statusCounts[m.status]++;
            } else {
                statusCounts.PENDING++; // Default to pending if status is not recognized
            }
        });

        overallStatusCards.innerHTML = `
            <div class="status-card up">
                <h3>Online</h3>
                <div class="count">${statusCounts.UP}</div>
                <div class="label">Monitores</div>
            </div>
            <div class="status-card down">
                <h3>Offline</h3>
                <div class="count">${statusCounts.DOWN}</div>
                <div class="label">Monitores</div>
            </div>
            <div class="status-card pending">
                <h3>Pendente</h3>
                <div class="count">${statusCounts.PENDING}</div>
                <div class="label">Monitores</div>
            </div>
            <div class="status-card total">
                <h3>Total</h3>
                <div class="count">${statusCounts.TOTAL}</div>
                <div class="label">Monitores</div>
            </div>
        `;
    }

    async function fetchMonitors() {
        try {
            const response = await fetch('/api/monitors');
            if (!response.ok) throw new Error('Falha ao buscar monitores');
            allMonitors = await response.json();

            updateOverallStatus(allMonitors);
            renderCategorySummary(allMonitors);

            // If currently on a category detail view, re-render it to show updates
            if (currentView === 'category-detail') {
                const currentCategory = categoryDetailTitle.textContent.replace('Monitores em ', '');
                renderCategoryDetail(currentCategory);
            }

        } catch (error) {
            console.error('Erro ao carregar monitores:', error);
            overallStatusCards.innerHTML = '<p class="error-message">Erro ao carregar status geral.</p>';
            categorySummaryGrid.innerHTML = '<p class="error-message">Erro ao carregar resumos de categoria.</p>';
        }
    }

    // --- App Settings ---
    async function fetchAppSettings() {
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Falha ao buscar configurações');
            const settings = await response.json();
            if (settings.appName) {
                appNameInput.value = settings.appName;
                appMonitoringName = settings.appName;
                appTitle.textContent = appMonitoringName;
            }
        } catch (error) {
            console.error('Erro ao buscar configurações da aplicação:', error);
        }
    }

    appSettingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newAppName = appNameInput.value;
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'appName', value: newAppName }),
            });
            if (response.ok) {
                appMonitoringName = newAppName;
                appTitle.textContent = appMonitoringName;
                alert('Configurações salvas com sucesso!');
            } else {
                alert('Falha ao salvar configurações.');
            }
        } catch (error) {
            console.error('Erro ao salvar configurações da aplicação:', error);
            alert('Ocorreu um erro ao salvar as configurações.');
        }
    });

    // --- Add New Monitor ---
    addMonitorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addMonitorForm);
        const data = Object.fromEntries(formData.entries());

        // Convert port and interval to numbers if they exist
        if (data.port) data.port = parseInt(data.port, 10);
        if (data.interval) data.interval = parseInt(data.interval, 10);

        try {
            const response = await fetch('/api/monitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                addMonitorForm.reset();
                const categoryInput = addMonitorForm.querySelector('#monitor-category');
                if (categoryInput) categoryInput.value = 'Hosts'; // Reset to default category
                alert('Monitor adicionado com sucesso!');
                fetchMonitors(); // Refresh data after adding
            } else {
                alert('Falha ao adicionar monitor.');
            }
        } catch (error) {
            console.error('Falha ao enviar formulário:', error);
            alert('Ocorreu um erro.');
        }
    });

    // --- Edit Monitor ---
    function populateEditForm(monitor) {
        editMonitorIdInput.value = monitor.id;
        editMonitorNameInput.value = monitor.name;
        editMonitorCategorySelect.value = monitor.category;
        editMonitorTypeSelect.value = monitor.type;
        editPortInput.value = monitor.port || '';
        editMonitorTargetInput.value = monitor.target;

        // Trigger change event for type select to show/hide port field
        const event = new Event('change');
        editMonitorTypeSelect.dispatchEvent(event);
    }

    editMonitorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editMonitorForm);
        const data = Object.fromEntries(formData.entries());

        const monitorId = data.id;
        if (!monitorId) return alert('ID do monitor não encontrado para edição.');

        // Convert port and interval to numbers if they exist
        if (data.port) data.port = parseInt(data.port, 10);
        else data.port = null; // Ensure null if empty
        if (data.interval) data.interval = parseInt(data.interval, 10);
        else data.interval = 60; // Default if empty

        try {
            const response = await fetch(`/api/monitors/${monitorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Monitor atualizado com sucesso!');
                editMonitorForm.reset();
                editMonitorSection.style.display = 'none'; // Hide edit form
                addMonitorForm.style.display = 'block'; // Show add form
                showView('dashboard'); // Go back to dashboard and refresh
            } else {
                alert('Falha ao atualizar monitor.');
            }
        } catch (error) {
            console.error('Falha ao enviar formulário de edição:', error);
            alert('Ocorreu um erro ao atualizar o monitor.');
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        editMonitorForm.reset();
        editMonitorSection.style.display = 'none'; // Hide edit form
        addMonitorForm.style.display = 'block'; // Show add form
    });

    // --- Delete Monitor ---
    async function deleteMonitor(monitorId) {
        try {
            const response = await fetch(`/api/monitors/${monitorId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Monitor excluído com sucesso!');
                fetchMonitors(); // Refresh data after deleting
                showView('dashboard'); // Go back to dashboard
            } else {
                alert('Falha ao excluir monitor.');
            }
        } catch (error) {
            console.error('Erro ao excluir monitor:', error);
            alert('Ocorreu um erro ao excluir o monitor.');
        }
    }

    // --- Initial Load ---
    showView('dashboard'); // Start on dashboard view
    setInterval(fetchMonitors, 5000); // Refresh dashboard data every 5 seconds
    fetchAppSettings(); // Fetch app name on startup
});
