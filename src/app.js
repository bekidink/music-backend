const express = require("express");
const app = express();
const cors = require("cors");
const { default: mongoose } = require("mongoose");
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  return res.json("hi fronted");
});
mongoose.connect(
  "mongodb+srv://bereketdinku:beki1234@cluster0.a7un02o.mongodb.net/musictest"
);
mongoose.connection
  .once("open", () => console.log("Connected"))
  .on("error", (error) => {
    console.log(`Error: ${error}`);
  });


const songRoute = require("./route/song");
app.use("/api/song", songRoute);

app.listen(8080, () => console.log("Listening to port 8000"));
