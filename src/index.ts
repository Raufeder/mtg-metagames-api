import express from "express"
import { supabase } from "./supabase.js";

const app = express();

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

app.get("/tournaments", async (req, res) => {
  const { data, error } = await supabase.from("tournaments").select("*");
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

app.listen(process.env.PORT || 3000);