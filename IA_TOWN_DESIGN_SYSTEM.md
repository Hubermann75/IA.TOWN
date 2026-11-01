# IA TOWN — SYSTÈME DE DESIGN "CYBERPUNK SHELTER" V5.0

## 1. Philosophie & Influences Visuelles
Le design d'IA TOWN fusionne quatre influences de référence :
1. **Fallout Shelter :** Vue en coupe transversale des bâtiments avec étages visibles, pièces compartimentées et robots au travail.
2. **Nintendo (Expressivité & Clarté) :** Micro-animations expressives, silhouette lisible au premier coup d'œil, feedback immédiat lors des clics.
3. **Apple (Lisibilité & Typographie) :** Hiérarchie stricte, marges aérées, alignements rigoureux, absence totale de bruit visuel inutile.
4. **Bethesda (Profondeur & Immersion) :** Décors détaillés, tuyauteries industrielles, écrans de contrôle, wagonnets de minerai, cohérence diégétique.

---

## 2. Palette de Couleurs & Accents

| Usage / Composant | Couleur Tailwind | Code Hex | Signification / Rôle |
| :--- | :--- | :--- | :--- |
| **Fond Principal** | Slate 950 / Deep Charcoal | `#020617` / `#090d16` | Contraste sombre favorisant la concentration |
| **Panneaux & Cartes** | Slate 900 / Slate 850 | `#0f172a` / `#162032` | Structure de calque net avec bordures Slate 800 |
| **Bordures Actives** | Slate 700 / Slate 800 | `#334155` / `#1e293b` | Délimitation fine sans halo agressif |
| **Accent CCC Connect** | High-Tech Neon Cyan | `#00f0ff` / `#38bdf8` | Ponts de connectivité, flux de transmission |
| **Accent Bank & Vault** | Emerald / Gold | `#10b981` / `#eab308` | Fonds réellement encaissés, équilibre financier |
| **Accent Cost Guard** | Crimson Red | `#ef4444` / `#f87171` | Dépenses réelles, alertes budgétaires, coupure |
| **Accent Factory & Code** | Amber / Orange | `#f59e0b` / `#ea580c` | Fabrication logicielle, forge de scripts |
| **Accent R&D & IA** | Purple / Violet | `#c084fc` / `#a855f7` | Inférence cognitive, optimisation des modèles |

---

## 3. Typographie & Polices
- **Titres & Identifiants :** Police Cyberpunk géométrique, tout en majuscules avec espacement étendu (`tracking-wider`, `font-mono-code` ou `font-cyber`).
- **Corps de Texte :** Sans-serif moderne (Inter / Roboto / System UI), interlignage généreux (`leading-relaxed`) garantissant une lecture reposante.
- **Télémétrie & Chiffres :** Police à chasse fixe (`font-mono-code` / `monospace`) pour l'alignement parfait des montants en euros, latences et hashrates.

---

## 4. Règles d'Animation & Rendu
- **Fluidité Visée :** 60 images par seconde constantes.
- **Wagonnets & Galeries :** Déplacement fluide sur rails avec translation CSS optimisée par GPU (`will-change: transform`).
- **Robots Ouvriers :** Balancement de bras et voyants d'activité cadencés entre 1.5s et 3s.
- **Antenne CCC Hub :** Ondes concentriques animées avec opacité décroissante représentant le rayonnement radio.
- **Interdictions :** Pas d'effets de clignotement épileptique, pas de saturation à 100% sur de larges surfaces, pas de pill buttons génériques d'IA.
