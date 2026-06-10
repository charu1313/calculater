const mongoose = require("mongoose");

const historySchema =
    new mongoose.Schema({

        expression: String,

        result: Number,

        createdAt: {
            type: Date,
            default: Date.now
        }
    });

module.exports =
    mongoose.model(
        "History",
        historySchema
    );