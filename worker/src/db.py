# import asyncio
from datetime import datetime, timedelta

import pytz
from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import InsertOne, UpdateOne
from pymongo.results import BulkWriteResult

from .models import PostStats, UserInfo


class Repository:
    def __init__(self, db_url: str, period_min: int = 10) -> None:
        self.tz = pytz.timezone("Asia/Seoul")
        self.period_min = period_min  # user find할때 업데이트 몇 분 전 user를 가져올 지
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

    async def find_user_by_id(self, user_id) -> UserInfo:
        coll = self.db["userinfos"]
        result = await coll.find_one({"userId": user_id})
        return UserInfo(**result)

    async def find_users(self) -> list[UserInfo]:
        # 현재 시간으로부터 15분 전 시간 계산
        fifteen_minutes_ago = datetime.now(self.tz) - timedelta(minutes=self.period_min)

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
        """
        ### `PostStats` 를 신규 생성 또는 업데이트하는 함수, bulk로 동작
        - `findOne` 이후 없으면 `insert`
        - 이후 존재하고, 다를때 & stats 크롤링 성공했을때만 `updateOne`
        """
        coll = self.db["poststats"]
        operations = list()
        for post in posts_stats:
            # Try to find the post by uuid.
            existing_post = await coll.find_one({"uuid": post.uuid})

            # If it doesn't exist, we prepare to insert it.
            if not existing_post:
                operations.append(InsertOne(post.model_dump()))
            else:
                # If it exists, we compare the data and prepare an update if there is a difference.
                post_model_dict = post.model_dump()
                if post_model_dict == existing_post:
                    continue

                if not post_model_dict.get("stats", []):
                    continue

                operations.append(
                    UpdateOne({"uuid": post.uuid}, {"$set": post.model_dump()})
                )

        # If we have any operations to perform, we do them all at once.
        if operations:
            result = await coll.bulk_write(operations)
            return result
        else:
            return BulkWriteResult(
                {
                    "writeErrors": [],
                    "writeConcernErrors": [],
                    "nInserted": 0,
                    "nUpserted": 0,
                    "nMatched": 0,
                    "nModified": 0,
                    "nRemoved": 0,
                },
                True,
            )

    async def update_userinfo_success(
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

    async def update_userinfo_fail(self, user: UserInfo, result_msg: str):
        coll = self.db["userinfos"]
        result = await coll.update_one(
            {"userId": user.userId},
            {
                "$set": {
                    "lastScrapingAttemptResult": result_msg,
                    "updatedAt": datetime.now(self.tz),
                    "lastScrapingAttemptTime": datetime.now(self.tz),
                }
            },
        )
        return result

    async def update_userinfo_token(self, user: UserInfo, cookie: dict):
        coll = self.db["userinfos"]
        result = await coll.update_one(
            {"userId": user.userId},
            {
                "$set": {
                    "accessToken": cookie["access_token"],
                    "refreshToken": cookie["refresh_token"],
                    "updatedAt": datetime.now(self.tz),
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
