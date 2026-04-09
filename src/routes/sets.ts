import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("sets").select("*");
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

export default router;