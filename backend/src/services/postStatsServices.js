"use strict";

import PostStats from "../models/postStats.js";


export const totalStats = async (req, res) => {
    try {
        const { params: { userId } } = req;
        if (req.user.userId != userId) {
            return res.status(404).json({ message: "Access Denied" });
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


export const getAllPostsWithTotal = async (req, res) => {
    try {
        const { params: { userId } } = req;
        if (req.user.userId != userId) {
            return res.status(404).json({ message: "Access Denied" });
        }
        const result = await PostStats.allPostsAggByUserId(userId);
        return res.status(200).json({
            message: "User's Total Posts with total",
            result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}