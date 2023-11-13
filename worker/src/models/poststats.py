from datetime import datetime
from typing import List

import pytz
from pydantic import BaseModel, Field


class Stats(BaseModel):
    date: datetime = Field(default_factory=datetime.now)
    viewCount: int = 0
    likeCount: int = 0


class PostStats(BaseModel):
    userId: str = Field(..., description="Unique userId for the velog post")
    uuid: str = Field(..., description="Unique identifier for the post", unique=True)
    url: str = Field(None, description="URL of the post")
    title: str = Field(None, description="Title of the post")
    stats: List[Stats] = []
    totalViewCount: int
    updatedAt: datetime = datetime.now(pytz.timezone("Asia/Seoul"))
