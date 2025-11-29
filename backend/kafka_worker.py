import json
import sys
import os
import time
from kafka import KafkaConsumer
from sqlalchemy.orm import Session

# Thêm đường dẫn root vào sys.path để import được thư mục 'models'
sys.path.append(os.getcwd())

from backend.db.session import SessionLocal
from backend.services.reddit_service import get_user_interactions
from backend.models.interaction import Interaction
from backend.models.child import Child
from backend.models.user import User 

# --- 1. IMPORT MODEL AI (Cập nhật đúng tên hàm) ---
print("--- Đang tải AI Models (Sẽ mất chút thời gian)... ---")
try:
    # Import từ folder 'models'
    from ai_models.classify import predict_sentiment
    from ai_models.categorize import predict_labels
    from ai_models.summarize import summarize_text
    print("-> AI Models đã sẵn sàng.")
except ImportError as e:
    print(f"-> Lỗi import AI: {e}")
    print("-> Đảm bảo bạn đã tạo file models/__init__.py và cài đủ thư viện.")
    # Hàm dự phòng (Dummy)
    def predict_sentiment(t): return "non-hate"
    def predict_labels(t): return "general"
    def summarize_text(t, **k): return t[:100]

# --- 2. HÀM PHÂN TÍCH ---
def analyze_content(content):
    if not content: return "low", "General", ""
    
    # A. Đánh giá rủi ro (classify.py)
    # Hàm predict_sentiment trả về "hate" hoặc "non-hate"
    try:
        ai_label = predict_sentiment(content)
        ai_risk = "high" if ai_label == "hate" else "low"
    except:
        ai_risk = "low"
    
    # B. Phân loại chủ đề (categorize.py)
    try:
        # Hàm predict_labels trả về string hoặc list tùy tham số
        categories = predict_labels(content, return_list=False) 
        if categories == "None": categories = "General"
    except:
        categories = "Uncategorized"

    # C. Tóm tắt (summarize.py)
    summary = content
    if len(content) > 150:
        try:
            # Hàm summarize_text nhận text và trả về string
            summary = summarize_text(content, max_length=60, min_length=10)
        except:
            pass 
            
    return ai_risk, categories, summary

def run_worker():
    print("--- Kafka Worker đang chạy... ---")
    
    # ... (Giữ nguyên phần khởi tạo Consumer và vòng lặp như cũ) ...
    consumer = KafkaConsumer(
        'reddit_scan_tasks',
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='reddit_monitor_group_ai_v2', # Đổi group ID để test lại từ đầu
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    for message in consumer:
        task = message.value
        child_id = task['child_id']
        username = task['username']
        print(f"[*] Nhận task: {username}")
        
        # Lấy dữ liệu (Giới hạn 5 bài để test nhanh)
        interactions = get_user_interactions(username)
        
        if not interactions:
            print("   -> Không có dữ liệu mới.")
            continue

        db = SessionLocal()
        try:
            count = 0
            for item in interactions:
                exists = db.query(Interaction).filter(Interaction.id == item['id']).first()
                if not exists:
                    # --- GỌI AI ---
                    print(f"      -> AI analyzing: {item['id']}...")
                    ai_risk, ai_cat, ai_sum = analyze_content(item['content'])
                    
                    final_risk = "high" if ai_risk == "high" or item['risk'] == "high" else "low"

                    new_inter = Interaction(
                        id=item['id'],
                        child_id=child_id,
                        type=item['type'],
                        content=item['content'],
                        subreddit=item['subreddit'],
                        sentiment=item['sentiment'],
                        url=item['url'],
                        risk_level=final_risk,
                        category=ai_cat,  # Lưu category
                        summary=ai_sum    # Lưu summary
                    )
                    db.add(new_inter)
                    count += 1
            
            db.commit()
            print(f"   -> Đã lưu {count} item.")
        except Exception as e:
            print(f"   -> Lỗi DB: {e}")
            db.rollback()
        finally:
            db.close()

if __name__ == "__main__":
    run_worker()