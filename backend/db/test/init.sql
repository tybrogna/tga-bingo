DROP TABLE IF EXISTS tiles;
DROP TABLE IF EXISTS events;
-- DROP TABLE IF EXISTS submitter;
DROP TABLE IF EXISTS tile_clusters;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS nominees;

-- CREATE TABLE submitters (
--     id SERIAL PRIMARY KEY,
--     email TEXT NOT NULL,
--     nickname TEXT
-- );

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
    -- submitter_id INTEGER REFERENCES submitters(id),
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
    -- igdb_id INTEGER,
    igdb_cover_id INTEGER,
    name TEXT NOT NULL,
    release DATE,
    developer TEXT,
    publisher TEXT,
    notability_score INTEGER DEFAULT 0,
    is_vr BOOLEAN DEFAULT FALSE,
    is_remaster BOOLEAN DEFAULT FALSE,
    is_in_early_access BOOLEAN DEFAULT FALSE,
    is_released_from_early_access BOOLEAN DEFAULT FALSE,
    is_expansion BOOLEAN DEFAULT FALSE,
    is_mobile BOOLEAN DEFAULT FALSE,
    is_free_to_play BOOLEAN DEFAULT FALSE,
    -- is_ongoing BOOLEAN DEFAULT FALSE,
    last_update_date DATE,
    alternate_name TEXT,
    alt_text TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    token_expires_at TIMESTAMP
);

-- INSERT INTO submitters (email, nickname) values ('test@qa.com', 'Nick Quality');
-- INSERT INTO tiles(title, desciption) values ('a tile', 'why would you put this in here');
-- INSERT INTO events (name, year, active) VALUES ('Summer Games Fest', 2025, FALSE);
-- INSERT INTO events (name, year, active) VALUES ('The Game Awards', 2024, FALSE);
-- INSERT INTO events (name, year, active) VALUES ('The Game Awards', 2025, TRUE);
INSERT INTO games (id, name, release, developer, publisher, notability_score, is_released_from_early_access) VALUES (654321, 'The Year 2025', '2026-01-01', 'BiG BoYS', 'Devolver Digital', 420, TRUE);
INSERT INTO igdb_api_keys (token, expires_at) values ('a299aca4gz7z6yc7cvbrmb78lou7cx', 1782792000);