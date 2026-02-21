// ===== GLOBAL VARIABLES =====
let tasks = [];
let currentFilter = 'all';
let taskToDelete = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    initFilters();
    initTaskModals();
});

// ===== TASK MANAGEMENT =====
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks).map(task => ({
                id: task.id,
                title: task.title || '',
                description: task.description || '',
                dueDate: task.dueDate || '',
                status: task.status || 'pending'
            }));
        } catch (e) {
            tasks = [];
        }
    }
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const tbody = document.getElementById('admin-todo-list-body');
    const emptyState = document.getElementById('admin-empty-state');

    if (!tbody || !emptyState) return;

    let filteredTasks = currentFilter === 'all' 
        ? tasks 
        : tasks.filter(t => t.status === currentFilter);

    if (filteredTasks.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    filteredTasks.sort((a, b) => a.status === 'completed' ? 1 : -1);

    tbody.innerHTML = filteredTasks.map(task => {
        const status = task.status || 'pending';
        return `
        <tr>
            <td>${escapeHtml(task.title)}</td>
            <td>${escapeHtml(task.description)}</td>
            <td>${task.dueDate ? `📅 ${task.dueDate}` : ''}</td>
            <td>
                <span class="status-badge status-${status}">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-success btn-small" onclick="toggleTaskStatus(${task.id})">
                    ${status === 'pending' ? 'Complete' : 'Undo'}
                </button>
                <button class="btn btn-warning btn-small" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="showDeleteModal(${task.id})">X</button>
            </td>
        </tr>`;
    }).join('');
}

// ===== FILTERS =====
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
}

// ===== MODALS =====
function initTaskModals() {
    const taskModal = document.getElementById('task-modal');
    const deleteModal = document.getElementById('delete-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const taskForm = document.getElementById('task-form');
    const deleteModalClose = document.getElementById('delete-modal-close');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    if (!taskModal || !addTaskBtn || !taskForm) return;

    // Open add task modal
    addTaskBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add Task';
        document.getElementById('task-id').value = '';
        taskForm.reset();
        taskModal.classList.add('show');
    });

    // Close task modal
    modalClose?.addEventListener('click', () => taskModal.classList.remove('show'));
    cancelBtn?.addEventListener('click', () => taskModal.classList.remove('show'));

    // Delete modal handlers
    deleteModalClose?.addEventListener('click', () => deleteModal.classList.remove('show'));
    cancelDeleteBtn?.addEventListener('click', () => deleteModal.classList.remove('show'));
    confirmDeleteBtn?.addEventListener('click', () => {
        if (taskToDelete !== null) {
            deleteTask(taskToDelete);
            deleteModal.classList.remove('show');
            taskToDelete = null;
        }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) taskModal.classList.remove('show');
        if (e.target === deleteModal) deleteModal.classList.remove('show');
    });

    // Form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const dueDate = document.getElementById('task-due-date').value;
        const status = document.getElementById('task-status').value;

        if (taskId) {
            const index = tasks.findIndex(t => t.id === parseInt(taskId));
            if (index !== -1) {
                tasks[index] = { id: parseInt(taskId), title, description, dueDate, status };
            }
        } else {
            const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            tasks.push({ id: newId, title, description, dueDate, status });
        }

        saveTasks();
        renderTasks();
        taskModal.classList.remove('show');
    });
}

// ===== TASK ACTIONS =====
function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        saveTasks();
        renderTasks();
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-modal').classList.add('show');
    }
}

function showDeleteModal(taskId) {
    taskToDelete = taskId;
    document.getElementById('delete-modal').classList.add('show');
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

// ===== UTILITIES =====
function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}