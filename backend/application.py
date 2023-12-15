from flask import Flask, jsonify, request
import pytesseract
from PIL import Image
import io
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from flask_migrate import Migrate
import secrets

# Flask 앱 초기화
application = Flask(__name__)
# CORS 설정
CORS(application)
# 데이터베이스 설정
application.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
# JWT 비밀 키 설정
application.config['JWT_SECRET_KEY'] = secrets.token_hex(16)

# SQLAlchemy 인스턴스 생성
db = SQLAlchemy(application)
migrate = Migrate(application, db)
# JWT Manager 인스턴스 생성
jwt = JWTManager(application)

# User 모델 정의
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.String(50), primary_key=True)
    password = db.Column(db.String(50), nullable=False)

# Chat 모델 정의
class Chat(db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'))
    message = db.Column(db.String(500), nullable=False)
    sender = db.Column(db.String(50), nullable=False)

class Memo(db.Model):
    __tablename__ = 'memo'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'))
    title = db.Column(db.String(500), nullable=False)
    content = db.Column(db.String(1000), nullable=False)


# 로그인 API
@application.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(id=data['id']).first()
    if user and user.password == data['password']:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify(message="Invalid credentials"), 401

# 회원가입 API
@application.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # 중복된 ID를 방지하기 위해 검사
    if User.query.filter_by(id=data['id']).first():
        return jsonify(message="User ID already exists!"), 400
    new_user = User(id=data['id'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(message="User registered successfully!"), 201

# 메모 추가 API
@application.route('/add_memo', methods=['POST'])
@jwt_required()
def add_memo():
    try:
        # 현재 로그인한 사용자의 ID 가져오기
        user_id = get_jwt_identity()

        # 클라이언트로부터 JSON 형식의 메모 데이터 가져오기 (제목과 내용만)
        memo_data = request.get_json()
        title = memo_data.get('title')
        content = memo_data.get('content')

        # 메모 데이터를 데이터베이스에 저장
        new_memo = Memo(user_id=user_id, title=title, content=content)

        db.session.add(new_memo)
        db.session.commit()

        # 저장된 메모 정보를 응답으로 보내기
        response_data = {
            'id': new_memo.id,
            'user_id': new_memo.user_id,
            'title': new_memo.title,
            'content': new_memo.content
        }
        return jsonify(response_data), 201
    except Exception as e:
        return jsonify(message=str(e)), 500
        # return jsonify(message="Failed to add memo"), 500

# 메모 삭제 API
@application.route('/delete_memo/<int:memo_id>', methods=['DELETE'])
@jwt_required()
def delete_memo(memo_id):
    try:
        user_id = get_jwt_identity()
        memo = Memo.query.filter_by(id=memo_id, user_id=user_id).first()
        if memo:
            db.session.delete(memo)
            db.session.commit()
            return jsonify(message="Memo deleted successfully"), 200
        else:
            return jsonify(message="Memo not found"), 404
    except Exception as e:
        return jsonify(message=str(e)), 500


# 메모 불러오기 API
@application.route('/get_memos', methods=['GET'])
@jwt_required()
def get_memos():
    try:
        # 현재 로그인한 사용자의 ID 가져오기
        user_id = get_jwt_identity()

        # 해당 사용자에 대한 메모 데이터를 데이터베이스에서 불러오기
        memos = Memo.query.filter_by(user_id=user_id).all()

        # 메모 데이터를 JSON 형식으로 변환하여 클라이언트에게 반환
        memo_list = [{'id': memo.id, 'title': memo.title, 'content': memo.content} for memo in memos]
        return jsonify(memos=memo_list), 200
    except Exception as e:
        return jsonify(message="Failed to fetch memos"), 500


# # 채팅 내용 저장 API
# @application.route('/save_chat', methods=['POST'])
# @jwt_required()
# def save_chat():
#     data = request.get_json()
#     user_id = get_jwt_identity() # JWT에서 사용자 ID 가져오기
#     new_chat = Chat(user_id=user_id, message=data['message'], sender=data['sender'])
#     db.session.add(new_chat)
#     db.session.commit()
#     return jsonify(message="Chat saved successfully"), 200
#
# # 저장된 채팅 불러오기 API
# @application.route('/get_chats', methods=['GET'])
# @jwt_required()
# def get_chats():
#     user_id = get_jwt_identity()
#     chats = Chat.query.filter_by(user_id=user_id).all()
#     chat_list = [{'message': chat.message, 'sender': chat.sender} for chat in chats]
#     return jsonify(chats=chat_list), 200

@application.route('/perform_ocr', methods=['POST'])
@jwt_required()
def perform_ocr():
    config = ('-l kor+eng')
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({'error': 'No image file provided'}), 400

    image = Image.open(io.BytesIO(image_file.read()))
    ocr_text = pytesseract.image_to_string(image, config=config)  # 언어 설정에 주의

    # OCR 결과를 데이터베이스에 저장
    user_id = get_jwt_identity()
    new_memo = Memo(user_id=user_id, title='OCR 결과', content=ocr_text)
    db.session.add(new_memo)
    db.session.commit()

    return jsonify({'ocrText': ocr_text, 'memoId': new_memo.id}), 200


# 보호된 경로 테스트 API
@application.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    return jsonify(message="This is a protected route!")

# 테스트 페이지
@application.route('/test')
def index():
    return "Welcome to my Flask App!"

# 메인 함수
if __name__ == '__main__':
    # 데이터베이스 테이블 생성
    with application.app_context():
        db.create_all()
    # 앱 실행
    application.run(debug=True, host='0.0.0.0', port=8080)