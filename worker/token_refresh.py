import asyncio
import os

from dotenv import load_dotenv
from logger import TOKEN_REFRESH_LOGGER as log
from src.db import Repository
from src.models import UserInfo
from src.modules.velog_apis import fetch_posts, get_cookie_from_one_stats_api

load_dotenv()
DB_URL = os.getenv("DB_URL")
PERIOD_MIN = int(os.getenv("PERIOD_MIN"))
WORKER_ENV = os.getenv("WORKER_ENV")

if not DB_URL:
    raise Exception("There is no DB_URL value in env value")

if not PERIOD_MIN:
    PERIOD_MIN = 15


async def main():
    rep = Repository(DB_URL, PERIOD_MIN)
    # 모든 데이터 스크레핑 타겟 유저 가져오기
    target_users: list[UserInfo] = await rep.find_users()

    if not target_users:
        log.info("empty target user")

    for user in target_users:
        # 전체 게시물 정보를 가져온 뒤, 첫 게시글 uuid만 추출
        posts = await fetch_posts(user.userId)
        log.info(f"{user.userId} - posts {len(posts)}, start to fetching all stats")

        if len(posts) <= 0:
            continue

        try:
            target_post = list(posts.keys())[0]
            # 해당 uuid 값 기반으로 cookie 값만 가져오기
            target_cooike = await get_cookie_from_one_stats_api(
                target_post, user.accessToken, user.refreshToken
            )

            # cookie validations
            if (
                not target_cooike
                or not target_cooike.get("access_token")
                or not target_cooike.get("refresh_token")
            ):
                raise Exception("cookie is empty")

            # 가져온 cookie db update
            result = await rep.update_userinfo_token(user, target_cooike)
            log.info(
                f"{user.userId} - "
                + f"target_cooike >> {target_cooike}, "
                + f"result >> {result}"
            )
        except Exception as e:
            log.error(f"{user.userId} - token_refresh exception >> {e}, {type(e)}")
            continue


asyncio.run(main())
