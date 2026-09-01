from pathlib import Path

# Корень backend-пакета: backend/ локально, /app в Docker.
BACKEND_ROOT = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BACKEND_ROOT / "uploads"
