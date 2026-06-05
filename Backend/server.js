require("dotenv").config();

const express = require("express");
const cors = require("cors");

const quizRoute = require("./routes/quiz");
const chatRoute = require("./routes/chat");
const sessionRoute = require("./routes/session");
const messageRoute = require("./routes/message");
const authRoute = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/sessions", sessionRoute);
app.use("/api/messages", messageRoute);
app.use("/api/chat", chatRoute);
app.use("/api/quiz", quizRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
