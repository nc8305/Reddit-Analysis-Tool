from dotenv import load_dotenv
import os

load_dotenv()

class ENV:
    DB_USER = os.getenv("user")
    DB_PASSWORD = os.getenv("password")
    DB_HOST = os.getenv("host")
    DB_PORT = os.getenv("port")
    DB_NAME = os.getenv("dbname")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
    REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
    REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

    # SUPABASE_URL = os.getenv("SUPABASE_URL")
    # SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    # SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


    # JWT settings
    # JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-for-production")
    # JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    # ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    # # --- Refresh Token Settings (Long-lived) ---
    # REFRESH_TOKEN_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-for-production")
    # REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

env_settings=ENV