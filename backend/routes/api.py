from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from ..models.models import Student, LostItem, FoundItem, Claim
from ..utils.auth import token_required, create_token, generate_passkey, match_items

api_bp = Blueprint("api", __name__)

# Auth routes
@api_bp.post("/auth/register")
def register():
    data = request.get_json()
    
    if Student.find_by_email(data["email"]):
        return jsonify({"message": "Email already registered"}), 400
    
    password_hash = generate_password_hash(data["password"])
    student = Student.create(data["email"], data["name"], password_hash)
    
    return jsonify({
        "message": "Registration successful",
        "token": create_token(str(student.inserted_id))
    }), 201

@api_bp.post("/auth/login")
def login():
    data = request.get_json()
    student = Student.find_by_email(data["email"])
    
    if not student or not check_password_hash(student["password"], data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
    
    return jsonify({
        "token": create_token(str(student["_id"]))
    })

# Lost Items routes
@api_bp.post("/lost-items")
@token_required
def report_lost_item(current_user_id):
    data = request.get_json()
    passkey = generate_passkey()
    
    lost_item = LostItem.create(
        title=data["title"],
        description=data["description"],
        category=data["category"],
        location=data["location"],
        date_lost=datetime.fromisoformat(data["date_lost"]),
        student_id=current_user_id,
        passkey=passkey
    )
    
    return jsonify({
        "message": "Lost item reported successfully",
        "passkey": passkey
    }), 201

@api_bp.get("/lost-items")
@token_required
def get_lost_items(current_user_id):
    items = LostItem.find_by_student(current_user_id)
    return jsonify([{
        "id": str(item["_id"]),
        "title": item["title"],
        "status": item["status"],
        "passkey": item["passkey"]
    } for item in items])

# Found Items routes
@api_bp.post("/found-items")
@token_required
def report_found_item(current_user_id):
    data = request.get_json()
    passkey = data.get("passkey", generate_passkey())
    
    found_item = FoundItem.create(
        title=data["title"],
        description=data["description"],
        category=data["category"],
        location=data["location"],
        finder_id=current_user_id,
        passkey=passkey
    )
    
    # Check for matching lost items
    lost_item = LostItem.find_by_passkey(passkey)
    if lost_item:
        # Create a claim automatically
        claim = Claim.create(
            lost_item_id=str(lost_item["_id"]),
            found_item_id=str(found_item.inserted_id),
            student_id=str(lost_item["student_id"])
        )
        
    return jsonify({
        "message": "Found item reported successfully",
        "passkey": passkey
    }), 201

# Claims routes
@api_bp.post("/claims/<claim_id>/verify")
@token_required
def verify_claim(current_user_id, claim_id):
    Claim.update_status(claim_id, "verified")
    return jsonify({"message": "Claim verified successfully"})

@api_bp.get("/health")
def health():
    return jsonify(status="ok")
