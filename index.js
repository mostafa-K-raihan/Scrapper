const path = require("path");
const express = require("express");
const redis = require("redis");
const { fetch } = require("./fetch");

const app = express();

const PORT = 8000;
const REDIS_PORT = 6379;

let redisClient;

(async () => {
  redisClient = redis.createClient(REDIS_PORT);

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
  console.log("connected");
})();

app.listen(PORT, () => console.log("Listening..."));

async function cache(req, res, next) {
  console.log("calling cache");
  let data = await redisClient.get("data");

  if (data != null) {
    console.log("from cache");
    data = JSON.parse(data);
    res.json({ length: data.length, data });
  } else {
    console.log("not found in cache");
    next();
  }
}

app.get("/", cache, async (req, res) => {
  // res.sendFile(path.join(__dirname + '/index.html'));
  const data = await fetch();
  console.log("not from cache");
  await redisClient.setEx("data", 120, JSON.stringify(data));
  return res.json({ length: data.length, data });
});

app.get("/search", async (req, res) => {
  const q = req.query.q;
  try {
    if (q) {
      const data = await fetch(q);
      return res.json(data);
    }
    return res.send("You have not searched for anything");
  } catch (err) {
    return res.status(500).send("Hah");
  }
});
