ALTER TABLE nominee_categories
    ADD COLUMN locked BOOLEAN DEFAULT FALSE;

UPDATE nominee_categories SET locked=TRUE
    FROM events
    WHERE nominee_categories.event_id=events.id AND events.active=FALSE;

DROP TABLE IF EXISTS user_event_scores;
CREATE TABLE user_event_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    score INTEGER
)

CREATE TABLE final_nominees {
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES nominee_categories(id),
    game_ids INTEGER[]
}
