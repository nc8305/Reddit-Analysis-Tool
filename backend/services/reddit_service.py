import praw
import time
from collections import Counter
from backend.config.env_settings import env_settings
import socket
import requests.packages.urllib3.util.connection as urllib3_cn

# --- 1. FIX LỖI TREO MẠNG (IPv6) ---
def allowed_gai_family():
    return socket.AF_INET

urllib3_cn.allowed_gai_family = allowed_gai_family
# -----------------------------------

# Khởi tạo Reddit
reddit = praw.Reddit(
    client_id=env_settings.REDDIT_CLIENT_ID,
    client_secret=env_settings.REDDIT_CLIENT_SECRET,
    user_agent=env_settings.REDDIT_USER_AGENT
)

def get_relative_time(created_utc):
    """Chuyển timestamp thành '2 hours ago', '5 mins ago'"""
    now = time.time()
    diff = int(now - created_utc)
    
    if diff < 60: return f"{diff}s ago"
    if diff < 3600: return f"{diff // 60}m ago"
    if diff < 86400: return f"{diff // 3600}h ago"
    return f"{diff // 86400}d ago"

def get_user_interactions(username: str):
    """
    Lấy TOÀN BỘ danh sách hoạt động (Post + Comment) khả dụng của user.
    (Reddit API giới hạn tối đa khoảng 1000 items mới nhất)
    """
    try:
        if not username:
            return []
            
        # Khởi tạo đối tượng User
        user = reddit.redditor(username)
        activities = []

        print(f"--> Đang lấy dữ liệu cho: {username} (Lấy tất cả)...")

        # 1. Lấy Comments (limit=None để lấy tối đa)
        try:
            for comment in user.comments.new(limit=None):
                risk_level = "low"
                sentiment = "Neutral"
                
                text_lower = comment.body.lower()
                if any(w in text_lower for w in ["die", "kill", "hate", "stupid"]):
                    risk_level = "medium"
                    sentiment = "Negative"
                
                activities.append({
                    "id": comment.id,
                    "type": "comment",
                    "content": comment.body[:300] + ("..." if len(comment.body) > 300 else ""),
                    "subreddit": f"r/{comment.subreddit.display_name}",
                    "timestamp": get_relative_time(comment.created_utc),
                    "created_utc": comment.created_utc,
                    "score": comment.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{comment.permalink}"
                })
        except Exception as e:
            print(f"--> LỖI LẤY COMMENT ({username}): {e}")

        # 2. Lấy Posts (limit=None để lấy tối đa)
        try:
            for post in user.submissions.new(limit=None):
                risk_level = "low"
                sentiment = "Neutral"
                
                if post.over_18:
                    risk_level = "high"
                    sentiment = "NSFW"

                content = post.title
                if post.selftext:
                    content += f": {post.selftext[:200]}..."

                activities.append({
                    "id": post.id,
                    "type": "post",
                    "content": content,
                    "subreddit": f"r/{post.subreddit.display_name}",
                    "timestamp": get_relative_time(post.created_utc),
                    "created_utc": post.created_utc,
                    "score": post.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{post.permalink}"
                })
        except Exception as e:
            print(f"--> LỖI LẤY POST ({username}): {e}")

        # 3. Sắp xếp
        activities.sort(key=lambda x: x['created_utc'], reverse=True)
        
        return activities

    except Exception as e:
        print(f"--> LỖI CHUNG SERVICE: {e}")
        return []

def get_user_top_subreddits(username: str):
    """Lấy danh sách Top Subreddits (Dựa trên toàn bộ lịch sử lấy được)"""
    try:
        if not username: return []
        user = reddit.redditor(username)
        subreddit_counts = Counter()
        
        try:
            # limit=None để quét hết lịch sử
            for comment in user.comments.new(limit=None):
                subreddit_counts[comment.subreddit.display_name] += 1
        except: pass

        try:
            # limit=None để quét hết lịch sử
            for submission in user.submissions.new(limit=None):
                subreddit_counts[submission.subreddit.display_name] += 1
        except: pass

        # Lấy Top 10 frequent nhất
        top_subreddits = subreddit_counts.most_common(10) 
        
        results = []
        for sub_name, count in top_subreddits:
            risk_level = "low"
            risk_score = 2
            rationale = "Cộng đồng phổ biến."
            try:
                sub_info = reddit.subreddit(sub_name)
                if sub_info.over18:
                    risk_level = "high"
                    risk_score = 9
                    rationale = "NSFW."
            except: pass

            results.append({
                "name": f"r/{sub_name}",
                "activityLevel": count, 
                "riskLevel": risk_level,
                "riskScore": risk_score,
                "riskRationale": rationale,
                "dominantTopics": [], 
                "url": f"https://reddit.com/r/{sub_name}"
            })
        return results
    except Exception as e:
        print(f"Lỗi Reddit API: {e}")
        return []

# --- ĐOẠN CODE ĐỂ TEST NHANH (HARDCODE) ---
if __name__ == "__main__":
    # Bạn có thể chạy trực tiếp file này để test: python -m backend.services.reddit_service
    test_user = "spez"
    print(f"--- Đang test user: {test_user} ---")
    
    # Test lấy hết dữ liệu
    data = get_user_interactions(test_user)
    
    print(f"Kết quả: Tìm thấy {len(data)} interactions.")
    for item in data[:5]: # In thử 5 cái đầu
        print(f"- [{item['type']}] {item['subreddit']}: {item['content'][:50]}...")