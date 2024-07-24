const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require('./config/db');

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  return res.json("hi fronted");
});
connectDB();




const songRoute = require("./route/song");
app.use("/api/song", songRoute);

app.listen(8000, () => console.log("Listening to port 8000"));
