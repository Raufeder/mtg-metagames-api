import {Router} from "express";
import { supabase } from "../supabase.js";

const router = Router();

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).send({ error: "name is required." });
    return;
  }
  const { data, error } = await supabase.from("archetypes").insert([{
    name
  }]).select("*").single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

export default router;