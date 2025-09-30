from datetime import datetime
from backend import mongo
from bson import ObjectId
from pymongo import ASCENDING, TEXT

class Student:
    @staticmethod
    def create(email: str, name: str, password_hash: str, role: str = "student"):
        student = {
            "email": email,
            "name": name,
            "password": password_hash,
            "role": role,  # "student" or "admin"
            "created_at": datetime.utcnow()
        }
        return mongo.db.students.insert_one(student)

    @staticmethod
    def find_by_email(email: str):
        return mongo.db.students.find_one({"email": email})

    @staticmethod
    def find_by_id(student_id: str):
        return mongo.db.students.find_one({"_id": ObjectId(student_id)})

class LostItem:
    @staticmethod
    def create(title: str, description: str, category: str, location: str, date_lost: datetime, 
               student_id: str, passkey: str):
        item = {
            "title": title,
            "description": description,
            "category": category,
            "location": location,
            "date_lost": date_lost,
            "student_id": ObjectId(student_id),
            "passkey": passkey,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        return mongo.db.lost_items.insert_one(item)

    @staticmethod
    def find_by_passkey(passkey: str):
        return mongo.db.lost_items.find_one({"passkey": passkey})

    @staticmethod
    def find_by_student(student_id: str):
        return mongo.db.lost_items.find({"student_id": ObjectId(student_id)})

    @staticmethod
    def find_by_id(item_id: str):
        return mongo.db.lost_items.find_one({"_id": ObjectId(item_id)})

    @staticmethod
    def search(query: str, limit: int = 20):
        """Text search lost items by query string."""
        return mongo.db.lost_items.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)

class FoundItem:
    @staticmethod
    def create(title: str, description: str, category: str, location: str, 
               finder_id: str, passkey: str):
        item = {
            "title": title,
            "description": description,
            "category": category,
            "location": location,
            "finder_id": ObjectId(finder_id),
            "passkey": passkey,
            "status": "unclaimed",
            "created_at": datetime.utcnow()
        }
        return mongo.db.found_items.insert_one(item)

    @staticmethod
    def find_by_passkey(passkey: str):
        return mongo.db.found_items.find_one({"passkey": passkey})

    @staticmethod
    def update_status(item_id: str, status: str):
        return mongo.db.found_items.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": {"status": status}}
        )

    @staticmethod
    def search(query: str, limit: int = 20):
        """Text search found items by query string."""
        return mongo.db.found_items.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)

class Claim:
    @staticmethod
    def create(lost_item_id: str, found_item_id: str, student_id: str):
        claim = {
            "lost_item_id": ObjectId(lost_item_id),
            "found_item_id": ObjectId(found_item_id),
            "student_id": ObjectId(student_id),
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        return mongo.db.claims.insert_one(claim)

    @staticmethod
    def update_status(claim_id: str, status: str):
        return mongo.db.claims.update_one(
            {"_id": ObjectId(claim_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )

    @staticmethod
    def find_all(limit: int = 50):
        return mongo.db.claims.find().sort("created_at", -1).limit(limit)

    @staticmethod
    def find_by_id(claim_id: str):
        return mongo.db.claims.find_one({"_id": ObjectId(claim_id)})

class Retrieval:
    @staticmethod
    def create(claim_id: str, retrieved_by: str, notes: str = ""):
        retrieval = {
            "claim_id": ObjectId(claim_id),
            "retrieved_by": ObjectId(retrieved_by),
            "notes": notes,
            "retrieved_at": datetime.utcnow()
        }
        return mongo.db.retrievals.insert_one(retrieval)

    @staticmethod
    def find_by_claim(claim_id: str):
        return mongo.db.retrievals.find_one({"claim_id": ObjectId(claim_id)})

    @staticmethod
    def find_all(limit: int = 50):
        return mongo.db.retrievals.find().sort("retrieved_at", -1).limit(limit)

def ensure_indexes() -> None:
    """Create required MongoDB indexes if they do not exist."""
    # Students: unique email
    mongo.db.students.create_index([("email", ASCENDING)], unique=True, name="unique_email_idx")

    # Lost items: passkey and text index with weights
    mongo.db.lost_items.create_index([("passkey", ASCENDING)], name="lost_passkey_idx")
    mongo.db.lost_items.create_index(
        [("title", TEXT), ("description", TEXT), ("category", TEXT), ("location", TEXT)],
        name="lost_items_text_index",
        default_language="english",
        weights={"title": 10, "description": 5, "category": 3, "location": 2},
    )

    # Found items: passkey and text index with weights
    mongo.db.found_items.create_index([("passkey", ASCENDING)], name="found_passkey_idx")
    mongo.db.found_items.create_index(
        [("title", TEXT), ("description", TEXT), ("category", TEXT), ("location", TEXT)],
        name="found_items_text_index",
        default_language="english",
        weights={"title": 10, "description": 5, "category": 3, "location": 2},
    )

    # Claims: common lookup indexes
    mongo.db.claims.create_index([("lost_item_id", ASCENDING)], name="claims_lost_idx")
    mongo.db.claims.create_index([("found_item_id", ASCENDING)], name="claims_found_idx")
    mongo.db.claims.create_index([("student_id", ASCENDING)], name="claims_student_idx")

    # Retrievals: claim lookup
    mongo.db.retrievals.create_index([("claim_id", ASCENDING)], name="retrievals_claim_idx")