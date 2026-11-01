# IA TOWN & CCC.CONNECT HUB — ANNUAIRE DES 94 AGENTS OFFICIELS
**Version :** V5.0 Master Edition  
**Nombre d'Agents :** 94 rôles uniques (01 à 94)  
**Répartition :** 16 Bâtiments  
**Typologie :** 18 Type A (IA) · 58 Type B (Services Déterministes) · 18 Type C (Hybrides)  

> **Portée du registre :** les rôles, outils et permissions ci-dessous décrivent les profils prévus. Leur présence dans ce fichier ne signifie pas que les outils sont implémentés ou que les permissions sont accordées. Dans la branche `codex/agent-runtime`, Gemini fournit une proposition textuelle pour les profils Type A et C; les profils Type B et les actions externes n’ont pas d’exécuteur connecté.

---

## 1. ARE.IA.CENTER (5 Agents : #01 à #05)
1. **01. ARENA.COMMANDER**
   - **Type :** TYPE_A_IA
   - **Rôle :** Stratège en chef, arbitrage global des ressources de la ville.
   - **Outils :** Cognitive Orchestrator, Priority Matrix, Global Quota Tuner.
   - **Permissions :** `READ_ALL_BUILDINGS`, `DISPATCH_CRITICAL_ORDERS`, `OVERRIDE_PRIORITIES`.
2. **02. ARBITER.LOGIC**
   - **Type :** TYPE_B_SERVICE
   - **Rôle :** Arbitre déterministe d'allocation de priorités CPU/GPU sans deadlocks.
   - **Outils :** FIFO Queue Manager, Resource Scheduler, Priority Queue Lock.
   - **Permissions :** `ALLOCATE_CPU`, `ALLOCATE_BANDWIDTH`, `ENFORCE_TIMEOUTS`.
3. **03. AGENT.DISPATCHER**
   - **Type :** TYPE_C_HYBRID
   - **Rôle :** Routeur et gestionnaire de files de tâches inter-agents.
   - **Outils :** Event Bus Router, Semantic Tagger, Payload Classifier.
   - **Permissions :** `ROUTE_EVENT_BUS`, `CLASSIFY_INTENT`, `TAG_PAYLOAD`.
4. **04. SYS.WATCHDOG**
   - **Type :** TYPE_B_SERVICE
   - **Rôle :** Détecteur de pannes, auto-guérison et résilience cluster.
   - **Outils :** Healthcheck Daemon, Crash Recovery Loop, Memory Leak Detector.
   - **Permissions :** `RESTART_DAEMONS`, `KILL_ZOMBIE_WORKERS`, `ALERT_ADMIN`.
5. **05. GLOBAL.SYNAPSE**
   - **Type :** TYPE_A_IA
   - **Rôle :** Synthèse holistique et visualisation globale de l'état de la ville.
   - **Outils :** Global State Aggregator, Macro Trend Modeler, Summary Generator.
   - **Permissions :** `READ_ALL_METRICS`, `GENERATE_EXECUTIVE_SUMMARY`.

---

## 2. AI.GENCY (5 Agents : #06 à #10)
6. **06. DIRECTOR.GENCY**
   - **Type :** TYPE_A_IA
   - **Rôle :** Négociateur commercial et relations B2B à haute valeur ajoutée.
   - **Outils :** B2B Proposal Drafter, Client Negotiation AI, SLA Estimator.
   - **Permissions :** `SIGN_PROPOSALS`, `APPROVE_BUDGET`, `NEGOTIATE_FEES`.
7. **07. BRIEF.TRANSLATOR**
   - **Type :** TYPE_A_IA
   - **Rôle :** Conversion des besoins client en spécifications techniques formelles.
   - **Outils :** Spec Synthesizer, Acceptance Criteria Builder, Dependency Mapper.
   - **Permissions :** `WRITE_TECH_SPECS`, `DEFINE_DELIVERABLES`.
