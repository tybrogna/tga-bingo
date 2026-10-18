--
-- PostgreSQL database dump
--

\restrict g783t3hyDfhHHPozIpoIAurIQ026fUnhCETXdM8EcryslxOmwOUcJ8erIPHDVfS

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
-- Data for Name: submitters; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- COPY public.submitters (id, email, nickname) FROM stdin;
-- 1	test@qa.com	Nick Quality
-- \.


--
-- Data for Name: tile_clusters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tile_clusters (id, tile_ids, event_id, is_verified, is_free) FROM stdin;
1	1,2	3	f	f
2	3	3	f	f
3	4	3	f	f
4	5	3	f	f
5	6	3	f	f
6	7	3	f	f
7	8	3	f	f
8	9	3	f	t
9	10	3	f	f
10	11	3	f	f
11	12	3	f	f
12	13,14	3	f	f
13	15,16	3	f	f
14	17,18	3	f	f
15	19	3	f	f
16	20,21	3	f	f
17	22,23	3	f	f
18	24	3	f	f
19	25	3	f	f
20	26	3	f	f
21	27	3	f	f
22	28	3	f	f
23	29	3	f	f
24	30	3	f	f
25	31	3	f	f
26	32	3	f	f
27	33	3	f	f
28	34	3	f	f
29	35	3	f	f
30	36	3	f	f
31	37	3	f	f
32	38	3	f	f
33	39	3	f	f
34	40	3	f	f
35	41	3	f	f
36	42	3	f	f
37	43	3	f	f
38	44	3	f	f
39	45,46	3	f	f
40	47,48	3	f	f
41	49	3	f	f
42	50	3	f	f
43	51	3	f	f
\.


