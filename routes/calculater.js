const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const History =
    require("../models/History");

const inMemoryHistory = [];

const isDbConnected = () =>
    mongoose.connection.readyState === 1;

router.post(
    "/calculate",
    async (req, res) => {

        try {

            const { expression } = req.body;

            const result =
                eval(expression);

            if (isDbConnected()) {
                await History.create({
                    expression,
                    result
                });
            } else {
                inMemoryHistory.push({
                    expression,
                    result,
                    createdAt: new Date()
                });
            }

            res.json({
                result
            });

        } catch (error) {

            res.status(400).json({
                message: "Invalid Expression"
            });
        }
    });

router.get(
    "/history",
    async (req, res) => {

        let history;

        if (isDbConnected()) {
            history =
                await History.find()
                    .sort({ createdAt: -1 });
        } else {
            history = [...inMemoryHistory].sort(
                (a, b) => b.createdAt - a.createdAt
            );
        }

        res.json(history);
    });

module.exports = router;