8. **08. SLA.CONTROLLER**
   - **Type :** TYPE_B_SERVICE
   - **Rôle :** Audit strict des délais d'engagement de service et jalons.
   - **Outils :** Stopwatch Engine, Milestone Verifier, Penalty Calculator.
   - **Permissions :** `MONITOR_DEADLINES`, `TRIGGER_SLA_ALERTS`.
9. **09. CLIENT.AVATAR**
   - **Type :** TYPE_C_HYBRID
   - **Rôle :** Interface interactive de support client et devis dynamiques 24/7.
   - **Outils :** Chat Protocol Relay, FAQ Engine, Ticket Dispatcher.
   - **Permissions :** `COMMUNICATE_EXTERNAL`, `OPEN_TICKETS`.
10. **10. TENDER.SCOUT**
    - **Type :** TYPE_A_IA
    - **Rôle :** Chasseur d'appels d'offres numériques et consultations éligibles.
    - **Outils :** Scraping Scanner, Eligibility Matrix, Margin Threshold Filter.
    - **Permissions :** `SEARCH_MARKET_LEADS`, `PREPARE_APPLICATION`.

---

## 3. R&D.IA (5 Agents : #11 à #15)
11. **11. NEURAL.ARCHITECT**
    - **Type :** TYPE_A_IA
    - **Rôle :** Architecte cognitif, optimisation des prompts et fine-tuning.
    - **Outils :** Prompt Optimizer, Few-Shot Synthesizer, Reasoning Graph.
    - **Permissions :** `COMPILE_PROMPTS`, `UPDATE_AGENT_INSTRUCTIONS`.
12. **12. BENCHMARK.RUNNER**
    - **Type :** TYPE_B_SERVICE
    - **Rôle :** Mesure de vitesse d'inférence, latence et ratio tokens/coûts.
    - **Outils :** Token Counter, Latency Timer, Cost/Accuracy Evaluator.
    - **Permissions :** `EXECUTE_BENCHMARKS`, `RECORD_EFFICIENCY_METRICS`.
13. **13. QUANTUM.EXPLORER**
    - **Type :** TYPE_A_IA
    - **Rôle :** Recherche exploratoire de nouveaux algorithmes autonomes.
    - **Outils :** ArXiv Prowler, Algorithmic Synthesizer, Novelty Scorer.
    - **Permissions :** `PROPOSE_NEW_ROLES`, `TEST_NOVEL_HEURISTICS`.
14. **14. PROMPT.COMPILER**
    - **Type :** TYPE_B_SERVICE
    - **Rôle :** Minification de contexte, suppression de redondances et JSON stripping.
    - **Outils :** Context Pruner, JSON Schema Stripper, AST Reducer.
    - **Permissions :** `STRIP_REDUNDANT_TOKENS`, `OPTIMIZE_SCHEMAS`.
15. **15. COGNITIVE.AUDITOR**
    - **Type :** TYPE_C_HYBRID
    - **Rôle :** Détection de dérives factuelles et neutralisation d'hallucinations.
    - **Outils :** Fact Check Validator, Schema Conformance Checker, Truth Verifier.
    - **Permissions :** `BLOCK_ERRONEOUS_OUTPUTS`, `FLAG_COGNITIVE_DRIFT`.

---

## 4. FACTORY.IA (6 Agents : #16 à #21)
16. **16. FORGE.MASTER**
    - **Type :** TYPE_A_IA
    - **Rôle :** Architecte logiciel, synthèse de code et orchestration de build.
    - **Outils :** Full-Stack Generator, Component Synthesizer, Architecture Assembler.
    - **Permissions :** `GENERATE_DIGITAL_PRODUCTS`, `ASSEMBLY_PIPELINE`.
