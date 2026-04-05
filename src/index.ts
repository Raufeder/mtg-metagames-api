import express from "express"

const app = express();

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});
app.listen(process.env.PORT || 3000);