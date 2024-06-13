import re
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 비밀 키 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # SQLite 데이터베이스 설정
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # SQLAlchemy 경고 메시지 비활성화

db = SQLAlchemy(app)

# 유저 로그인 정보
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)

# 유저 스케줄
class UserSchedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    schedule = db.Column(db.String(500), nullable=False)
    schedule_date = db.Column(db.String(500), nullable=False)
    schedule_info = db.Column(db.String(500), nullable=False)

# 가입 시 email form 확인    
def is_valid_email(email):
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.match(regex, email) is not None

@app.route('/')
def home():
    if 'username' in session:
        return redirect(url_for('mainPage'))
    else:
        return render_template('login.html', register=False)

@app.route('/main')
def mainPage():
    if 'username' in session:
        user = User.query.filter_by(username=session['username']).first()
        return render_template('index.html', user=user)
    else:
        flash('로그인이 필요합니다.', 'danger')
        return redirect(url_for('home'))

# 로그인
@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        session['username'] = user.username  # 세션에 사용자 이름 저장
        return redirect(url_for('mainPage', username=user.username))
    else:
        flash('로그인 실패. 사용자 이름과 비밀번호를 확인하세요.', 'danger')
        return redirect(url_for('home'))

# 가입
@app.route('/register', methods=['POST'])
def register():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')
    
    if not is_valid_email(email):
        flash('유효한 이메일 주소를 입력하세요.', 'danger')
        return redirect(url_for('home'))
    
    if password != confirm_password:
        flash('비밀번호가 일치하지 않습니다!', 'danger')
        return redirect(url_for('home'))
    
    hashed_password = generate_password_hash(
        password,
        method="pbkdf2:sha256",
        salt_length=8
    )
    
    new_user = User(username=username, email=email, password=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        flash('회원가입에 성공했습니다!', 'success')
        return redirect(url_for('home'))
    except:
        flash('사용자 이름이나 이메일이 이미 존재합니다.', 'danger')
        return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop('username', None)  # 세션에서 사용자 이름 제거
    flash('로그아웃 되었습니다.', 'success')
    return redirect(url_for('home'))

@app.route('/forget', methods=['GET', 'POST'])
def forget():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        
        user = User.query.filter_by(username=username, email=email).first()
        if user:
            # 비밀번호 재설정 페이지로 리디렉션
            return redirect(url_for('reset_password', username=username))
        else:
            flash('사용자 이름이나 이메일이 일치하지 않습니다.', 'danger')
            return redirect(url_for('forget'))
    
    return render_template('forget.html')

@app.route('/reset_password/<username>', methods=['GET', 'POST'])
def reset_password(username):
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('비밀번호가 일치하지 않습니다.', 'danger')
            return redirect(url_for('reset_password', username=username))
        
        user = User.query.filter_by(username=username).first()
        if user:
            hashed_password = generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)
            user.password = hashed_password
            db.session.commit()
            flash('비밀번호가 성공적으로 변경되었습니다.', 'success')
            return redirect(url_for('home'))
        else:
            flash('사용자를 찾을 수 없습니다.', 'danger')
            return redirect(url_for('forget'))
    
    return render_template('reset_password.html', username=username)

@app.route('/mainPage/<username>')
def logged_mainPage(username):
    user = User.query.filter_by(username=username).first()
    if user:
        user_schedules = UserSchedule.query.filter_by(user_id=user.id).all()  # 사용자 스케줄 조회
        return render_template('index.html', user=user, schedules=user_schedules)
    else:
        flash('사용자를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('home'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 데이터베이스와 테이블 생성
    app.run(debug=True)