require("dotenv").config();

const express = require("express");
const cors = require("cors");

const quizRoute = require("./routes/quiz");
const chatRoute = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRoute);
app.use("/api", quizRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
