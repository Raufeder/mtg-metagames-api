import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("metagames").select("*");
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("metagames").select("*, tournaments(*), metagames_archetypes(archetypes(*), metagame_banlist(*)), metagame_sets(sets(*))")
  .eq("id", req.params.id)
  .single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.get("/:id/tournaments/:tournament_id", async (req, res) => {
  const { data, error } = await supabase.from("tournaments").select("*, decks(*, archetypes(*))")
  .eq("id", req.params.tournament_id)
  .eq("metagame_id", req.params.id)
  .single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.get("/:id/archetypes/:archetype_id", async (req, res) => {
  const { data, error } = await supabase.from("archetypes").select("*, decks(*, tournaments(*))")
  .eq("id", req.params.archetype_id)
  .eq("metagames_archetypes.metagame_id", req.params.id)
  .single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.post("/", async (req, res) => {
  const {start_date, end_date, name} = req.body;
  if (!start_date || !end_date || !name) {
      res.status(400).send({ error: "start_date, end_date, and name are required." });
      return;
  }
  const { data, error } = await supabase.from("metagames").insert([{
    start_date: start_date,
    end_date: end_date,
    name: name
  }]).select("*").single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.post("/:id/sets", async (req, res) => {
  const {set_name} = req.body;
  if (!set_name) {
      res.status(400).send({ error: "set_name is required." });
      return;
  }
  let setId = null;
  const { data, error } = await supabase.from("sets").select("*").eq("name", set_name).single();
  if (error) {
      const scryfallURL = `https://api.scryfall.com/sets/${set_name.toLowerCase()}`;
      const response = await fetch(scryfallURL);
        if (!response.ok) {
          res.status(404).send({ error: "Scryfall set not found." });
          return;
        }
      const resJson = await response.json()
      setId = resJson.id;
      const { error } = await supabase.from("sets").upsert([{
        scryfall_id: resJson.id,
        icon_set_image: resJson.icon_svg_uri,
        name: resJson.name,
        set_code: resJson.code
      }], { onConflict: "scryfall_id" }).select("*").single();
  if (error) {
    res.status(500).send({ error: error.message });
    return;
  }} else {
    setId = data.scryfall_id;
  }
    const { error: metagameSetError } = await supabase.from("metagame_sets").insert([{
      metagame_id: req.params.id,
      set_id: setId,
    }]).select("*").single();
  if (metagameSetError) {
    res.status(500).send({ error: metagameSetError.message });
    return;
  } else {  
  res.send({ message: "Set added to metagame successfully." });
  }
});

router.post("/:id/tournaments", async (req, res) => {
  const { name, start_date, end_date, location } = req.body;
  if (!name || !start_date || !end_date || !location) {
    res.status(400).send({ error: "name, start_date, end_date, and location are required." });
    return;
  }
  const { data, error } = await supabase.from("tournaments").insert([{
    metagame_id: req.params.id,
    name: name,
    start_date: start_date,
    end_date: end_date,
    location: location
  }]).select("*").single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.post("/:id/archetypes", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).send({ error: "name is required." });
    return;
  }
  const { data, error } = await supabase.from("archetypes").upsert({ name }, { onConflict: "name" }).select("*").single()
    if (error) {
    res.status(500).send({ error: error.message });
    return;
  }

  const { error: metagameArchetypeError } = await supabase.from("metagames_archetypes").insert([{
      metagame_id: req.params.id,
      archetype_id: data.id,
  }]).select("*").single();

  if (metagameArchetypeError) {
    res.status(500).send({ error: metagameArchetypeError.message });
  } else {
    res.send(data);
  }
});

router.post("/:id/banlist", async (req, res) => {
  const {card_list} = req.body;
  if (!card_list) {
    res.status(400).send({ error: "card_list is required." });
    return;
  }
  const splitStrings = card_list.split("\n");
  for (const card of splitStrings) {
    if (!card.trim()) {
      continue;
    }
    const scryfallLookup = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card)}`;
    const response = await fetch(scryfallLookup);
    if (!response.ok) {
      res.status(404).send({ error: `Scryfall card not found for ${card}.` });
      return;
    }
    const resJson = await response.json();
    const { error } = await supabase.from("metagame_banlist").insert([{
      metagame_id: req.params.id,
      scryfall_id: resJson.id,
    }]);
    if (error) {
      res.status(500).send({ error: error.message });
      return;
    }
  }
   res.send({ message: "Cards added to banlist successfully." });
});

export default router;