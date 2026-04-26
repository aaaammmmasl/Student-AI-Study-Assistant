const express = require("express");
const cors = require("cors");

const summarizeRoute = require("./routes/summarize");
const uploadRoute = require("./routes/upload");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", summarizeRoute);
app.use("/api", uploadRoute);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});