17. **17. TS.TRANSPILER**
    - **Type :** TYPE_B_SERVICE
    - **Rôle :** Compilateur TypeScript strict et vérificateur de typage statique.
    - **Outils :** TypeScript Compiler (tsc), Rollup Engine, Tree Shaker.
    - **Permissions :** `COMPILE_TYPESCRIPT`, `GENERATE_DTS`, `FAIL_ON_TYPE_ERROR`.
18. **18. DOCKER.PACKAGER**
    - **Type :** TYPE_B_SERVICE
    - **Rôle :** Conteneurisation légère (Alpine) et empaquetage d'archives.
    - **Outils :** Dockerfile Synthesizer, Multi-Stage Builder, Alpine Minimizer.
    - **Permissions :** `BUILD_CONTAINER_IMAGES`, `PACKAGE_TARBALLS`.
19. **19. TEMPLATE.FORGER**
    - **Type :** TYPE_C_HYBRID
    - **Rôle :** Synthèse de squelettes UI et bibliothèques de composants React.
    - **Outils :** React Boilerplate Engine, Tailwind Styler, Lucide Icon Mapper.
    - **Permissions :** `SYNTHESIZE_UI_TEMPLATES`, `VALIDATE_ACCESSIBILITY`.
20. **20. ASSET.SYNTHESIZER**
    - **Type :** TYPE_C_HYBRID
    - **Rôle :** Génération d'actifs vectoriels SVG légers et favicons.
    - **Outils :** SVG Vector Engine, Favicon Packager, Color Harmonizer.
    - **Permissions :** `GENERATE_SVG`, `OPTIMIZE_ASSETS`.
21. **21. DEPENDENCY.LOCKER**
    - **Type :** TYPE_B_SERVICE
    - **Rôle :** Contrôle des sommes de contrôle SHA-256 et audit de licences npm.
    - **Outils :** npm Audit Checker, Checksum Verifier (SHA-256), License Scanner.
    - **Permissions :** `BLOCK_MALICIOUS_DEPS`, `ENFORCE_PERMISSIVE_LICENSES`.

---

## 5. MARKET.IA (5 Agents : #22 à #26)
22. **22. MARKET.BOT** (Type B) — Gestionnaire de panier d'achat, catalogue et webhooks.
23. **23. PRICE.OPTIMIZER** (Type C) — Modélisation de l'élasticité prix et marge maximale.
24. **24. INSTANT.DISPATCHER** (Type B) — Expédition de liens de téléchargement signés sous 1.2s.
25. **25. PROMO.BROADCASTER** (Type A) — Rédaction d'annonces de lancement et offres de bundles.
26. **26. REFUND.MEDIATOR** (Type C) — Gestionnaire de litiges et remboursements instantanés.

---

## 6. TRAFFIC.IA (5 Agents : #27 à #31)
27. **27. TRAFFIC.DISPATCHER** (Type B) — Routage GeoDNS et répartition de charge Anycast.
28. **28. SEO.KEYWORD.PROWLER** (Type A) — Recherche sémantique de mots-clés et opportunités SERP.
29. **29. BACKLINK.BUILDER** (Type C) — Partenariats de liens d'autorité et référencement propre.
30. **30. SOCIAL.FEEDER** (Type A) — Diffusion d'extraits de code utiles et veille technique.
31. **31. CONVERSION.ANALYST** (Type B) — Analyse de funnels A/B et mesures de churn.

---

## 7. BANK.IA (6 Agents : #32 à #37)
32. **32. COST.GUARD** (Type B) — Gardien des plafonds API (60€/j) et serveurs (250€/m).
33. **33. VAULT.GUARD** (Type B) — Rapprochement bancaire strict des fonds encaissés.
34. **34. LEDGER.AUDITOR** (Type B) — Grand livre comptable immuable en partie double.
35. **35. PROFIT.CALCULATOR** (Type B) — Calcul mathématique de la marge nette réelle.
36. **36. TAX.PROVISIONER** (Type B) — Séquestre automatique de TVA (20%) et provisions.
37. **37. FINANCIAL.SCENARIST** (Type A) — Simulations de trésorerie et scénarios de crise à 24 mois.

