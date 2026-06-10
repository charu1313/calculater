const path = require("path");
const express =
    require("express");

const cors =
    require("cors");

require("dotenv").config();

const connectDB =
    require("./config/db");

connectDB();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(
    require("./routes/calculater")
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(5000, () => {

    console.log(
        "Server Running on http://localhost:5000"
    );
});