--
-- Data for Name: tiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tiles (id, title, description, img_loc, gotwrong) FROM stdin;
1	Sydnee Goodman wears a Sparkly Dress	Anything with light reflective bits counts. Not jewelry, or a brooch, its gotta be part of the dress.	sgwasd49799.jpg	\N
2	Sydnee Goodman wears a Non-Sparkly Dress	This only counts if there is no sparkly bits on the dress. Jewelry or brooches aren''t part of the dress, so they don''t count against this.	sgwand49915.jpg	\N
3	Award Recipient gets Confused about Stage Cues/Crowd Flow	Check this off if someone wanders in the wrong direction and has to be guided by Geoff or a stage hand.	argcascf59987.jpg	\N
4	"Full Trailer on [Media Platform]"	Some companies only pay for short slots, mostly in the pre-show. Mark this off if you see this in the corner, or at the end of any trailer.	ftomp01481.jpg	\N
5	Mobile Service Game form Last Year reappears (Steel Paws, ARAD DnF, GoT Kingsroad)	Admittedly a cruel card, since i think Steel Paws is already down. But you can play Got Kingsroad now, and ARAD DnF isn''t out yet, so its possible!	msgflyrspadgk40119.jpg	\N
6	Minor Celebrity Announces Game They''re Acting In	"Minor" is a joke, I mean any celebrity of course. And specifically, they need to be a known movie or TV actor.	mcagtai51771.jpg	\N
7	Dead Franchise gets revived (no release in 7+ years)	That''s 2018, for you math nerds. This is only for NEW announcements, so things like Fable and GTA6 don''t count. If the franchise received a port of old games, that doesn''t count against it. So things like Castlevania, Mega Man, Deus Ex, Blazblue and Divinity count. If the franchise got a REMAKE, or a spinoff, they''re not dead. Persona, Yakuza, Metal Gear, and Fallout/Elder Scrolls are all alive and well at the moment.	dfgrnri7y20021.jpg	\N
8	Personnel from Last Year''s Winners Presents/Appears (Astrobot''s Doucet, Metaphor''s Hashino)	Don''t worry, Geoff will introduce them. Other less common appearances will include Tekken''s Harada, FFVII Rebirth''s Hamaguchi, Baldur''s Gate 3''s Vinke, Helldivers 2''s Eriksson and Balatro''s anonymous steward Localthunk.	pflywpadmh78051.jpg	\N
9	TGA makes baffling decision about best fighting game Nominees	Its the free tile. Bonus points for giving 2XKO the award despite the game not being out yet.	tmbdabfgn39277.jpg	\N
10	Update/expansion for game that came out this year	Yeah Tainted Grail came out this year. Guaranteed to be checked off, congrats.	ufgtcoty63927.jpg	\N
11	Update/expansion for game that DIDN''T come out this year	Last year counts! But there are many, many games this could apply to.	ufgtdcoty35868.jpg	\N
12	Someone references the "what really is an indie game" debate	Expedition 33, Hades II, Megabonk, Dispatch and found themselves in the "indie" category, despite having varying levels of disqualification depending on your personal definition of "indie." And no, it isn''t enough for Geoff to say "indie game Clair Obscur." One of the muppets will likely make a flippant remark about it.	srtwriaigd29046.jpg	\N
13	Clair Obscur: Expedition 33 wins 3 awards	Its up for 11 categories, including best performance. Not saying this is guaranteed, but--	coe3w3a43607.jpg	\N
14	Clair Obscur: Expedition 33 wins less than 3 awards	More like Expedition Only 1, amirite. Thank you to no name youtuber AlpaxLP for the thumbnail, i couldn''t find the font they used for the numbers.	coe3wlt3a43608.jpg	\N
15	The Same Game wins GotY and Best Direction		tsgwgabd59272.jpg	\N
16	Different Games win GotY and Best Game Direction	look at this picture man. new american jackets, you''re either AI or crazy	dgwgabgd59272.jpg	\N
17	Best Sports/Racing Game: Cartoony Game Wins	That''s Rematch, Mario Kart World, or Sonic Racing Crossworlds	bsgcgw03606.jpg	\N
18	Best Sports/Racing Game: Photoreal Game Wins	That''s EA Sports FC 26, or F1 25.	bsgpgw03607.jpg	\N
19	Hollow Knight: Silksong wins ANY awards	Competition is fierce for the little game that could, just sayin.	hkswaa91196.jpg	\N
20	IGF stars win Games for Impact (either Consume Me or Despelote)	Either one, they both cleaned up at the IGF awards despite being not out when they won.	iswgfiecmod45239.jpg	\N
21	Usual Suspects win Games for Impact (Lost Records, South of Midnight, Wanderstop)	The divide between what TGAs like and the GDCs like fascinates me.	uswgfilrsomw45240.jpg	\N
22	Phantom Blade 0 Release Date is March 2026 or Earlier		pb0rdim2oe78118.jpg	\N
23	Phantom Blade 0 Release Date is April 2026 or Later		pb0rdia2ol78119.jpg	\N
24	Something about CoD Blpoz 7 Zombs	Kinda a long shot, but there was a patch on Dec 10th, so maybe they''ll announce something	sacb7z92188.jpg	\N
25	Resident Evil Requiem Shows a classic character (Leon, Chris, Jill)	Sure, we''re going back to racoon city, but how far back are we going?	rersacclcj52887.jpg	\N
26	Silent Hill 1 Remake News	I think its too early. Silent Hill 2 Remake came out last year, and Bloober released a game this year. But thats what the rumors say, so	sh1rn19563.jpg	\N
27	Exodus Trailer Prominently features Matthew McConaughey	The last one showed some gameplay, but its still being sold on his name	etpfmm47501.jpg	\N
28	Marathon is BACK BABY	Now that Ark Raiders has been a massive success, people will like Marathon now, right? 	mibb48347.jpg	\N
29	New Valve Game (Not Deadlock)	I think you know what I mean	nvgnd42851.jpg	\N
30	Stranger Than Heaven returns	Remember this? It''s a new game from Ryu Ga Gotoku Studios, of Yakuza fame. It was featured at TGA 2024, and Summer Games Fest 2025. 	sthr84520.jpg	\N
31	Acknowledgment of the Hololive streaming partnership	This year, 12 Hololive vtubers are official co-streamers of The Game Awards. One of them (Sakura Miko) is up for the Content Creator award, too. Check this off at any point if anyone dare utter the words ''hololive'' into a microphone, or if one of the anime avatars appears anywhere. Don''t worry, you''ll know when they show up.	aothsp91562.jpg	\N
32	2XKO new character reveal	It should be pretty obvious, but in case it isn''t, here are all the currently available characters: Ahri, Blitzcrank, Braum, Darius, Ekko, Illaoi, Jinx, Teemo, Vi, Warwick, Yasuo	2ncr41462.jpg	\N
33	New Larian Studios game	It''s been highly rumored that the statue in the desert is for the new Divinity game. I, for one, believe. BRING BACK FALLEN HEROES	nlsg26730.jpg	\N
34	Next Remedy game	Control 2/Control Resonant is expected to be their next game, but the Max Payne remake was announced years ago. I wouldn''t be surprised if that game was shown off first.	nrg91971.jpg	\N
35	Final Fantasy VII part 3	While technically known its been coming for a while, i feel like its much too soon for them to be sharing anything. But the rumors swirl in that direction. I''m just saying, be prepared for disappointment.	ffvp398097.jpg	\N
36	New Sonic game (not port)	It''s about That Time. If, for whatever reason, this turns out to be porting a bunch of games to modern consoles, that doesn''t count (sorry Sonic Adventure 2 hopefuls. but look on the bright side, that''s way better than ticking off a bingo tile)	nsgnp55382.jpg	\N
37	Lords of the Fallen II appears	The first game was shown off at The Game Awards 2022, and they want this one out by 2026. Seems plausible.	lotfia97940.jpg	\N
38	Fortnite Collab with a game announced at the show	It''s guaranteed that both Fortnite and something about Tomb Raider will be at the game awards, so the extra requirement doesn''t just make this a free space. 	fcwagaats20787.jpg	\N
39	007 First Light trailer shows Lenny Kravitz in the game	This is extremely specific because it''s a straight up leak. I mostly can''t believe it''s real, but I guess that''s what makes it more real than most of the tiles i write down.	0fltslkitg41809.jpg	\N
40	Crimson Desert trailer	It was at The Game Awards last year, and the release date is really close. 	cdt38459.jpg	\N
41	Lara Croft wearing classic outfit in trailer (teal tank top, brown short shorts, french braid)	Evaluate on a close enough basis. It doesn''t have to be literally 1996 authentic outfit, just not be obviously "different." If, for whatever reason, in the trailer, the camera pans over a mannequin wearing the classic outfit, that DOESN''T count. Lara has to be wearing it.	lcwcoittttbssfb07192.jpg	\N
42	Playgrounds'' Fable 2026 trailer	It is endlessly funny to me that all these MS games are going to be heavily advertised to be releasing on PS5. 	pf2t11759.jpg	\N
43	Marvel'' Wolverine release date	https://youtu.be/WaKIX6oaSLs?si=AqJOmY0rphx6oZj4&t=522	mwrd54506.jpg	\N
44	Saros trailer features extremely large boss monster	I mean skyscraper sized. It shouldn''t be able to fit on the arena Mr Saros is standing on.	stfelbm94358.jpg	\N
45	Contrary to expectation, Wildflower Interactive''s new game is dark and gritty	We ARE talking about the new studio headed by Uncharted 4 and The Last of Us'' co-director, Bruce Straley after all.	ctewingidag29034.jpg	\N
46	Wildflower Interactive''s new game is cute and colorful	Betcha didn''t know Uncharted 4 and The Last of Us co-director Bruce Straley worked on Mr. Bones.	wingicac29034.jpg	\N
47	Eidos Montreal''s new game is an established franchise	Remember Nosgoth? The Legacy of Kain multiplayer battle game? Anyways, be on the lookout for that, Deus Ex, Thief, Lord of the Rings, or even Gex. If, for whatever reason, one of the Xbox games Eidos Montreal is assisting with appears (Fable, Grounded 2), that DOESN''T count for this tile.	emngiaef73535.jpg	\N
48	Eidos Montreal''s new game is a new IP	Remember Project: Snowblind? The Deus ex Invisible War multiplayer mode, hacked off to be its own product? Anyways, be on the lookout for their logo next to something new. They''ve been struggling to get projects approved by publishers, and a lot of known IP games canceled.	emngiani73536.jpg	\N
49	GTA VI graces The Game Awards with its presence	Highly unlikely, but someone''s gonna have the last laugh if it happens.	gvgtgawip25753.jpg	\N
50	Anime Gatcha Game	MiHoYo I know you''re gonna show that honkai pokemon game today even if there is NO rumor or indication that they will.	agg21628.jpg	\N
51	New Star Wars game	Apparently it''ll be there. I''m skeptical, so onto the bingo board it goes	nswg01567.jpg	\N
\.


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 3, true);


--
-- Name: submitters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- SELECT pg_catalog.setval('public.submitters_id_seq', 1, true);


--
-- Name: tile_clusters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tile_clusters_id_seq', 43, true);


--
-- Name: tiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tiles_id_seq', 51, true);


--
-- PostgreSQL database dump complete
--

\unrestrict g783t3hyDfhHHPozIpoIAurIQ026fUnhCETXdM8EcryslxOmwOUcJ8erIPHDVfS

