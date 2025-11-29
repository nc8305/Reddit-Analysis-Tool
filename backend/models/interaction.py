from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.sql import func
from backend.db.session import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(String, primary_key=True) 
    child_id = Column(Integer, ForeignKey("children.id"))
    type = Column(String) 
    content = Column(Text) # Changed to Text for longer content
    subreddit = Column(String)
    sentiment = Column(String)
    risk_level = Column(String)
    url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- NEW COLUMNS FOR AI MODELS ---
    category = Column(String, nullable=True) # Stores categories from categorize.py
    summary = Column(Text, nullable=True)    # Stores summary from summarize.py