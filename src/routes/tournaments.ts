import {Router} from "express";
import { supabase } from "../supabase.js";
import ValidateJWTMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("tournaments").select("*");
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

// PATCH CALLS START HERE
router.patch("/:id", ValidateJWTMiddleware, async (req, res) => {
  const { name, location, start_date, end_date } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (location !== undefined) updates.location = location;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;
  if (Object.keys(updates).length === 0) {
    res.status(400).send({ error: "No fields to update." });
    return;
  }
  const { data, error } = await supabase.from("tournaments").update(updates).eq("id", req.params.id).select("*").single()
    if (error) {
    res.status(500).send({ error: error.message });
    return;
  } else {
    res.send(data);
  }
});
// DELETE CALLS START HERE

router.delete("/:id", ValidateJWTMiddleware, async (req, res) => {
  const { error } = await supabase.from("tournaments").delete().eq("id", req.params.id);
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(204).send();
  }
});

export default router;