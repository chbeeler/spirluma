PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS necklaces (
	id TEXT PRIMARY KEY
		CHECK (length(id) BETWEEN 3 AND 6 AND id NOT GLOB '*[^0-9]*'),
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS necklace_events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	necklace_id TEXT NOT NULL,
	occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	event TEXT NOT NULL DEFAULT 'QR visit',
	FOREIGN KEY (necklace_id) REFERENCES necklaces(id)
);

CREATE INDEX IF NOT EXISTS necklace_events_necklace_time
	ON necklace_events (necklace_id, occurred_at DESC);

INSERT OR IGNORE INTO necklaces (id) VALUES ('001'), ('002'), ('003');

CREATE VIEW IF NOT EXISTS necklace_visit_log AS
SELECT
	necklace_id AS Necklace,
	occurred_at AS Time,
	event AS Event
FROM necklace_events
ORDER BY occurred_at DESC;
