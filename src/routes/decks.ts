import {Router} from "express";
import { supabase } from "../supabase.js";
import ValidateJWTMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("decks").select("*, archetypes(*), tournaments(*), decklist_cards(*)").eq("id", req.params.id).single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.post("/", ValidateJWTMiddleware, async (req, res) => {
  const { archetype_id, tournament_id, player_name, name, placement } = req.body;
  if (!archetype_id || !tournament_id || !player_name || !name) {
    res.status(400).send({ error: "All fields except placement are required." });
    return;
  }
  const { data, error } = await supabase.from("decks").insert([{
    archetype_id,
    tournament_id,
    player_name,
    name,
    placement
  }]).select("*").single();
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.send(data);
  }
});

router.post("/:id/cards", ValidateJWTMiddleware, async (req, res) => {
  const {card_list} = req.body;
  const failedCards: string[] = [];
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  if (!card_list) {
    res.status(400).send({ error: "card_list is required." });
    return;
  }
  const splitStrings = card_list.split("\n");
  const workableCardList = [];
  let isSideboard = false;
  for (const str of splitStrings) {
    const countAndName = str.split(" ");
    if (str.trim().toLowerCase() === "sideboard") {
      isSideboard = true;
      continue;
    }
    if (countAndName.length < 2) {
      continue;
    }
    workableCardList.push({
      count: parseInt(countAndName[0]),
      name: countAndName.slice(1).join(" "),
      is_sideboard: isSideboard
    });
  }
  for (const card of workableCardList) {
    const scryfallLookup = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card.name)}`;
    const response = await fetch(scryfallLookup);
    let resJson = null;
    if (!response.ok) {
      await sleep(500); // Sleep for 500ms before the next request to avoid hitting rate limits
      const retry = await fetch(scryfallLookup);
      if (!retry.ok) {
      failedCards.push(card.name);
      continue;
      }
      const retryJson = await retry.json();
      resJson = retryJson;
    } else {
      resJson = await response.json();
    }
    const { error } = await supabase.from("decklist_cards").insert([{
      deck_id: req.params.id,
      scryfall_id: resJson.id,
      quantity: card.count,
      is_sideboard: card.is_sideboard
    }]);
    await sleep(200); // Sleep for 200ms before the next request to avoid hitting rate limits
    if (error) {
      res.status(500).send({ error: error.message });
      return;
    }
  }
   res.send({ message: "Cards added successfully.", failedCards });
});

// PATCH CALLS START HERE
router.patch("/:id", ValidateJWTMiddleware, async (req, res) => {
  const { player_name, name, placement, archetype_id, tournament_id } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (player_name !== undefined) updates.player_name = player_name;
  if (placement !== undefined) updates.placement = placement;
  if (archetype_id !== undefined) updates.archetype_id = archetype_id;
  if (tournament_id !== undefined) updates.tournament_id = tournament_id;
  if (Object.keys(updates).length === 0) {
    res.status(400).send({ error: "No fields to update." });
    return;
  }
  const { data, error } = await supabase.from("decks").update(updates).eq("id", req.params.id).select("*").single()
    if (error) {
    res.status(500).send({ error: error.message });
    return;
  } else {
    res.send(data);
  }
});
// DELETE CALLS START HERE

router.delete("/:id", ValidateJWTMiddleware, async (req, res) => {
  const { error } = await supabase.from("decks").delete().eq("id", req.params.id);
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(204).send();
  }
});

router.delete("/:id/cards/:scryfall_id", ValidateJWTMiddleware, async (req, res) => {
  const { is_sideboard } = req.query;
  const { error } = await supabase.from("decklist_cards").delete().eq("deck_id", req.params.id).eq("scryfall_id", req.params.scryfall_id).eq("is_sideboard", is_sideboard === "true");
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(204).send();
  }
});

export default router;