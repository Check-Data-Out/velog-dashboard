# noqa

import asyncio

# import aiohttp
from aiohttp_retry import ExponentialRetry, RetryClient


def get_header(access_token: str, refresh_token: str) -> dict:
    return {
        "authority": "v3.velog.io",
        "origin": "https://velog.io",
        "content-type": "application/json",
        "cookie": f"access_token={access_token}; refresh_token={refresh_token}",
    }


async def get_all_posts(session, user_name: str, cursor: str = "") -> dict:
    """
    ### `user_name` 에 해당하는 사용자의 게시글 가져오는 graphQL 호출
    - `cursor` 값을 기반으로 페이지네이션
    - 토큰 필요 없음
    """
    query = """
    query Posts($cursor: ID, $username: String, $temp_only: Boolean, $tag: String, $limit: Int) {
        posts(cursor: $cursor, username: $username, temp_only: $temp_only, tag: $tag, limit: $limit) {
            id
            title
            short_description
            thumbnail
            url_slug
            released_at
            updated_at
            comments_count
            tags
            is_private
            likes
            __typename
        }
    }"""
    variables = {"username": user_name}
    if cursor:
        variables["cursor"] = cursor
    payload = {"query": query, "variables": variables, "operationName": "Posts"}

    async with session.post("https://v2cdn.velog.io/graphql", json=payload) as response:
        return await response.json()


async def get_post_stats(session, post_id: str, actoken: str, reftoken: str) -> dict:
    """
    ### post_id에 대한 통계 정보 가져오는 graphQL 호출
    - `post_id` 라는 velog post의 `uuid` 값 필요
    """
    query = """
    query GetStats($post_id: ID!) {
        getStats(post_id: $post_id) {
            total
            count_by_day {
                count
                day
            }
        }
    }"""
    variables = {"post_id": post_id}
    payload = {"query": query, "variables": variables, "operationName": "GetStats"}
    headers = get_header(actoken, reftoken)
    async with session.post(
        "https://v2cdn.velog.io/graphql",
        json=payload,
        headers=headers,
    ) as response:
        try:
            res = await response.json()
        except Exception as e:
            res = None
            print(f"post_id >> {post_id}, error >> {e}")
        return res


async def fetch_stats(session, total_post_id_dict: dict, actoken, reftoken):
    """
    ### 모든 페이지의 포스트를 가져온 dict 기반으로 통계 업데이트 해서 return 하는 함수
    - `fetch_posts` 로 만들어진 `total_post_id_dict` 필수
    """
    tasks = [
        asyncio.create_task(get_post_stats(session, post_id, actoken, reftoken))
        for post_id in total_post_id_dict
    ]
    stats_results = await asyncio.gather(*tasks)
    for post_id, result in zip(total_post_id_dict.keys(), stats_results):
        try:
            total_post_id_dict[post_id]["total"] = result["data"]["getStats"]["total"]

            # daily stats
            daily_cnt = result["data"]["getStats"]["count_by_day"]
            for cnt in daily_cnt:
                total_post_id_dict[post_id]["stats"].append(
                    dict(
                        count=cnt["count"],
                        day=cnt["day"],
                    )
                )

            # daily stats sorting
            total_post_id_dict[post_id]["stats"] = sorted(
                total_post_id_dict[post_id]["stats"], key=lambda x: x["day"]
            )
        except Exception as e:
            print(f"post_id >> {post_id} error >> {e}, result >> {result}")
            continue
    return total_post_id_dict


async def fetch_posts(user_name: str):
    """
    ### 모든 페이지의 포스트를 가져오기 위해 비동기로 페이지를 반복.
    - `get_all_posts` 함수 활용
    - 토큰 필요 없음
    """
    retry_options = ExponentialRetry(attempts=3)
    async with RetryClient(retry_options=retry_options) as session:
        cursor = ""
        total_post_id_dict = {}
        while True:
            data = await get_all_posts(session, user_name, cursor)
            post_list = data["data"]["posts"]
            if not post_list:
                break

            for post in post_list:
                total_post_id_dict[post["id"]] = {
                    "title": post["title"],
                    "url": f"https://velog.io/@{user_name}/{post['url_slug']}",
                    "likes": post["likes"],
                    "created_at": post["released_at"],
                    "stats": [],
                }
            cursor = post_list[-1]["id"]
        return total_post_id_dict
