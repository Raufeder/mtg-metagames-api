import {Router} from "express";
import { supabase } from "../supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (typeof q !== "string" || q.trim() === "") {
    res.status(400).send({ error: "Query parameter 'q' is required and must be a non-empty string." });
    return;
  }
  // I need a promise all here to search across multiple tables and combine results
  const [archetypesResult, decksResult, tournamentsResult, metagamesResult] = await Promise.all([
    supabase.from("archetypes").select("*").ilike("name", `%${q}%`),
    supabase.from("decks").select("*").or(`name.ilike.%${q}%,player_name.ilike.%${q}%`),
    supabase.from("tournaments").select("*").or(`name.ilike.%${q}%,location.ilike.%${q}%`),
    supabase.from("metagames").select("*").ilike("name", `%${q}%`)
  ]);
  if (archetypesResult.error || decksResult.error || tournamentsResult.error || metagamesResult.error) {
    res.status(500).send({ error: "Error searching." });
  } else {
    res.send({
      archetypes: archetypesResult.data,
      decks: decksResult.data,
      tournaments: tournamentsResult.data,
      metagames: metagamesResult.data
    });
  }
});

export default router;