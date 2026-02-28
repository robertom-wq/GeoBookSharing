---------------------------------------
--* Tutti i dati contenuti nel presente progetto (nomi, email, password) sono inventati al solo scopo dimostrativo e NON contengono informazioni 
--reali riguardanti persone o organizzazioni esistenti.
--* Dati Personali Immaginari: Tutti i nomi, cognomi, indirizzi email, biografie e log delle attività appartengono a utenti inventati. Qualsiasi 
--somiglianza con persone, indirizzi o eventi reali è puramente casuale.
--* Dati di Geolocalizzazione (PostGIS): Le coordinate geografiche presenti nel database (ad esempio nella tabella scaffali) sono state utilizzate
--unicamente per testare e dimostrare il funzionamento delle query spaziali dell'applicazione. Sebbene i punti possano ricadere su una mappa reale,
--sono stati assegnati in modo arbitrario e non corrispondono ad abitazioni, posizioni o spostamenti di utenti reali.

--In un ambiente di produzione reale, la privacy e la sicurezza dei dati degli utenti vengono trattate con la massima priorità e nel pieno rispetto
--delle normative vigenti (GDPR). Nessun dato personale, sensibile o di geolocalizzazione di utenti reali verrebbe mai esposto o pubblicato in questo modo
---------------------------------------

--
-- PostgreSQL database dump
--

\restrict ap7dTnddHJhkrhqi1qW0FlEBmRcgIteFXLJ0TiSkYXQkC7CkD9u3oBbzITqbQqJ

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.utente_valutazioni DROP CONSTRAINT utente_valutazioni_recensore_id_fkey;
ALTER TABLE ONLY public.utente_valutazioni DROP CONSTRAINT utente_valutazioni_recensito_id_fkey;
ALTER TABLE ONLY public.utente_valutazioni DROP CONSTRAINT utente_valutazioni_condivisione_id_fkey;
ALTER TABLE ONLY public.scaffali DROP CONSTRAINT scaffali_proprietario_id_fkey;
ALTER TABLE ONLY public.libri DROP CONSTRAINT libri_tipo_condivisione_id_fkey;
ALTER TABLE ONLY public.libri DROP CONSTRAINT libri_scaffale_id_fkey;
ALTER TABLE ONLY public.libri DROP CONSTRAINT libri_proprietario_id_fkey;
ALTER TABLE ONLY public.libri DROP CONSTRAINT libri_master_id_fkey;
ALTER TABLE ONLY public.libri_master DROP CONSTRAINT libri_master_genere_id_fkey;
ALTER TABLE ONLY public.libri DROP CONSTRAINT libri_genere_id_fkey;
ALTER TABLE ONLY public.condivisioni DROP CONSTRAINT condivisioni_tipo_condivisione_id_fkey;
ALTER TABLE ONLY public.condivisioni DROP CONSTRAINT condivisioni_richiedente_id_fkey;
ALTER TABLE ONLY public.condivisioni DROP CONSTRAINT condivisioni_proprietario_id_fkey;
ALTER TABLE ONLY public.condivisioni DROP CONSTRAINT condivisioni_libro_id_fkey;
DROP INDEX public.utente_valutazioni_recensore_id_idx;
DROP INDEX public.utente_valutazioni_recensito_id_idx;
DROP INDEX public.utente_valutazioni_condivisione_id_recensore_id_recensito_i_key;
DROP INDEX public.storico_utente_valutazioni_recensore_username_idx;
DROP INDEX public.storico_utente_valutazioni_recensito_username_idx;
DROP INDEX public.storico_eliminazioni_esecutore_username_idx;
DROP INDEX public.storico_eliminazioni_azione_target_nome_idx;
DROP INDEX public.storico_eliminazioni_azione_idx;
DROP INDEX public.libri_titolo_idx;
DROP INDEX public.libri_master_titolo_idx;
DROP INDEX public.libri_master_titolo_autore_anno_key;
DROP INDEX public.libri_master_isbn_key;
DROP INDEX public.libri_master_isbn_idx;
DROP INDEX public.libri_master_genere_id_idx;
DROP INDEX public.libri_master_autore_idx;
DROP INDEX public.libri_autore_idx;
DROP INDEX public.idx_utenti_username;
DROP INDEX public.idx_utenti_ruolo;
DROP INDEX public.idx_utenti_richiesta_eliminazione;
DROP INDEX public.idx_utenti_email;
DROP INDEX public.idx_utenti_bannato;
DROP INDEX public.idx_tipo_condivisione_dettagli;
DROP INDEX public.idx_scaffali_proprietario_id_nome;
DROP INDEX public.idx_scaffali_posizione;
DROP INDEX public.idx_libri_scaffale;
DROP INDEX public.idx_libri_prorprietario;
DROP INDEX public.idx_libri_filtri;
DROP INDEX public.idx_libri_disponibili;
DROP INDEX public.idx_genere_dettagli;
DROP INDEX public.idx_condivisioni_tipocondivisione;
DROP INDEX public.idx_condivisioni_richiedente;
DROP INDEX public.idx_condivisioni_proprietario;
DROP INDEX public.idx_condivisioni_date;
DROP INDEX public.idx_condivisioni_confermato;
DROP INDEX public.idx_condivisioni_completato;
ALTER TABLE ONLY public.utenti DROP CONSTRAINT utenti_pkey;
ALTER TABLE ONLY public.utente_valutazioni DROP CONSTRAINT utente_valutazioni_pkey;
ALTER TABLE ONLY public.tipi_condivisione DROP CONSTRAINT tipi_condivisione_pkey;
ALTER TABLE ONLY public.storico_utente_valutazioni DROP CONSTRAINT storico_utente_valutazioni_pkey;
ALTER TABLE ONLY public.storico_eliminazioni DROP CONSTRAINT storico_eliminazioni_pkey;
ALTER TABLE ONLY public.scaffali DROP CONSTRAINT scaffali_pkey;
ALTER TABLE ONLY public.libri DROP CONSTRAINT libri_pkey;
ALTER TABLE ONLY public.libri_master DROP CONSTRAINT libri_master_pkey;
ALTER TABLE ONLY public.generi DROP CONSTRAINT generi_pkey;
ALTER TABLE ONLY public.condivisioni DROP CONSTRAINT condivisioni_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE public.utenti ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.utente_valutazioni ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.tipi_condivisione ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.storico_utente_valutazioni ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.storico_eliminazioni ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.scaffali ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.libri_master ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.libri ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.generi ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.condivisioni ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.utenti_id_seq;
DROP TABLE public.utenti;
DROP SEQUENCE public.utente_valutazioni_id_seq;
DROP TABLE public.utente_valutazioni;
DROP SEQUENCE public.tipi_condivisione_id_seq;
DROP TABLE public.tipi_condivisione;
DROP SEQUENCE public.storico_utente_valutazioni_id_seq;
DROP TABLE public.storico_utente_valutazioni;
DROP SEQUENCE public.storico_eliminazioni_id_seq;
DROP TABLE public.storico_eliminazioni;
DROP SEQUENCE public.scaffali_id_seq;
DROP TABLE public.scaffali;
DROP SEQUENCE public.libri_master_id_seq;
DROP TABLE public.libri_master;
DROP SEQUENCE public.libri_id_seq;
DROP TABLE public.libri;
DROP SEQUENCE public.generi_id_seq;
DROP TABLE public.generi;
DROP SEQUENCE public.condivisioni_id_seq;
DROP TABLE public.condivisioni;
DROP TABLE public._prisma_migrations;
DROP TYPE public."TipiAzione";
DROP EXTENSION postgis;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: TipiAzione; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipiAzione" AS ENUM (
    'DELETE_UTENTE',
    'DELETE_LIBRO',
    'DELETE_SCAFFALE',
    'DELETE_CONDIVISIONE',
    'DELETE_VALUTAZIONE',
    'BAN_UTENTE',
    'MODIFICA_RUOLO',
    'DELETE_LIBRO_MASTER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: condivisioni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.condivisioni (
    id integer NOT NULL,
    libro_id integer NOT NULL,
    proprietario_id integer NOT NULL,
    richiedente_id integer NOT NULL,
    tipo_condivisione_id integer NOT NULL,
    data_dal date,
    data_al date,
    note character varying(1000),
    is_confermato boolean DEFAULT false NOT NULL,
    is_completato boolean DEFAULT false NOT NULL,
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_completato timestamp(6) without time zone,
    data_ultima_modifica timestamp(6) without time zone NOT NULL
);


--
-- Name: condivisioni_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.condivisioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: condivisioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.condivisioni_id_seq OWNED BY public.condivisioni.id;


--
-- Name: generi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generi (
    id integer NOT NULL,
    dettagli character varying(100) NOT NULL
);


--
-- Name: generi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.generi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.generi_id_seq OWNED BY public.generi.id;


--
-- Name: libri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libri (
    id integer NOT NULL,
    titolo character varying(300) NOT NULL,
    autore character varying(1000) DEFAULT 'Sconosciuto'::character varying NOT NULL,
    anno integer,
    copertina character varying(1000),
    copertina_thumb character varying(1000),
    descrizione character varying(2000),
    genere_id integer DEFAULT 999 NOT NULL,
    tipo_condivisione_id integer DEFAULT 999 NOT NULL,
    proprietario_id integer NOT NULL,
    scaffale_id integer NOT NULL,
    is_disponibile boolean DEFAULT true NOT NULL,
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    data_ultima_modifica timestamp(6) without time zone NOT NULL,
    master_id integer,
    visualizzazioni integer DEFAULT 0 NOT NULL,
    isbn character varying(20) DEFAULT 'Non definito'::character varying NOT NULL
);


--
-- Name: libri_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.libri_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libri_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.libri_id_seq OWNED BY public.libri.id;


--
-- Name: libri_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libri_master (
    id integer NOT NULL,
    titolo character varying(300) NOT NULL,
    autore character varying(1000) DEFAULT 'Sconosciuto'::character varying NOT NULL,
    anno integer,
    isbn character varying(20) NOT NULL,
    descrizione character varying(2000),
    copertina character varying(1000),
    copertina_thumb character varying(1000),
    genere_id integer DEFAULT 999,
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_aggiornamento timestamp(6) without time zone NOT NULL
);


--
-- Name: libri_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.libri_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libri_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.libri_master_id_seq OWNED BY public.libri_master.id;


--
-- Name: scaffali; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scaffali (
    id integer NOT NULL,
    nome character varying(300) NOT NULL,
    descrizione character varying(1000),
    proprietario_id integer NOT NULL,
    posizione public.geography NOT NULL,
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    data_ultima_modifica timestamp(6) without time zone NOT NULL
);


--
-- Name: scaffali_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scaffali_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scaffali_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scaffali_id_seq OWNED BY public.scaffali.id;


--
-- Name: storico_eliminazioni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storico_eliminazioni (
    id integer NOT NULL,
    "timestamp" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    esecutore_id integer NOT NULL,
    esecutore_username character varying(100) NOT NULL,
    "target_ID" integer NOT NULL,
    target_nome character varying(300) NOT NULL,
    azione public."TipiAzione" NOT NULL,
    dettagli character varying(1000)
);


--
-- Name: storico_eliminazioni_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.storico_eliminazioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: storico_eliminazioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.storico_eliminazioni_id_seq OWNED BY public.storico_eliminazioni.id;


