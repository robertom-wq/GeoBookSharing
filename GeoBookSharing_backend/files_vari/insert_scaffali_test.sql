INSERT INTO scaffali (
    nome, 
    descrizione, 
    proprietario_id, 
    posizione,
    data_creazione,
    data_ultima_modifica
) 
VALUES 
-- --------------------------------------------------------------------------------------------------------------------------------------
-- UTENTI ID 4-6: Montebelluna (Lat: 45.77, Lon: 12.04)
-- --------------------------------------------------------------------------------------------------------------------------------------
-- Proprietario ID 4 (Anna Neri)
('Scaffale Fantasy', 'Tutto il mio repertorio di high fantasy e urban fantasy.', 4, ST_GeomFromText('POINT(12.043 45.765)', 4326), NOW(), NOW()),
('Scaffale Sci-Fi', 'Racconti brevi e romanzi di fantascienza. Solo i migliori!', 4, ST_GeomFromText('POINT(12.038 45.771)', 4326), NOW(), NOW()),

-- Proprietario ID 5 (Fabio Gialli)
('Classici Italiani', 'Da Manzoni a Calvino. Opere imprescindibili.', 5, ST_GeomFromText('POINT(12.051 45.779)', 4326), NOW(), NOW()),
('Classici Stranieri', 'La letteratura russa e francese del XIX secolo.', 5, ST_GeomFromText('POINT(12.047 45.782)', 4326), NOW(), NOW()),

-- Proprietario ID 6 (Chiara Blu)
('Storia Antica', 'Focus su Grecia e Roma. Perfetto per la ricerca universitaria.', 6, ST_GeomFromText('POINT(12.031 45.760)', 4326), NOW(), NOW()),
('Saggi Contemporanei', 'Libri di politica e sociologia recenti.', 6, ST_GeomFromText('POINT(12.035 45.768)', 4326), NOW(), NOW()),

-- --------------------------------------------------------------------------------------------------------------------------------------
-- UTENTI ID 7-9: Treviso (Lat: 45.67, Lon: 12.24)
-- --------------------------------------------------------------------------------------------------------------------------------------
-- Proprietario ID 7 (Davide Arancio)
('Fumetti e Graphic Novel', 'Raccolta di volumi indipendenti e major.', 7, ST_GeomFromText('POINT(12.248 45.671)', 4326), NOW(), NOW()),
('Libri di informatica, elettronica e matematica', ' Scambio/prestito testi universitari.', 7, ST_GeomFromText('POINT(12.241 45.665)', 4326), NOW(), NOW()),

-- Proprietario ID 8 (Elena Viola)
('Gialli Svedesi', 'Il meglio del Nordic Noir. Alta richiesta!', 8, ST_GeomFromText('POINT(12.235 45.680)', 4326), NOW(), NOW()),
('Horror & Gotico', 'Dai classici di Poe alle nuove uscite.', 8, ST_GeomFromText('POINT(12.239 45.677)', 4326), NOW(), NOW()),

-- Proprietario ID 9 (Francesco Marrone)
('Filosofia Tedesca', 'Da Kant a Nietzsche. Solo testi in lingua originale o traduzioni fedeli.', 9, ST_GeomFromText('POINT(12.253 45.669)', 4326), NOW(), NOW()),
('Politica Attuale', 'Analisi e reportage sui sistemi politici europei.', 9, ST_GeomFromText('POINT(12.257 45.675)', 4326), NOW(), NOW()),

-- --------------------------------------------------------------------------------------------------------------------------------------
-- UTENTI ID 10-11: Paese (TV) (Lat: 45.65, Lon: 12.15)
-- --------------------------------------------------------------------------------------------------------------------------------------
-- Proprietario ID 10 (Greta Rosa)
('Nuove Voci', 'Autori esordienti e promesse della letteratura.', 10, ST_GeomFromText('POINT(12.149 45.654)', 4326), NOW(), NOW()),
('Cucina dal Mondo', 'Ricettari e storie gastronomiche internazionali.', 10, ST_GeomFromText('POINT(12.153 45.658)', 4326), NOW(), NOW()),

-- Proprietario ID 11 (Luca Grigio)
('Poesia Moderna', 'Da Montale in poi. Solo volumi tascabili.', 11, ST_GeomFromText('POINT(12.160 45.648)', 4326), NOW(), NOW()),
('Fantascienza Hard', 'Focus su fisica e astrofisica. Molto tecnico.', 11, ST_GeomFromText('POINT(12.155 45.652)', 4326), NOW(), NOW()),

-- --------------------------------------------------------------------------------------------------------------------------------------
-- UTENTI ID 12-13: Castelfranco Veneto (Lat: 45.67, Lon: 11.93)
-- --------------------------------------------------------------------------------------------------------------------------------------
-- Proprietario ID 12 (Silvia Nero)
('Guide di Viaggio Europa', 'Lonely Planet e Rough Guide recenti.', 12, ST_GeomFromText('POINT(11.933 45.668)', 4326), NOW(), NOW()),
('Letteratura di Viaggio', 'Racconti da Patagona e Siberia.', 12, ST_GeomFromText('POINT(11.928 45.672)', 4326), NOW(), NOW()),

-- Proprietario ID 13 (Tommaso Azzurro)
('Dica 33, libri di medicina', 'Scambio/prestito testi universitari di medicina.', 13, ST_GeomFromText('POINT(11.940 45.675)', 4326), NOW(), NOW()),
('Libri d''Arte', 'Cataloghi di mostre e monografie.', 13, ST_GeomFromText('POINT(11.935 45.670)', 4326), NOW(), NOW());