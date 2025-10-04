from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from ..models.models import Student, LostItem, FoundItem, Claim, Retrieval
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

    # 1) Passkey exact match, if any
    lp = lost.get("passkey")
    if lp:
        match = FoundItem.find_by_passkey(lp)
        if match:
            suggestions.append(_serialize_basic(match))
            seen.add(str(match.get("_id")))

    # 2) Keyword-based search using the lost item's details
    parts = [lost.get("title", ""), lost.get("description", ""), lost.get("category", ""), lost.get("location", "")]
    combined_query = " ".join([p for p in parts if p])
    if combined_query.strip():
        for item in FoundItem.search(combined_query, limit=20):
            sid = str(item.get("_id"))
            if sid in seen:
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
    Claim.update_status(claim_id, "approved")
    return jsonify({"message": "Claim approved"})

@api_bp.post("/admin/claims/<claim_id>/reject")
@admin_required
def admin_reject_claim(current_user_id, claim_id):
    """Reject a claim"""
    Claim.update_status(claim_id, "rejected")
    return jsonify({"message": "Claim rejected"})

@api_bp.post("/admin/retrievals")
@admin_required
def admin_create_retrieval(current_user_id):
    """Record item retrieval"""
    data = request.get_json() or {}
    claim_id = data.get("claim_id")
    notes = data.get("notes", "")
    
    if not claim_id:
        return jsonify({"message": "claim_id is required"}), 400
    
    # Mark claim as retrieved
    Claim.update_status(claim_id, "retrieved")
    
    # Create retrieval record
    retrieval = Retrieval.create(claim_id=claim_id, retrieved_by=current_user_id, notes=notes)
    
    return jsonify({
        "message": "Retrieval recorded",
        "retrieval_id": str(retrieval.inserted_id)
    }), 201

@api_bp.get("/admin/retrievals")
@admin_required
def admin_get_retrievals(current_user_id):
    """Get retrieval history"""
    retrievals = Retrieval.find_all(limit=100)
    results = []
    for ret in retrievals:
        results.append({
            "id": str(ret.get("_id")),
            "claim_id": str(ret.get("claim_id")),
            "retrieved_by": str(ret.get("retrieved_by")),
            "notes": ret.get("notes"),
            "retrieved_at": ret.get("retrieved_at").isoformat() if ret.get("retrieved_at") else None,
        })
    return jsonify(results)
