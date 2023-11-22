import asyncio
import os
from concurrent.futures import ProcessPoolExecutor

from dotenv import load_dotenv
from logger import MAIN_LOGGER as log
from pymongo.results import BulkWriteResult
from src.db import Repository
from src.models import PostStats, Stats, UserInfo
from src.modules.velog_apis import fetch_posts, fetch_stats

load_dotenv()
DB_URL = os.getenv("DB_URL")
PERIOD_MIN = int(os.getenv("PERIOD_MIN"))
WORKER_ENV = os.getenv("WORKER_ENV")

if not DB_URL:
    raise Exception("There is no DB_URL value in env value")

if not PERIOD_MIN:
    PERIOD_MIN = 15


async def make_all_posts_stats(
    user: UserInfo, all_post_stats_result: dict
) -> list[PostStats]:
    return [
        PostStats(
            userId=user.userId,
            uuid=post_id,
            url=post_data["url"],
            title=post_data["title"],
            stats=[
                Stats(
                    date=daily_cnt["day"],
                    viewCount=daily_cnt["count"],
                    likeCount=post_data["likes"],
                )
                for daily_cnt in post_data.get("stats", [])
            ],
            totalViewCount=post_data.get("total", 0),
        )
        for post_id, post_data in all_post_stats_result.items()
    ]


async def scrapping(rep: Repository, user_id: str):
    user: UserInfo = await rep.find_user_by_id(user_id)

    # 전체 게시물 정보를 가져오기
    posts = await fetch_posts(user.userId)
    log.info(f"{user.userId} - posts {len(posts)}, start to fetching all stats")

    # 통계 정보를 비동기적으로 가져옵니다.
    all_post_stats_result = await fetch_stats(
        posts, user.accessToken, user.refreshToken
    )
    posts_stats = await make_all_posts_stats(user, all_post_stats_result)

    try:
        res: BulkWriteResult = await rep.create_or_update_poststats(posts_stats)
        log.info(
            f"{user.userId} - "
            + f"updated_post_cnt >> {res.modified_count}, "
            + f"upserted_post_cnt >> {res.upserted_count}"
        )

        # posts_stats 의 uuid 추출, uuid 대상으로 find_all & object Id 추출
        # userInfo update 실시
        posts_uuid_list: list[str] = [post.uuid for post in posts_stats]
        result = await rep.update_userinfo_success(
            user,
            posts_uuid_list,
            f"200,{res.modified_count} updated,{res.upserted_count} upserted",
        )
        log.info(f"{user.userId} - result >> {result}")
    except Exception as e:
        log.error(f"{user.userId} - worker exception >> {e}, {type(e)}")
        result = await rep.update_userinfo_fail(user, f"500,0 updated,0 upserted,{e}")


def run_scrapping(user_id):
    """asyncio 이벤트 루프 생성 및 scrapping 함수 실행, **동기여야 함**"""
    # 새 이벤트 루프 생성 및 설정
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    # Repository 인스턴스 생성
    rep = Repository(DB_URL, PERIOD_MIN)

    # scrapping 코루틴 실행
    try:
        loop.run_until_complete(scrapping(rep, user_id))
    finally:
        loop.close()


async def main():
    rep = Repository(DB_URL, PERIOD_MIN)
    # 모든 데이터 스크레핑 타겟 유저 가져오기
    target_users: list[UserInfo] = await rep.find_users()

    if not target_users:
        log.info("empty target user")

    target_users = [user.userId for user in target_users]

    # ProcessPoolExecutor를 사용하여 각 사용자에 대한 scrapping 함수를 별도의 프로세스에서 실행
    with ProcessPoolExecutor() as executor:
        executor.map(run_scrapping, target_users)


if __name__ == "__main__":
    asyncio.run(main())
