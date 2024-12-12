const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 8000;
const authRoute = require("./routes/authRoute");
const antibioticsRoute = require("./routes/antibioticsRoute");
const profileRoute = require("./routes/profileRoute");
const articlesRoute = require("./routes/articleRoute");
const reminderRoute = require("./routes/reminderRoute");
const diagnosisRoute = require("./routes/diagnosisRoute");
const path = require("path");

// middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
// app.use(
//   "/public/uploads",
//   express.static(path.join(__dirname + "/public/uploads"))
// );

// routes
app.use("/auth", authRoute);
app.use("/antibiotics", antibioticsRoute);
app.use("/profile", profileRoute);
app.use("/articles", articlesRoute);
app.use("/reminders", reminderRoute);
app.use("/diagnosis", diagnosisRoute);

// server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
