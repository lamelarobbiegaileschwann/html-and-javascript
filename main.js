// ===== GLOBAL VARIABLES =====
let tasks = [];
let currentFilter = 'all';
let taskToDelete = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    if (document.getElementById('todo-list-body')) {
        loadTasks();
        initNavigation();
        initFilters();
        initLoginForm();
        
        // Show todo section on page startup
        showSection('todo');
    }
    
    if (document.getElementById('admin-todo-list-body')) {
        initAdminModals();
    }
});

// ===== NAVIGATION =====
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const hash = window.location.hash.slice(1) || 'home';

    // Handle initial hash
    showSection(hash);

    // Handle nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            window.location.hash = section;
        });
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.slice(1) || 'home';
        showSection(hash);
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        section.classList.remove('active');
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// ===== TASK MANAGEMENT =====
function loadTasks() {
    // Load from localStorage or use default data
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    } else {
        // Default sample tasks
        tasks = [
            {
                id: 1,
                title: 'Science Project',
                description: 'Complete the STEM project on renewable energy',
                dueDate: '2026-03-15',
                status: 'pending'
            },
            {
                id: 2,
                title: 'Math Assignment',
                description: 'Finish Chapter 5 exercises',
                dueDate: '2026-02-25',
                status: 'pending'
            },
            {
                id: 3,
                title: 'Research Paper',
                description: 'Submit research paper outline',
                dueDate: '2026-03-01',
                status: 'completed'
            }
        ];
        saveTasks();
    }
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const todoListBody = document.getElementById('todo-list-body');
    const emptyState = document.getElementById('empty-state');
    
    if (!todoListBody) return;

    let filteredTasks = tasks;
    if (currentFilter !== 'all') {
        filteredTasks = tasks.filter(task => task.status === currentFilter);
    }

    if (filteredTasks.length === 0) {
        todoListBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    todoListBody.innerHTML = filteredTasks.map(task => `
        <tr>
            <td>${escapeHtml(task.title)}</td>
            <td>${escapeHtml(task.description)}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>
                <span class="status-badge status-${task.status}">
                    ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
            </td>
        </tr>
    `).join('');
}

function loadAdminTasks() {
    loadTasks();
    renderAdminTasks();
}

function renderAdminTasks() {
    const adminTodoListBody = document.getElementById('admin-todo-list-body');
    const adminEmptyState = document.getElementById('admin-empty-state');

    if (!adminTodoListBody) return;

    if (tasks.length === 0) {
        adminTodoListBody.innerHTML = '';
        adminEmptyState.style.display = 'block';
        return;
    }

    adminEmptyState.style.display = 'none';
    adminTodoListBody.innerHTML = tasks.map(task => `
        <tr>
            <td>${escapeHtml(task.title)}</td>
            <td>${escapeHtml(task.description)}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>
                <span class="status-badge status-${task.status}">
                    ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-success btn-small" onclick="toggleTaskStatus(${task.id})">
                    ${task.status === 'pending' ? 'Complete' : 'Undo'}
                </button>
                <button class="btn btn-warning btn-small" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="showDeleteModal(${task.id})">Delete</button>
            </td>
        </tr>
    `).join('');
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

// ===== LOGIN =====
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        // Simple authentication (in production, use server-side validation)
        if (username === 'admin' && password === 'admin123') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.classList.add('show');
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 3000);
        }
    });
}

// ===== ADMIN MODALS =====
function initAdminModals() {
    const taskModal = document.getElementById('task-modal');
    const deleteModal = document.getElementById('delete-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const taskForm = document.getElementById('task-form');
    const deleteModalClose = document.getElementById('delete-modal-close');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // Add Task Modal
    addTaskBtn.addEventListener('click', function() {
        document.getElementById('modal-title').textContent = 'Add New Task';
        document.getElementById('task-id').value = '';
        taskForm.reset();
        taskModal.classList.add('show');
    });

    modalClose.addEventListener('click', function() {
        taskModal.classList.remove('show');
    });

    cancelBtn.addEventListener('click', function() {
        taskModal.classList.remove('show');
    });

    // Delete Modal
    deleteModalClose.addEventListener('click', function() {
        deleteModal.classList.remove('show');
    });

    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.remove('show');
    });

    confirmDeleteBtn.addEventListener('click', function() {
        if (taskToDelete !== null) {
            deleteTask(taskToDelete);
            deleteModal.classList.remove('show');
            taskToDelete = null;
        }
    });

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target === taskModal) {
            taskModal.classList.remove('show');
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove('show');
        }
    });

    // Task Form Submit
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const dueDate = document.getElementById('task-due-date').value;
        const status = document.getElementById('task-status').value;

        if (taskId) {
            // Edit existing task
            const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    id: parseInt(taskId),
                    title,
                    description,
                    dueDate,
                    status
                };
            }
        } else {
            // Add new task
            const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
            tasks.push({
                id: newId,
                title,
                description,
                dueDate,
                status
            });
        }

        saveTasks();
        renderAdminTasks();
        taskModal.classList.remove('show');
    });
}

// ===== ADMIN ACTIONS =====
function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        saveTasks();
        renderAdminTasks();
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
    renderAdminTasks();
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
