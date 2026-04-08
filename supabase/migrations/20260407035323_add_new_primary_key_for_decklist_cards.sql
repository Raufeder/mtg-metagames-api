ALTER TABLE decklist_cards DROP CONSTRAINT decklist_cards_pkey;
ALTER TABLE decklist_cards ADD PRIMARY KEY (deck_id, scryfall_id, is_sideboard);