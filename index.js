const path = require("path");
const express = require("express");

const { fetch } = require("./fetch");

const app = express();

const PORT = 8000;

app.listen(PORT, () => console.log("Listening..."));

app.get("/", async (req, res) => {
  // res.sendFile(path.join(__dirname + '/index.html'));
  const data = await fetch();
  return res.json({ data, length: data.length });
});

app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (q) {
    const data = await fetch(q);
    return res.json(data);
  }

  res.send("You have not searched for anything");
});
