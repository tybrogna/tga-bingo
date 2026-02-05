--
-- PostgreSQL database dump
--

\restrict d12jAikFU3JmzZs35HXegWzJqelYjQRy7TUmKXxujdYGEtnFr26uYhg0008i48G

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, name, year, active) FROM stdin;
1	Summer Games Fest	2025	f
2	The Game Awards	2024	f
3	The Game Awards	2025	t
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, name, release, developer, publisher, is_notable, is_vr, is_remaster, is_early_access_release, is_expansion, is_mobile, is_free_to_play, alternate_name, alt_text) FROM stdin;
1	The Year 2025	2026-01-01	BiG BoYS	Devolver Digital	t	f	f	t	f	f	f	\N	\N
\.


--
-- Data for Name: submitters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submitters (id, email, nickname) FROM stdin;
1	test@qa.com	Nick Quality
\.


--
-- Data for Name: tile_clusters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tile_clusters (id, tile_ids, submitter_id, event_id, is_verified, is_free) FROM stdin;
1	1	\N	3	f	f
2	2	\N	3	f	f
3	3	\N	3	f	f
4	4,5	\N	3	f	f
\.


--
-- Data for Name: tiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tiles (id, title, description, img_loc, gotwrong) FROM stdin;
1	cre ma spe fo com	opaiuswbegf	cmsfc71932.jpg	\N
2	reg lan dtrus me bro	poauisbeg	rldmb82616.jpg	\N
3	overh win ocn	oh boy	owo96736.jpg	\N
4	pee in abyss	sdfrtjkmder	pia16517.jpg	\N
5	shit teferi	segase	st16517.jpg	\N
\.


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 3, true);


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.games_id_seq', 1, true);


--
-- Name: submitters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submitters_id_seq', 1, true);


--
-- Name: tile_clusters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tile_clusters_id_seq', 4, true);


--
-- Name: tiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tiles_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

\unrestrict d12jAikFU3JmzZs35HXegWzJqelYjQRy7TUmKXxujdYGEtnFr26uYhg0008i48G

