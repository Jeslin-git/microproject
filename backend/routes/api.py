from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from ..models.models import Student, LostItem, FoundItem, Claim
from ..utils.auth import token_required, create_token, generate_passkey, match_items, admin_required

api_bp = Blueprint("api", __name__)

# Helpers
def _serialize_basic(item):
    return {
        "id": str(item.get("_id")),
        "title": item.get("title"),
        "description": item.get("description"),
        "category": item.get("category"),
        "location": item.get("location"),
        "status": item.get("status"),
        "passkey": item.get("passkey"),
        "serial_number": item.get("serial_number"),
        "created_at": item.get("created_at").isoformat() if item.get("created_at") else None,
    }

# Auth routes
@api_bp.post("/auth/register")
def register():
    data = request.get_json()
    
    if Student.find_by_email(data["email"]):
        return jsonify({"message": "Email already registered"}), 400
    
    password_hash = generate_password_hash(data["password"])
    student = Student.create(data["email"], data["name"], password_hash)
    
    # Get the created student to get the role
    created_student = Student.find_by_id(str(student.inserted_id))
    role = created_student.get('role', 'student')
    
    return jsonify({
        "message": "Registration successful",
        "token": create_token(str(student.inserted_id), role)
    }), 201

@api_bp.post("/auth/login")
def login():
    data = request.get_json()
    student = Student.find_by_email(data["email"])
    
    if not student or not check_password_hash(student["password"], data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
    
    role = student.get('role', 'student')
    
    return jsonify({
        "token": create_token(str(student["_id"]), role)
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
        passkey=passkey,
        serial_number=data.get("serialNumber")  # Optional field
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
        passkey=passkey,
        serial_number=data.get("serialNumber")  # Optional field
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

# Search routes
@api_bp.get("/found-items/search")
def search_found_items():
    query = request.args.get("q") or request.args.get("query")
    if not query:
        return jsonify({"message": "Missing query parameter 'q'"}), 400

    limit = int(request.args.get("limit", 20))
    category = request.args.get("category")
    location = request.args.get("location")

    cursor = FoundItem.search(query, limit=limit)
    results = []
    for item in cursor:
        # Skip claimed items
        if item.get("status") == "claimed":
            continue
        if category and item.get("category") != category:
            continue
        if location and item.get("location") != location:
            continue
        results.append(_serialize_basic(item))
    return jsonify(results)

@api_bp.get("/lost-items/search")
def search_lost_items():
    query = request.args.get("q") or request.args.get("query")
    if not query:
        return jsonify({"message": "Missing query parameter 'q'"}), 400

    limit = int(request.args.get("limit", 20))
    category = request.args.get("category")
    location = request.args.get("location")

    cursor = LostItem.search(query, limit=limit)
    results = []
    for item in cursor:
        if category and item.get("category") != category:
            continue
        if location and item.get("location") != location:
            continue
        results.append(_serialize_basic(item))
    return jsonify(results)

# Match suggestions for a given lost item
@api_bp.get("/lost-items/<lost_id>/matches")
@token_required
def suggest_matches(current_user_id, lost_id):
    lost = LostItem.find_by_id(lost_id)
    if not lost:
        return jsonify({"message": "Lost item not found"}), 404

    suggestions = []
    seen = set()

    # 1) Serial number exact match (highest priority)
    serial = lost.get("serial_number")
    if serial and serial.strip():
        for item in FoundItem.find_by_serial_number(serial.strip()):
            # Skip claimed items
            if item.get("status") == "claimed":
                continue
            suggestions.append(_serialize_basic(item))
            seen.add(str(item.get("_id")))

    # 2) Passkey exact match
    lp = lost.get("passkey")
    if lp:
        match = FoundItem.find_by_passkey(lp)
        if match and match.get("status") != "claimed":
            sid = str(match.get("_id"))
            if sid not in seen:
                suggestions.append(_serialize_basic(match))
                seen.add(sid)

    # 3) Keyword-based search using the lost item's details
    parts = [lost.get("title", ""), lost.get("description", ""), lost.get("category", ""), lost.get("location", "")]
    if serial and serial.strip():
        parts.append(serial.strip())
    combined_query = " ".join([p for p in parts if p])
    if combined_query.strip():
        for item in FoundItem.search(combined_query, limit=20):
            sid = str(item.get("_id"))
            if sid in seen:
                continue
            # Additional check to ensure claimed items are filtered out
            if item.get("status") == "claimed":
                continue
            suggestions.append(_serialize_basic(item))
            seen.add(sid)

    return jsonify(suggestions)

# Create a claim manually from a suggested match
@api_bp.post("/claims")
@token_required
def create_claim(current_user_id):
    data = request.get_json() or {}
    lost_item_id = data.get("lost_item_id")
    found_item_id = data.get("found_item_id")
    if not lost_item_id or not found_item_id:
        return jsonify({"message": "lost_item_id and found_item_id are required"}), 400

    # Check if user has already claimed this found item
    existing_claim = Claim.find_existing_claim(found_item_id, current_user_id)
    if existing_claim:
        return jsonify({
            "message": "You have already claimed this item",
            "existing_claim_id": str(existing_claim["_id"])
        }), 409  # 409 Conflict

    ins = Claim.create(lost_item_id=lost_item_id, found_item_id=found_item_id, student_id=current_user_id)
    return jsonify({"message": "Claim created", "claim_id": str(ins.inserted_id)}), 201

# Admin endpoints
@api_bp.get("/admin/claims")
@admin_required
def admin_get_claims(current_user_id):
    """Get all claims for admin review"""
    claims = Claim.find_all(limit=100)
    results = []
    for claim in claims:
        results.append({
            "id": str(claim.get("_id")),
            "lost_item_id": str(claim.get("lost_item_id")),
            "found_item_id": str(claim.get("found_item_id")),
            "student_id": str(claim.get("student_id")),
            "status": claim.get("status"),
            "created_at": claim.get("created_at").isoformat() if claim.get("created_at") else None,
            "updated_at": claim.get("updated_at").isoformat() if claim.get("updated_at") else None,
        })
    return jsonify(results)

@api_bp.post("/admin/claims/<claim_id>/approve")
@admin_required
def admin_approve_claim(current_user_id, claim_id):
    """Approve a claim"""
    # Get the claim details to update related items
    claim = Claim.find_by_id(claim_id)
    if not claim:
        return jsonify({"message": "Claim not found"}), 404
    
    # Update claim status
    Claim.update_status(claim_id, "approved")
    
    # Update found item status to 'claimed'
    if claim.get("found_item_id"):
        FoundItem.update_status(str(claim["found_item_id"]), "claimed")
    
    # Update lost item status to 'found'
    if claim.get("lost_item_id"):
        LostItem.update_status(str(claim["lost_item_id"]), "found")
    
    return jsonify({"message": "Claim approved"})

@api_bp.post("/admin/claims/<claim_id>/reject")
@admin_required
def admin_reject_claim(current_user_id, claim_id):
    """Reject a claim"""
    Claim.update_status(claim_id, "rejected")
    return jsonify({"message": "Claim rejected"})
