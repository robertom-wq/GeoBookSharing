INSERT INTO utenti (
    nome, 
    cognome, 
    username, 
    email, 
    hashed_password, 
    biografia, 
    bannato, 
    ruolo,
    visualizzazioni,
    privacy_policy_accettata
) 
VALUES 
-- --------------------------------------------------------------------------------------------------------------------------------------
-- 3 UTENTI ADMIN (Password: password)
-- --------------------------------------------------------------------------------------------------------------------------------------
('Marco', 'Rossi', 'marco.rossi', 'marco.rossi@example.it', '$2b$12$zPEPYU0KW1SZy3MBuBg0IunNW68EeRjdi0c/Z2OWZgbhFY9udybcK', 'Amministratore del sistema, gestisce l infrastruttura.', FALSE, 'admin', 100,TRUE),
('Laura', 'Bianchi', 'laura.bianchi', 'laura.bianchi@example.it', '$2b$12$P75gQupkAGIWn7BwkBSUi.Mrr6NM54a10Jk3oT1/p/mJ0KJpK/O9u', 'Admin specializzato in supporto utenti e moderazione.', FALSE, 'admin', 50,TRUE),
('Giovanni', 'Verdi', 'giovanni.verdi', 'giovanni.verdi@example.it', '$2b$12$wJRxAxPYxko.kynOhAFMAeI9yG20DOdU132d7qM3OtmwCCv4/iyMK', 'Responsabile della sicurezza e dei dati.', FALSE, 'admin', 75,TRUE),

-- --------------------------------------------------------------------------------------------------------------------------------------
-- 10 UTENTI STANDARD (user) (Password: password)
-- --------------------------------------------------------------------------------------------------------------------------------------
('Anna', 'Neri', 'anna.neri', 'anna.neri@example.it', '$2b$12$P460lwmTc3CWu64PvihvmO8RKgWQ/vx8OS.KfxYfQAteGAMhmJ9Ai', 'Appassionata di romanzi fantasy e scienza fiction. Cerco sempre nuovi libri da condividere.', FALSE, 'user', 15,TRUE),
('Fabio', 'Gialli', 'fabio.gialli', 'fabio.gialli@example.it', '$2b$12$6q99nW9ufPkUsUGnaRSEqOjEYr5p7shlU5SPyP4fs6sdmVTYSnn0a', 'Collezionista di classici. Non presto i libri, li condivido con chi li apprezza.', FALSE, 'user', 25,TRUE),
('Chiara', 'Blu', 'chiara.blu', 'chiara.blu@example.it', '$2b$12$bzKvoG59QSKwt56ZZfRCZ.HmNGOo4pl0zZbzPROD98lh8ExLHOd/G', 'Studente universitaria alla ricerca di testi storici rari. Disponibile a scambi.', FALSE, 'user', 30,TRUE),
('Davide', 'Arancio', 'davide.arancio', 'davide.arancio@example.it', '$2b$12$oGc8aqsb6ArSzqGYZQaNy.JnAOgpUQKhmxskoOx68pbOwZQSojGki', 'Studente di Ingegneria, appassionato di elettronica e fumetti', FALSE, 'user', 5,TRUE),
('Elena', 'Viola', 'elena.viola', 'elena.viola@example.it', '$2b$12$BcRXWMTvh3YF48lUYq8K/OFww44iPjh2SEdIVF85wgvuwmRXbR1.6', 'Leggo un libro a settimana. Ho una vasta collezione di gialli svedesi.', FALSE, 'user', 40,TRUE),
('Francesco', 'Marrone', 'francesco.marrone', 'francesco.marrone@example.it', '$2b$12$jjFo9Vt8pimILOana1.pLOY2latuPAeNgNenHGBSXRktKAm2f4UBu', 'Amo la saggistica. Chiedetemi qualsiasi cosa su filosofia e politica.', FALSE, 'user', 20,TRUE),
('Greta', 'Rosa', 'greta.rosa', 'greta.rosa@example.it', '$2b$12$cn5dmaqQpiyjRp4/I1TexeukND4WT2O50HIbIauEHThQw0Z.gSXDq', 'Nuova sulla piattaforma, ma con tanti libri da mettere in circolo!', FALSE, 'user', 1,TRUE),
('Luca', 'Grigio', 'luca.grigio', 'luca.grigio@example.it', '$2b$12$aWfZOMTh.m8lnnLV90Zd6eIjXNihHCJB5t/xzAlky8q4k3QuqKYbq', 'Preferisco il formato digitale, ma presto anche i miei pochi volumi cartacei.', FALSE, 'user', 10,TRUE),
('Silvia', 'Nero', 'silvia.nero', 'silvia.nero@example.it', '$2b$12$xr.QCWKSp7VeI6LHUIgOIupl9bZtiHe8xYFPiF2PUBlakK6/paUb6', 'Viaggiatrice e lettrice di guide e racconti di viaggio.', FALSE, 'user', 12,TRUE),
('Tommaso', 'Azzurro', 'tommaso.azzurro', 'tommaso.azzurro@example.it', '$2b$12$fpFNq2H2CLdtcaQA55QdXuPJq/WK2SlOFaleENVoMkVRN.t1KjNBK', 'Studente di medicina, appassionato della cultura locale e delle tradizioni Venete', FALSE, 'user', 8,TRUE);