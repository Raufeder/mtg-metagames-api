import {Router} from "express";
import { supabase } from "../supabase.js";

const router = Router();

router.post("/", async (req, res) => {
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

router.post("/:id/cards", async (req, res) => {
  const {card_list} = req.body;
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
    if (!response.ok) {
      res.status(404).send({ error: `Scryfall card not found for ${card.name}.` });
      return;
    }
    const resJson = await response.json();
    const { error } = await supabase.from("decklist_cards").insert([{
      deck_id: req.params.id,
      scryfall_id: resJson.id,
      quantity: card.count,
      is_sideboard: card.is_sideboard
    }]);
    await sleep
    if (error) {
      res.status(500).send({ error: error.message });
      return;
    }
  }
   res.send({ message: "Cards added successfully." });
});

export default router;