from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.database import db
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # 确保instance目录存在
    if not os.path.exists('instance'):
        os.makedirs('instance')
    
    # 配置数据库
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    migrate = Migrate(app, db)  # 初始化迁移
    
    # 注册路由
    from app.routes import todo_bp, summary_bp
    app.register_blueprint(todo_bp)
    app.register_blueprint(summary_bp)
    
    # 只在首次创建数据库表，而不是每次都重新创建
    with app.app_context():
        # 检查数据库文件是否存在
        db_path = os.path.join('instance', 'todos.db')
        if not os.path.exists(db_path):
            db.create_all()
    
    return app 