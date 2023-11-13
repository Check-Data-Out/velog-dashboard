# import asyncio
from datetime import datetime, timedelta

import pytz
from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne
from pymongo.results import BulkWriteResult

from .models import PostStats, UserInfo


class Repository:
    def __init__(self, db_url: str) -> None:
        self.tz = pytz.timezone("Asia/Seoul")
        self.__get_connection(db_url)

    def __get_connection(self, db_url: str):
        self.client = AsyncIOMotorClient(db_url)
        self.db = self.client["velog-dashboard"]

    async def test_connection(self) -> bool:
        try:
            await self.client.admin.command("ping")
            return True
        except Exception:
            return False

    async def find_all(self, coll_name: str) -> list[dict]:
        coll = self.db[coll_name]
        cursor = coll.find({})
        documents = await cursor.to_list(length=None)
        return documents

    async def find_users(self) -> list[UserInfo]:
        # 현재 시간으로부터 15분 전 시간 계산
        fifteen_minutes_ago = datetime.now(self.tz) - timedelta(minutes=1)

        coll = self.db["userinfos"]
        documents = await coll.find(
            {
                "$or": [
                    {"lastScrapingAttemptResult": ""},
                    {"lastScrapingAttemptTime": {"$lt": fifteen_minutes_ago}},
                ]
            }
        ).to_list(None)
        users = [UserInfo(**doc) for doc in documents]
        return users

    async def create_or_update_poststats(
        self, posts_stats: list[PostStats]
    ) -> BulkWriteResult:
        coll = self.db["poststats"]
        operations = [
            UpdateOne({"uuid": post.uuid}, {"$set": post.model_dump()}, upsert=True)
            for post in posts_stats
        ]
        result = await coll.bulk_write(operations)
        return result

    async def update_userinfo(
        self, user: UserInfo, posts_uuid_list: list[str], result_msg: str
    ):
        coll_post = self.db["poststats"]
        posts = await coll_post.find({"uuid": {"$in": posts_uuid_list}}).to_list(None)
        post_obj_ids: list[ObjectId] = [post["_id"] for post in posts]
        coll = self.db["userinfos"]
        result = await coll.update_one(
            {"userId": user.userId},
            {
                "$set": {
                    "posts": post_obj_ids,
                    "lastScrapingAttemptResult": result_msg,
                    "updatedAt": datetime.now(self.tz),
                    "lastScrapingAttemptTime": datetime.now(self.tz),
                }
            },
        )
        return result

    def __del__(self) -> None:
        self.client.close()


# async def main():
#     rep = Repository()
#     await rep.test_connection()
#     docs = await rep.find_all("userinfos")
#     print(docs)


# asyncio.run(main())
