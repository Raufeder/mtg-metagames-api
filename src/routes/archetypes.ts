import {Router} from "express";
import { supabase } from "../supabase.js";
import ValidateJWTMiddleware from "../middleware/auth.js";

const VALID_COLORS = ["W", "U", "B", "R", "G", "C"];

const router = Router();
router.post("/", ValidateJWTMiddleware, async (req, res) => {
  const { name, colors } = req.body;
  if (!name) {
    res.status(400).send({ error: "name is required." });
    return;
  }
  if (!Array.isArray(colors) || !colors.every(c => VALID_COLORS.includes(c))) {
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

// PATCH CALLS START HERE
router.patch("/:id", ValidateJWTMiddleware, async (req, res) => {
  const { name, colors } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (colors !== undefined) updates.colors = colors;
  if (colors !== undefined && (!Array.isArray(colors) || !colors.every(c => VALID_COLORS.includes(c)))) {
  res.status(400).send({ error: "colors must be an array of valid color codes (W, U, B, R, G, C)." });
  return;
}
  if (Object.keys(updates).length === 0) {
    res.status(400).send({ error: "No fields to update." });
    return;
  }
  const { data, error } = await supabase.from("archetypes").update(updates).eq("id", req.params.id).select("*").single()
    if (error) {
    res.status(500).send({ error: error.message });
    return;
  } else {
    res.send(data);
  }
});
// DELETE CALLS START HERE

router.delete("/:id", ValidateJWTMiddleware, async (req, res) => {
  const { error } = await supabase.from("archetypes").delete().eq("id", req.params.id);
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(204).send();
  }
});

export default router;