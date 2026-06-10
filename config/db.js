const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/calculatorDB");

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection failed; continuing without database.");
        console.error(error.message || error);
    }
};

module.exports = connectDB;