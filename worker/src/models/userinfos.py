from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field, validator


class UserInfo(BaseModel):
    accessToken: str = Field(..., description="Access token for the user")
    refreshToken: str = Field(..., description="Refresh token for the user")
    userId: str = Field(..., description="Unique user ID", unique=True)
    email: str
    lastScrapingAttemptTime: datetime
    lastScrapingAttemptResult: Optional[str] = ""
    posts: List[str] = Field(
        default_factory=list, description="List of post IDs associated with the user"
    )

    # posts 필드에 대한 검증 함수
    @validator("posts", each_item=True, pre=True, always=True)
    def validate_posts_ids(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if ObjectId.is_valid(v):  # 문자열이 유효한 ObjectId인 경우
            return str(ObjectId(v))
        raise ValueError("Invalid ObjectId")