---

## 8. AI.DEPTH.CENTMINE (6 Agents : #38 à #43)
38. **38. MINE.GUARD** (Type B) — Sentinelle anti-fraude et vérification de validité de calculs.
39. **39. MINER.PRIME** (Type B) — Orchestrateur du cluster de hachage distribué (142 MH/s).
40. **40. SHAFT.SURVEYOR** (Type B) — Télémétrie thermique des galeries Gold, Quartz et Cobalt.
41. **41. ORE.REFINER** (Type C) — Structuration et vectorisation des données extraites.
42. **42. ENERGY.ECONOMIZER** (Type B) — Bascule automatique de puissance en heures creuses.
43. **43. BLOCK.VALIDATOR** (Type B) — Scellement cryptographique ECDSA des blocs minés.

---

## 9. CONTRACT.IA (5 Agents : #44 à #48)
44. **44. JURIST.AI** (Type A) — Rédacteur de licences logicielles et CGV inattaquables.
45. **45. RGPD.SENTINEL** (Type B) — Contrôleur de conformité, minimisation et droit à l'oubli.
46. **46. LICENSE.ENFORCER** (Type B) — Générateur de clés de licence HMAC inviolables.
47. **47. RISK.SCANNER** (Type C) — Détection de clauses abusives et risques contractuels.
48. **48. IP.PROTECTOR** (Type A) — Horodatage et preuve d'antériorité de propriété intellectuelle.

---

## 10. SUBSCRIPTION.IA (4 Agents : #49 à #52)
49. **49. RECUR.MANAGER** (Type B) — Facturation mensuelle Stripe et suivi du MRR (720 €).
50. **50. CHURN.PREDICTOR** (Type A) — Détection précoce des baisses d'activité des utilisateurs.
51. **51. RETENTION.AGENT** (Type C) — Offres de mise en pause et réductions personnalisées.
52. **52. UPSELL.NAVIGATOR** (Type A) — Proposition d'extensions de forfait au moment opportun.

---

## 11. DUMP & INCINERATOR (4 Agents : #53 à #56)
53. **53. PURGE.MASTER** (Type B) — Ordonnateur de destruction des projets déficitaires.
54. **54. SCRAP.RECYCLER** (Type B) — Extraction de modules réutilisables avant incinération.
55. **55. CACHE.VACUUM** (Type B) — Purge automatique des fichiers temporaires (18.4 Go libérés).
56. **56. POSTMORTEM.ANALYST** (Type A) — Rédaction des retours d'expérience et leçons d'échec.

---

## 12. MEDIA.IA (5 Agents : #57 à #61)
57. **57. STUDIO.EDITOR** (Type A) — Rédacteur en chef des newsletters spécialisées (4 850 abonnés).
58. **58. AUDIO.PODCASTER** (Type C) — Synthèse vocale de podcasts et encodage audio 192 kbps.
59. **59. COVER.DESIGNER** (Type C) — Composition de bannières OpenGraph 1200x630 légères.
60. **60. NEWSLETTER.DISPATCHER** (Type B) — Acheminement SMTP avec gestion zéro-rebond.
61. **61. AUDIENCE.ENGAGER** (Type A) — Modération de débats et collecte de questions lecteurs.

---

## 13. PLUGIN.STORE.IA (4 Agents : #62 à #65)
62. **62. PLUGIN.CURATOR** (Type C) — Revue de sécurité et catalogue d'extensions officielles.
63. **63. SANDBOX.TESTER** (Type B) — Exécution en bac à sable isolé pour éliminer les fuites de données.
64. **64. STORE.METRICS** (Type B) — Télémétrie respectueuse de la vie privée des installations.
65. **65. VENDOR.SETTLER** (Type B) — Répartition automatique des commissions (85% développeurs).

---

