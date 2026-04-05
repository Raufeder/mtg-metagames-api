CREATE TABLE metagames (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    end_date timestamptz NOT NULL,
    start_date timestamptz NOT NULL
);

CREATE TABLE tournaments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metagame_id uuid NOT NULL REFERENCES metagames(id) ON DELETE CASCADE,
    name text NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    location text NOT NULL
);

CREATE TABLE archetypes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL
);

CREATE TABLE decks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    archetype_id uuid NOT NULL REFERENCES archetypes(id) ON DELETE CASCADE,
    tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_name text NOT NULL,
    name text NOT NULL
);

CREATE TABLE sets (
    scryfall_id text PRIMARY KEY
);

CREATE TABLE decklist_cards (
    scryfall_id text NOT NULL,
    deck_id uuid NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    is_sideboard boolean NOT NULL,
    quantity integer NOT NULL,
    PRIMARY KEY (deck_id, scryfall_id)
);

CREATE TABLE metagame_sets (
    metagame_id uuid NOT NULL REFERENCES metagames(id) ON DELETE CASCADE,
    set_id text NOT NULL REFERENCES sets(scryfall_id) ON DELETE CASCADE,
    PRIMARY KEY (metagame_id, set_id)
);

CREATE TABLE metagames_archetypes (
    metagame_id uuid NOT NULL REFERENCES metagames(id) ON DELETE CASCADE,
    archetype_id uuid NOT NULL REFERENCES archetypes(id) ON DELETE CASCADE,
    PRIMARY KEY (metagame_id, archetype_id)
);

CREATE TABLE metagame_banlist (
    metagame_id uuid NOT NULL REFERENCES metagames(id) ON DELETE CASCADE,
    scryfall_id text NOT NULL,
    PRIMARY KEY (metagame_id, scryfall_id)
);