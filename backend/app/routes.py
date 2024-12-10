from flask import Blueprint, request, jsonify
from app.models import Todo, Summary
from app.database import db
from datetime import datetime
import markdown
import bleach

# 允许的 HTML 标签和属性
ALLOWED_TAGS = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
    'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre',
    'a', 'img', 'blockquote', 'table', 'thead', 'tbody',
    'tr', 'th', 'td'
]
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title']
}

# 创建待办事项蓝图
todo_bp = Blueprint('todo', __name__)

# 创建工作总结蓝图
summary_bp = Blueprint('summary', __name__)

# 待办事项路由
@todo_bp.route('/api/todos', methods=['GET'])
def get_todos():
    sort_by = request.args.get('sort_by', 'created_at')
    todos = Todo.query.order_by(getattr(Todo, sort_by).desc()).all()
    return jsonify([todo.to_dict() for todo in todos])

@todo_bp.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    
    # 处理预计完成时间
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data['due_date'])
        except ValueError:
            return jsonify({'error': '无效的日期格式'}), 400
    
    new_todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        importance=data.get('importance', 'normal'),
        urgency=data.get('urgency', 'normal'),
        due_date=due_date
    )
    db.session.add(new_todo)
    db.session.commit()
    return jsonify(new_todo.to_dict()), 201

@todo_bp.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()
    
    # 处理预计完成时间
    if 'due_date' in data:
        try:
            todo.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        except ValueError:
            return jsonify({'error': '无效的日期格式'}), 400
    
    todo.title = data.get('title', todo.title)
    todo.description = data.get('description', todo.description)
    todo.importance = data.get('importance', todo.importance)
    todo.urgency = data.get('urgency', todo.urgency)
    
    new_completed = data.get('completed', todo.completed)
    if new_completed != todo.completed:
        todo.completed = new_completed
        todo.completed_at = datetime.utcnow() if new_completed else None
    
    db.session.commit()
    return jsonify(todo.to_dict())

@todo_bp.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return '', 204

# 工作总结路由
@summary_bp.route('/api/summaries', methods=['GET'])
def get_summaries():
    summaries = Summary.query.order_by(Summary.created_at.desc()).all()
    return jsonify([summary.to_dict() for summary in summaries])

@summary_bp.route('/api/summaries', methods=['POST'])
def create_summary():
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({'error': '内容不能为空'}), 400
    
    # 将 Markdown 转换为 HTML，并清理不安全的标签
    html_content = markdown.markdown(content, extensions=['fenced_code', 'tables'])
    clean_html = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )
    
    summary = Summary(content=content, html_content=clean_html)
    db.session.add(summary)
    db.session.commit()
    
    return jsonify(summary.to_dict()), 201

@summary_bp.route('/api/summaries/<int:summary_id>', methods=['PUT'])
def update_summary(summary_id):
    summary = Summary.query.get_or_404(summary_id)
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({'error': '内容不能为空'}), 400
    
    # 更新内容和 HTML
    html_content = markdown.markdown(content, extensions=['fenced_code', 'tables'])
    clean_html = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )
    
    summary.content = content
    summary.html_content = clean_html
    db.session.commit()
    
    return jsonify(summary.to_dict())

@summary_bp.route('/api/summaries/<int:summary_id>', methods=['DELETE'])
def delete_summary(summary_id):
    summary = Summary.query.get_or_404(summary_id)
    db.session.delete(summary)
    db.session.commit()
    return '', 204 