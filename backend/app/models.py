from datetime import datetime
from app.database import db

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    importance = db.Column(db.String(20), nullable=False, default='normal')
    urgency = db.Column(db.String(20), nullable=False, default='normal')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'importance': self.importance,
            'urgency': self.urgency,
            'created_at': self.created_at.isoformat()
        } 

class Summary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)  # Markdown 内容
    html_content = db.Column(db.Text, nullable=False)  # 渲染后的 HTML
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'html_content': self.html_content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 