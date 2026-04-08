CREATE TABLE metagame_restrictedlist (
    metagame_id uuid NOT NULL REFERENCES metagames(id) ON DELETE CASCADE,
    scryfall_id text NOT NULL,
    PRIMARY KEY (metagame_id, scryfall_id)
);