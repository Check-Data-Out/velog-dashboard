import gzip
import logging
import logging.handlers
import os
from datetime import datetime
from logging import Logger

import pytz


class GZipRotator:
    def __call__(self, source, dest):
        # 압축될 파일의 이름을 현재 날짜와 시간으로 설정합니다.
        tz_seoul = pytz.timezone("Asia/Seoul")
        dest = f"{dest}.{datetime.now(tz_seoul).strftime('%Y-%m-%d_%H-%M-%S')}.gz"
        with open(source, "rb") as sf:
            with gzip.open(dest, "wb") as df:
                df.writelines(sf)
        os.remove(source)


def get_logger(name: str) -> Logger:
    """
    ### 커스텀한 logger instance를 return합니다.
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    json_formatter = logging.Formatter(
        '{{"logger": "{name}", "level": "{levelname}", "message": "{message}", "asctime": "{asctime}"}}',
        style="{",
    )

    stream_hander = logging.StreamHandler()
    stream_hander.setFormatter(json_formatter)
    logger.addHandler(stream_hander)

    rotating_file_handler = logging.handlers.RotatingFileHandler(
        f"./logs/{name}.log",
        maxBytes=100 * 1024 * 1024,  # 100MB
        backupCount=5,
    )
    rotating_file_handler.setFormatter(json_formatter)
    rotating_file_handler.rotator = GZipRotator()

    logger.addHandler(rotating_file_handler)
    return logger


# # 로깅 예시
# logger.debug("debug log!!!")
# logger.info("info log!!!")
# logger.warning("warning log!!!")
# logger.error("error log!!!")
# logger.critical("critical log!!!")
