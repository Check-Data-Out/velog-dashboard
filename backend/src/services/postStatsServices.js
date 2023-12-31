"use strict";

import PostStats from "../models/postStats.js";


export const totalStats = async (req, res) => {
    try {
        const { params: { userId } } = req;
        if (req.user.userId != userId) {
            return res.status(403).json({ message: "Access Denied" });
        }

        const result = await PostStats.aggTotalByUserId(userId);
        return res.status(200).json({
            message: "User's Total Stats",
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};


export const dailyTotalView = async (req, res) => {
    try {
        const { params: { userId } } = req;
        if (req.user.userId != userId) {
            return res.status(403).json({ message: "Access Denied" });
        }

        const result = await PostStats.aggDailyTotalByUserId(userId);
        return res.status(200).json({
            message: "User's Daily TotalView Stats",
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};


export const getAllPostsWithTotal = async (req, res) => {
    try {
        const { params: { userId }, query: { sortBy, order } } = req;
        if (req.user.userId != userId) {
            return res.status(403).json({ message: "Access Denied" });
        }

        let result = await PostStats.allPostsAggByUserId(userId);

        // 정렬 함수를 정의
        const getSortFunction = (sortBy, order) => {
            const sortOrder = order === "desc" ? -1 : 1;
            return (a, b) => {
                if (sortBy === "title") {
                    return sortOrder * a.title.localeCompare(b.title);
                } else if (sortBy === "totalViewCount" || sortBy === "lastViewCount" || sortBy === "totalLikeCount") {
                    return sortOrder * (a[sortBy] - b[sortBy]);
                }
            };
        };

        // 정렬 함수 세팅
        if (sortBy, order) {
            const sortFunction = getSortFunction(sortBy, order);
            result = result.sort(sortFunction);
        }

        return res.status(200).json({
            message: "User's Total Posts with total",
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};


export const getPostByUUID = async (req, res) => {
    try {
        const { query: { uuid } } = req;
        if (!uuid) {
            return res.status(404).json({ message: "UUID cannot be empty." });
        }

        const post = await PostStats.findOne({ uuid }, { _id: 0, uuid: 0 });
        if (req.user.userId != post.userId) {
            return res.status(403).json({ message: "Access Denied" });
        }
        return res.status(200).json({
            message: "User's Total Posts with total",
            result: post
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};