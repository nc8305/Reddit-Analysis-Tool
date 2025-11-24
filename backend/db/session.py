from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base 
from backend.config.env_settings import env_settings

DATABASE_URL = env_settings.DATABASE_URL

# --- SỬA DÒNG NÀY ---
# Thêm tham số pool_pre_ping=True và pool_recycle
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800, # Tái tạo sau 30 phút
    pool_size=2,       # <--- Giảm xuống còn 2
    max_overflow=1,   # <--- Chỉ cho phép tràn thêm 1 khi quá tải
    connect_args={
        "prepare_threshold": None  # <--- QUAN TRỌNG: Tắt Prepared Statements để chạy được với Port 6543
    }
)
# --------------------

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()