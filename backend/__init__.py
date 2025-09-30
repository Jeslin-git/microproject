import os
from pathlib import Path
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_pymongo import PyMongo

# Initialize MongoDB connection
mongo = PyMongo()

load_dotenv()


def create_app(config_overrides: dict | None = None) -> Flask:
    """Application factory for the Flask app.

    - Enables CORS for Vite dev server (default: http://localhost:5173)
    - Registers API blueprint under /api
    - Optionally serves the Vite production build from frontend/dist
    """
    base_dir = Path(__file__).resolve().parent
    dist_dir = (base_dir.parent / "frontend" / "dist").resolve()

    static_folder = str(dist_dir) if dist_dir.exists() else None
    static_url_path = "/"

    app = Flask(
        __name__,
        static_folder=static_folder,
        static_url_path=static_url_path,
    )

    if config_overrides:
        app.config.update(config_overrides)

    # MongoDB configuration
    app.config["MONGO_URI"] = os.getenv("MONGODB_URI", "mongodb://localhost:27017/lostfound")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key-here")
    mongo.init_app(app)

    # Ensure DB indexes on startup
    with app.app_context():
        try:
            from .models.models import ensure_indexes
            ensure_indexes()
        except Exception as exc:  # pragma: no cover
            # Avoid hard-failing app if index creation encounters a transient error
            app.logger.warning(f"Index creation warning: {exc}")

    # CORS for Vite dev server - allow both 5173 and 5174 ports in development
    frontend_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    ]
    # Remove any duplicates and None values
    frontend_origins = list({origin for origin in frontend_origins if origin})
    CORS(app, resources={"/api/*": {"origins": frontend_origins}})

    # Register blueprints
    from .routes.api import api_bp  # noqa: WPS433 (import within function)

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.get("/healthz")
    def healthz():  # type: ignore[unused-ignore]
        return jsonify(status="ok")

    # Serve SPA (only if built)
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path: str):  # type: ignore[unused-ignore]
        if not dist_dir.exists():
            return (
                jsonify(error="Frontend not built. Run 'npm run build' in frontend/"),
                404,
            )
        full_path = dist_dir / path
        if path and full_path.exists():
            return send_from_directory(str(dist_dir), path)
        return send_from_directory(str(dist_dir), "index.html")

    return app
