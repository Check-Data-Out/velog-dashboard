import asyncio
import os

import aiohttp
from dotenv import load_dotenv
from logger import get_logger
from pymongo.results import BulkWriteResult
from src.db import Repository
from src.models import PostStats, Stats, UserInfo
from src.modules.velog_apis import fetch_posts, fetch_stats

log = get_logger("velog-dashboard-worker")

# get ENV
load_dotenv()
DB_URL = os.getenv("DB_URL")

if not DB_URL:
    raise Exception("There is no DB_URL value in env value")


async def main():
    rep = Repository(DB_URL)
    # 모든 데이터 스크레핑 타겟 유저 가져오기
    target_users: list[UserInfo] = await rep.find_users()
    print(target_users)

    for user in target_users:
        # 전체 게시물 정보를 가져오기
        posts = await fetch_posts(user.userId)
        log.info(f"posts clear >> {len(posts.keys())}")

        # aiohttp 세션을 생성합니다.
        async with aiohttp.ClientSession() as session:
            # 통계 정보를 비동기적으로 가져옵니다.
            all_post_stats_result = await fetch_stats(
                session, posts, user.accessToken, user.refreshToken
            )

            # 성공적으로 가져왔으면 결과값으로 collection update
            posts_stats: list[PostStats] = [
                PostStats(
                    userId=user.userId,
                    uuid=post_id,
                    url=post_data["url"],
                    title=post_data["title"],
                    stats=[
                        Stats(
                            date=daily_cnt["day"],
                            veiwCount=daily_cnt["count"],
                            likeCount=post_data["likes"],
                        )
                        for daily_cnt in post_data["stats"]
                    ],
                    totalViewCount=post_data.get("total", 0),
                )
                for post_id, post_data in all_post_stats_result.items()
            ]
            res: BulkWriteResult = await rep.create_or_update_poststats(posts_stats)
            log.info(
                f"updated_post_cnt >> {res.modified_count},"
                + f"upserted_post_cnt >> {res.upserted_count}"
            )

            # posts_stats 의 uuid 추출, uuid 대상으로 find_all & object Id 추출
            # userInfo update 실시
            posts_uuid_list: list[str] = [post.uuid for post in posts_stats]
            result = await rep.update_userinfo(
                user,
                posts_uuid_list,
                f"200,{res.modified_count} updated,{res.upserted_count} upserted",
            )
            log.info(f"result >> {result}")


# 이벤트 루프를 사용하여 메인 함수 실행
asyncio.run(main())
