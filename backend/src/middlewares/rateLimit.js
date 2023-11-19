
import rateLimit from "express-rate-limit";


/**
 * ip당 분당 300개 요청 허용
 */
export const Limit300PerMin = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300
});

/**
 * ip당 분당 30개 요청 허용
 */
export const Limit30PerMin = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30
});