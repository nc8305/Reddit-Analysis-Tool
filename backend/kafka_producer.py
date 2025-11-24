import json
from kafka import KafkaProducer
import time

def get_producer():
    try:
        return KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )
    except:
        return None

producer = get_producer()

def send_scan_request(child_id: int, reddit_username: str):
    if producer:
        message = {
            "child_id": child_id,
            "username": reddit_username,
            "timestamp": time.time()
        }
        # Gửi task vào topic 'reddit_scan_tasks'
        producer.send('reddit_scan_tasks', value=message)
        print(f"[Kafka] sent scan request for {reddit_username}")
    else:
        print("[Kafka] Producer not available. Cannot send message.")