DROP TABLE IF EXISTS tiles;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS submitter;

CREATE TABLE submitters (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    nickname TEXT
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
    submitter_id INTEGER REFERENCES submitters(id),
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

INSERT INTO submitters (email, nickname) values ('test@qa.com', 'Nick Quality');
-- INSERT INTO tiles(title, desciption) values ('a tile', 'why would you put this in here');
INSERT INTO events (name, year, active) VALUES ('Summer Games Fest', 2025, FALSE);
INSERT INTO events (name, year, active) VALUES ('The Game Awards', 2024, FALSE);
INSERT INTO events (name, year, active) VALUES ('The Game Awards', 2025, TRUE);
