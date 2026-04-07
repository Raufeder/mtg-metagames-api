import {Router} from "express";
import { supabase } from "../supabase.js";

const router = Router();
router.post("/", async (req, res) => {
  const { name, colors } = req.body;
    const validColors = ["W", "U", "B", "R", "G", "C"];
  if (!name) {
    res.status(400).send({ error: "name is required." });
    return;
  }
  if (!Array.isArray(colors) || !colors.every(c => validColors.includes(c))) {
    res.status(400).send({ error: "colors must be an array of valid color codes (W, U, B, R, G, C)." });
    return; 
  }
  const { data, error } = await supabase.from("archetypes").insert([{
    name,
    colors
  }]).select("*").single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

export default router;