const API_URL = 'http://localhost:5000/api';
let editor;

// 初始化 Markdown 编辑器
document.addEventListener('DOMContentLoaded', () => {
    editor = new EasyMDE({
        element: document.getElementById('summaryEditor'),
        spellChecker: false,
        placeholder: '在这里输入工作总结...',
        autofocus: true,
        status: ['lines', 'words', 'cursor'],
        minHeight: '300px',
        maxHeight: '500px',
        autosave: {
            enabled: true,
            uniqueId: 'summaryEditor',
            delay: 1000,
        },
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'code', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'table', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],
        renderingConfig: {
            singleLineBreaks: false,
            codeSyntaxHighlighting: true,
        },
        previewRender: function(plainText) {
            // 自定义预览渲染
            const html = this.parent.markdown(plainText);
            return `<div class="custom-preview">${html}</div>`;
        }
    });
    
    fetchSummaries();
});

// 获取所有工作总结
async function fetchSummaries() {
    try {
        const response = await fetch(`${API_URL}/summaries`);
        if (!response.ok) {
            throw new Error('获取工作总结失败');
        }
        const summaries = await response.json();
        displaySummaries(summaries);
    } catch (error) {
        console.error('获取工作总结失败:', error);
    }
}

// 显示工作总结列表
function displaySummaries(summaries) {
    const summaryList = document.getElementById('summaryList');
    summaryList.innerHTML = '';
    
    summaries.forEach(summary => {
        const summaryElement = document.createElement('div');
        summaryElement.className = 'summary-item';
        
        summaryElement.innerHTML = `
            <div class="summary-content">${summary.html_content}</div>
            <div class="summary-meta">
                <div class="summary-time">
                    创建于：${formatDateTime(summary.created_at)}
                    ${summary.updated_at !== summary.created_at ? 
                        `<br>更新于：${formatDateTime(summary.updated_at)}` : ''}
                </div>
                <div class="summary-actions">
                    <button onclick="editSummary(${summary.id}, \`${summary.content}\`)">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="delete-btn" onclick="deleteSummary(${summary.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `;
        
        summaryList.appendChild(summaryElement);
    });
}

// 保存工作总结
async function saveSummary() {
    const content = editor.value().trim();
    
    if (!content) {
        alert('请输入工作总结内容！');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/summaries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            editor.value('');
            fetchSummaries();
        }
    } catch (error) {
        console.error('保存工作总结失败:', error);
    }
}

// 编辑工作总结
function editSummary(id, content) {
    editor.value(content);
    const saveButton = document.querySelector('.editor-actions button');
    saveButton.textContent = '更新总结';
    saveButton.onclick = () => updateSummary(id);
}

// 更新工作总结
async function updateSummary(id) {
    const content = editor.value().trim();
    
    if (!content) {
        alert('请输入工作总结内容！');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/summaries/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            editor.value('');
            const saveButton = document.querySelector('.editor-actions button');
            saveButton.textContent = '保存总结';
            saveButton.onclick = saveSummary;
            fetchSummaries();
        }
    } catch (error) {
        console.error('更新工作总结失败:', error);
    }
}

// 删除工作总结
async function deleteSummary(id) {
    if (!confirm('确定要删除这条工作总结吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/summaries/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchSummaries();
        }
    } catch (error) {
        console.error('删除工作总结失败:', error);
    }
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
} 