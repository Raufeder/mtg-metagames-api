ALTER TABLE metagames_archetypes ADD COLUMN primary_deck_id uuid REFERENCES decks(id) ON DELETE SET NULL;
