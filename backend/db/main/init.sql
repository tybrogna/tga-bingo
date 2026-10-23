DROP TABLE IF EXISTS igdb_api_keys;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS tile_clusters;
DROP TABLE IF EXISTS tiles;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS nominee_categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_nominations;


CREATE TABLE igdb_api_keys (
    id SERIAL PRIMARY KEY,
    token TEXT,
    expires_at INTEGER
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER,
    active BOOLEAN
);

CREATE TABLE tile_clusters (
    id SERIAL PRIMARY KEY,
    tile_ids TEXT NOT NULL,
    event_id INTEGER REFERENCES events(id),
    is_verified BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE
);

CREATE TABLE tiles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    img_loc TEXT,
    gotWrong BOOLEAN
);

CREATE TABLE games (
    id INTEGER PRIMARY KEY,
    igdb_cover_id TEXT,
    name TEXT NOT NULL,
    release_date DATE,
    developers TEXT[],
    publishers TEXT[],
    notability_score INTEGER DEFAULT 0,
    is_vr BOOLEAN DEFAULT FALSE,
    is_remaster BOOLEAN DEFAULT FALSE,
    is_in_early_access BOOLEAN DEFAULT FALSE,
    is_released_from_early_access BOOLEAN DEFAULT FALSE,
    is_expansion BOOLEAN DEFAULT FALSE,
    is_mobile BOOLEAN DEFAULT FALSE,
    is_free_to_play BOOLEAN DEFAULT FALSE,
    last_update_date DATE,
    alternative_names TEXT[]
);

CREATE TABLE nominee_categories (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    name TEXT NOT NULL,
    year INTEGER
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
    -- token_expires_at TIMESTAMP
);

CREATE TABLE user_nominations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES nominee_categories(id),
    game_ids INTEGER[]
);

CREATE UNIQUE INDEX user_nomination_combo ON user_nominations(user_id, category_id);
INSERT INTO events (id, name, year, active) VALUES (4, 'The Game Awards', 2026, TRUE);
insert into nominee_categories (name,year,event_id) values ('Game of the Year',2026,4),('Best Game Direction',2026,4),('Best Narrative',2026,4),('Best Art Direction',2026,4),('Best remake / remaster',2026,4),('Best visual design',2026,4),('Best Audio Design',2026,4),('Best Ongoing',2026,4),('Best Debut Indie Game',2026,4),('Best Action Game',2026,4),('Best RPG',2026,4),('Best Family',2026,4),('Best Sports / Racing',2026,4),('Best Multiplayer',2026,4);