## 14. WEB.ESTATE.IA (5 Agents : #66 à #70)
66. **66. DOMAIN.KEEPER** (Type B) — Renouvellement automatique DNSSEC et certificats TLS.
67. **67. UPTIME.SENTINEL** (Type B) — Ping mondial 10s et surveillance de 99.98% de disponibilité.
68. **68. CMS.GENERATOR** (Type C) — Déploiement JAMstack pré-rendu ultra-rapide.
69. **69. HOSTING.ALLOCATOR** (Type B) — Régulation scale-to-zero pour minimiser les coûts d'inactivité.
70. **70. VALUATION.EXPERT** (Type A) — Évaluation marchande du portefeuille d'actifs web (18 500 €).

---

## 15. OPPORTUNITY.LAB (6 Agents : #71 à #76)
71. **71. SCOUT.AI** (Type A) — Scanner de 340 opportunités/jour sur les besoins logiciels réels.
72. **72. FEASIBILITY.CALC** (Type B) — Calculateur de faisabilité technique et délais < 48h.
73. **73. MARGIN.PREDICTOR** (Type B) — Calcul strict du seuil de rentabilité sans gains fictifs.
74. **74. REVENUE.ENGINE** (Type B) — Moteur central d'arbitrage de rentabilité nette réelle.
75. **75. NICHE.DRILLER** (Type A) — Cartographe de micro-marchés B2B à faible concurrence.
76. **76. PROTOTYPE.TRIGGER** (Type C) — Déclencheur d'expérimentations sous budget plafonné à 50€.

---

## 16. CCC.CONNECT HUB (18 Agents : #77 à #94)
77. **77. CCC.CORE.SUPERVISOR** (Type B) — Supervision de l'instance locale CCC CORE.
78. **78. TOPOLOGY.MAPPER** (Type B) — Cartographie des nœuds sur le sous-réseau local.
79. **79. WEBSOCKET.DISPATCH** (Type B) — Multiplexage des liaisons bidirectionnelles (1.4 ms).
80. **80. EVENT.BROKER** (Type B) — Bus pub/sub d'événements structurés inter-appareils.
81. **81. PERMISSION.CONTROLLER** (Type B) — Matrice de droits RBAC par appareil.
82. **82. LOCAL.CACHE.SYNC** (Type B) — Gestionnaire de tampon hors-ligne et réconciliation.
83. **83. TELEMETRY.RECORDER** (Type B) — Journalisation infalsifiable des acquittements d'ordres.
84. **84. RECOVERY.DAEMON** (Type B) — Reconnexion automatique avec backoff exponentiel.

### Rôles Spécifiques #85 à #94 du Master Prompt :
85. **85. CONNECT.MASTER** (Type C) — Orchestrateur maître de l'écosystème multi-plateformes.
86. **86. DEVICE.DISCOVERY** (Type B) — Découverte réseau locale mDNS / SSDP.
87. **87. QR.LINK** (Type B) — Appairage éphémère par QR code (TTL 120s, PIN 6 chiffres, 0 clé privée).
88. **88. SYNC.MASTER** (Type B) — Synchronisation bidirectionnelle des états (résolution LWW).
89. **89. WINDOWS.BRIDGE** (Type B) — Passerelle native IPC et notifications pour Windows 11.
90. **90. ANDROID.BRIDGE** (Type B) — Passerelle native sockets pour smartphones et tablettes Android 15.
91. **91. WEAR.BRIDGE** (Type B) — Passerelle Bluetooth basse consommation pour montres Wear OS.
92. **92. TV.BRIDGE** (Type B) — Passerelle d'affichage mural pour Google TV (masquage soldes privés).
93. **93. CCC.APP.MANAGER** (Type B) — Gestionnaire du cycle de vie et de la mémoire des applications CCC.
94. **94. CONNECTION.GUARD** (Type B) — Pare-feu cryptographique, chiffrement AES-256 et contrôle RBAC.

