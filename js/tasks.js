document.addEventListener('DOMContentLoaded', async () => {
    await loadTasksData();
});

/**
 * Загрузка задач из Google Drive
 */
async function loadTasksData() {
    const container = document.getElementById('tasksContainer');
    
    if (typeof fetchJsonFromDrive === 'function') {
        const tasks = await fetchJsonFromDrive(DRIVE_CONFIG.files.tasks);
        if (tasks && Array.isArray(tasks)) {
            renderTasks(tasks);
        } else {
            showTasksError('Не удалось загрузить задачи из tasks.json.');
        }
    } else {
        showTasksError('Ошибка: Модуль js/drive.js не подключен.');
    }
}

/**
 * Отрисовка карточек задач и чек-листов
 */
function renderTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p class="no-results">Список задач пуст.</p>';
        return;
    }

    container.innerHTML = tasks.map(task => {
        const priorityClass = task.priority ? task.priority.toLowerCase() : 'medium';
        const statusText = task.status === 'In Progress' ? 'В процессе' : 
                           task.status === 'Pending' ? 'Ожидает' : 'Завершено';

        return `
            <div class="task-card priority-${priorityClass}">
                <div class="task-header">
                    <span class="task-car">${task.carModel}</span>
                    <span class="task-status status-${task.status.toLowerCase().replace(/\s+/g, '-')}">${statusText}</span>
                </div>
                
                <h3 class="task-title">${task.title}</h3>

                ${task.checklist && task.checklist.length > 0 ? `
                    <div class="checklist-container">
                        <h4>Чек-лист выполнения:</h4>
                        <ul class="checklist">
                            ${task.checklist.map((step, index) => `
                                <li>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="task-${task.id}-step-${index}">
                                        <span>${step}</span>
                                    </label>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function showTasksError(message) {
    const container = document.getElementById('tasksContainer');
    if (container) {
        container.innerHTML = `<div class="error-message">⚠️ ${message}</div>`;
    }
}