--
-- Name: storico_utente_valutazioni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storico_utente_valutazioni (
    id integer NOT NULL,
    voto integer NOT NULL,
    recensione character varying(1000),
    recensore_username character varying(100) NOT NULL,
    recensito_username character varying(100) NOT NULL,
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: storico_utente_valutazioni_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.storico_utente_valutazioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: storico_utente_valutazioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.storico_utente_valutazioni_id_seq OWNED BY public.storico_utente_valutazioni.id;


--
-- Name: tipi_condivisione; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipi_condivisione (
    id integer NOT NULL,
    dettagli character varying(100),
    descrizione character varying(2000)
);


--
-- Name: tipi_condivisione_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipi_condivisione_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipi_condivisione_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipi_condivisione_id_seq OWNED BY public.tipi_condivisione.id;


--
-- Name: utente_valutazioni; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utente_valutazioni (
    id integer NOT NULL,
    voto integer NOT NULL,
    recensione character varying(1000),
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recensore_id integer NOT NULL,
    recensito_id integer NOT NULL,
    condivisione_id integer NOT NULL
);


--
-- Name: utente_valutazioni_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utente_valutazioni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utente_valutazioni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utente_valutazioni_id_seq OWNED BY public.utente_valutazioni.id;


--
-- Name: utenti; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utenti (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    cognome character varying(100) NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    biografia character varying(1000),
    avatar character varying(1000),
    avatar_thumb character varying(1000),
    bannato boolean DEFAULT false NOT NULL,
    data_creazione timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ruolo character varying(50) DEFAULT 'user'::character varying NOT NULL,
    richiesta_eliminazione boolean DEFAULT false,
    data_richiesta_eliminazione timestamp(6) without time zone,
    data_ultima_modifica timestamp(6) without time zone,
    visualizzazioni integer DEFAULT 0 NOT NULL,
    data_accettazione_privacy timestamp(6) without time zone,
    privacy_policy_accettata boolean DEFAULT false NOT NULL
);


--
-- Name: utenti_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utenti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utenti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utenti_id_seq OWNED BY public.utenti.id;


--
-- Name: condivisioni id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condivisioni ALTER COLUMN id SET DEFAULT nextval('public.condivisioni_id_seq'::regclass);


--
-- Name: generi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generi ALTER COLUMN id SET DEFAULT nextval('public.generi_id_seq'::regclass);


--
-- Name: libri id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri ALTER COLUMN id SET DEFAULT nextval('public.libri_id_seq'::regclass);


--
-- Name: libri_master id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri_master ALTER COLUMN id SET DEFAULT nextval('public.libri_master_id_seq'::regclass);


--
-- Name: scaffali id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scaffali ALTER COLUMN id SET DEFAULT nextval('public.scaffali_id_seq'::regclass);


--
-- Name: storico_eliminazioni id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storico_eliminazioni ALTER COLUMN id SET DEFAULT nextval('public.storico_eliminazioni_id_seq'::regclass);


--
-- Name: storico_utente_valutazioni id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storico_utente_valutazioni ALTER COLUMN id SET DEFAULT nextval('public.storico_utente_valutazioni_id_seq'::regclass);


--
-- Name: tipi_condivisione id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipi_condivisione ALTER COLUMN id SET DEFAULT nextval('public.tipi_condivisione_id_seq'::regclass);


--
-- Name: utente_valutazioni id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utente_valutazioni ALTER COLUMN id SET DEFAULT nextval('public.utente_valutazioni_id_seq'::regclass);


--
-- Name: utenti id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utenti ALTER COLUMN id SET DEFAULT nextval('public.utenti_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e7576a11-d69f-4fc5-81e9-11ebe889d469	d1f01bf8454753acae484aadc98f6c96a30157f6a57025f24825f279b531da7f	2025-12-13 10:58:39.197225+00	20251209191856	\N	\N	2025-12-13 10:58:39.178834+00	1
37ac2739-1f96-42de-beb8-3497363330c6	55d1cb628a88e7e12a0985951af56f32936c83030c6a00b29b69f82570d7d187	2025-12-13 10:58:37.523809+00	20251129200959_creazione_tabella_utenti	\N	\N	2025-12-13 10:58:37.494828+00	1
574d3a19-2d4a-4e2d-bb67-88925606d393	44f6605f0fdc911de997a01b7ea92e8e1c57fd54f467b9e115bd0ba40c1e2f55	2025-12-13 10:58:37.55571+00	20251129202014_creazione_tabella_utenti	\N	\N	2025-12-13 10:58:37.529516+00	1
cf6172b6-6979-456e-83c9-561f8edf02ef	4beb98a0cc939fb603b9ee8fb05f2a173ad8466ddcd031cf2efd358af815a829	2025-12-13 10:58:37.590085+00	20251129204853_creazione_tabella_libri	\N	\N	2025-12-13 10:58:37.562311+00	1
47e9cd56-e5d3-4130-b519-169fdfb4ed2e	aeb7efcc35810ab40dc4652b0d9e4aa1faf4a6788bc0f43e29cd3dd9a7686dbd	2026-02-08 08:48:19.967835+00	20260208084819_aggiunte_colonne_pryvacy_policy	\N	\N	2026-02-08 08:48:19.93409+00	1
dddce0f6-68bb-41dd-911c-83b38ce4c0c0	06cb1277f89127df5a15400caa19daa885a65009078a901824da97a03f7b0a8c	2025-12-13 10:58:37.662383+00	20251129214430_creazione_altre_tabelle	\N	\N	2025-12-13 10:58:37.596473+00	1
dcebb1be-206b-4e22-b732-b85e68c30494	c10ab5e8a5d62e31171a0fa875e003e6133cd2a48ace9def142aa7673aaf6d4d	2025-12-13 10:58:38.868407+00	20251129220905_creazione_altre_tabelle	\N	\N	2025-12-13 10:58:37.667363+00	1
ceefe7c3-d895-4022-bb43-421af906f7d8	ea94a950cd48d7da189e20428facdec5c26936259beea464f2cf3315ec5eb448	2025-12-13 10:58:38.933112+00	20251130105038_creazione_ultime_tabelle	\N	\N	2025-12-13 10:58:38.872961+00	1
d7ff2a90-b19e-44db-b0d6-3a4013e8712c	399ac1c36d5d2f419f3c9760f62ceb7523465c02471e1f8edb16b487716b852d	2025-12-13 10:58:38.95922+00	20251130110049_creazione_ultime_tabelle	\N	\N	2025-12-13 10:58:38.938874+00	1
0761f935-f4f4-4f85-a792-b1cf4602ddf9	60925eea8587e5e52fa5ca014cf487f1b420574265e2c1b5e4a657c1362b9633	2025-12-13 10:58:38.98332+00	20251130131133_rifinitura	\N	\N	2025-12-13 10:58:38.96423+00	1
ce8026d4-b05b-4696-ac33-9ffcf1d011d2	ec1d0af325939bed61f183f9e6ffac3266f8cf7cc427855e5d2ea775f8538a41	2025-12-13 10:58:39.013075+00	20251206162938_modifica	\N	\N	2025-12-13 10:58:38.99129+00	1
93b6b24d-7434-403f-bd7d-3088986a6a56	055e224ab4cd29f9d2b4ac9ef5a36758ee1558657b4265f71f849423ca21b959	2025-12-13 10:58:39.075012+00	20251207112909_aggiunta_isbn_a_libro	\N	\N	2025-12-13 10:58:39.030958+00	1
d0ee3f2c-a4d2-4c34-903f-8ec52fc992f4	15a7df45e9dc60bc0b845f287d52ef4b34ffbe3fae7579f2cf787aec6e7d0604	2025-12-13 10:58:39.112957+00	20251208104906	\N	\N	2025-12-13 10:58:39.089655+00	1
5bb84ae3-cc90-4f08-b0d3-6f112d421d96	5c52b413f95aa5a73251c0a112154ea07aa32308b5276748fcdc1d7e75d557b6	2025-12-13 10:58:39.14192+00	20251208144141	\N	\N	2025-12-13 10:58:39.121001+00	1
03fe6336-bda4-4e7e-a563-4b69f29e0fa6	f005a070390f2103f39b156a1573bd3c5ee24b8fb5f9650964f1f50fc6a70e01	2025-12-13 10:58:39.172972+00	20251208144509	\N	\N	2025-12-13 10:58:39.151283+00	1
\.


--
-- Data for Name: condivisioni; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.condivisioni (id, libro_id, proprietario_id, richiedente_id, tipo_condivisione_id, data_dal, data_al, note, is_confermato, is_completato, data_creazione, data_completato, data_ultima_modifica) FROM stdin;
27	61	1	32	1	2026-02-22	2026-02-27	\N	t	t	2026-02-23 17:31:33.654	2026-02-23 18:07:55.505	2026-02-23 18:07:55.509
28	93	10	32	1	2026-02-22	2026-03-11	\N	t	t	2026-02-23 18:10:17.86	2026-02-23 19:10:53.255	2026-02-23 19:10:53.257
29	92	10	33	1	2026-03-03	2026-03-25	Vorrei leggere questo capolavoro...	t	t	2026-02-23 19:13:10.232	2026-02-23 19:13:30.178	2026-02-23 19:13:30.18
30	79	32	10	1	2026-02-25	2026-03-18	Mi piacerebbe leggerlo..	t	t	2026-02-24 00:53:59.455	2026-02-24 00:54:37	2026-02-24 00:54:37.001
31	94	34	32	1	2026-02-24	2026-03-12	[Rifiutata dal proprietario] Spiacente quelle date lo porto con me in un viaggio... riprova la settimana successiva	f	t	2026-02-24 00:59:53.9	2026-02-24 01:01:03.367	2026-02-24 01:01:03.371
32	43	12	10	1	2026-03-24	2026-03-30		f	f	2026-02-25 09:53:47.367	\N	2026-02-25 09:53:47.367
\.


--
-- Data for Name: generi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.generi (id, dettagli) FROM stdin;
1	Non definito
2	Non-Fiction per Ragazzi
3	Scienze Sociali
4	Tecnologia e Ingegneria
5	Educazione
6	Informatica
7	Medico
8	Viaggi
9	Storia
10	Poesia
11	Fumetti e Romanzi Illustrati
12	Narrativa
13	Fiction per Ragazzi
14	Matematica
15	Salute e Fitness
16	Famiglia e Relazioni
17	Filosofia
18	Scienze Politiche
19	Cucina
20	Natura
21	Critica Letteraria
22	Biografia e Autobiografia
23	Scienza
24	Religione
25	Business ed Economia
26	Corpo, Mente e Spirito
\.


--
-- Data for Name: libri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.libri (id, titolo, autore, anno, copertina, copertina_thumb, descrizione, genere_id, tipo_condivisione_id, proprietario_id, scaffale_id, is_disponibile, data_creazione, data_ultima_modifica, master_id, visualizzazioni, isbn) FROM stdin;
60	Computer Networks	Andrew Tanenbaum, Nick Feamster, David Wetherall	2021	uploads/copertine/1767282090923-662667859-main.jpg	\N		6	1	1	27	t	2026-01-01 15:49:12.124	2026-02-06 15:42:03.754	72	3	Non definito
97	Storia della politica internazionale	Alessandro Duce	2013	uploads/copertine/1771867622053-337966215-main.jpg	\N	\N	9	999	34	59	t	2026-02-23 17:27:11.802	2026-02-23 17:27:11.802	84	0	Non definito
61	Programmare con Python. Guida completa	Marco Buttu	2014	uploads/copertine/1768234548003-984670564-main.jpg	uploads/copertine/1768234548003-984670564-thumb.jpg	Descrizione..	6	999	1	27	t	2026-01-01 15:55:37.838	2026-02-23 17:31:01.078	41	32	Non definito
34	La persecuzione delle sorelle Mansfield	Xenobe Purvis	\N	uploads/copertine/1765634418507-675500021-main.jpg	\N	A Little Nettlebed si raccontano molte storie sulle sorelle Mansfield: che sono arroganti, bugiarde, indisciplinate. Ciascun abitante del piccolo villaggio ha da dire la propria sul loro conto, ma su una cosa tutti concordano: le ragazze sono strane, e, quindi, pericolose. Con l'arrivo di una delle estati più torride di sempre, poi, comincia a verificarsi una serie di eventi singolari: un enorme pesce argentato - o forse un mostro di fiume - si arena sulla riva del Tamigi, gli animali si fanno frenetici, gruppi di corvi si radunano sui tetti delle case, e qualcuno giura di aver visto le cinque sorelle trasformarsi in un branco di cani e latrare nella notte. I sospetti viaggiano in fretta di bocca in bocca, portando a galla paure, pregiudizi e anche un pizzico d'invidia. Cosa nascondono le ragazze Mansfield? Qual è la loro vera natura? Che le voci siano fondate o meno, a Little Nettlebed sta accadendo qualcosa di innaturale, e, come sempre capita in questi casi, serve un capro espiatorio. Un romanzo d'esordio magnetico e dalle atmosfere avvolgenti, che si muove sulla soglia tra allegoria, realismo magico e un'acuta critica sociale. Purvis trascina il lettore nell'Oxfordshire del XVIII secolo e lo spinge simultaneamente verso riflessioni senza tempo sul rapporto tra maldicenza e verità, sulla diffidenza nei confronti di ciò che è diverso e su cosa voglia dire essere una giovane donna fuori dagli schemi.	12	999	10	13	t	2025-12-13 14:02:19.186229	2025-12-13 14:02:19.186229	57	0	Non definito
41	Per antiche strade. Un viaggio nella storia d'Europa	Mathijs Deen	2020	uploads/copertine/1765635083388-493442582-main.jpg	\N	\N	9	999	12	17	t	2025-12-13 14:14:27.421044	2025-12-13 14:14:27.421044	64	0	Non definito
42	Leggendari viaggi on the road in Europa. 200 emozionanti viaggi su strada	Sconosciuto	2023	uploads/copertine/1765635100292-105997994-main.jpg	\N	\N	8	999	12	17	t	2025-12-13 14:14:27.421044	2026-02-23 23:20:00.59	65	1	Non definito
43	Letteratura italiana di viaggio. Percorsi critici dal Medioevo al Seicento	Stefano Scioli	2024	uploads/copertine/1765635173786-628899666-main.jpg	\N	\N	21	999	12	18	t	2025-12-13 14:14:29.845776	2026-02-25 09:53:29.84	66	3	Non definito
44	Scrivendo sulla strada. Diari di viaggio e di letteratura	Lawrence Ferlinghetti	2017	uploads/copertine/1772091036241-910572673-main.jpg	uploads/copertine/1772091036241-910572673-thumb.jpg	\N	22	999	12	18	t	2025-12-13 14:14:29.845776	2026-02-26 07:30:37.07	67	1	Non definito
90	Letteratura italiana di viaggio. Percorsi critici dal Medioevo al Seicento	Stefano Scioli	2024	uploads/copertine/1765635173786-628899666-main.jpg	\N	test descrizione	21	999	10	14	t	2026-02-23 17:08:15.257	2026-02-26 07:32:46.865	66	1	Non definito
85	Memorie di terra e d'acqua. Note di storia e cultura del Veneto	Ugo Spezia	2017	uploads/copertine/1771865372302-590696613-main.jpg	\N		9	999	33	58	t	2026-02-23 17:01:44.911	2026-02-23 17:01:44.911	17	0	Non definito
76	Elementi Di Matematica Discreta	Giuseppe Lancia	2018	uploads/copertine/1771864657312-78498690-main.jpg	uploads/copertine/1771864657312-78498690-thumb.jpg	Il testo contiene materiale per un corso introduttivo agli argomenti della matematica discreta per studenti di discipline scientifiche quali informatica e ingegneria. Dopo una parte preliminare dedicata a concetti elementari di teoria degli insiemi, logica, funzioni, relazioni ed equivalenze, sommatorie, vengono trattati argomenti introduttivi alla teoria dei numeri e allo studio dei numeri primi. La parte centrale del testo è dedicata al calcolo combinatorio con particolare enfasi all'utilizzo …	14	1	32	56	t	2026-02-23 16:36:30.603	2026-02-23 16:37:47.878	42	0	Non definito
75	Manuale di elettronica e telecomunicazioni	Giuseppe Biondo, Enrico Sacchi	1996	uploads/copertine/1765628029887-688991892-main.jpg	\N	\N	4	1	32	56	t	2026-02-23 16:35:41.321	2026-02-23 16:37:59.028	39	0	Non definito
77	C++ Fondamenti di programmazione	Harvey M. Deitel, Paul J. Deitel	2001	uploads/copertine/1765628090190-183543368-main.jpg	\N	\N	6	999	32	56	t	2026-02-23 16:38:33.368	2026-02-23 16:38:33.368	40	0	Non definito
78	Deviant. Eclissi di Marte	Ellie B. Luin	2023	uploads/copertine/1765633600458-355601857-main.jpg	\N	\N	12	999	32	55	t	2026-02-23 16:39:13.015	2026-02-23 16:39:13.015	52	0	Non definito
80	Anatomia umana. Atlante	Giuseppe Anastasi, Eugenio Gaudio, Carlo Tacchetti	2019	uploads/copertine/1765625157029-918945306-main.jpg	\N	\N	7	999	33	57	t	2026-02-23 16:58:38.978	2026-02-23 16:58:38.978	13	0	Non definito
81	Harrison. Principi di medicina interna	Dennis L. Kasper, Anthony S. Fauci, Dan L. Longo	2016	uploads/copertine/1765625094506-905372637-main.jpg	\N	\N	7	999	33	57	t	2026-02-23 16:58:49.152	2026-02-23 16:58:49.152	11	0	Non definito
82	Fisiologia medica	Arthur C. Guyton, John E. Hall	2021	uploads/copertine/1765625138009-993897923-main.jpg	\N	\N	7	999	33	57	t	2026-02-23 16:59:06.429	2026-02-23 16:59:06.429	12	0	Non definito
83	Folklore e magia popolare del Veneto. Rituali, superstizioni e antica stregoneria	Elena Righetto	2022	uploads/copertine/1771865415853-975514041-main.jpg	\N		3	999	33	58	t	2026-02-23 17:01:14.428	2026-02-23 17:01:14.428	14	0	Non definito
84	Storia del Veneto dalle origini ai giorni nostri	Francesco Jori	2018	uploads/copertine/1765625331790-833669116-main.jpg	\N	\N	9	999	33	58	t	2026-02-23 17:01:29.449	2026-02-23 17:01:29.449	19	0	Non definito
86	Veneti. Ricettario della memoria	Francesco Jori	\N	uploads/copertine/1765625367476-816373061-main.jpg	\N	\N	3	999	33	58	t	2026-02-23 17:01:56.376	2026-02-23 17:01:56.376	20	0	Non definito
87	Guerra e pace	Lev Tolstoj	2017	uploads/copertine/1765627710332-137463846-main.jpg	\N	\N	12	999	10	14	t	2026-02-23 17:07:08.171	2026-02-23 17:07:08.171	31	0	Non definito
88	I promessi sposi	Alessandro Manzoni	2010	uploads/copertine/1765630473024-512151209-main.jpg	\N	A cura di Ferruccio Ulivi Edizione integrale La storia di Renzo e Lucia, don Abbondio e padre Cristoforo, don Rodrigo e l’Innominato ha appassionato generazioni di lettori e occupa ancora oggi un posto del tutto speciale nelle biblioteche degli italiani. «Storia milanese del XVII secolo scoperta e rifatta da Alessandro Manzoni» era il sottotitolo con cui l’autore presentava I promessi sposi, uno dei capolavori della nostra letteratura, affresco storico e romanzo in cui si fondono mirabilmente immagini forti e poetiche, pietas per un’umanità ingenua e dolente, ironia. Questa edizione si avvale di un’ampia premessa e di un rigoroso corredo di note, utilissimi strumenti per comprendere pienamente i molteplici livelli e aspetti della narrazione. – Carneade! Chi era costui? – ruminava tra sé don Abbondio seduto sul suo seggiolone, in una stanza del piano superiore, con un libricciolo aperto davanti, quando Perpetua entrò a portargli l’imbasciata. «Carneade! questo nome mi par bene d’averlo letto o sentito; doveva essere un uomo di studio, un letteratone del tempo antico: è un nome di quelli; ma chi diavolo era costui?» Alessandro Manzoni nacque a Milano nel 1785. Sua madre era Giulia Beccaria, figlia del celebre Cesare. Considerato tra i massimi scrittori della nostra letteratura, fu autore di opere etico-religiose, storiche, poetiche. Morì a Milano nel 1873. La Newton Compton ha pubblicato I promessi sposi, La monaca di Monza e Storia della colonna infame. A cura di Ferruccio Ulivi scrittore e narratore, ha pubblicato numerosi saggi critici sulla nostra letteratura e ha insegnato nelle Università di Bari, Perugia e Roma. Ha curato per la Newton Compton, con Marta Savini, l’Iliade e l’Odissea.	12	999	10	14	t	2026-02-23 17:07:18.745	2026-02-23 17:07:18.745	47	0	Non definito
89	La coscienza di Zeno. Ediz. integrale	Italo Svevo	2014	uploads/copertine/1765630282147-375554406-main.jpg	\N	Op verzoek van zijn psychiater maakt een oudere man een verslag van zijn strijd tegen slechte gewoontes als roken.	12	999	10	14	t	2026-02-23 17:07:47.822	2026-02-23 17:07:47.822	46	0	Non definito
91	Sottobosco	Sara Strömberg	2025	uploads/copertine/1765633192749-524227336-main.jpg	\N	L’esordio crime che ha conquistato la Svezia: il primo volume di una serie con una protagonista ineguagliabile. Vera Bergström è un’ex giornalista cinquantenne in piena crisi di mezza età. Dopo trent’anni di lavoro al «Jämtlandsposten» e una lunga convivenza con il compagno Levan, si ritrova di punto in bianco senza più certezze, licenziata dal giornale in seguito alla crisi della carta stampata e lasciata dal partner per una ragazza più giovane. Costretta a reinventarsi una vita, torna nella sua regione natia nel Nordovest della Svezia cercando faticosamente di riconquistare un equilibrio. Il ritrovamento del cadavere di una donna brutalmente assassinata in una radura nelle foreste circostanti la riporta sul terreno che predilige: quello del giornalismo d’inchiesta. Contattata dal suo ex caporedattore, viene incaricata di seguire il caso per conto della sua vecchia testata. Ben presto Vera si accorge che le dinamiche del delitto non sono chiare come vorrebbe la polizia. Intraprende così un’indagine parallela alla ricerca della vera identità della vittima e del possibile movente dell’assassino: scoprirà quanto sconfinati e oscuri possono diventare i luoghi che pensiamo di conoscere da sempre. Con una scrittura fluida e coinvolgente, Sara Strömberg riesce a creare un perfetto equilibrio tra realismo, crudezza, lirismo e ironia. Sottobosco è un grande affresco della Svezia contemporanea nel solco della migliore tradizione del noir scandinavo, e Vera Bergström, sfolgorante eroina hard-boiled, è una protagonista indimenticabile che, con il suo cinismo e il suo disincanto, riempie tutta la scena. «Qui avevo giocato ed ero cresciuta. In mezzo all’odore di palude e muschio. Il mio corpo se ne ricordava. Portava i segni del sottobosco e della sterpaglia. Agognava sempre il calore, ma quando restavo al caldo troppo a lungo voleva tornare a casa per poter davvero respirare. Qui si era molto distanti dalle sparatorie della grande città, dalle esplosioni e dalla criminalità del	12	999	10	13	t	2026-02-23 17:11:27.685	2026-02-23 17:11:27.685	48	0	Non definito
95	La monarchia della paura. Considerazioni sulla crisi politica attuale	Martha C. Nussbaum	2020	uploads/copertine/1765634080510-431239028-main.jpg	\N	\N	17	999	34	59	t	2026-02-23 17:24:52.539	2026-02-23 17:24:52.539	56	0	Non definito
96	Filosofia classica tedesca: le parole chiave	L. Illetterati, P. Giuspoli	2020	uploads/copertine/1765633956299-401689774-main.jpg	\N	\N	17	999	34	59	t	2026-02-23 17:25:17.617	2026-02-23 17:25:17.617	54	0	Non definito
92	Verso la notte	Håkan Nesser	2025	uploads/copertine/1765633416950-507192738-main.jpg	\N	\N	12	999	10	13	t	2026-02-23 17:11:40.751	2026-02-23 19:12:42.116	49	1	Non definito
79	Watchmen: DC Compact Comics Edition	Alan Moore	2024	uploads/copertine/1765627568485-787755631-main.jpg	\N	Graphic novels to read anywhere: DC Compact Comics collect DC s bestselling, most iconic stories in a new size![Bokinfo].	11	999	32	55	t	2026-02-23 16:39:30.958	2026-02-24 00:53:36.279	28	1	Non definito
94	Storia della filosofia occidentale	G. Cambiano, L. Fonnesu, M. Mori	2014	uploads/copertine/1765633923559-189404108-main.jpg	\N	\N	17	999	34	59	t	2026-02-23 17:24:39.721	2026-02-24 00:58:43.389	53	1	Non definito
93	Il bambino segreto	Camilla Läckberg	2013	uploads/copertine/1765633464777-466047868-main.jpg	\N	La quinta indagine di Erica Falck e Patrik Hedström. Nella soffitta di casa, in un baule dove la madre Elsy conservava i suoi oggetti più cari, Erica trova alcuni diari e una medaglia dell'epoca nazista avvolta in un camicino da neonato macchiato di sangue. Incuriosita, decide di rivolgersi a un vecchio professore di storia in pensione. Ma le risposte che riceve sono vaghe e, due giorni dopo, il professore viene assassinato. Mentre le pagine del diario di Elsy gettano luce su un passato drammatico, Erica cerca di capire chi è ancora disposto a tutto pur di tenere segreti eventi tanto lontani, anche a uccidere. "Il migliore della serie. Camilla Lackberg dà prova di grande maestria" (Le Nouvel Observateur)	12	999	10	13	t	2026-02-23 17:12:14.023	2026-02-26 07:30:01.726	50	3	Non definito
\.


--
-- Data for Name: libri_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.libri_master (id, titolo, autore, anno, isbn, descrizione, copertina, copertina_thumb, genere_id, data_creazione, data_aggiornamento) FROM stdin;
70	Succede sempre qualcosa di meraviglioso	Gianluca Gotto	2021	978-88-04-72904-4	\N	uploads/copertine/1767027974900-10106222-main.jpg	uploads/copertine/1767027974900-10106222-thumb.jpg	12	2025-12-29 17:06:15.058	2025-12-29 17:06:15.058
71	1984	George Orwell	2021	978-88-07-90381-6	\N	uploads/copertine/1767125248457-830332742-main.jpg	uploads/copertine/1767125248457-830332742-thumb.jpg	12	2025-12-30 20:07:28.557	2025-12-30 20:07:28.557
73	La ragazza della neve	Pam Jenoff	2019	978-88-227-2025-2	\N	uploads/copertine/1768055450965-449818314-main.jpg	uploads/copertine/1768055450965-449818314-thumb.jpg	12	2026-01-10 14:30:51.023	2026-01-10 14:30:51.023
58	Gusto. Guida infografica all'esplorazione di ingredienti e cibi delle cucine del mondo	Laura Rowe	2019	978-88-276-0070-2		uploads/copertine/1767722983672-325637246-main.jpg	uploads/copertine/1767722983672-325637246-thumb.jpg	19	2025-12-13 14:01:35.615	2026-02-03 18:00:38.642
76	Codice Ratzinger	Andrea Cionci	2022	979-12-80657-11-4	\N	uploads/copertine/1770152758189-595642213-main.jpg	uploads/copertine/1770152758189-595642213-thumb.jpg	24	2026-02-03 21:05:58.244	2026-02-03 21:05:58.244
81	How To English	Adam David Broughton	2019	978-1-0764-0806-8	Teachers are obsessed with telling you what to learn. The problem is, nobody teaches you how to learn. This is all about to change. In his new book, How To English, Adam David Broughton shares a revolutionary and powerful system that teaches you exactly how to make incredible progress in all aspects of English. In How To English, you will learn 62 practical techniques to become an independent learner in 31 days, and everything you will ever need to get the level you've always wanted in English and enjoy the process. How to master English fluency How to listen perfectly in English How to stop making mistakes in English How to improve your pronunciation How to expand your vocabulary in English How to have perfect English grammar How to stay motivated, be disciplined and create a habit ...and 55 other amazing techniques. Everyone knows that it's not what you do in class that determines your progress in English, it's what you do when you are not in class. However, English learners often don't know what to do. As a result, at some point, every English learner stops making progress. Then they get frustrated. How To English is the antidote to this frustration. When you learn how to learn English, you never need to worry about what you learn in English.	uploads/copertine/1770930969415-979306931-main.jpg	uploads/copertine/1770930969415-979306931-thumb.jpg	1	2026-02-12 21:16:09.439	2026-02-12 21:16:09.439
72	Computer Networks	Andrew Tanenbaum, Nick Feamster, David Wetherall	2021	978-1-292-37406-2		uploads/copertine/1767282090923-662667859-main.jpg	uploads/copertine/1767282090923-662667859-thumb.jpg	6	2026-01-01 15:41:31.167	2026-01-01 15:44:18.003
74	Il profumo delle foglie di tè	Dinah Jefferie	2020	978-88-227-3213-2		uploads/copertine/1768060195024-350354559-main.jpg	uploads/copertine/1768060195024-350354559-thumb.jpg	12	2026-01-10 15:49:55.108	2026-01-10 15:58:53.534
77	Nel nido dei serpenti	Zerocalcare	2025	979-12-5621-243-9	\N	uploads/copertine/1770153199957-76885300-main.jpg	uploads/copertine/1770153199957-76885300-thumb.jpg	11	2026-02-03 21:13:19.997	2026-02-03 21:13:19.997
79	Prime Persone	Erri De Luca	2025	978-88-07-03686-6	\N	uploads/copertine/1770153472997-200100091-main.jpg	uploads/copertine/1770153472997-200100091-thumb.jpg	12	2026-02-03 21:17:53.021	2026-02-03 21:17:53.021
82	I nuovi sovrani del nostro tempo. Amazon, Google, Facebook	Jonathan Taplin	2018	978-88-9319-848-6	\N	uploads/copertine/1770934248762-102210667-main.jpg	uploads/copertine/1770934248762-102210667-thumb.jpg	25	2026-02-12 22:10:48.855	2026-02-12 22:10:48.855
49	Verso la notte	Håkan Nesser	2025	978-88-235-3522-0	\N	uploads/copertine/1765633416950-507192738-main.jpg	uploads/copertine/1765633416950-507192738-thumb.jpg	12	2025-12-13 13:43:36.998	2025-12-13 13:43:36.998
9	Modern Physics for Scientists and Engineers	Stephen Thornton, Andrew Rex	2020	978-1-337-91945-6	Learn how your life connects to the latest discoveries in physics with MODERN PHYSICS FOR SCIENTISTS AND ENGINEERS. This updated fifth edition offers a contemporary, comprehensive approach with a strong emphasis on applications to help you see how concepts in the book relate to the real world. Discussions on the experiments that led to key discoveries illustrate the process behind scientific advances and give you a historical perspective. Included is a thorough treatment of special relativity, an introduction to general relativity, and a solid foundation in quantum theory to help you succeed. An updated WebAssign course features a mobile-friendly ebook and a variety of assignable questions to enhance your learning experience. WebAssign for MODERN PHYSICS FOR SCIENTISTS AND ENGINEERS helps you prepare for class with confidence. Its online learning platform helps you unlearn common misconceptions, practice and absorb what you learn and begin your path as a future physicist or engineer. Tutorials walk you through concepts when you're stuck, and instant feedback and grading let you know where you stand--so you can focus your study time and perform better on in-class assignments and prepare for exams. Study smarter with WebAssign!	uploads/copertine/1765625024418-793308592-main.jpg	uploads/copertine/1765625024418-793308592-thumb.jpg	5	2025-12-13 11:23:44.473	2025-12-13 11:23:44.473
10	C++. Fondamenti di programmazione	Harvey M. Deitel, Paul J. Deitel	2014	978-88-387-8571-9	\N	uploads/copertine/1765625045298-45310893-main.jpg	uploads/copertine/1765625045298-45310893-thumb.jpg	6	2025-12-13 11:24:05.346	2025-12-13 11:24:05.346
34	L'uomo che piantava gli alberi	Jean Giono, Peppo Bianchessi	2016	978-88-6918-731-5	\N	uploads/copertine/1765627841039-862257467-main.jpg	uploads/copertine/1765627841039-862257467-thumb.jpg	1	2025-12-13 12:10:41.077	2025-12-13 12:10:41.077
35	American Gods	Neil Gaiman	2022	978-88-04-74530-3	\N	uploads/copertine/1765627876212-464261800-main.jpg	uploads/copertine/1765627876212-464261800-thumb.jpg	12	2025-12-13 12:11:16.251	2025-12-13 12:11:16.251
36	Il trono di spade. Un gioco di troni	George R. R. Martin, Daniel Abraham	2019	978-88-04-71394-4	\N	uploads/copertine/1765627901936-57795482-main.jpg	uploads/copertine/1765627901936-57795482-thumb.jpg	11	2025-12-13 12:11:41.98	2025-12-13 12:11:41.98
6	I, Robot	Айзек Азимов	2009	978-5-94962-153-0		uploads/copertine/1771865132109-886838976-main.jpg	uploads/copertine/1771865132109-886838976-thumb.jpg	1	2025-12-13 11:22:20.461	2026-02-23 16:45:32.436
7	Storia dell'arte italiana. Il Rinascimento. Per le Scuole superiori	Giulio Carlo Argan	2008	978-88-383-0748-5		uploads/copertine/1771865309521-548281685-main.webp	uploads/copertine/1771865309521-548281685-thumb.webp	2	2025-12-13 11:23:04.185	2026-02-23 16:48:29.712
22	Storia dell'arte italiana. Dal manierismo al neoclassicismo. Per le Scuole superiori	Giulio Carlo Argan	2008	978-88-383-0751-5		uploads/copertine/1771865184375-306340295-main.jpg	uploads/copertine/1771865184375-306340295-thumb.jpg	9	2025-12-13 11:31:01.242	2026-02-23 16:46:36.874
17	Memorie di terra e d'acqua. Note di storia e cultura del Veneto	Ugo Spezia	2017	978-88-87731-64-4		uploads/copertine/1771865372302-590696613-main.jpg	uploads/copertine/1771865372302-590696613-thumb.jpg	9	2025-12-13 11:28:02.883	2026-02-23 16:49:32.42
8	Meccanica Analitica	Valter Moretti	2024	978-3-031-63112-2	Il testo parte da una rivisitazione teorica della meccanica classica newtoniana e del suo linguaggio matematico che si conclude con un'analisi critica della meccanica classica newtoniana. Si passa quindi alle formulazioni lagrangiane e hamiltoniane della meccanica classica, discutendo in particolare il rapporto tra simmetrie e costanti del moto all'interno di varie versioni del teorema di Noether e analoghi risultati. I capitoli sulla meccanica hamiltoniana, oltre al materiale standard come le parentesi di Poisson, la geometria simplettica, la formulazione di Hamilton-Jacobi e principi variazionali, includono alcuni risultati teorici importanti come il teorema di Liouville e il teorema di ricorrenza di Poincaré. La teoria della stabilità è introdotta e discussa nell'approccio di Lyapunov. Nella seconda edizione è stata aggiunta una descrizione matematica della teoria della relatività speciale e di alcuni suoi sviluppi nell'ambito della formulazione lagrangiana ed hamiltoniana. Il linguaggio adottato in tutto il testo è quello della geometria differenziale, che in ogni caso viene introdotta gradualmente. Un primo complemento finale discute gli assiomi fisici su cui si basa la teoria della relatività speciale e come si passa da tali assiomi alla formulazione matematica. Un secondo complemento include la teoria di base dei sistemi di equazioni differenziali ordinarie e dei sistemi con alcune generalizzazioni alla teoria sulle varietà. Diverse appendici introducono alcuni strumenti matematici come la teoria delle forme differenziali, la derivata di Lie e la teoria dell'integrazione su varietà. Il libro include diversi esercizi risolti. Il libro si rivolge agli studenti di Matematica e Fisica per i corsi di Meccanica Razionale e Meccanica Analitica.	uploads/copertine/1765625002851-575114432-main.jpg	uploads/copertine/1765625002851-575114432-thumb.jpg	4	2025-12-13 11:23:22.887	2025-12-13 11:23:22.887
11	Harrison. Principi di medicina interna	Dennis L. Kasper, Anthony S. Fauci, Dan L. Longo	2016	978-88-08-18538-9	\N	uploads/copertine/1765625094506-905372637-main.jpg	uploads/copertine/1765625094506-905372637-thumb.jpg	7	2025-12-13 11:24:54.542	2025-12-13 11:24:54.542
12	Fisiologia medica	Arthur C. Guyton, John E. Hall	2021	978-88-214-5541-4	\N	uploads/copertine/1765625138009-993897923-main.jpg	uploads/copertine/1765625138009-993897923-thumb.jpg	7	2025-12-13 11:25:38.057	2025-12-13 11:25:38.057
13	Anatomia umana. Atlante	Giuseppe Anastasi, Eugenio Gaudio, Carlo Tacchetti	2019	978-88-7051-458-2	\N	uploads/copertine/1765625157029-918945306-main.jpg	uploads/copertine/1765625157029-918945306-thumb.jpg	7	2025-12-13 11:25:57.062	2025-12-13 11:25:57.062
15	Veneto. Storytelling turistico e identità storica	Beniamino D'Errico	2024	978-88-3359-740-9	\N	uploads/copertine/1765625216361-488987508-main.jpg	uploads/copertine/1765625216361-488987508-thumb.jpg	8	2025-12-13 11:26:56.402	2025-12-13 11:26:56.402
16	Venezia. Una storia di mare e di terra	Alessandro Marzo Magno	2022	978-88-581-4542-5	\N	uploads/copertine/1765625236591-137553370-main.jpg	uploads/copertine/1765625236591-137553370-thumb.jpg	9	2025-12-13 11:27:16.626	2025-12-13 11:27:16.626
18	Manuale di cultura veneta	Manlio Cortelazzo	2004	978-88-317-8475-7	\N	uploads/copertine/1765625310775-615388961-main.jpg	uploads/copertine/1765625310775-615388961-thumb.jpg	3	2025-12-13 11:28:30.814	2025-12-13 11:28:30.814
19	Storia del Veneto dalle origini ai giorni nostri	Francesco Jori	2018	978-88-6391-289-0	\N	uploads/copertine/1765625331790-833669116-main.jpg	uploads/copertine/1765625331790-833669116-thumb.jpg	9	2025-12-13 11:28:51.825	2025-12-13 11:28:51.825
20	Veneti. Ricettario della memoria	Francesco Jori	\N	978-88-6391-361-3	\N	uploads/copertine/1765625367476-816373061-main.jpg	uploads/copertine/1765625367476-816373061-thumb.jpg	3	2025-12-13 11:29:27.515	2025-12-13 11:29:27.515
21	Storia dell'arte italiana. Antichità e Medioevo. Con DVD	Giulio C. Argan	2008	978-88-383-0783-6	\N	uploads/copertine/1765625437354-922777284-main.jpg	uploads/copertine/1765625437354-922777284-thumb.jpg	2	2025-12-13 11:30:37.389	2025-12-13 11:30:37.389
23	Poesie. Testo inglese a fronte	Emily Dickinson	2023	978-88-04-77665-9	\N	uploads/copertine/1765627349841-407676736-main.jpg	uploads/copertine/1765627349841-407676736-thumb.jpg	10	2025-12-13 12:02:29.871	2025-12-13 12:02:29.871
24	Nella mente di Sherlock Holmes. Il caso del biglietto misterioso	Cyril Liéron, Benoit Dahan	2023	978-88-04-77775-5	\N	uploads/copertine/1765627406269-167317233-main.jpg	uploads/copertine/1765627406269-167317233-thumb.jpg	11	2025-12-13 12:03:26.306	2025-12-13 12:03:26.306
25	Non lasciarmi	Kazuo Ishiguro	2016	978-88-06-23177-4	\N	uploads/copertine/1765627447117-587504009-main.jpg	uploads/copertine/1765627447117-587504009-thumb.jpg	12	2025-12-13 12:04:07.142	2025-12-13 12:04:07.142
26	La ragazza che giocava con il fuoco. Millennium	Stieg Larsson	2018	978-88-317-4336-5	\N	uploads/copertine/1765627471824-949827588-main.jpg	uploads/copertine/1765627471824-949827588-thumb.jpg	12	2025-12-13 12:04:31.862	2025-12-13 12:04:31.862
27	Sandman	Neil Gaiman	2025	979-12-219-1655-3	\N	uploads/copertine/1765627510030-46347788-main.jpg	uploads/copertine/1765627510030-46347788-thumb.jpg	11	2025-12-13 12:05:10.074	2025-12-13 12:05:10.074
28	Watchmen: DC Compact Comics Edition	Alan Moore	2024	978-1-77952-732-5	Graphic novels to read anywhere: DC Compact Comics collect DC s bestselling, most iconic stories in a new size![Bokinfo].	uploads/copertine/1765627568485-787755631-main.jpg	uploads/copertine/1765627568485-787755631-thumb.jpg	11	2025-12-13 12:06:08.522	2025-12-13 12:06:08.522
29	Storia d'Italia. Il cammino tormentato di una nazione 1861-2016	Massimo L. Salvadori	2018	978-88-06-23226-9	\N	uploads/copertine/1765627609125-882153646-main.jpg	uploads/copertine/1765627609125-882153646-thumb.jpg	9	2025-12-13 12:06:49.158	2025-12-13 12:06:49.158
65	Leggendari viaggi on the road in Europa. 200 emozionanti viaggi su strada	Sconosciuto	2023	978-88-592-8865-7	\N	uploads/copertine/1765635100292-105997994-main.jpg	uploads/copertine/1765635100292-105997994-thumb.jpg	8	2025-12-13 14:11:40.478	2025-12-13 14:11:40.478
30	La Caduta di Costantinopoli: Le testimonianze dei contemporanei	Agostino Pertusi	1976	978-88-04-13431-2	"Il secondo volume di quest'opera riunisce gli scritti di quanti commentarono la tragica fine di Bisanzio. La prima parte del volume raccoglie le discordanti interpretazioni che Oriente e Occidente diedero del trionfo di Maometto II; la seconda i lamenti in prosa e in poesia che la scomparsa di Bisanzio ispirò ai poeti greci, veneti, francesi, tedeschi, slavi, armeni, e ai poeti popolari della Grecia e del Ponto." -- Vol. II., from publisher's website.	uploads/copertine/1765627658010-569761720-main.jpg	uploads/copertine/1765627658010-569761720-thumb.jpg	9	2025-12-13 12:07:38.048	2025-12-13 12:07:38.048
31	Guerra e pace	Lev Tolstoj	2017	978-88-04-68259-2	\N	uploads/copertine/1765627710332-137463846-main.jpg	uploads/copertine/1765627710332-137463846-thumb.jpg	12	2025-12-13 12:08:30.376	2025-12-13 12:08:30.376
32	Il ritratto di Dorian Gray. Ediz. illustrata	Oscar Wilde	2024	978-88-6722-870-6	\N	uploads/copertine/1765627742306-832595396-main.jpg	uploads/copertine/1765627742306-832595396-thumb.jpg	13	2025-12-13 12:09:02.354	2025-12-13 12:09:02.354
33	Delitto e castigo. Ediz. integrale	Fëdor Dostoevskij	2019	978-88-6311-409-6	\N	uploads/copertine/1765627808477-917058362-main.jpg	uploads/copertine/1765627808477-917058362-thumb.jpg	12	2025-12-13 12:10:08.521	2025-12-13 12:10:08.521
37	Il trono di spade. Libro primo delle Cronache del ghiaccio e del fuoco	George R. R. Martin, Daniel Abraham, Tommy Patterson	2019	978-88-04-70755-4	\N	uploads/copertine/1765627941425-589073053-main.jpg	uploads/copertine/1765627941425-589073053-thumb.jpg	11	2025-12-13 12:12:21.487	2025-12-13 12:12:21.487
38	Lo Hobbit	John Ronald Reuel Tolkien	2012	978-88-452-6834-2	\N	uploads/copertine/1765627985797-751585882-main.jpg	uploads/copertine/1765627985797-751585882-thumb.jpg	12	2025-12-13 12:13:05.828	2025-12-13 12:13:05.828
39	Manuale di elettronica e telecomunicazioni	Giuseppe Biondo, Enrico Sacchi	1996	978-88-203-2254-0	\N	uploads/copertine/1765628029887-688991892-main.jpg	uploads/copertine/1765628029887-688991892-thumb.jpg	4	2025-12-13 12:13:49.93	2025-12-13 12:13:49.93
40	C++ Fondamenti di programmazione	Harvey M. Deitel, Paul J. Deitel	2001	978-88-7303-670-8	\N	uploads/copertine/1765628090190-183543368-main.jpg	uploads/copertine/1765628090190-183543368-thumb.jpg	6	2025-12-13 12:14:50.232	2025-12-13 12:14:50.232
43	Il museo dei numeri. Da zero verso l'infinito, storie dal mondo della matematica	Piergiorgio Odifreddi	2014	978-88-17-07611-1	\N	uploads/copertine/1765628268254-251057801-main.jpg	uploads/copertine/1765628268254-251057801-thumb.jpg	14	2025-12-13 12:17:48.282	2025-12-13 12:17:48.282
44	Voglio correre. Allenamento e alimentazione: come diventare più veloci, più resistenti, più magri	Enrico Arcelli	2019	978-88-6836-513-4	\N	uploads/copertine/1765628312401-540909033-main.jpg	uploads/copertine/1765628312401-540909033-thumb.jpg	15	2025-12-13 12:18:32.438	2025-12-13 12:18:32.438
45	I genitori perfetti non esistono. Mindfulness per mamme e papà liberi dall'ansia e per bambini felici	Valentina Giordano	2018	978-88-200-6482-2	\N	uploads/copertine/1765628363251-344071337-main.jpg	uploads/copertine/1765628363251-344071337-thumb.jpg	16	2025-12-13 12:19:23.481	2025-12-13 12:19:23.481
46	La coscienza di Zeno. Ediz. integrale	Italo Svevo	2014	978-88-541-6547-2	Op verzoek van zijn psychiater maakt een oudere man een verslag van zijn strijd tegen slechte gewoontes als roken.	uploads/copertine/1765630282147-375554406-main.jpg	uploads/copertine/1765630282147-375554406-thumb.jpg	12	2025-12-13 12:51:22.185	2025-12-13 12:51:22.185
68	Fusione nucleare. Mito o realtà? Una svolta possibile per una nuova energia	Simone Baroni	2023	978-88-360-1400-2	\N	uploads/copertine/1766870649538-728307258-main.jpg	uploads/copertine/1766870649538-728307258-thumb.jpg	23	2025-12-27 21:24:09.757	2025-12-27 21:24:09.757
69	La teoria del tutto. Origine e destino dell'universo	Stephen Hawking	2015	978-88-17-07976-1	\N	uploads/copertine/1766870801930-214750071-main.jpg	uploads/copertine/1766870801930-214750071-thumb.jpg	23	2025-12-27 21:26:42.141	2025-12-27 21:26:42.141
66	Letteratura italiana di viaggio. Percorsi critici dal Medioevo al Seicento	Stefano Scioli	2024	978-88-555-3605-9	test descrizione	uploads/copertine/1765635173786-628899666-main.jpg	uploads/copertine/1765635173786-628899666-thumb.jpg	21	2025-12-13 14:12:54.117	2026-02-03 19:29:52.326
47	I promessi sposi	Alessandro Manzoni	2010	978-88-541-2598-8	A cura di Ferruccio Ulivi Edizione integrale La storia di Renzo e Lucia, don Abbondio e padre Cristoforo, don Rodrigo e l’Innominato ha appassionato generazioni di lettori e occupa ancora oggi un posto del tutto speciale nelle biblioteche degli italiani. «Storia milanese del XVII secolo scoperta e rifatta da Alessandro Manzoni» era il sottotitolo con cui l’autore presentava I promessi sposi, uno dei capolavori della nostra letteratura, affresco storico e romanzo in cui si fondono mirabilmente immagini forti e poetiche, pietas per un’umanità ingenua e dolente, ironia. Questa edizione si avvale di un’ampia premessa e di un rigoroso corredo di note, utilissimi strumenti per comprendere pienamente i molteplici livelli e aspetti della narrazione. – Carneade! Chi era costui? – ruminava tra sé don Abbondio seduto sul suo seggiolone, in una stanza del piano superiore, con un libricciolo aperto davanti, quando Perpetua entrò a portargli l’imbasciata. «Carneade! questo nome mi par bene d’averlo letto o sentito; doveva essere un uomo di studio, un letteratone del tempo antico: è un nome di quelli; ma chi diavolo era costui?» Alessandro Manzoni nacque a Milano nel 1785. Sua madre era Giulia Beccaria, figlia del celebre Cesare. Considerato tra i massimi scrittori della nostra letteratura, fu autore di opere etico-religiose, storiche, poetiche. Morì a Milano nel 1873. La Newton Compton ha pubblicato I promessi sposi, La monaca di Monza e Storia della colonna infame. A cura di Ferruccio Ulivi scrittore e narratore, ha pubblicato numerosi saggi critici sulla nostra letteratura e ha insegnato nelle Università di Bari, Perugia e Roma. Ha curato per la Newton Compton, con Marta Savini, l’Iliade e l’Odissea.	uploads/copertine/1765630473024-512151209-main.jpg	uploads/copertine/1765630473024-512151209-thumb.jpg	12	2025-12-13 12:54:33.054	2025-12-13 12:54:33.054
48	Sottobosco	Sara Strömberg	2025	979-12-5967-833-1	L’esordio crime che ha conquistato la Svezia: il primo volume di una serie con una protagonista ineguagliabile. Vera Bergström è un’ex giornalista cinquantenne in piena crisi di mezza età. Dopo trent’anni di lavoro al «Jämtlandsposten» e una lunga convivenza con il compagno Levan, si ritrova di punto in bianco senza più certezze, licenziata dal giornale in seguito alla crisi della carta stampata e lasciata dal partner per una ragazza più giovane. Costretta a reinventarsi una vita, torna nella sua regione natia nel Nordovest della Svezia cercando faticosamente di riconquistare un equilibrio. Il ritrovamento del cadavere di una donna brutalmente assassinata in una radura nelle foreste circostanti la riporta sul terreno che predilige: quello del giornalismo d’inchiesta. Contattata dal suo ex caporedattore, viene incaricata di seguire il caso per conto della sua vecchia testata. Ben presto Vera si accorge che le dinamiche del delitto non sono chiare come vorrebbe la polizia. Intraprende così un’indagine parallela alla ricerca della vera identità della vittima e del possibile movente dell’assassino: scoprirà quanto sconfinati e oscuri possono diventare i luoghi che pensiamo di conoscere da sempre. Con una scrittura fluida e coinvolgente, Sara Strömberg riesce a creare un perfetto equilibrio tra realismo, crudezza, lirismo e ironia. Sottobosco è un grande affresco della Svezia contemporanea nel solco della migliore tradizione del noir scandinavo, e Vera Bergström, sfolgorante eroina hard-boiled, è una protagonista indimenticabile che, con il suo cinismo e il suo disincanto, riempie tutta la scena. «Qui avevo giocato ed ero cresciuta. In mezzo all’odore di palude e muschio. Il mio corpo se ne ricordava. Portava i segni del sottobosco e della sterpaglia. Agognava sempre il calore, ma quando restavo al caldo troppo a lungo voleva tornare a casa per poter davvero respirare. Qui si era molto distanti dalle sparatorie della grande città, dalle esplosioni e dalla criminalità del	uploads/copertine/1765633192749-524227336-main.jpg	uploads/copertine/1765633192749-524227336-thumb.jpg	12	2025-12-13 13:39:52.792	2025-12-13 13:39:52.792
50	Il bambino segreto	Camilla Läckberg	2013	978-88-317-3505-6	La quinta indagine di Erica Falck e Patrik Hedström. Nella soffitta di casa, in un baule dove la madre Elsy conservava i suoi oggetti più cari, Erica trova alcuni diari e una medaglia dell'epoca nazista avvolta in un camicino da neonato macchiato di sangue. Incuriosita, decide di rivolgersi a un vecchio professore di storia in pensione. Ma le risposte che riceve sono vaghe e, due giorni dopo, il professore viene assassinato. Mentre le pagine del diario di Elsy gettano luce su un passato drammatico, Erica cerca di capire chi è ancora disposto a tutto pur di tenere segreti eventi tanto lontani, anche a uccidere. "Il migliore della serie. Camilla Lackberg dà prova di grande maestria" (Le Nouvel Observateur)	uploads/copertine/1765633464777-466047868-main.jpg	uploads/copertine/1765633464777-466047868-thumb.jpg	12	2025-12-13 13:44:24.829	2025-12-13 13:44:24.829
51	Discesa agli inferi. Game of gods	Hazel Riley	2023	978-88-200-7771-6	\N	uploads/copertine/1765633556767-724676645-main.jpg	uploads/copertine/1765633556767-724676645-thumb.jpg	12	2025-12-13 13:45:56.854	2025-12-13 13:45:56.854
52	Deviant. Eclissi di Marte	Ellie B. Luin	2023	978-88-200-7644-3	\N	uploads/copertine/1765633600458-355601857-main.jpg	uploads/copertine/1765633600458-355601857-thumb.jpg	12	2025-12-13 13:46:40.488	2025-12-13 13:46:40.488
41	Programmare con Python. Guida completa	Marco Buttu	2014	978-88-6895-024-8		uploads/copertine/1771864966325-954009183-main.jpg	uploads/copertine/1771864966325-954009183-thumb.jpg	6	2025-12-13 12:15:23.5	2026-02-23 16:42:46.39
53	Storia della filosofia occidentale	G. Cambiano, L. Fonnesu, M. Mori	2014	978-88-15-25270-8	\N	uploads/copertine/1765633923559-189404108-main.jpg	uploads/copertine/1765633923559-189404108-thumb.jpg	17	2025-12-13 13:52:03.597	2025-12-13 13:52:03.597
54	Filosofia classica tedesca: le parole chiave	L. Illetterati, P. Giuspoli	2020	978-88-290-0143-9	\N	uploads/copertine/1765633956299-401689774-main.jpg	uploads/copertine/1765633956299-401689774-thumb.jpg	17	2025-12-13 13:52:36.434	2025-12-13 13:52:36.434
55	Donne in politica. Dalle suffragette all'attuale rappresentanza femminile	Alessandra Portinari	2023	978-88-351-4523-3	\N	uploads/copertine/1765634052885-130994256-main.jpg	uploads/copertine/1765634052885-130994256-thumb.jpg	18	2025-12-13 13:54:12.946	2025-12-13 13:54:12.946
56	La monarchia della paura. Considerazioni sulla crisi politica attuale	Martha C. Nussbaum	2020	978-88-15-29046-5	\N	uploads/copertine/1765634080510-431239028-main.jpg	uploads/copertine/1765634080510-431239028-thumb.jpg	17	2025-12-13 13:54:40.546	2025-12-13 13:54:40.546
57	La persecuzione delle sorelle Mansfield	Xenobe Purvis	\N	978-88-357-4501-3	A Little Nettlebed si raccontano molte storie sulle sorelle Mansfield: che sono arroganti, bugiarde, indisciplinate. Ciascun abitante del piccolo villaggio ha da dire la propria sul loro conto, ma su una cosa tutti concordano: le ragazze sono strane, e, quindi, pericolose. Con l'arrivo di una delle estati più torride di sempre, poi, comincia a verificarsi una serie di eventi singolari: un enorme pesce argentato - o forse un mostro di fiume - si arena sulla riva del Tamigi, gli animali si fanno frenetici, gruppi di corvi si radunano sui tetti delle case, e qualcuno giura di aver visto le cinque sorelle trasformarsi in un branco di cani e latrare nella notte. I sospetti viaggiano in fretta di bocca in bocca, portando a galla paure, pregiudizi e anche un pizzico d'invidia. Cosa nascondono le ragazze Mansfield? Qual è la loro vera natura? Che le voci siano fondate o meno, a Little Nettlebed sta accadendo qualcosa di innaturale, e, come sempre capita in questi casi, serve un capro espiatorio. Un romanzo d'esordio magnetico e dalle atmosfere avvolgenti, che si muove sulla soglia tra allegoria, realismo magico e un'acuta critica sociale. Purvis trascina il lettore nell'Oxfordshire del XVIII secolo e lo spinge simultaneamente verso riflessioni senza tempo sul rapporto tra maldicenza e verità, sulla diffidenza nei confronti di ciò che è diverso e su cosa voglia dire essere una giovane donna fuori dagli schemi.	uploads/copertine/1765634418507-675500021-main.jpg	uploads/copertine/1765634418507-675500021-thumb.jpg	12	2025-12-13 14:00:18.542	2025-12-13 14:00:18.542
60	Movimenti acque soliloqui	Sconosciuto	2024	978-88-3367-291-5	\N	uploads/copertine/1765634658312-523969980-main.jpg	uploads/copertine/1765634658312-523969980-thumb.jpg	1	2025-12-13 14:04:18.526	2025-12-13 14:04:18.526
61	Il loro grido è la mia voce. Poesie da Gaza	A. Bocchinfuso, M. Soldaini, L. Tosti	2025	979-12-5967-758-7	\N	uploads/copertine/1765634778907-800533419-main.jpg	uploads/copertine/1765634778907-800533419-thumb.jpg	10	2025-12-13 14:06:18.954	2025-12-13 14:06:18.954
62	Oltre la morte e altre storie di lotta, terrore e fantascienza	Jack London	2024	979-12-80168-32-0	\N	uploads/copertine/1765634899993-872454355-main.jpg	uploads/copertine/1765634899993-872454355-thumb.jpg	12	2025-12-13 14:08:20.042	2025-12-13 14:08:20.042
63	Il groviglio verde. Abitare le foreste dal Mesozoico alla fantascienza	Danilo Zagaria	2024	978-88-6783-465-5	\N	uploads/copertine/1765634974502-772866468-main.jpg	uploads/copertine/1765634974502-772866468-thumb.jpg	20	2025-12-13 14:09:34.552	2025-12-13 14:09:34.552
64	Per antiche strade. Un viaggio nella storia d'Europa	Mathijs Deen	2020	978-88-7091-621-8	\N	uploads/copertine/1765635083388-493442582-main.jpg	uploads/copertine/1765635083388-493442582-thumb.jpg	9	2025-12-13 14:11:23.426	2025-12-13 14:11:23.426
67	Scrivendo sulla strada. Diari di viaggio e di letteratura	Lawrence Ferlinghetti	2017	978-88-428-2302-5	Lawrence Ferlinghetti non avrebbe potuto che essere un viaggiatore infaticabile, un cosmopolita a oltranza, un vagabondo avido di vita e paesaggio. Nato in America da una madre di origine francese e da un padre italiano, che morì ancor prima di conoscerlo, ha vissuto a Strasburgo e ha fatto poi ritorno in America. Ha studiato letteratura alla Sorbona, ha partecipato allo sbarco in Normandia, è stato travolto da quell'ondata di irrequietezza e desiderio, di scrittura e ribellione che ha preso il …	uploads/copertine/1771864853704-943188046-main.jpg	uploads/copertine/1771864853704-943188046-thumb.jpg	22	2025-12-13 14:13:48.757	2026-02-23 16:41:20.43
83	Il Codice da Vinci	Dan Brown	2022	978-88-04-74667-6		uploads/copertine/1771865013945-432360819-main.jpg	uploads/copertine/1771865013945-432360819-thumb.jpg	12	2026-02-22 20:10:48.525	2026-02-23 16:43:34.211
42	Elementi Di Matematica Discreta	Giuseppe Lancia	2018	978-1-7238-4942-8	Il testo contiene materiale per un corso introduttivo agli argomenti della matematica discreta per studenti di discipline scientifiche quali informatica e ingegneria. Dopo una parte preliminare dedicata a concetti elementari di teoria degli insiemi, logica, funzioni, relazioni ed equivalenze, sommatorie, vengono trattati argomenti introduttivi alla teoria dei numeri e allo studio dei numeri primi. La parte centrale del testo è dedicata al calcolo combinatorio con particolare enfasi all'utilizzo …	uploads/copertine/1771865044199-40595837-main.jpg	uploads/copertine/1771865044199-40595837-thumb.jpg	1	2025-12-13 12:15:58.513	2026-02-23 16:44:04.351
14	Folklore e magia popolare del Veneto. Rituali, superstizioni e antica stregoneria	Elena Righetto	2022	979-12-80764-86-7		uploads/copertine/1771865415853-975514041-main.jpg	uploads/copertine/1771865415853-975514041-thumb.jpg	3	2025-12-13 11:26:29.741	2026-02-23 16:50:15.989
59	Il giro del mondo in cucina	Anna Rita Granata E	2022	979-12-213-5424-9	Ci pensate mai ai “se non avessi scelto questo, cosa sarei?”, “se avessi detto di sì, dove sarei?”. Bene, lasciate perdere tutti i “se”. Nessuno può saperlo perché siamo noi la risposta alle nostre incertezze. Tutto sta nelle nostre scelte e rinunce e nel modo in cui decidiamo la sorte di ognuna di esse. Dopo oltre dieci anni di lavoro trascorsi a gestire il suo negozio di abbigliamento e nel pieno del periodo più buio della sua vita, Anna Rita decide di dedicarsi a un progetto tutto suo fatto d…	uploads/copertine/1771866813859-97442801-main.jpg	uploads/copertine/1771866813859-97442801-thumb.jpg	19	2025-12-13 14:02:05.773	2026-02-23 17:13:33.943
84	Storia della politica internazionale	Alessandro Duce	2013	978-88-382-4174-1	\N	uploads/copertine/1771867622053-337966215-main.jpg	uploads/copertine/1771867622053-337966215-thumb.jpg	9	2026-02-23 17:27:02.104	2026-02-23 17:27:02.104
85	Il potere di adesso. Una guida all'illuminazione spirituale	Eckhart Tolle	2023	978-88-6386-019-1	\N	uploads/copertine/1772091548518-636248815-main.jpg	uploads/copertine/1772091548518-636248815-thumb.jpg	26	2026-02-26 07:39:08.593	2026-02-26 07:39:08.593
\.


--
-- Data for Name: scaffali; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scaffali (id, nome, descrizione, proprietario_id, posizione, data_creazione, data_ultima_modifica) FROM stdin;
55	Fumetti e Graphic Novel	Raccolta di volumi indipendenti e major.	32	0101000020E610000011B5E7243756284015421339C4D24640	2026-02-23 16:33:28.848537	2026-02-23 16:52:38.697
14	Classici Italiani e stranieri	Da Manzoni a Svevo, dalla letteratura russa a quella francese.. 	10	0101000020E6100000010000D03A7328407724D2D1B4D34640	2025-12-13 11:00:10.51581	2026-02-26 09:25:49.971
56	Libri di informatica, elettronica e matematica	Scambio/prestito testi universitari.	32	0101000020E6100000FE61A5231F5528408D92890BC0D24640	2026-02-23 16:35:08.897559	2026-02-23 16:53:05.501
17	Guide di Viaggio Europa	Lonely Planet e Rough Guide recenti.	12	0101000020E61000008437951DA57A2840EAD0849C0AD54640	2025-12-13 11:00:10.51581	2026-02-23 16:55:00.623
13	Nuove Voci e Gialli Svedesi	Autori esordienti, promesse della letteratura e Il meglio del Nordic Noir. Alta richiesta	10	0101000020E610000001000000027C28401898F6AAA3D14640	2025-12-13 11:00:10.51581	2026-02-26 09:26:24.089
18	Letteratura di Viaggio	Racconti da Patagona e Siberia.	12	0101000020E6100000DC4ED4D072772840A5686964C1D44640	2025-12-13 11:00:10.51581	2026-02-23 16:55:30.015
27	Scaffale tecnologico	Specialista di architettura delle reti	1	0101000020E6100000010000006F872840C7FAE3E2BAD24640	2026-01-01 15:38:09.545905	2026-02-26 09:28:19.461
57	Dica 33, libri di medicina	Scambio/prestito testi universitari di medicina.	33	0101000020E6100000010000F0CE8228402BD8F1BCE6D54640	2026-02-23 16:58:21.295906	2026-02-26 09:33:57.685
59	Filosofia e Politica	Filosofia e Politica alla portata di tutti	34	0101000020E610000001000028E4802840F9A7611A74D14640	2026-02-23 17:22:59.583788	2026-02-26 09:24:37.144
58	Riscoprire il Veneto	Libri per riscoprire la tradizione veneta.. 	33	0101000020E610000001000000D7882840E55EBEA396D44640	2026-02-23 17:00:48.70422	2026-02-26 09:34:23.347
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: storico_eliminazioni; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.storico_eliminazioni (id, "timestamp", esecutore_id, esecutore_username, "target_ID", target_nome, azione, dettagli) FROM stdin;
1	2025-12-26 16:35:10.705	5	fabio.gialli	21	21	DELETE_SCAFFALE	\N
2	2025-12-26 16:37:37.368	5	fabio.gialli	22	22	DELETE_SCAFFALE	\N
3	2025-12-26 16:38:58.942	5	fabio.gialli	23	23	DELETE_SCAFFALE	\N
4	2025-12-27 20:31:20.805	5	fabio.gialli	54	Gusto. Guida infografica all'esplorazione di ingredienti e cibi delle cucine del mondo	DELETE_LIBRO	\N
5	2025-12-27 22:24:46.498	5	fabio.gialli	24	24	DELETE_SCAFFALE	\N
6	2025-12-27 22:28:34.977	5	fabio.gialli	25	25	DELETE_SCAFFALE	\N
7	2025-12-27 22:55:39.866	5	fabio.gialli	26	26	DELETE_SCAFFALE	\N
8	2026-01-01 18:47:50.079	13	tommaso.azzurro	62	Scrivendo sulla strada. Diari di viaggio e di letteratura	DELETE_LIBRO	\N
9	2026-01-02 20:12:43.371	5	fabio.gialli	1	Condivisione tra p:4 ed r:5 del libro:8. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
10	2026-01-03 09:44:30.93	1	marco.rossi	3	Condivisione tra p:1 ed r:5 del libro:61. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
11	2026-01-03 09:44:35.432	1	marco.rossi	4	Condivisione tra p:1 ed r:5 del libro:61. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
12	2026-01-03 09:44:38.891	1	marco.rossi	5	Condivisione tra p:1 ed r:5 del libro:61. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
13	2026-01-03 09:44:40.902	1	marco.rossi	6	Condivisione tra p:1 ed r:5 del libro:61. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
14	2026-01-03 23:06:55.518	1	marco.rossi	14	roberto.neri	DELETE_UTENTE	\N
15	2026-01-04 08:22:08.125	1	marco.rossi	15	nicoletta.bianchi	DELETE_UTENTE	\N
16	2026-01-21 17:20:32.33	13	tommaso.azzurro	19	Condivisione tra p:1 ed r:13 del libro:61. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
17	2026-01-24 08:53:10.732	1	marco.rossi	17	francesca.bianco	DELETE_UTENTE	\N
18	2026-01-24 08:54:33.081	1	marco.rossi	16	maria.ciano	DELETE_UTENTE	\N
19	2026-01-24 08:59:02.348	1	marco.rossi	18	francesca.bianco	DELETE_UTENTE	\N
20	2026-01-24 09:00:44.539	1	marco.rossi	19	francesca.bianco	DELETE_UTENTE	\N
21	2026-01-29 16:36:23.305	13	tommaso.azzurro	29	29	DELETE_SCAFFALE	\N
22	2026-01-29 16:48:50.812	13	tommaso.azzurro	30	30	DELETE_SCAFFALE	\N
23	2026-01-29 16:54:32.512	13	tommaso.azzurro	31	31	DELETE_SCAFFALE	\N
24	2026-01-29 17:01:23.303	13	tommaso.azzurro	33	33	DELETE_SCAFFALE	\N
25	2026-01-29 17:01:41.47	13	tommaso.azzurro	32	32	DELETE_SCAFFALE	\N
26	2026-01-29 17:18:19.293	13	tommaso.azzurro	34	34	DELETE_SCAFFALE	\N
27	2026-01-29 17:27:24.68	13	tommaso.azzurro	35	35	DELETE_SCAFFALE	\N
28	2026-01-29 17:30:46.352	13	tommaso.azzurro	37	37	DELETE_SCAFFALE	\N
29	2026-01-29 17:30:58.096	13	tommaso.azzurro	36	36	DELETE_SCAFFALE	\N
30	2026-01-29 17:33:16.202	13	tommaso.azzurro	38	38	DELETE_SCAFFALE	\N
31	2026-01-29 17:35:42.99	13	tommaso.azzurro	39	39	DELETE_SCAFFALE	\N
32	2026-01-29 18:37:23.822	13	tommaso.azzurro	40	40	DELETE_SCAFFALE	\N
33	2026-01-29 18:47:55.415	13	tommaso.azzurro	41	41	DELETE_SCAFFALE	\N
34	2026-01-29 18:48:23.768	13	tommaso.azzurro	42	42	DELETE_SCAFFALE	\N
35	2026-01-29 18:52:15.012	13	tommaso.azzurro	43	43	DELETE_SCAFFALE	\N
36	2026-01-29 18:54:29.188	13	tommaso.azzurro	44	44	DELETE_SCAFFALE	\N
37	2026-01-29 18:56:15.451	13	tommaso.azzurro	45	45	DELETE_SCAFFALE	\N
38	2026-01-29 19:01:12.711	13	tommaso.azzurro	46	46	DELETE_SCAFFALE	\N
39	2026-01-29 20:05:42.806	13	tommaso.azzurro	48	48	DELETE_SCAFFALE	\N
40	2026-01-29 20:15:15.96	13	tommaso.azzurro	47	47	DELETE_SCAFFALE	\N
41	2026-01-29 20:35:02.123	13	tommaso.azzurro	49	49	DELETE_SCAFFALE	\N
42	2026-01-29 20:36:59.751	13	tommaso.azzurro	50	50	DELETE_SCAFFALE	\N
43	2026-01-29 21:03:51.903	13	tommaso.azzurro	51	51	DELETE_SCAFFALE	\N
44	2026-02-03 20:42:58.466	1	marco.rossi	75	Codice Ratzinger	DELETE_LIBRO_MASTER	\N
45	2026-02-03 21:18:31.121	1	marco.rossi	78	Qualcosa è andato storto	DELETE_LIBRO_MASTER	\N
46	2026-02-03 21:22:23.804	1	marco.rossi	80	Il destino dei popoli. Come l'umanità ha fatto la storia e creato il nostro tempo	DELETE_LIBRO_MASTER	\N
47	2026-02-08 15:21:54.033	1	marco.rossi	29	utente.utente	DELETE_UTENTE	\N
48	2026-02-12 21:07:03.938	30	martino.arancio	66	Folklore e magia popolare del Veneto. Rituali, superstizioni e antica stregoneria	DELETE_LIBRO	\N
49	2026-02-12 21:14:38.379	30	martino.arancio	26	Condivisione tra p:1 ed r:30 del libro:61. Motivazione: Nessun Motivo	DELETE_CONDIVISIONE	\N
50	2026-02-12 21:18:57.763	1	marco.rossi	30	martino.arancio	DELETE_UTENTE	\N
51	2026-02-12 22:03:32.982	5	fabio.gialli	53	Gusto. Guida infografica all'esplorazione di ingredienti e cibi delle cucine del mondo	DELETE_LIBRO	\N
52	2026-02-21 10:06:47.601	5	fabio.gialli	53	53	DELETE_SCAFFALE	\N
53	2026-02-21 10:12:09.903	5	fabio.gialli	73	Scrivendo sulla strada. Diari di viaggio e di letteratura	DELETE_LIBRO	\N
54	2026-02-21 10:12:12.385	5	fabio.gialli	54	54	DELETE_SCAFFALE	\N
55	2026-02-22 19:55:57.181	1	marco.rossi	31	test.test	DELETE_UTENTE	\N
56	2026-02-22 20:11:17.584	1	marco.rossi	74	Il Codice da Vinci	DELETE_LIBRO	\N
57	2026-02-23 16:18:21.241	1	marco.rossi	4	anna.neri	DELETE_UTENTE	\N
58	2026-02-23 16:18:35.57	1	marco.rossi	13	tommaso.azzurro	DELETE_UTENTE	\N
59	2026-02-23 16:18:48.515	1	marco.rossi	11	luca.grigio	DELETE_UTENTE	\N
60	2026-02-23 16:19:00.823	1	marco.rossi	21	marcello.viola	DELETE_UTENTE	\N
61	2026-02-23 16:19:12.83	1	marco.rossi	2	laura.bianchi	DELETE_UTENTE	\N
62	2026-02-23 16:19:23.131	1	marco.rossi	6	chiara.blu	DELETE_UTENTE	\N
63	2026-02-23 16:19:44.763	1	marco.rossi	5	fabio.gialli	DELETE_UTENTE	\N
64	2026-02-23 16:20:07.184	1	marco.rossi	8	elena.viola	DELETE_UTENTE	\N
65	2026-02-23 16:20:21.928	1	marco.rossi	20	francesca.bianco	DELETE_UTENTE	\N
66	2026-02-23 16:20:30.03	1	marco.rossi	9	francesco.marrone	DELETE_UTENTE	\N
67	2026-02-23 16:20:39.036	1	marco.rossi	3	giovanni.verdi	DELETE_UTENTE	\N
68	2026-02-23 16:21:50.726	1	marco.rossi	7	davide.arancio	DELETE_UTENTE	\N
69	2026-02-23 17:06:53.116	10	greta.rosa	36	Gusto. Guida infografica all'esplorazione di ingredienti e cibi delle cucine del mondo	DELETE_LIBRO	\N
70	2026-02-23 17:06:57.809	10	greta.rosa	35	Il giro del mondo in cucina	DELETE_LIBRO	\N
71	2026-02-24 00:31:57.157	1	marco.rossi	35	test.elimina	DELETE_UTENTE	\N
\.


--
-- Data for Name: storico_utente_valutazioni; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.storico_utente_valutazioni (id, voto, recensione, recensore_username, recensito_username, data_creazione) FROM stdin;
\.


--
-- Data for Name: tipi_condivisione; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tipi_condivisione (id, dettagli, descrizione) FROM stdin;
999	Non definito	\N
1	Prestito	\N
2	Scambio	\N
3	Gruppo di lettura	\N
4	Dibattito	\N
5	Donazione	\N
\.


--
-- Data for Name: utente_valutazioni; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utente_valutazioni (id, voto, recensione, data_creazione, recensore_id, recensito_id, condivisione_id) FROM stdin;
25	5	Grazie, prestito perfetto.	2026-02-23 18:08:22.574	32	1	27
26	4	E' stato un piacere.	2026-02-23 18:08:42.284	1	32	27
27	5	Grazie..	2026-02-23 19:11:02.085	10	32	28
28	5	Perfetto	2026-02-23 19:11:13.768	32	10	28
29	3	Non puntuale. Ma almeno il libro è tornato a casa sano e salvo	2026-02-23 19:14:19.529	10	33	29
30	5	Tutto perfetto. Greta è stata molto puntuale	2026-02-24 00:54:55.503	32	10	30
31	5	Libro tenuto molto bene e il proprietario è stato puntuale.	2026-02-24 00:55:52.759	10	32	30
\.


--
-- Data for Name: utenti; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utenti (id, nome, cognome, username, email, hashed_password, biografia, avatar, avatar_thumb, bannato, data_creazione, ruolo, richiesta_eliminazione, data_richiesta_eliminazione, data_ultima_modifica, visualizzazioni, data_accettazione_privacy, privacy_policy_accettata) FROM stdin;
10	Greta	Rosa	greta.rosa	greta.rosa@example.it	$2b$12$cn5dmaqQpiyjRp4/I1TexeukND4WT2O50HIbIauEHThQw0Z.gSXDq	Nuova sulla piattaforma, ma con tanti libri da mettere in circolo!	uploads/avatars/1771864105721-350224566-main.png	uploads/avatars/1771864105721-350224566-thumb.png	f	2025-12-13 10:59:51.896095	user	f	\N	2026-02-26 07:17:50.537	8	\N	t
1	Marco	Rossi	marco.rossi	marco.rossi@example.it	$2b$12$zPEPYU0KW1SZy3MBuBg0IunNW68EeRjdi0c/Z2OWZgbhFY9udybcK	Amministratore del sistema, gestisce l infrastruttura. Studente di Informatica.	uploads/avatars/1771864314164-178534501-main.png	uploads/avatars/1771864314164-178534501-thumb.png	f	2025-12-13 10:59:51.896095	admin	f	\N	2026-02-23 17:14:56.229	100	\N	t
12	Silvia	Nero	silvia.nero	silvia.nero@example.it	$2b$12$xr.QCWKSp7VeI6LHUIgOIupl9bZtiHe8xYFPiF2PUBlakK6/paUb6	Viaggiatrice e lettrice di guide e racconti di viaggio.	uploads/avatars/1771864058359-462120464-main.png	uploads/avatars/1771864058359-462120464-thumb.png	f	2025-12-13 10:59:51.896095	user	f	\N	2026-02-23 17:16:26.32	107	\N	t
33	Tommaso	Azzurro	tommaso.azzurro	tommaso.azzurro@example.com	$2b$12$g5x/g8UH9Oue9iqLW48EA./zTg0nbtT7FkfZNxUX.CoRKoVOkuX/i	Studente di medicina, appassionato della cultura locale e delle tradizioni Venete	uploads/avatars/1771864231939-522387822-main.png	uploads/avatars/1771864231939-522387822-thumb.png	f	2026-02-23 16:29:46.973	user	f	\N	2026-02-26 09:30:55.557	9	\N	t
36	utente	bannato	utente.bannato	utente.bannato@example.com	$2b$12$pYSW6Dz4FTGOxZu.7iKQLeoQxt75luQjxopZZtw4jXNEAW48qrxka	Utente bannato	\N	\N	t	2026-02-26 09:31:25.263	user	f	\N	2026-02-26 09:32:12.522	1	\N	t
34	Francesco	Marrone	francesco.marrone	francesco.marrone@example.com	$2b$12$g8QEA8oKWemxBPH64WXVVukwbwZ39xwJEQfy2LWs24xwYvMnrCXpa	Neo laureato in Scienze Politiche amo la saggistica e la filosofia. Chiedetemi qualsiasi cosa su filosofia e politica..Presto libri o li leggiamo assieme.. scegliete voi	uploads/avatars/1771867147991-338299837-main.jpg	uploads/avatars/1771867147991-338299837-thumb.jpg	f	2026-02-23 17:18:41.386	user	f	\N	2026-02-23 17:24:09.832	0	\N	t
32	Davide	Arancio	davide.arancio	davide.arancio@example.com	$2b$12$4r2tJdfe.tfYcc4klS7DQO15kkgMlVBcowLmsGgeh4cS3LW7eGDHu	Studente di Ingegneria, appassionato di elettronica e fumetti..	uploads/avatars/1771864011785-713780547-main.png	uploads/avatars/1771864011785-713780547-thumb.png	f	2026-02-23 16:24:31.881	user	f	\N	2026-02-24 16:21:11.116	20	\N	t
\.


--
-- Name: condivisioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.condivisioni_id_seq', 32, true);


--
-- Name: generi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.generi_id_seq', 26, true);


--
-- Name: libri_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.libri_id_seq', 97, true);


--
-- Name: libri_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.libri_master_id_seq', 85, true);


--
-- Name: scaffali_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scaffali_id_seq', 59, true);


--
-- Name: storico_eliminazioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.storico_eliminazioni_id_seq', 71, true);


--
-- Name: storico_utente_valutazioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.storico_utente_valutazioni_id_seq', 1, false);


--
-- Name: tipi_condivisione_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipi_condivisione_id_seq', 5, true);


--
-- Name: utente_valutazioni_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utente_valutazioni_id_seq', 31, true);


--
-- Name: utenti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utenti_id_seq', 36, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: condivisioni condivisioni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condivisioni
    ADD CONSTRAINT condivisioni_pkey PRIMARY KEY (id);


--
-- Name: generi generi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generi
    ADD CONSTRAINT generi_pkey PRIMARY KEY (id);


--
-- Name: libri_master libri_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri_master
    ADD CONSTRAINT libri_master_pkey PRIMARY KEY (id);


--
-- Name: libri libri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri
    ADD CONSTRAINT libri_pkey PRIMARY KEY (id);


--
-- Name: scaffali scaffali_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scaffali
    ADD CONSTRAINT scaffali_pkey PRIMARY KEY (id);


--
-- Name: storico_eliminazioni storico_eliminazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storico_eliminazioni
    ADD CONSTRAINT storico_eliminazioni_pkey PRIMARY KEY (id);


--
-- Name: storico_utente_valutazioni storico_utente_valutazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storico_utente_valutazioni
    ADD CONSTRAINT storico_utente_valutazioni_pkey PRIMARY KEY (id);


--
-- Name: tipi_condivisione tipi_condivisione_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipi_condivisione
    ADD CONSTRAINT tipi_condivisione_pkey PRIMARY KEY (id);


--
-- Name: utente_valutazioni utente_valutazioni_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utente_valutazioni
    ADD CONSTRAINT utente_valutazioni_pkey PRIMARY KEY (id);


--
-- Name: utenti utenti_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utenti
    ADD CONSTRAINT utenti_pkey PRIMARY KEY (id);


--
-- Name: idx_condivisioni_completato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condivisioni_completato ON public.condivisioni USING btree (is_completato);


--
-- Name: idx_condivisioni_confermato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condivisioni_confermato ON public.condivisioni USING btree (is_confermato);


--
-- Name: idx_condivisioni_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condivisioni_date ON public.condivisioni USING btree (data_dal, data_al);


--
-- Name: idx_condivisioni_proprietario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condivisioni_proprietario ON public.condivisioni USING btree (proprietario_id);


--
-- Name: idx_condivisioni_richiedente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condivisioni_richiedente ON public.condivisioni USING btree (richiedente_id);


--
-- Name: idx_condivisioni_tipocondivisione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condivisioni_tipocondivisione ON public.condivisioni USING btree (tipo_condivisione_id);


--
-- Name: idx_genere_dettagli; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_genere_dettagli ON public.generi USING btree (dettagli);


--
-- Name: idx_libri_disponibili; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_libri_disponibili ON public.libri USING btree (is_disponibile);


--
-- Name: idx_libri_filtri; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_libri_filtri ON public.libri USING btree (genere_id, tipo_condivisione_id);


--
-- Name: idx_libri_prorprietario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_libri_prorprietario ON public.libri USING btree (proprietario_id);


--
-- Name: idx_libri_scaffale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_libri_scaffale ON public.libri USING btree (scaffale_id);


--
-- Name: idx_scaffali_posizione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scaffali_posizione ON public.scaffali USING gist (posizione);


--
-- Name: idx_scaffali_proprietario_id_nome; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_scaffali_proprietario_id_nome ON public.scaffali USING btree (proprietario_id, nome);


--
-- Name: idx_tipo_condivisione_dettagli; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_tipo_condivisione_dettagli ON public.tipi_condivisione USING btree (dettagli);


--
-- Name: idx_utenti_bannato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_utenti_bannato ON public.utenti USING btree (bannato);


--
-- Name: idx_utenti_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_utenti_email ON public.utenti USING btree (email);


--
-- Name: idx_utenti_richiesta_eliminazione; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_utenti_richiesta_eliminazione ON public.utenti USING btree (richiesta_eliminazione);


--
-- Name: idx_utenti_ruolo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_utenti_ruolo ON public.utenti USING btree (ruolo);


--
-- Name: idx_utenti_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_utenti_username ON public.utenti USING btree (username);


--
-- Name: libri_autore_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX libri_autore_idx ON public.libri USING btree (autore);


--
-- Name: libri_master_autore_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX libri_master_autore_idx ON public.libri_master USING btree (autore);


--
-- Name: libri_master_genere_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX libri_master_genere_id_idx ON public.libri_master USING btree (genere_id);


--
-- Name: libri_master_isbn_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX libri_master_isbn_idx ON public.libri_master USING btree (isbn);


--
-- Name: libri_master_isbn_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX libri_master_isbn_key ON public.libri_master USING btree (isbn);


--
-- Name: libri_master_titolo_autore_anno_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX libri_master_titolo_autore_anno_key ON public.libri_master USING btree (titolo, autore, anno);


--
-- Name: libri_master_titolo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX libri_master_titolo_idx ON public.libri_master USING btree (titolo);


--
-- Name: libri_titolo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX libri_titolo_idx ON public.libri USING btree (titolo);


--
-- Name: storico_eliminazioni_azione_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storico_eliminazioni_azione_idx ON public.storico_eliminazioni USING btree (azione);


--
-- Name: storico_eliminazioni_azione_target_nome_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storico_eliminazioni_azione_target_nome_idx ON public.storico_eliminazioni USING btree (azione, target_nome);


--
-- Name: storico_eliminazioni_esecutore_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storico_eliminazioni_esecutore_username_idx ON public.storico_eliminazioni USING btree (esecutore_username);


--
-- Name: storico_utente_valutazioni_recensito_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storico_utente_valutazioni_recensito_username_idx ON public.storico_utente_valutazioni USING btree (recensito_username);


--
-- Name: storico_utente_valutazioni_recensore_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX storico_utente_valutazioni_recensore_username_idx ON public.storico_utente_valutazioni USING btree (recensore_username);


--
-- Name: utente_valutazioni_condivisione_id_recensore_id_recensito_i_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX utente_valutazioni_condivisione_id_recensore_id_recensito_i_key ON public.utente_valutazioni USING btree (condivisione_id, recensore_id, recensito_id);


--
-- Name: utente_valutazioni_recensito_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utente_valutazioni_recensito_id_idx ON public.utente_valutazioni USING btree (recensito_id);


--
-- Name: utente_valutazioni_recensore_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX utente_valutazioni_recensore_id_idx ON public.utente_valutazioni USING btree (recensore_id);


--
-- Name: condivisioni condivisioni_libro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condivisioni
    ADD CONSTRAINT condivisioni_libro_id_fkey FOREIGN KEY (libro_id) REFERENCES public.libri(id) ON DELETE CASCADE;


--
-- Name: condivisioni condivisioni_proprietario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condivisioni
    ADD CONSTRAINT condivisioni_proprietario_id_fkey FOREIGN KEY (proprietario_id) REFERENCES public.utenti(id) ON DELETE CASCADE;


--
-- Name: condivisioni condivisioni_richiedente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condivisioni
    ADD CONSTRAINT condivisioni_richiedente_id_fkey FOREIGN KEY (richiedente_id) REFERENCES public.utenti(id) ON DELETE CASCADE;


--
-- Name: condivisioni condivisioni_tipo_condivisione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condivisioni
    ADD CONSTRAINT condivisioni_tipo_condivisione_id_fkey FOREIGN KEY (tipo_condivisione_id) REFERENCES public.tipi_condivisione(id) ON DELETE SET DEFAULT;


--
-- Name: libri libri_genere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri
    ADD CONSTRAINT libri_genere_id_fkey FOREIGN KEY (genere_id) REFERENCES public.generi(id) ON DELETE SET DEFAULT;


--
-- Name: libri_master libri_master_genere_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri_master
    ADD CONSTRAINT libri_master_genere_id_fkey FOREIGN KEY (genere_id) REFERENCES public.generi(id) ON DELETE SET DEFAULT;


--
-- Name: libri libri_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri
    ADD CONSTRAINT libri_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.libri_master(id) ON DELETE SET NULL;


--
-- Name: libri libri_proprietario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri
    ADD CONSTRAINT libri_proprietario_id_fkey FOREIGN KEY (proprietario_id) REFERENCES public.utenti(id) ON DELETE CASCADE;


--
-- Name: libri libri_scaffale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri
    ADD CONSTRAINT libri_scaffale_id_fkey FOREIGN KEY (scaffale_id) REFERENCES public.scaffali(id) ON DELETE CASCADE;


--
-- Name: libri libri_tipo_condivisione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libri
    ADD CONSTRAINT libri_tipo_condivisione_id_fkey FOREIGN KEY (tipo_condivisione_id) REFERENCES public.tipi_condivisione(id) ON DELETE SET DEFAULT;


--
-- Name: scaffali scaffali_proprietario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scaffali
    ADD CONSTRAINT scaffali_proprietario_id_fkey FOREIGN KEY (proprietario_id) REFERENCES public.utenti(id) ON DELETE CASCADE;


--
-- Name: utente_valutazioni utente_valutazioni_condivisione_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utente_valutazioni
    ADD CONSTRAINT utente_valutazioni_condivisione_id_fkey FOREIGN KEY (condivisione_id) REFERENCES public.condivisioni(id) ON DELETE CASCADE;


--
-- Name: utente_valutazioni utente_valutazioni_recensito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utente_valutazioni
    ADD CONSTRAINT utente_valutazioni_recensito_id_fkey FOREIGN KEY (recensito_id) REFERENCES public.utenti(id) ON DELETE CASCADE;


--
-- Name: utente_valutazioni utente_valutazioni_recensore_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utente_valutazioni
    ADD CONSTRAINT utente_valutazioni_recensore_id_fkey FOREIGN KEY (recensore_id) REFERENCES public.utenti(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ap7dTnddHJhkrhqi1qW0FlEBmRcgIteFXLJ0TiSkYXQkC7CkD9u3oBbzITqbQqJ

