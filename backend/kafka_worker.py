import json
import sys
import os
from kafka import KafkaConsumer
from sqlalchemy.orm import Session

sys.path.append(os.getcwd())

from backend.db.session import SessionLocal
from backend.services.reddit_service import get_user_interactions
from backend.models.interaction import Interaction
from backend.models.child import Child
from backend.models.user import User 
# -------------------------------------------

def run_worker():
    print("--- Consumer running ---")
    
    # 2. Khởi tạo Consumer
    consumer = KafkaConsumer(
        'reddit_scan_tasks',
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='earliest', # Đọc lại tin nhắn cũ nếu bị trôi
        enable_auto_commit=True,
        group_id='reddit_monitor_group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    for message in consumer:
        task = message.value
        child_id = task['child_id']
        username = task['username']
        
        print(f"[*] Receive task: Scan {username} (Child ID: {child_id})")
        
        # 3. Gọi PRAW lấy dữ liệu thật
        try:
            interactions_data = get_user_interactions(username)
        except Exception as e:
            print(f" PRAW error: {e}")
            continue
        
        if not interactions_data:
            print(" No updates found.")
            continue

        # 4. Lưu vào Database
        db = SessionLocal()
        try:
            count = 0
            for item in interactions_data:
                # Kiểm tra trùng lặp trước khi lưu
                exists = db.query(Interaction).filter(Interaction.id == item['id']).first()
                if not exists:
                    new_inter = Interaction(
                        id=item['id'],
                        child_id=child_id,
                        type=item['type'],
                        content=item['content'],
                        subreddit=item['subreddit'],
                        sentiment=item['sentiment'],
                        risk_level=item['risk'],
                        url=item['url']
                        # created_at sẽ tự động lấy giờ hiện tại theo database
                    )
                    db.add(new_inter)
                    count += 1
            
            db.commit()
            print(f"Save {count} new interactions.")
        except Exception as e:
            print(f" DB error: {e}")
            db.rollback()
        finally:
            db.close()

if __name__ == "__main__":
    run_worker()