from flask import Blueprint, jsonify, request

api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health():
    return jsonify(status="ok")


@api_bp.get("/hello")
def hello():
    name = request.args.get("name", "World")
    return jsonify(message=f"Hello, {name}!")


@api_bp.post("/echo")
def echo():
    data = request.get_json(silent=True) or {}
    return jsonify(received=data)
