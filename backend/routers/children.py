# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List

# from backend.db.session import SessionLocal
# from backend.models.child import Child
# from backend.models.user import User
# from backend.schemas.child import ChildCreate, ChildResponse 
# from backend.dependencies import get_current_user, get_db 
# # ... các import cũ ...
# from backend.models.interaction import Interaction  # <--- THÊM DÒNG NÀY
# # --- IMPORT THÊM SERVICES REDDIT ---
# from backend.services.reddit_service import get_user_top_subreddits, get_user_interactions

# router = APIRouter()

# # 1. Lấy danh sách con
# @router.get("/", response_model=List[ChildResponse])
# def get_my_children(current_user: User = Depends(get_current_user)):
#     return current_user.children

# # 2. Thêm con mới
# @router.post("/", response_model=ChildResponse)
# def add_child(
#     child_in: ChildCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     new_child = Child(
#         name=child_in.name,
#         age=child_in.age,
#         reddit_username=child_in.reddit_username, 
#     )
#     new_child.parents.append(current_user)
#     db.add(new_child)
#     db.commit()
#     db.refresh(new_child)
#     return new_child

# # 3. Xóa con
# @router.delete("/{child_id}")
# def remove_child(
#     child_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     target_child = None
#     for child in current_user.children:
#         if child.id == child_id:
#             target_child = child
#             break
            
#     if not target_child:
#         raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản trẻ em này")
    
#     current_user.children.remove(target_child)
#     db.commit()
#     return {"message": "Đã xóa thành công"}

# # 4. API Lấy Subreddits (Đã có nhưng thêm vào cho chắc chắn)
# @router.get("/{child_id}/subreddits")
# def get_child_subreddits(
#     child_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     target_child = None
#     for child in current_user.children:
#         if child.id == child_id:
#             target_child = child
#             break
            
#     if not target_child:
#         raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

#     clean_username = target_child.reddit_username.replace("u/", "").strip()
#     return get_user_top_subreddits(clean_username)

# # 5. API Lấy Interactions (Đây là cái bạn đang thiếu)
# # @router.get("/{child_id}/interactions")
# # def get_child_interactions(
# #     child_id: int,
# #     db: Session = Depends(get_db),
# #     current_user: User = Depends(get_current_user)
# # ):
# #     target_child = None
# #     for child in current_user.children:
# #         if child.id == child_id:
# #             target_child = child
# #             break
            
# #     if not target_child:
# #         raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

# #     clean_username = target_child.reddit_username.replace("u/", "").strip()
    
# #     # Gọi hàm service lấy post + comment
# #     return get_user_interactions(clean_username)    

# @router.post("/{child_id}/scan")
# def trigger_scan(
#     child_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # ... (Tìm child như cũ) ...
#     target_child = ... # logic tìm child
    
#     clean_username = target_child.reddit_username.replace("u/", "").strip()
    
#     # Gửi message vào Kafka
#     send_scan_request(target_child.id, clean_username)
    
#     return {"message": "Scan request sent."}

# # 2. API Lấy dữ liệu (Đọc từ DB thay vì PRAW)
# @router.get("/{child_id}/interactions")
# def get_child_interactions_from_db(
#     child_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # Lấy dữ liệu từ bảng interactions
#     data = db.query(Interaction).filter(Interaction.child_id == child_id).order_by(Interaction.created_at.desc()).all()
#     return data

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from typing import Optional
from backend.db.session import SessionLocal
from backend.models.child import Child
from backend.models.user import User
from backend.models.interaction import Interaction # Import model Interaction
from backend.schemas.child import ChildCreate, ChildResponse
from backend.dependencies import get_current_user, get_db
from backend.services.reddit_service import get_user_top_subreddits
from backend.kafka_producer import send_scan_request # Import producer

router = APIRouter()

# ... (Giữ nguyên các API get/add/delete child cũ) ...
@router.get("/", response_model=List[ChildResponse])
def get_my_children(current_user: User = Depends(get_current_user)):
    return current_user.children
    
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    children_stats = []
    total_activity = 0
    
    for child in current_user.children:
        # Đếm số lượng interaction của từng bé trong DB
        count = db.query(Interaction).filter(Interaction.child_id == child.id).count()
        total_activity += count
        
        children_stats.append({
            "id": child.id,
            "name": child.name,
            "username": child.reddit_username,
            "scanned_count": count
        })
        
    return {
        "total_children": len(current_user.children),
        "total_activity": total_activity,
        "details": children_stats
    }

@router.post("/", response_model=ChildResponse)
def add_child(child_in: ChildCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_child = Child(name=child_in.name, age=child_in.age, reddit_username=child_in.reddit_username)
    new_child.parents.append(current_user)
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

@router.delete("/{child_id}")
def remove_child(child_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child: raise HTTPException(status_code=404, detail="Child not found")
    current_user.children.remove(target_child)
    db.commit()
    return {"message": "Deleted"}

@router.get("/{child_id}/subreddits")
def get_child_subreddits(child_id: int, current_user: User = Depends(get_current_user)):
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child: raise HTTPException(status_code=404, detail="Child not found")
    clean_username = target_child.reddit_username.replace("u/", "").strip()
    return get_user_top_subreddits(clean_username)

# --- API MỚI 1: Kích hoạt quét (Gửi lệnh sang Kafka) ---
@router.post("/{child_id}/scan")
def trigger_scan(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Tìm hồ sơ trẻ em
    target_child = None
    for child in current_user.children:
        if child.id == child_id:
            target_child = child
            break
            
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    clean_username = target_child.reddit_username.replace("u/", "").strip()
    
    # 2. Gửi message vào Kafka
    send_scan_request(target_child.id, clean_username)
    
    return {"message": "Đang quét dữ liệu ngầm..."}

# --- API MỚI 2: Lấy dữ liệu từ DB (Nhanh) ---
@router.get("/{child_id}/interactions")
def get_child_interactions_from_db(
    child_id: int,
    sentiment: Optional[str] = None,  # Thêm tham số lọc
    risk_level: Optional[str] = None, # Thêm tham số lọc
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Kiểm tra quyền truy cập
    target_child = next((c for c in current_user.children if c.id == child_id), None)
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    # 2. Xây dựng Query cơ bản
    query = db.query(Interaction).filter(Interaction.child_id == child_id)

    # 3. Áp dụng bộ lọc nếu có tham số truyền vào
    if sentiment and sentiment != "all":
        # So sánh không phân biệt hoa thường
        query = query.filter(Interaction.sentiment.ilike(sentiment))
    
    if risk_level and risk_level != "all":
        query = query.filter(Interaction.risk_level == risk_level)

    # 4. Lấy dữ liệu và sắp xếp mới nhất
    data = query.order_by(Interaction.created_at.desc()).all()
    
    return data