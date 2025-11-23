from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.db.session import SessionLocal
from backend.models.child import Child
from backend.models.user import User
from backend.schemas.child import ChildCreate, ChildResponse 
from backend.dependencies import get_current_user, get_db 
# --- IMPORT THÊM SERVICES REDDIT ---
from backend.services.reddit_service import get_user_top_subreddits, get_user_interactions

router = APIRouter()

# 1. Lấy danh sách con
@router.get("/", response_model=List[ChildResponse])
def get_my_children(current_user: User = Depends(get_current_user)):
    return current_user.children

# 2. Thêm con mới
@router.post("/", response_model=ChildResponse)
def add_child(
    child_in: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_child = Child(
        name=child_in.name,
        age=child_in.age,
        reddit_username=child_in.reddit_username, 
    )
    new_child.parents.append(current_user)
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

# 3. Xóa con
@router.delete("/{child_id}")
def remove_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_child = None
    for child in current_user.children:
        if child.id == child_id:
            target_child = child
            break
            
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản trẻ em này")
    
    current_user.children.remove(target_child)
    db.commit()
    return {"message": "Đã xóa thành công"}

# 4. API Lấy Subreddits (Đã có nhưng thêm vào cho chắc chắn)
@router.get("/{child_id}/subreddits")
def get_child_subreddits(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_child = None
    for child in current_user.children:
        if child.id == child_id:
            target_child = child
            break
            
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    clean_username = target_child.reddit_username.replace("u/", "").strip()
    return get_user_top_subreddits(clean_username)

# 5. API Lấy Interactions (Đây là cái bạn đang thiếu)
@router.get("/{child_id}/interactions")
def get_child_interactions(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_child = None
    for child in current_user.children:
        if child.id == child_id:
            target_child = child
            break
            
    if not target_child:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ")

    clean_username = target_child.reddit_username.replace("u/", "").strip()
    
    # Gọi hàm service lấy post + comment
    return get_user_interactions(clean_username)