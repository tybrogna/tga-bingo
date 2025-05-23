DROP TABLE IF EXISTS tiles;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS submitter;

CREATE TABLE submitter (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    nickname TEXT
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER
);

CREATE TABLE tiles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    desciption TEXT,
    submitter_id INTEGER REFERENCES submitter(id),
    event_id INTEGER REFERENCES events(id),
    isVerified BOOLEAN,
    gotWrong BOOLEAN
);

INSERT INTO submitter(email, nickname) values ('test@qa.com', 'Nick Quality');
