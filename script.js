$(document).ready(function() {
    loadHeaderAndFooter();
    setupCurrentPage();
});

function loadHeaderAndFooter() {
    $('#header-placeholder').load('header_navbar.html', setupDarkMode);
    $('#footer-placeholder').load('footer.html');
}

function setupCurrentPage() {
    const page = location.pathname.split('/').pop() || 'index.html';
    
    if (page === 'index.html' || page === '') showActivity();
    if (page === 'tasks.html') setupTasks();
    if (page === 'contact.html') setupContact();
}

function setupDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        $('html').attr('data-theme', 'dark');
        $('#darkModeToggle').prop('checked', true);
    }
    
    $('#darkModeToggle').change(function() {
        if (this.checked) {
            $('html').attr('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            $('html').removeAttr('data-theme');
            localStorage.setItem('darkMode', 'false');
        }
    });
}

function showActivity() {
    const tasks = loadTasks();
    let html = tasks.length === 0 ? 
        '<div class="alert alert-info">No tasks yet. Create your first task!</div>' :
        tasks.slice(-3).reverse().map(task => 
            `<div class="alert alert-light mb-2">${task.name} was ${task.completed ? 'completed' : 'added'}</div>`
        ).join('');
    
    $('#activity-list').html(html);
}

let editing = null;

function setupTasks() {
    showAllTasks();
    updateNumbers();
    
    $('#taskForm').submit(function(e) {
        e.preventDefault();
        const name = $('#taskName').val().trim();
        const date = $('#taskDueDate').val();
        
        if (!name || !date) return alert('Please fill name and date');
        
        editing ? saveEdit() : addNew();
    });
    
    $('#cancelEdit').click(() => { editing = null; $('#taskForm')[0].reset(); $('#cancelEdit').hide(); });
    
    $('#statusFilter, #priorityFilter').change(filterTasks);
}

function addNew() {
    const tasks = loadTasks();
    tasks.push({
        id: Date.now(),
        name: $('#taskName').val().trim(),
        description: $('#taskDescription').val().trim(),
        dueDate: $('#taskDueDate').val(),
        priority: $('#taskPriority').val(),
        completed: false
    });
    saveTasks(tasks);
    $('#taskForm')[0].reset();
    showAllTasks();
    updateNumbers();
    alert('Task added!');
}

function editTask(id) {
    const task = loadTasks().find(t => t.id === id);
    $('#taskName').val(task.name);
    $('#taskDescription').val(task.description);
    $('#taskDueDate').val(task.dueDate);
    $('#taskPriority').val(task.priority);
    editing = id;
    $('#cancelEdit').show();
}

function saveEdit() {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === editing);
    task.name = $('#taskName').val().trim();
    task.description = $('#taskDescription').val().trim();
    task.dueDate = $('#taskDueDate').val();
    task.priority = $('#taskPriority').val();
    saveTasks(tasks);
    editing = null;
    $('#taskForm')[0].reset();
    $('#cancelEdit').hide();
    showAllTasks();
    updateNumbers();
    alert('Task updated!');
}

function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const tasks = loadTasks().filter(t => t.id !== id);
    saveTasks(tasks);
    showAllTasks();
    updateNumbers();
    alert('Task deleted!');
}

function toggleTask(id) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks(tasks);
    showAllTasks();
    updateNumbers();
}

function showAllTasks() {
    showTasks(loadTasks());
}

function showTasks(tasks) {
    if (tasks.length === 0) {
        $('#tasksTableBody').html('<tr><td colspan="6" class="text-center">No tasks found</td></tr>');
        return;
    }
    
    const html = tasks.map(task => `
        <tr class="${task.completed ? 'task-completed' : ''}">
            <td>${task.name}</td>
            <td>${task.description || 'No description'}</td>
            <td>${task.dueDate}</td>
            <td><span class="badge priority-${task.priority.toLowerCase()}">${task.priority}</span></td>
            <td>${task.completed ? 'Completed' : 'Pending'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-sm btn-success" onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    
    $('#tasksTableBody').html(html);
}

function filterTasks() {
    let tasks = loadTasks();
    const status = $('#statusFilter').val();
    const priority = $('#priorityFilter').val();
    
    if (status === 'completed') tasks = tasks.filter(t => t.completed);
    if (status === 'pending') tasks = tasks.filter(t => !t.completed);
    if (priority !== 'all') tasks = tasks.filter(t => t.priority === priority);
    
    showTasks(tasks);
}

function updateNumbers() {
    const tasks = loadTasks();
    const completed = tasks.filter(t => t.completed).length;
    $('#totalTasks').text(tasks.length);
    $('#completedTasks').text(completed);
    $('#pendingTasks').text(tasks.length - completed);
}

function setupContact() {
    $('#contactForm').submit(function(e) {
        e.preventDefault();
        const data = {
            name: $('#contactName').val().trim(),
            email: $('#contactEmail').val().trim(),
            subject: $('#contactSubject').val().trim(),
            message: $('#contactMessage').val().trim()
        };
        
        if (!data.name || !data.email || !data.subject || !data.message) {
            return alert('Please fill in all fields');
        }
        
        showSuccessPopup(data);
        $('#contactForm')[0].reset();
    });
}

function showSuccessPopup(data) {
    const popup = `
        <div class="modal fade" id="contactModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5>Message Sent!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success">
                            <p><strong>Name:</strong> ${data.name}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Subject:</strong> ${data.subject}</p>
                            <p><strong>Message:</strong> ${data.message}</p>
                            <p>Thank you!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(popup);
    new bootstrap.Modal($('#contactModal')[0]).show();
}

function loadTasks() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}