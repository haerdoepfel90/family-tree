CREATE TABLE IF NOT EXISTS individuals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    given_name      TEXT,
    second_name     TEXT,
    third_name      TEXT,
    surname         TEXT,
    maiden_name     TEXT,
    sex             TEXT,
    birth_date      TEXT,
    birth_place     TEXT,
    death_date      TEXT,
    death_place     TEXT,
    portrait_url    TEXT
);

CREATE TABLE IF NOT EXISTS families (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    partner1_id  INTEGER REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE SET NULL,
    partner2_id  INTEGER REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE SET NULL,
    wedding_date TEXT,
    UNIQUE (partner1_id, partner2_id)
);

CREATE TABLE IF NOT EXISTS family_children (
    family_id INTEGER REFERENCES families(id) ON UPDATE CASCADE ON DELETE CASCADE,
    child_id INTEGER REFERENCES individuals(id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (family_id, child_id)
);