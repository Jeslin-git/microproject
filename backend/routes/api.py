from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson import ObjectId
from ..models.models import Student, LostItem, FoundItem, Claim, Retrieval
from ..utils.auth import token_required, create_token, generate_passkey, match_items, admin_required
from backend import mongo

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
    
    # Check if this is the first user
    user_count = mongo.db.students.count_documents({})
    role = "admin" if user_count == 0 else "student"
    
    password_hash = generate_password_hash(data["password"])
    student = Student.create(data["email"], data["name"], password_hash, role)
    
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
        "description": item["description"],
        "category": item["category"],
        "location": item["location"],
        "date_lost": item["date_lost"].isoformat() if item.get("date_lost") else None,
        "serial_number": item.get("serial_number"),
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

@api_bp.get("/found-items")
@token_required
def get_found_items(current_user_id):
    """Get all found items"""
    items = FoundItem.find_all()
    return jsonify([{
        "id": str(item["_id"]),
        "title": item["title"],
        "description": item["description"],
        "category": item["category"],
        "location": item["location"],
        "date_found": item.get("date_found"),
        "status": item.get("status", "unclaimed"),
        "passkey": item["passkey"]
    } for item in items])

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
        # Get item details
        lost_item = LostItem.find_by_id(str(claim.get("lost_item_id"))) if claim.get("lost_item_id") else None
        found_item = FoundItem.find_by_id(str(claim.get("found_item_id"))) if claim.get("found_item_id") else None
        student = Student.find_by_id(str(claim.get("student_id"))) if claim.get("student_id") else None
        
        results.append({
            "id": str(claim.get("_id")),
            "lost_item_id": str(claim.get("lost_item_id")),
            "lost_item_title": lost_item.get("title") if lost_item else "Unknown",
            "lost_item_category": lost_item.get("category") if lost_item else "Unknown",
            "found_item_id": str(claim.get("found_item_id")),
            "found_item_title": found_item.get("title") if found_item else "Unknown",
            "found_item_category": found_item.get("category") if found_item else "Unknown",
            "student_id": str(claim.get("student_id")),
            "student_name": student.get("name") if student else "Unknown",
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

# Retrieval endpoints
@api_bp.post("/admin/retrievals")
@admin_required
def create_retrieval(current_user_id):
    """Record a physical item retrieval"""
    data = request.get_json()
    claim_id = data.get("claim_id")
    notes = data.get("notes", "")
    retrieval_location = data.get("retrieval_location", "Main Office")
    
    if not claim_id:
        return jsonify({"message": "claim_id is required"}), 400
    
    # Verify claim exists and is approved
    claim = Claim.find_by_id(claim_id)
    if not claim:
        return jsonify({"message": "Claim not found"}), 404
    
    if claim.get("status") != "approved":
        return jsonify({"message": "Claim must be approved before retrieval"}), 400
    
    # Check if retrieval already exists
    existing = Retrieval.find_by_claim_id(claim_id)
    if existing:
        return jsonify({"message": "Retrieval already recorded for this claim"}), 409
    
    # Create retrieval record
    retrieval = Retrieval.create(
        claim_id=claim_id,
        student_id=str(claim["student_id"]),
        admin_id=current_user_id,
        retrieval_location=retrieval_location,
        notes=notes
    )
    
    # Update claim status to retrieved
    Claim.update_status(claim_id, "retrieved")
    
    return jsonify({
        "message": "Retrieval recorded successfully",
        "retrieval_id": str(retrieval.inserted_id)
    }), 201

@api_bp.get("/admin/retrievals")
@admin_required
def get_retrievals(current_user_id):
    """Get all retrieval records"""
    limit = int(request.args.get("limit", 100))
    retrievals = Retrieval.find_all(limit=limit)
    
    results = []
    for retrieval in retrievals:
        # Get claim details
        claim = Claim.find_by_id(str(retrieval["claim_id"]))
        student = Student.find_by_id(str(retrieval["student_id"]))
        admin = Student.find_by_id(str(retrieval["admin_id"]))
        
        # Get item details from claim
        lost_item = None
        found_item = None
        if claim:
            lost_item = LostItem.find_by_id(str(claim.get("lost_item_id"))) if claim.get("lost_item_id") else None
            found_item = FoundItem.find_by_id(str(claim.get("found_item_id"))) if claim.get("found_item_id") else None
        
        results.append({
            "id": str(retrieval["_id"]),
            "claim_id": str(retrieval["claim_id"]),
            "student_id": str(retrieval["student_id"]),
            "student_name": student.get("name") if student else "Unknown",
            "student_email": student.get("email") if student else "Unknown",
            "admin_id": str(retrieval["admin_id"]),
            "admin_name": admin.get("name") if admin else "Unknown",
            "item_title": lost_item.get("title") if lost_item else (found_item.get("title") if found_item else "Unknown"),
            "item_category": lost_item.get("category") if lost_item else (found_item.get("category") if found_item else "Unknown"),
            "retrieval_location": retrieval.get("retrieval_location"),
            "notes": retrieval.get("notes"),
            "retrieval_date": retrieval.get("retrieval_date").isoformat() if retrieval.get("retrieval_date") else None,
            "created_at": retrieval.get("created_at").isoformat() if retrieval.get("created_at") else None
        })
    
    return jsonify(results)

@api_bp.get("/retrievals/my")
@token_required
def get_my_retrievals(current_user_id):
    """Get retrieval records for current user"""
    retrievals = Retrieval.find_by_student(current_user_id)
    
    results = []
    for retrieval in retrievals:
        admin = Student.find_by_id(str(retrieval["admin_id"]))
        
        # Get item details from claim
        claim = Claim.find_by_id(str(retrieval["claim_id"]))
        lost_item = None
        found_item = None
        if claim:
            lost_item = LostItem.find_by_id(str(claim.get("lost_item_id"))) if claim.get("lost_item_id") else None
            found_item = FoundItem.find_by_id(str(claim.get("found_item_id"))) if claim.get("found_item_id") else None
        
        results.append({
            "id": str(retrieval["_id"]),
            "claim_id": str(retrieval["claim_id"]),
            "admin_name": admin.get("name") if admin else "Unknown",
            "item_title": lost_item.get("title") if lost_item else (found_item.get("title") if found_item else "Unknown"),
            "item_category": lost_item.get("category") if lost_item else (found_item.get("category") if found_item else "Unknown"),
            "retrieval_location": retrieval.get("retrieval_location"),
            "notes": retrieval.get("notes"),
            "retrieval_date": retrieval.get("retrieval_date").isoformat() if retrieval.get("retrieval_date") else None
        })
    
    return jsonify(results)

@api_bp.patch("/admin/retrievals/<retrieval_id>")
@admin_required
def update_retrieval(current_user_id, retrieval_id):
    """Update retrieval notes"""
    data = request.get_json()
    notes = data.get("notes")
    
    if notes is None:
        return jsonify({"message": "notes field is required"}), 400
    
    Retrieval.update_notes(retrieval_id, notes)
    return jsonify({"message": "Retrieval notes updated successfully"})

# User Management endpoints
@api_bp.get("/admin/users")
@admin_required
def get_all_users(current_user_id):
    """Get all users for admin"""
    try:
        users = list(mongo.db.students.find().sort("created_at", -1))
        results = []
        for user in users:
            results.append({
                "id": str(user["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "student"),
                "created_at": user.get("created_at").isoformat() if user.get("created_at") else None
            })
        return jsonify(results)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@api_bp.patch("/admin/users/<user_id>/role")
@admin_required
def update_user_role(current_user_id, user_id):
    """Update user role"""
    data = request.get_json()
    role = data.get("role")
    
    if role not in ["student", "admin"]:
        return jsonify({"message": "Invalid role. Must be 'student' or 'admin'"}), 400
    
    mongo.db.students.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )
    return jsonify({"message": "User role updated successfully"})

@api_bp.delete("/admin/users/<user_id>")
@admin_required
def delete_user(current_user_id, user_id):
    """Delete a user"""
    if user_id == current_user_id:
        return jsonify({"message": "Cannot delete your own account"}), 400
    
    mongo.db.students.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"message": "User deleted successfully"})

# Item Management endpoints
@api_bp.get("/admin/lost-items")
@admin_required
def get_all_lost_items(current_user_id):
    """Get all lost items for admin"""
    limit = int(request.args.get("limit", 100))
    items = LostItem.find_all(limit=limit) if hasattr(LostItem, 'find_all') else mongo.db.lost_items.find().sort("created_at", -1).limit(limit)
    
    results = []
    for item in items:
        student = Student.find_by_id(str(item["student_id"]))
        results.append({
            "id": str(item["_id"]),
            "title": item.get("title"),
            "description": item.get("description"),
            "category": item.get("category"),
            "location": item.get("location"),
            "status": item.get("status"),
            "passkey": item.get("passkey"),
            "serial_number": item.get("serial_number"),
            "student_name": student.get("name") if student else "Unknown",
            "student_email": student.get("email") if student else "Unknown",
            "date_lost": item.get("date_lost").isoformat() if item.get("date_lost") else None,
            "created_at": item.get("created_at").isoformat() if item.get("created_at") else None
        })
    return jsonify(results)

@api_bp.get("/admin/found-items")
@admin_required
def get_all_found_items(current_user_id):
    """Get all found items for admin"""
    limit = int(request.args.get("limit", 100))
    items = mongo.db.found_items.find().sort("created_at", -1).limit(limit)
    
    results = []
    for item in items:
        finder = Student.find_by_id(str(item["finder_id"]))
        results.append({
            "id": str(item["_id"]),
            "title": item.get("title"),
            "description": item.get("description"),
            "category": item.get("category"),
            "location": item.get("location"),
            "status": item.get("status"),
            "passkey": item.get("passkey"),
            "serial_number": item.get("serial_number"),
            "finder_name": finder.get("name") if finder else "Unknown",
            "finder_email": finder.get("email") if finder else "Unknown",
            "created_at": item.get("created_at").isoformat() if item.get("created_at") else None
        })
    return jsonify(results)

@api_bp.delete("/admin/lost-items/<item_id>")
@admin_required
def delete_lost_item(current_user_id, item_id):
    """Delete a lost item"""
    mongo.db.lost_items.delete_one({"_id": ObjectId(item_id)})
    return jsonify({"message": "Lost item deleted successfully"})

@api_bp.delete("/admin/found-items/<item_id>")
@admin_required
def delete_found_item(current_user_id, item_id):
    """Delete a found item"""
    mongo.db.found_items.delete_one({"_id": ObjectId(item_id)})
    return jsonify({"message": "Found item deleted successfully"})
