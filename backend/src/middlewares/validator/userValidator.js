"use strict";

import { check, validationResult } from "express-validator";


/**
 * @desc `createUserInfo` body값 유효성 검사
 */
export const validateUserInfoCreate = [
    check("accessToken")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("accessToken can not be empty!")
        .bail()
        .isLength({ min: 20 })
        .withMessage("more than 20 characters required in accessToken!")
        .bail(),
    check("refreshToken")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("refreshToken can not be empty!")
        .bail()
        .isLength({ min: 20 })
        .withMessage("more than 20 characters required in refreshToken!")
        .bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ message: errors.array() });
        next();
    },
];
