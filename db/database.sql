CREATE TABLE IF NOT EXISTS users
(
    id       SERIAL PRIMARY KEY,
    nickname VARCHAR(100)        NOT NULL
);

CREATE TABLE IF NOT EXISTS maze
(
    scoreID SERIAL PRIMARY KEY,
    user_id INT     NOT NULL,
    score   INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS snake
(
    scoreID SERIAL PRIMARY KEY,
    user_id INT     NOT NULL,
    score   INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS mine
(
    scoreID SERIAL PRIMARY KEY,
    user_id INT     NOT NULL,
    score   INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS tic_tac_toe
(
    scoreID SERIAL PRIMARY KEY,
    user_id INT     NOT NULL,
    score   INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE OR REPLACE FUNCTION update_score_maze(
    nick_name TEXT,
    new_score INT
) RETURNS VOID AS $$
DECLARE
    userId INT;
    current_score INT;
BEGIN
    SELECT id INTO userId
    FROM users
    WHERE nickname = nick_name;

    IF NOT FOUND THEN
        INSERT INTO users (nickname) VALUES (nick_name) RETURNING id INTO userId;
    END IF;

    SELECT score INTO current_score
    FROM maze
    WHERE user_id = userId;

    IF NOT FOUND THEN
        INSERT INTO maze (user_id, score) VALUES (userId, new_score);
    ELSE
        IF new_score > current_score THEN
            UPDATE maze SET score = new_score WHERE user_id = userId;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_score_snake(
    nick_name TEXT,
    new_score INT
) RETURNS VOID AS $$
DECLARE
    userId INT;
    current_score INT;
BEGIN
    SELECT id INTO userId
    FROM users
    WHERE nickname = nick_name;

    IF NOT FOUND THEN
        INSERT INTO users (nickname) VALUES (nick_name) RETURNING id INTO userId;
    END IF;

    SELECT score INTO current_score
    FROM snake
    WHERE user_id = userId;

    IF NOT FOUND THEN
        INSERT INTO snake (user_id, score) VALUES (userId, new_score);
    ELSE
        IF new_score > current_score THEN
            UPDATE snake SET score = new_score WHERE user_id = userId;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_score_mine(
    nick_name TEXT,
    new_score INT
) RETURNS VOID AS $$
DECLARE
    userId INT;
    current_score INT;
BEGIN
    SELECT id INTO userId
    FROM users
    WHERE nickname = nick_name;

    IF NOT FOUND THEN
        INSERT INTO users (nickname) VALUES (nick_name) RETURNING id INTO userId;
    END IF;

    SELECT score INTO current_score
    FROM mine
    WHERE user_id = userId;

    IF NOT FOUND THEN
        INSERT INTO mine (user_id, score) VALUES (userId, new_score);
    ELSE
        IF new_score > current_score THEN
            UPDATE mine SET score = new_score WHERE user_id = userId;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_score_tic_tac_toe(
    nick_name TEXT
) RETURNS VOID AS $$
DECLARE
    userId INT;
BEGIN
    -- Получаем или создаём пользователя
    SELECT id INTO userId
    FROM users
    WHERE nickname = nick_name;

    IF NOT FOUND THEN
        -- Если пользователя нет, создаём нового
        INSERT INTO users (nickname) VALUES (nick_name) RETURNING id INTO userId;

        -- И сразу добавляем первую запись в таблицу tic_tac_toe
        INSERT INTO tic_tac_toe (user_id, score) VALUES (userId, 1);
    ELSE
        -- Если пользователь есть, увеличиваем его значение в таблице tic_tac_toe
        UPDATE tic_tac_toe
        SET score = score + 1
        WHERE user_id = userId;

        -- Если записи для пользователя нет, добавляем её
        IF NOT FOUND THEN
            INSERT INTO tic_tac_toe (user_id, score) VALUES (userId, 1);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_top_5_mine()
    RETURNS TABLE(nickname VARCHAR(100), score INT) AS $$
BEGIN
    RETURN QUERY
        SELECT u.nickname, g.score
        FROM users u
                 JOIN mine g ON u.id = g.user_id
        ORDER BY g.score ASC
        LIMIT 5;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_top_5_maze()
    RETURNS TABLE(nickname VARCHAR(100), score INT) AS $$
BEGIN
    RETURN QUERY
        SELECT u.nickname, g.score
        FROM users u
                 JOIN maze g ON u.id = g.user_id
        ORDER BY g.score ASC
        LIMIT 5;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_top_5_snake()
    RETURNS TABLE(nickname VARCHAR(100), score INT) AS $$
BEGIN
    RETURN QUERY
        SELECT u.nickname, g.score
        FROM users u
                 JOIN snake g ON u.id = g.user_id
        ORDER BY g.score DESC
        LIMIT 5;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_top_5_tic_tac_toe()
    RETURNS TABLE(nickname VARCHAR(100), score INT) AS $$
BEGIN
    RETURN QUERY
        SELECT u.nickname, g.score
        FROM users u
                 JOIN tic_tac_toe g ON u.id = g.user_id
        ORDER BY g.score DESC
        LIMIT 5;
END;
$$ LANGUAGE plpgsql;
