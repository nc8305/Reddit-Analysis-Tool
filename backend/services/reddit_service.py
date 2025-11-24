import praw
import time
from collections import Counter
from backend.config.env_settings import env_settings

# Khởi tạo Reddit instance
reddit = praw.Reddit(
    client_id=env_settings.REDDIT_CLIENT_ID,
    client_secret=env_settings.REDDIT_CLIENT_SECRET,
    user_agent=env_settings.REDDIT_USER_AGENT
)

def get_relative_time(created_utc):
    """Chuyển timestamp thành '2 hours ago', '5 mins ago'"""
    now = time.time()
    diff = int(now - created_utc)
    
    if diff < 60:
        return f"{diff}s ago"
    if diff < 3600:
        return f"{diff // 60}m ago"
    if diff < 86400:
        return f"{diff // 3600}h ago"
    return f"{diff // 86400}d ago"

def get_user_interactions(username: str):
    """
    Lấy danh sách hoạt động (Post + Comment) của user, sắp xếp theo thời gian.
    """
    try:
        if not username:
            return []
            
        user = reddit.redditor(username)
        activities = []

        # 1. Lấy Comments
        try:
            for comment in user.comments.new():
                # Phân tích rủi ro sơ bộ
                risk_level = "low"
                risk_score = 1
                sentiment = "Neutral"
                
                # Ví dụ logic check từ khóa đơn giản
                text_lower = comment.body.lower()
                if any(w in text_lower for w in ["die", "kill", "hate", "stupid"]):
                    risk_level = "medium"
                    risk_score = 5
                    sentiment = "Negative"
                
                activities.append({
                    "id": comment.id,
                    "type": "comment",
                    "content": comment.body[:300] + ("..." if len(comment.body) > 300 else ""),
                    "subreddit": f"r/{comment.subreddit.display_name}",
                    "timestamp": get_relative_time(comment.created_utc),
                    "created_utc": comment.created_utc, # Dùng để sort
                    "score": comment.score,
                    "sentiment": sentiment,
                    "risk": risk_level,
                    "url": f"https://reddit.com{comment.permalink}"
                })
        except Exception:
            pass

        # 2. Lấy Posts (Submissions)
        try:
            for post in user.submissions.new():
                risk_level = "low"
                risk_score = 1
                sentiment = "Neutral"
                
                if post.over_18:
                    risk_level = "high"
                    risk_score = 9
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
        except Exception:
            pass

        # 3. Gộp và Sắp xếp theo thời gian (Mới nhất lên đầu)
        activities.sort(key=lambda x: x['created_utc'], reverse=True)
        
        return activities[:] # Trả về đúng số lượng yêu cầu

    except Exception as e:
        print(f"Lỗi lấy Interaction: {e}")
        return []

def get_user_top_subreddits(username: str):
    """
    Lấy danh sách Top 10 subreddits user tương tác nhiều nhất.
    """
    try:
        if not username:
            return []
            
        user = reddit.redditor(username)
        subreddit_counts = Counter()
        
        # 1. Quét 100 comment gần nhất
        try:
            for comment in user.comments.new():
                subreddit_counts[comment.subreddit.display_name] += 1
        except Exception:
            pass 

        # 2. Quét 50 post gần nhất
        try:
            for submission in user.submissions.new():
                subreddit_counts[submission.subreddit.display_name] += 1
        except Exception:       
            pass

        # 3. Lấy Top N 
        top_subreddits = subreddit_counts.most_common()
        
        results = []
        for sub_name, count in top_subreddits:
            # Lấy thông tin chi tiết để đánh giá rủi ro
            risk_level = "low"
            risk_score = 2
            rationale = "Cộng đồng phổ biến."
            
            try:
                sub_info = reddit.subreddit(sub_name)
                # Check NSFW
                if sub_info.over18:
                    risk_level = "high"
                    risk_score = 9
                    rationale = "CẢNH BÁO: Nội dung người lớn (NSFW)."
                elif sub_name.lower() in ["depression", "suicidewatch", "anxiety"]:
                    risk_level = "high"
                    risk_score = 8
                    rationale = "Cần chú ý: Chủ đề tâm lý nhạy cảm."
            except:
                pass

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
        print(f"Lỗi Reddit API ({username}): {e}")
        return []