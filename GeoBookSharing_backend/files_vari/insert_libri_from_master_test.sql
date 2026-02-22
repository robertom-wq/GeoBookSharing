-- ************************************************************
--   4 | anna.neri         | Appassionata di romanzi fantasy e scienza fiction. Cerco sempre nuovi libri da condividere. |  1 | Scaffale Fantasy                               | Tutto il mio repertorio di high fantasy e urban fantasy.
--   4 | anna.neri         | Appassionata di romanzi fantasy e scienza fiction. Cerco sempre nuovi libri da condividere. |  2 | Scaffale Sci-Fi                                | Racconti brevi e romanzi di fantascienza. Solo i migliori!
--   5 | fabio.gialli      | Collezionista di classici. Non presto i libri, li condivido con chi li apprezza.            |  3 | Classici Italiani                              | Da Manzoni a Calvino. Opere imprescindibili.
--   5 | fabio.gialli      | Collezionista di classici. Non presto i libri, li condivido con chi li apprezza.            |  4 | Classici Stranieri                             | La letteratura russa e francese del XIX secolo.
--   6 | chiara.blu        | Studentessa universitaria alla ricerca di testi storici rari. Disponibile a scambi          |  5 | Storia Antica                                  | Focus su Grecia e Roma. Perfetto per la ricerca universitaria.
--   6 | chiara.blu        | Studentessa universitaria alla ricerca di testi storici rari. Disponibile a scambi          |  6 | Saggi Contemporanei                            | Libri di politica e sociologia recenti.
--   7 | davide.arancio    | Studente di Ingegneria, appassionato di elettronica e fumetti                               |  7 | Fumetti e Graphic Novel                        | Raccolta di volumi indipendenti e major.
--   8 | elena.viola       | Leggo un libro a settimana. Ho una vasta collezione di gialli svedesi.                      |  9 | Gialli Svedesi                                 | Il meglio del Nordic Noir. Alta richiesta!
--   8 | elena.viola       | Leggo un libro a settimana. Ho una vasta collezione di gialli svedesi.                      | 10 | Horror & Gotico                                | Dai classici di Poe alle nuove uscite.
--   9 | francesco.marrone | Amo la saggistica. Chiedetemi qualsiasi cosa su filosofia e politica.                       | 11 | Filosofia Tedesca                              | Da Kant a Nietzsche. Solo testi in lingua originale o traduzioni fedeli.
--   9 | francesco.marrone | Amo la saggistica. Chiedetemi qualsiasi cosa su filosofia e politica.                       | 12 | Politica Attuale                               | Analisi e reportage sui sistemi politici europei.
--  10 | greta.rosa        | Nuova sulla piattaforma, ma con tanti libri da mettere in circolo!                          | 13 | Nuove Voci                                     | Autori esordienti e promesse della letteratura.
--  10 | greta.rosa        | Nuova sulla piattaforma, ma con tanti libri da mettere in circolo!                          | 14 | Cucina dal Mondo                               | Ricettari e storie gastronomiche internazionali.
--  11 | luca.grigio       | Preferisco il formato digitale, ma presto anche i miei pochi volumi cartacei.               | 15 | Poesia Moderna                                 | Da Montale in poi. Solo volumi tascabili.
--  11 | luca.grigio       | Preferisco il formato digitale, ma presto anche i miei pochi volumi cartacei.               | 16 | Fantascienza Hard                              | Focus su fisica e astrofisica. Molto tecnico.
--  12 | silvia.nero       | Viaggiatrice e lettrice di guide e racconti di viaggio.                                     | 17 | Guide di Viaggio Europa                        | Lonely Planet e Rough Guide recenti.
--  12 | silvia.nero       | Viaggiatrice e lettrice di guide e racconti di viaggio.                                     | 18 | Letteratura di Viaggio                         | Racconti da Patagona e Siberia.
--  13 | tommaso.azzurro   | Studente di medicina, appassionato della cultura locale e delle tradizioni Venete           | 20 | Libri d'Arte                                   | Cataloghi di mostre e monografie.
--   7 | davide.arancio    | Studente di Ingegneria, appassionato di elettronica e fumetti                               |  8 | Libri di informatica, elettronica e matematica | Scambio/prestito testi universitari
--  13 | tommaso.azzurro   | Studente di medicina, appassionato della cultura locale e delle tradizioni Venete           | 19 | Dica 33, libri di medicina                     | Scambio/prestito testi universitari di medicina
-- ************************************************************

-- anna.neri
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 4, 1, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (36, 37, 38);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 4, 2, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id =6;


-- fabio.gialli
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 5, 3, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (46, 47);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 5, 4, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id =31;

-- chiara.blu
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 6, 5, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (19, 29, 30);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 6, 6, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id =7;

-- davide.arancio
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 7, 7, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (27, 28, 38);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 7, 8, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (39, 9, 41);

-- elena.viola
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 8, 9, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (48, 49, 50);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 8, 10, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (51, 52);

-- francesco.marrone
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 9, 11, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (53,54);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 9, 12, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (55, 56);

-- greta.rosa
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 10, 13, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id = 57;

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 10, 14, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (58, 59);

-- luca.grigio
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 11, 15, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id in (60, 61);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 11, 16, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (62, 63);

-- silvia.nero
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 12, 17, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id in (64, 65);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 12, 18, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (66, 67);

-- tommaso.azzurro
INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 13, 19, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id in (13, 11, 12);

INSERT INTO libri (proprietario_id, scaffale_id, master_id, titolo, autore, anno, descrizione, copertina, genere_id, is_disponibile, data_ultima_modifica)
SELECT 13, 20, id, titolo, autore, anno, descrizione, copertina, genere_id, TRUE, NOW() FROM libri_master WHERE id IN (14,18,20,15,16);