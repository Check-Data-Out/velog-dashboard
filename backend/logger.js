import winston from "winston";

// Logger 구성
const logger = winston.createLogger({
    // 로그의 수준 설정
    level: "info",
    // 로그 형식
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    // 로그를 기록할 전송 방법 설정
    transports: [
        //
        // - 로그 파일 설정
        new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "./logs/combined.log" })
    ],
});

// 개발 중에는 로그를 콘솔에도 출력할 수 있습니다.
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

logger.info("Logger INIT");

export default logger;