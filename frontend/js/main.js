const API_URL = 'http://localhost:5000/api';

// 获取所有待办事项
async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) {
            throw new Error('获取待办事项失败');
        }
        const todos = await response.json();
        console.log('获取到的待办事项:', todos);
        displayTodos(todos);
    } catch (error) {
        console.error('获取待办事项失败:', error);
    }
}

// 显示待办事项
function displayTodos(todos) {
    // 清空所有象限
    document.getElementById('urgent-important-list').innerHTML = '';
    document.getElementById('important-not-urgent-list').innerHTML = '';
    document.getElementById('urgent-not-important-list').innerHTML = '';
    document.getElementById('not-urgent-not-important-list').innerHTML = '';
    
    // 添加调试日志
    console.log('待办事项列表:', todos);
    
    todos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        const quadrantId = getQuadrantId(todo.importance, todo.urgency);
        console.log('任务:', todo.title, '分配到象限:', quadrantId);
        const quadrantElement = document.getElementById(quadrantId);
        if (quadrantElement) {
            quadrantElement.appendChild(todoElement);
        } else {
            console.error('找不到象限元素:', quadrantId);
        }
    });
}

// 创建待办事项元素
function createTodoElement(todo) {
    const todoElement = document.createElement('div');
    todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    const timeInfo = `
        <div class="time-info">
            ${todo.due_date ? `
                <div class="due-date ${isOverdue(todo) ? 'overdue' : ''}">
                    <i class="far fa-clock"></i>
                    预计完成：${formatDateTime(todo.due_date)}
                    ${isOverdue(todo) && !todo.completed ? ' (已逾期)' : ''}
                </div>
            ` : ''}
            ${todo.completed_at ? `
                <div class="completed-time">
                    <i class="fas fa-check-circle"></i>
                    完成于：${formatDateTime(todo.completed_at)}
                </div>
            ` : ''}
        </div>
    `;
    
    todoElement.innerHTML = `
        <div class="todo-checkbox">
            <input type="checkbox" id="todo-${todo.id}" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id}, this.checked)">
            <label for="todo-${todo.id}">${todo.title}</label>
        </div>
        ${todo.description ? `<p class="todo-description">${todo.description}</p>` : ''}
        ${timeInfo}
        <div class="todo-actions">
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-trash"></i> 删除
            </button>
        </div>
    `;
    
    return todoElement;
}

// 获取象限ID
function getQuadrantId(importance, urgency) {
    // 修改分类逻辑
    if (importance === 'high') {
        if (urgency === 'high') {
            return 'urgent-important-list';
        } else {
            return 'important-not-urgent-list';
        }
    } else {
        if (urgency === 'high') {
            return 'urgent-not-important-list';
        } else {
            return 'not-urgent-not-important-list';
        }
    }
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

// 检查是否逾期
function isOverdue(todo) {
    if (!todo.due_date || todo.completed) return false;
    const dueDate = new Date(todo.due_date);
    return dueDate < new Date();
}

// 添加新待办事项
async function addTodo() {
    const titleInput = document.getElementById('todoTitle');
    const descriptionInput = document.getElementById('todoDescription');
    const importanceSelect = document.getElementById('todoImportance');
    const urgencySelect = document.getElementById('todoUrgency');
    const dueDateInput = document.getElementById('todoDueDate');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const importance = importanceSelect.value;
    const urgency = urgencySelect.value;
    const dueDate = dueDateInput.value;
    
    if (!title) {
        alert('请输入待办事项标题！');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                title, 
                description,
                importance,
                urgency,
                due_date: dueDate || null
            })
        });
        
        if (response.ok) {
            titleInput.value = '';
            descriptionInput.value = '';
            importanceSelect.value = 'normal';
            urgencySelect.value = 'normal';
            dueDateInput.value = '';
            fetchTodos();
        }
    } catch (error) {
        console.error('添加待办事项失败:', error);
    }
}

// 切换待办事项状态
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                completed,
                completed_at: completed ? new Date().toISOString() : null
            })
        });
        
        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error('更新待办事项失败:', error);
    }
}

// 删除待办事项
async function deleteTodo(id) {
    if (!confirm('确定要删除这个待办事项吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error('删除待办事项失败:', error);
    }
}

// 页面加载时获取待办事项
document.addEventListener('DOMContentLoaded', fetchTodos); 