from datetime import datetime
from backend import mongo
from bson import ObjectId

class Student:
    @staticmethod
    def create(email: str, name: str, password_hash: str):
        student = {
            "email": email,
            "name": name,
            "password": password_hash,
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
            {"$set": {"status": status}}
        )