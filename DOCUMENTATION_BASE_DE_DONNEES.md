# Bestie LipGloss — Documentation fonctionnelle pour la conception de la base de données

> **Statut actuel du projet** : le site fonctionne entièrement avec des données en mémoire (stores Zustand côté client + stubs en mémoire dans les routes API Next.js). Aucune base de données n'est encore connectée. Toutes les routes API contiennent déjà des commentaires `// TODO (BDD)` qui indiquent précisément la requête SQL prévue à l'endroit où elle devra être branchée.
>
> **Objectif de ce document** : donner au gestionnaire de base de données une vue complète du fonctionnement du site (parcours utilisateur, règles métier, calculs) afin qu'il puisse concevoir un schéma de base de données qui couvre tous les besoins réels de l'application, sans deviner les règles à partir du seul code.
>
> Ce document **ne crée aucune base de données** — il s'agit uniquement d'une spécification fonctionnelle.

---

## Table des matières

1. [Vue d'ensemble technique](#1-vue-densemble-technique)
2. [Glossaire des statuts (point d'attention important)](#2-glossaire-des-statuts-point-dattention-important)
3. [Entités et champs détaillés](#3-entités-et-champs-détaillés)
4. [Parcours utilisateur détaillés](#4-parcours-utilisateur-détaillés)
5. [Parcours administrateur détaillés](#5-parcours-administrateur-détaillés)
6. [Règles de calcul (prix, livraison, promo)](#6-règles-de-calcul-prix-livraison-promo)
7. [Authentification et sécurité — état actuel](#7-authentification-et-sécurité--état-actuel)
8. [Inventaire des stubs en mémoire à remplacer](#8-inventaire-des-stubs-en-mémoire-à-remplacer)
9. [Questions ouvertes pour le gestionnaire BDD](#9-questions-ouvertes-pour-le-gestionnaire-bdd)

---

## 1. Vue d'ensemble technique

- **Stack** : Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zustand (état client avec persistance `localStorage`), Framer Motion.
- **Langues** : site disponible en français, anglais, espagnol (sélection manuelle, stockée côté client).
- **Devises** : tous les prix et montants s'affichent en **USD** sur l'ensemble du site (client et admin). Seule exception : lorsque le client sélectionne **MonCash** comme mode de paiement, le montant lui est présenté en **HTG** (c'est la devise de MonCash en Haïti). Taux de conversion fixe : **1 USD = 130 HTG**.
- **Catalogue actuel** : **8 produits individuels**, chaque teinte de gloss étant exposée comme un produit à part entière (plus de regroupement par "collection" ni de variante) :
  - 5 produits issus de la gamme *Honey* (Brown, Pink, Red, Rosée, Rouge Grenadier)
  - 3 produits issus de la gamme *Labubu* (Pastel, Pink, Red)
  - Prix unique : **1690 HTG / $13 USD**.
  - L'admin ajoute un produit directement (nom, teinte, prix, photo, stock, ingrédients, bénéfices) sans catégorie ni photo d'introduction séparée.
- **Paiements** :
  - **MonCash** : intégration de l'API officielle MonCash / Digicel (`/api/paiement/moncash/initier`). Le client est redirigé vers l'interface MonCash pour effectuer la transaction ; confirmation via `/api/paiement/moncash/verifier`. Nécessite les variables d'environnement `MONCASH_CLIENT_ID`, `MONCASH_CLIENT_SECRET`, `MONCASH_ENV`.
  - **Zelle** : manuel — le client envoie et fournit une référence de transaction ; l'admin valide manuellement.
  - **Carte** : simulation uniquement (champs carte saisis côté front, aucune passerelle réelle branchée). Pas de champ "Référence" pour la carte (retiré — non nécessaire pour ce mode).

---

## 2. Glossaire des statuts (point d'attention important)

⚠️ **Le code actuel utilise DEUX nomenclatures différentes pour le statut d'une commande**, car le panier client et le tableau de bord admin sont aujourd'hui deux stores séparés qui ne communiquent pas entre eux (ils seront unifiés une fois la BDD branchée) :

| Étape du cycle de vie | Valeur côté **client** (`ordersStore`) | Valeur côté **admin** (`adminStore`) |
|---|---|---|
| Commande passée, en attente de validation | `attente` | `pending` |
| Paiement vérifié / commande validée | `valide` | `paid` |
| En cours de livraison | `livraison` | `shipping` |
| Livrée | `livre` | `delivered` |
| Annulée | `annule` | `cancelled` |

➡️ **Recommandation pour la BDD** : la table `Commande` doit avoir **un seul champ `statut`** avec une nomenclature unique (proposition : utiliser les valeurs anglaises `pending/paid/shipping/delivered/cancelled`, qui sont déjà utilisées comme valeurs canoniques dans les routes API `/api/commandes/[id]/statut`). Le front-end fera la traduction à l'affichage.

De même, il existe un statut séparé pour le **paiement** (`Paiement.statut` : `en_attente | validé | refusé`) qui est indépendant du statut de la commande — une commande peut être `pending` (en attente d'expédition) alors que son paiement est déjà `validé`.

---

## 3. Entités et champs détaillés

### 3.1 Utilisateur

Représente un client (et potentiellement un administrateur, voir §7).

| Champ | Type proposé | Obligatoire | Notes |
|---|---|---|---|
| id | INT / UUID (PK) | ✓ | Actuellement absent du modèle client (`user.id` n'existe pas dans `authStore` !) — voir §9 |
| nom_complet | VARCHAR | ✓ | Prénom + nom concaténés à l'inscription |
| pseudo | VARCHAR | ✓ | **Nom d'affichage principal** — saisi obligatoirement à l'inscription (min. 3 caractères, sans espace). Affiché dans le header et sur la page Mon Compte à la place du nom complet. Modifiable depuis "Mes informations". |
| email | VARCHAR (UNIQUE) | ✓ | Utilisé comme identifiant de connexion |
| telephone | VARCHAR | — | Format `+509 XXXX XXXX` (indicatif pays + numéro local) |
| mot_de_passe_hash | VARCHAR | ✓ | ⚠️ Actuellement **non implémenté** — l'inscription ne stocke aucun mot de passe en base, et la connexion ne vérifie aucun mot de passe réel (voir §7) |
| date_inscription | DATETIME | ✓ | |
| email_verifie | BOOLEAN | ✓ | Vérifié via OTP à l'inscription |
| role | ENUM('client','admin') | ✓ | Voir §7 pour la gestion actuelle de l'admin |

**Relations** : 1 Utilisateur → N Adresses, 1 Utilisateur → N Commandes, 1 Utilisateur → N Avis, 1 Utilisateur → N Favoris, 1 Utilisateur → N CodePromo (coupons assignés).

---

### 3.2 Adresse

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| id | INT/UUID (PK) | ✓ | |
| id_utilisateur | FK → Utilisateur | ✓ | |
| label | VARCHAR | ✓ | Nom donné par l'utilisateur (ex. "Maison", "Bureau") |
| pays | ENUM('hti','usa') | ✓ | Détermine quels champs ci-dessous s'appliquent |
| adresse | VARCHAR | ✓ | Rue / numéro |
| departement | VARCHAR | si pays = hti | 10 départements d'Haïti (liste fermée, voir `app/mon-compte/informations/page.tsx`) |
| ville | VARCHAR | ✓ | Commune (Haïti) ou ville (USA) — liste fermée également |
| quartier | VARCHAR | — | Optionnel, Haïti uniquement |
| state | VARCHAR(2) | si pays = usa | Code état US à 2 lettres |
| zip_code | VARCHAR | si pays = usa | Code postal US |
| instructions_livraison | TEXT | — | Saisi à l'étape "Livraison" du checkout, propre à **chaque commande**, pas à l'adresse elle-même (voir §4.4) |
| est_principale | BOOLEAN | ✓ | Une seule adresse principale par utilisateur |

**Remarque** : la logique de calcul des frais de livraison utilise `adresse.ville` pour chercher la `ZoneLivraison` correspondante (Haïti) — donc le nom de `ville` doit correspondre exactement à `ZoneLivraison.nom_zone` pour qu'un tarif soit trouvé (sinon tarif par défaut de 400 HTG appliqué).

---

### 3.3 Produit

⚠️ **Changement récent** : le concept de "variante/teinte" et de "collection" a été retiré du site à la demande du métier. Chaque teinte de gloss est désormais un produit autonome et complet — il n'y a plus de table séparée pour les variantes (voir ancienne version de ce document si besoin de retrouver l'historique). Un produit = une teinte = une fiche complète.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| id | INT (PK) | ✓ | |
| slug | VARCHAR (UNIQUE) | ✓ | Utilisé dans l'URL `/boutique/[slug]`, ex. `honey-brown` |
| nom | VARCHAR | ✓ | Ex. "Bestie Honey – Brown" |
| teinte | VARCHAR | — | Texte d'affichage descriptif de la teinte, ex. "Brun caramel chaleureux" |
| prix_htg | DECIMAL | ✓ | Actuellement 1690 pour tous |
| prix_usd | DECIMAL | ✓ | Actuellement 13 pour tous |
| description | TEXT | ✓ | |
| stock | INT | ✓ | Stock de **ce** produit (chaque teinte ayant désormais sa propre fiche, le stock est sans ambiguïté propre à chaque produit) |
| stock_alerte_seuil | INT | — | Seuil sous lequel afficher une alerte stock faible |
| badge | VARCHAR | — | Texte libre affiché en badge, ex. "Best-seller ✨" |
| badge_type | ENUM('bestseller','artisanal','nouveau','none') | — | |
| image | VARCHAR (URL) | — | Photo unique du produit (l'admin n'a qu'un seul champ photo à remplir, plus de "photo d'introduction" distincte) |
| couleur_fond | VARCHAR | — | Couleur (classe Tailwind ou hex) utilisée comme fond de carte produit / repli si pas de photo |
| is_active | BOOLEAN | ✓ | Produit visible sur le site ou non (= "publié" côté admin) |
| is_bestseller | BOOLEAN | — | |
| ingredients | voir 3.3bis | | Liste — table séparée recommandée |
| benefices | voir 3.3bis | | Liste — table séparée recommandée |

**3.3bis — Listes attachées au produit** (actuellement stockées comme simples tableaux de chaînes dans le code) :
- `ProduitIngredient(id, id_produit, libelle, ordre)`
- `ProduitBenefice(id, id_produit, libelle, ordre)`

---

### 3.4 ImageProduit

Une route API (`/api/produits/[id]/images`) existe déjà en stub pour une galerie d'images multiples par produit (en plus de la photo principale). Actuellement non utilisée par le front (qui se base sur `Produit.image` en fallback), mais prévue.

| Champ | Type | Notes |
|---|---|---|
| id | INT (PK) | |
| id_produit | FK → Produit | |
| url | VARCHAR | |
| alt_text | VARCHAR | — |
| ordre | INT | |
| est_principale | BOOLEAN | |

---

### 3.5 Panier / PanierItem

Panier serveur (pour utilisateurs connectés — synchronisé au login depuis le panier local du navigateur, voir §4.3).

| Table | Champs | Notes |
|---|---|---|
| **Panier** | id, id_utilisateur (FK, UNIQUE) | Un seul panier actif par utilisateur |
| **PanierItem** | id, id_panier (FK), id_produit (FK), quantite, date_ajout | Clé d'unicité logique : `(id_panier, id_produit)` — depuis la suppression des variantes, chaque produit a une seule version, donc un seul `PanierItem` par produit possible |

⚠️ Le panier **invité** (non connecté) est géré uniquement en `localStorage` côté client — il n'est synchronisé vers le serveur qu'à la connexion (`syncCartOnLogin`). Pas de besoin de table BDD pour les invités.

---

### 3.6 Commande

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| id | VARCHAR (PK) | ✓ | Format **`BES-AAAA-XXXXXX`** généré côté client (année + 6 caractères alphanumériques aléatoires) — voir §9 sur la fiabilité de cette génération |
| id_utilisateur | FK → Utilisateur | ✓ | |
| statut | ENUM (voir §2) | ✓ | |
| date_creation | DATETIME | ✓ | |
| sous_total_htg / sous_total_usd | DECIMAL | ✓ | Avant réduction et livraison |
| code_promo_utilise | VARCHAR | — | Code appliqué, le cas échéant |
| montant_reduction_htg / usd | DECIMAL | — | |
| type_livraison | ENUM('standard','express') | ✓ | Sélectionné par le client à l'étape Livraison du checkout |
| frais_livraison_htg / usd | DECIMAL | ✓ | Calculé à la commande (snapshot — ne doit pas changer si le tarif de zone change après coup) |
| total_htg / total_usd | DECIMAL | ✓ | |
| devise_paiement_choisie | ENUM('HTG','USD') | ✓ | HTG si MonCash, USD si Zelle/Carte |
| adresse_livraison_snapshot | TEXT ou FK figée | ✓ | Voir remarque ci-dessous |
| instructions_livraison | TEXT | — | |
| note_client | TEXT | — | Message libre du client à la commande |
| mode_paiement | ENUM('moncash','zelle','card') | ✓ | |

**Remarque importante (snapshot)** : l'adresse de livraison et le contenu du panier doivent être **figés au moment de la commande** (copie des valeurs), car si le client modifie ou supprime son adresse plus tard, ou si le prix d'un produit change, l'historique de la commande ne doit pas être affecté. Le code actuel applique déjà ce principe pour les articles (`orderItems` est un instantané pris avant `clearCart()`).

---

### 3.7 LigneCommande (articles d'une commande)

| Champ | Type | Notes |
|---|---|---|
| id | INT (PK) | |
| id_commande | FK → Commande | |
| nom_produit | VARCHAR | **Copié** au moment de la commande (snapshot) |
| teinte | VARCHAR | Snapshot |
| quantite | INT | |
| prix_unitaire_htg | DECIMAL | Snapshot |
| prix_unitaire_usd | DECIMAL | Snapshot |
| image_snapshot | VARCHAR | Snapshot |
| id_produit | FK → Produit | Référence pour analytics, mais pas pour l'affichage historique |

---

### 3.8 Paiement

Déjà esquissé dans `app/api/paiement/soumettre/route.ts` et `app/api/paiement/[id]/valider/route.ts`.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| id | INT (PK) | ✓ | |
| id_commande | FK → Commande (UNIQUE) | ✓ | Un seul enregistrement de paiement actif par commande — une re-soumission après refus **met à jour** la ligne existante plutôt que d'en créer une nouvelle |
| mode_paiement | ENUM('moncash','zelle','card') | ✓ | |
| statut | ENUM('en_attente','validé','refusé') | ✓ | |
| date_paiement | DATETIME | ✓ | Date de soumission par le client |
| montant_paye | DECIMAL | — | Déclaré par le client, pas vérifié automatiquement |
| devise_paiement | ENUM('HTG','USD') | ✓ | |
| reference_transaction | VARCHAR | — | Référence MonCash/Zelle fournie par le client |
| note_admin | TEXT | — | Commentaire interne ajouté à la validation/refus |
| date_validation | DATETIME | — | |
| id_admin_validateur | FK → Utilisateur (role=admin) | — | |

**Règle métier à respecter** :
- Si un paiement existe déjà avec statut `en_attente` → bloquer toute nouvelle soumission (message : preuve déjà envoyée, en cours de vérification).
- Si déjà `validé` → bloquer (commande déjà payée).
- Si `refusé` → autoriser une nouvelle soumission, qui **réinitialise** le statut à `en_attente`.

---

### 3.9 HistoriqueStatutCommande

Trace chaque changement de statut d'une commande (déjà prévu dans `app/api/commandes/[id]/statut/route.ts`).

| Champ | Type | Notes |
|---|---|---|
| id | INT (PK) | |
| id_commande | FK → Commande | |
| ancien_statut | VARCHAR (nullable) | |
| nouveau_statut | VARCHAR | |
| id_admin | FK → Utilisateur (nullable) | Admin ayant fait le changement |
| note | TEXT (nullable) | |
| date_changement | DATETIME | |

---

### 3.10 Avis (reviews produit)

Déjà modélisé dans `app/api/avis/route.ts` avec des données d'exemple.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| id | INT (PK) | ✓ | |
| id_produit | FK → Produit | ✓ | |
| id_utilisateur | FK → Utilisateur | ✓ | ⚠️ Actuellement codé en dur à `0` côté front (`ProductDetailClient.tsx` ligne ~112) — la session utilisateur réelle doit fournir cet ID une fois la BDD branchée |
| nom_client | VARCHAR | ✓ | Affiché publiquement (peut différer du nom complet du compte) |
| note | INT (1 à 5) | ✓ | |
| texte | TEXT | ✓ | |
| date_creation | DATETIME | ✓ | |
| statut | ENUM('en_attente','publie','refuse') | ✓ | Modération obligatoire avant affichage public |
| commande_verifiee | BOOLEAN | ✓ | Doit être déterminé en vérifiant si l'utilisateur a une commande **livrée** contenant ce produit — actuellement toujours `false` (TODO) |

**Règle d'unicité** : un utilisateur ne peut laisser qu'**un seul avis par produit** (contrainte `UNIQUE(id_utilisateur, id_produit)`).

---

### 3.11 CodePromo

| Champ | Type | Notes |
|---|---|---|
| id | INT (PK) | |
| code | VARCHAR (UNIQUE) | Stocké et comparé en MAJUSCULES |
| type_reduction | ENUM('pct','fixe') | `pct` = pourcentage (ex. 0.10 = 10%), `fixe` = montant fixe en HTG |
| reduction_valeur | DECIMAL | Pourcentage (0–1) ou montant HTG selon le type |
| date_expiration | DATETIME (nullable) | |
| nb_utilisations_max | INT (nullable) | NULL = illimité |
| nb_utilisations_actuel | INT | Incrémenté à chaque commande validée utilisant ce code |
| montant_minimum | DECIMAL (nullable) | Sous-total minimum requis en HTG |
| actif | BOOLEAN | |

**Flux d'attribution** (résolu) :
1. L'**admin** crée un coupon depuis `/admin/coupons` → `POST /api/promo/admin` (protégé par cookie admin).
2. L'**utilisateur** saisit manuellement le code dans "Mon Compte" → validé via `GET /api/promo/check?code=...` qui retourne uniquement `{ valid: true/false }` (sans révéler la raison d'invalidité, ni les codes existants).
3. Si valide, le code est ajouté à `user.coupons` en `localStorage` (futur : table `UtilisateurCodePromo(id_utilisateur, code)`).
4. Au **checkout**, sélection dans le menu déroulant → validation complète via `GET /api/promo/valider?code=...&montant=...` (inclut la vérification du montant minimum — le `/check` n'en fait pas).

**Routes API coupons** :
- `GET /api/promo/admin` — liste tous les codes (admin uniquement)
- `POST /api/promo/admin` — crée un code (admin uniquement)
- `PATCH /api/promo/admin` — toggle actif/inactif (admin uniquement)
- `DELETE /api/promo/admin` — supprime un code (admin uniquement)
- `GET /api/promo/check?code=...` — vérifie si un code est valide pour l'ajouter à un compte (public, retourne uniquement valid/invalid)
- `GET /api/promo/valider?code=...&montant=...` — validation complète au checkout (public)

---

### 3.12 ZoneLivraison

Déjà modélisé avec des données réelles dans `app/api/zones-livraison/route.ts`. Chaque zone propose désormais deux niveaux de service : **Standard** et **Express**.

| Champ | Type | Notes |
|---|---|---|
| id | INT (PK) | |
| nom_zone | VARCHAR (UNIQUE) | Doit correspondre exactement au champ `ville` de l'adresse pour être retrouvé |
| pays | ENUM('hti','usa') | Permet de retrouver la zone USA sans chercher par `ville` |
| frais_htg | DECIMAL | Tarif Standard (HTG) |
| frais_usd | DECIMAL (nullable) | Tarif Standard (USD) — si NULL, front convertit `frais_htg / 130` |
| seuil_gratuit | DECIMAL (nullable) | Sous-total à partir duquel la livraison **Standard** est gratuite. Express n'est jamais gratuit. |
| delai_min_heures / delai_max_heures | INT (nullable) | Délai Standard affiché ("24–48h") |
| frais_express_htg | DECIMAL (nullable) | Tarif Express (HTG) — NULL = Express non disponible pour cette zone |
| frais_express_usd | DECIMAL (nullable) | Tarif Express (USD) |
| delai_express_heures | INT (nullable) | Délai Express en heures (valeur unique, ex. 4h pour Port-au-Prince) |
| actif | BOOLEAN | |

**Données actuelles** (10 zones configurées) :
- 9 zones Haïti (Port-au-Prince centre, Pétion-Ville, Zone métropolitaine, Cap-Haïtien, Jacmel, Les Cayes, Gonaïves, Saint-Marc, Autre ville)
- 1 zone USA (`pays='usa'`) : Standard 3 500 HTG / $26.90 en 7–14 jours, Express 6 500 HTG / $50 en 72h

---

### 3.13 Favoris

Relation N-N simple entre Utilisateur et Produit (actuellement stockée uniquement en `localStorage`, jamais envoyée au serveur).

| Table | Champs |
|---|---|
| **Favori** | id_utilisateur (FK), id_produit (FK), date_ajout — clé primaire composite (id_utilisateur, id_produit) |

---

### 3.14 OtpVerification (vérification d'inscription)

⚠️ **Architecture modifiée — plus de table OTP nécessaire.** L'OTP utilise désormais une approche **JWT stateless** via `lib/otpJwt.ts` :

**Fonctionnement** :
1. À l'inscription, le serveur génère un code à 6 chiffres aléatoires + un **token signé HMAC-SHA256** contenant `{ email, codeHash, exp, name, telephone, pseudo }` (le code est haché avec le secret serveur — jamais exposé en clair dans le token).
2. Le code est envoyé par email (Brevo SMTP). Le token signé est retourné dans la réponse HTTP et stocké par le client en **`sessionStorage`**.
3. Quand l'utilisateur saisit son code, le front envoie `{ email, code, token }` au serveur.
4. Le serveur vérifie la signature HMAC, l'expiration, et compare le hash du code soumis avec celui dans le token — sans aucun stockage serveur.
5. En cas de succès : **connexion automatique immédiate** (les données `pendingUser` sont dans le token), redirection vers l'accueil. L'utilisateur n'a plus besoin de naviguer vers `/connexion`.

**Conséquence pour la BDD** : cette entité **n'a pas besoin de table SQL** — le JWT auto-expirant remplace entièrement le besoin de persistance. Seul le secret `OTP_SECRET` (variable d'environnement) doit être configuré de manière sécurisée sur le serveur.

Variables d'environnement requises : `OTP_SECRET` (secret HMAC), `BREVO_LOGIN_EMAIL`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`.

---

### 3.15 TokenReset (mot de passe oublié)

Déjà esquissé dans `lib/resetTokens.ts`.

| Champ | Type | Notes |
|---|---|---|
| token | VARCHAR (PK) | Aléatoire, 32 octets hexadécimaux |
| email | VARCHAR | |
| expires_at | DATETIME | Validité de **1 heure** |
| utilise | BOOLEAN | Un token est consommé (à usage unique) après utilisation |

---

### 3.16 Administrateur

Voir en détail au §7 — actuellement **pas une vraie table**, mais des identifiants fixes dans les variables d'environnement (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

---

## 4. Parcours utilisateur détaillés

### 4.1 Inscription

1. Le client remplit : prénom (obligatoire), nom (optionnel), **username / pseudo** (obligatoire, min. 3 caractères, sans espace — c'est le nom d'affichage principal sur le site), email (obligatoire), indicatif pays + numéro WhatsApp (obligatoire), mot de passe + confirmation (obligatoire, min. 6 caractères).
2. Le formulaire envoie une requête à `/api/otp/envoyer` avec `{email, name, telephone, pseudo}` → génère un code OTP à 6 chiffres, l'envoie par email (via Brevo/SMTP), **crée un token JWT signé** contenant toutes les données d'inscription (voir §3.14), retourne le token dans la réponse HTTP → stocké en `sessionStorage` côté client.
3. Le client est redirigé vers `/verification-email?email=...` où il saisit le code à 6 chiffres (6 cases séparées, focus automatique, collage supporté).
4. Code valable **2 minutes**, max protection par rate-limiting IP. Bouton "Renvoyer le code" disponible seulement quand le minuteur atteint 0 (nouveau token signé généré à chaque renvoi).
5. Une fois validé (`POST /api/otp/verifier` avec `{email, code, token}`) : **connexion automatique immédiate** — les données `pendingUser` extraites du token (name, email, telephone, pseudo) sont transmises au store `authStore`, l'utilisateur est connecté et redirigé vers l'accueil. Il n'y a plus de redirection vers `/connexion`.

⚠️ **Le mot de passe saisi à l'étape 1 n'est actuellement stocké nulle part** — ni en mémoire, ni transmis à la création du compte final. C'est un point à corriger absolument lors du branchement de la BDD (hashage + stockage du mot de passe doivent être ajoutés au flux, et le `pseudo` doit être persisté en base lors de la création du compte).

### 4.2 Connexion

- Champ "email ou nom d'utilisateur" + mot de passe.
- **Cas spécial** : si la valeur saisie dans le champ identifiant est exactement `admin`, le formulaire tente une connexion administrateur (`/api/admin/login`) avec le mot de passe saisi, comparé aux variables d'environnement `ADMIN_USERNAME`/`ADMIN_PASSWORD`. Limite de **5 tentatives par IP / 15 minutes**.
- **Cas client normal** : actuellement, **aucune vérification de mot de passe réelle n'est faite** contre une base — le compte est "connecté" simplement à partir de l'email saisi (simulation). Ceci devra être remplacé par une vérification réelle du hash de mot de passe en base.
- À la connexion réussie, le panier local (invité) est synchronisé vers le panier serveur (`syncCartOnLogin`) : chaque article local est envoyé via `/api/panier/add`, puis le panier serveur (s'il contient des articles) remplace le panier local.

### 4.3 Mot de passe oublié

1. `/mot-de-passe-oublie` → saisie de l'email → `/api/mot-de-passe/request` → génère un `TokenReset` valable 1h, envoie un lien par email (email non encore branché en prod, lien loggé en dev).
2. `/reinitialiser-mot-de-passe?token=...` → vérifie la validité du token (`GET /api/mot-de-passe/request?token=`), puis soumission du nouveau mot de passe (min. 6 caractères) → `/api/mot-de-passe/reset` → met à jour le hash en BDD et consomme (invalide) le token.

### 4.4 Boutique et fiche produit

- `/boutique` : liste de **tous** les produits actifs (un par teinte, plus de regroupement par collection), filtrables (tous / best-sellers / artisanaux), recherche texte (nom, teinte, description).
- `/boutique/[slug]` : page produit (server component, routes statiques générées via `generateStaticParams`). Affiche :
  - Galerie d'images (photo principale du produit, + galerie additionnelle optionnelle via `ImageProduit` si présente)
  - Ingrédients, bénéfices
  - **Avis clients** : chargés via `GET /api/avis?id_produit=X&statut=publie` — seuls les avis **modérés et publiés** sont visibles publiquement. Note moyenne calculée côté client à partir des avis publiés.
  - **Formulaire de nouvel avis** : nécessite d'être connecté (sinon ouvre la modale de connexion). Champs : note (1–5 étoiles), texte. Soumission → `POST /api/avis` → statut initial toujours `en_attente` (modération admin obligatoire avant publication).
  - Produits "similaires" (3 autres produits actifs, hors celui affiché).

### 4.5 Panier et tunnel de commande (checkout en 3 étapes)

Le panier est un objet client identifié par `variantKey = String(id_produit)` (chaque produit étant désormais une teinte unique et complète, il n'y a plus de sélection de teinte à faire dans le panier).

**Étape 0 — Panier**
- Liste des articles, quantités modifiables, suppression.
- Champ code promo (optionnel) — uniquement actionnable si connecté ; les codes promo disponibles pour ce compte sont listés dans un menu déroulant (`user.coupons`). Validation via `GET /api/promo/valider?code=...&montant=sous-total`.
- Estimateur de livraison : sélection d'une adresse déjà enregistrée pour prévisualiser les frais avant de continuer.
- Résumé : sous-total, réduction éventuelle, frais de livraison estimés, total.

**Étape 1 — Livraison**
- Affiche les coordonnées du compte (nom, téléphone) avec lien d'édition.
- Sélection d'une adresse enregistrée parmi celles du compte.
- **Sélecteur de type de livraison** : Standard ou Express (affiché uniquement si l'adresse est sélectionnée). Chaque option affiche son délai estimé et son coût en USD. L'Express n'est pas disponible pour toutes les zones (si `frais_express_htg IS NULL`, l'option est grisée).
- Champ "Instructions de livraison" (texte libre, optionnel, **propre à cette commande**).
- Un **numéro de commande est généré côté client** à ce moment (`BES-AAAA-XXXXXX`).

**Étape 2 — Paiement**
- Choix entre 3 méthodes :
  - **MonCash** : le client clique "Confirmer" → appel `POST /api/paiement/moncash/initier` → redirection vers l'interface MonCash (Digicel) → le paiement est effectué par le client dans l'interface MonCash → vérification via `GET /api/paiement/moncash/verifier?orderId=...`. Aucune saisie de référence manuelle.
  - **Zelle** : instructions affichées (email Zelle), champ **Référence de transaction** (obligatoire), soumission → `POST /api/paiement/soumettre`.
  - **Carte** : champs carte saisis (non traités par une vraie passerelle — simulation). Pas de champ référence (retiré pour ce mode).
- Champ "Note pour la commande" (optionnel, tous modes).
- Si le code promo est valide, son compteur d'utilisation est incrémenté à la soumission (pas avant).
- En cas de succès : commande enregistrée dans `ordersStore` avec snapshot complet (voir §3.6 et LigneCommande §3.7), panier vidé, passage à l'étape 3.

**Étape 3 — Reçu complet**
- Affichage d'un **reçu détaillé** comprenant :
  - Liste des articles (nom, teinte, quantité, prix unitaire × quantité)
  - Sous-total
  - Coupon appliqué (code + montant de réduction) — si applicable
  - Frais de livraison (Standard ou Express)
  - **Total final** (HTG pour MonCash, USD pour Zelle/Carte)
  - Adresse de livraison et méthode de paiement
- Délai de livraison estimé selon la zone et le type choisi.
- Numéro WhatsApp de contact pour toute question.

### 4.6 Espace "Mon compte"

- **Vue d'ensemble** (`/mon-compte`) : liens vers informations, commandes, favoris. Section coupons et points de fidélité.
  - **Coupons** : l'utilisateur saisit manuellement un code promo → validé via `GET /api/promo/check?code=...` (existence + actif + non expiré + non maxé, sans vérification de montant minimum). En cas d'invalidité, message générique "Ce coupon est invalide" — aucune raison précise ni suggestion de codes n'est révélée. Code valide → ajouté à `user.coupons` (localStorage / future table `UtilisateurCodePromo`).
- **Mes informations** (`/mon-compte/informations`) :
  - Identité (nom complet, **pseudo** / nom d'affichage) — modifiable.
  - Email — modifiable avec confirmation (double saisie).
  - Téléphone — modifiable (indicatif + numéro).
  - Mot de passe — modifiable (mot de passe actuel + nouveau + confirmation). ⚠️ Actuellement purement visuel, aucune vérification ni mise à jour réelle de mot de passe.
  - Adresses de livraison — ajout multiple, suppression. Formulaire dynamique selon le pays (Haïti : département → commune en cascade ; USA : état → ville en cascade + code postal).
- **Mes commandes** (`/mon-compte/commandes`) : onglets par statut, avec possibilité d'**annuler** une commande tant qu'elle est en statut `attente` uniquement. Chaque commande affiche le détail complet : coupon appliqué + réduction, frais de livraison (Standard/Express), et total.
- **Mes favoris** (`/mon-compte/favoris`) : produits ajoutés en favoris. Le cœur ❤ sur chaque carte produit permet un ajout/retrait direct (sans ouvrir la fiche produit). L'icône favoris dans le header pulse lors d'un ajout. Actuellement stocké uniquement en `localStorage`, jamais synchronisé serveur.

---

## 5. Parcours administrateur détaillés

Accès via `/admin` → connexion avec `username=admin` (voir §4.2 et §7), session via cookie HTTP-only signé (24h).

### 5.1 Tableau de bord (`/admin/dashboard`)

- **Vue d'ensemble** : nombre de clients, commandes en attente, commandes en livraison, chiffre d'affaires cumulé (somme des commandes payées/en livraison/livrées), liste des 8 dernières commandes.
- **Clients** : liste/recherche des clients (nom, email, téléphone), avec panneau latéral détaillant le profil et l'historique de commandes d'un client sélectionné.
- **Commandes par statut** : 5 onglets (`pending`, `paid`, `shipping`, `delivered`, `cancelled`), recherche par client/numéro/adresse. Chaque commande peut être :
  - Avancée au statut suivant (bouton contextuel : "Approuver" pending→paid, "Expédier" paid→shipping, "Marquer livré" shipping→delivered).
  - Annulée (sauf si déjà `cancelled`).
  - Une frise "historique" dépliable montre la progression dans le cycle de statuts.
- **Produits** : CRUD complet, **un produit = une teinte** (plus de gestion de variantes ni de catégorie/collection à renseigner) —
  - Liste en cartes (photo, nom, teinte, prix, badge, stock, statut publié/brouillon).
  - Formulaire de création/édition : nom, teinte, prix HTG/USD, stock, badge, photo unique (upload local en base64 actuellement — à remplacer par un vrai stockage de fichiers), couleur de fond, description, ingrédients et bénéfices (tags ajoutables/supprimables). L'admin ajoute directement un nouveau gloss sans devoir le rattacher à une catégorie existante.
  - Bouton "Publier/Dépublier" (équivaut à `Produit.is_active`).
  - Suppression avec confirmation.

### 5.2 Coupons (`/admin/coupons`)

Accès via lien "Coupons" dans la sidebar du dashboard. **Seuls les administrateurs peuvent créer, modifier ou supprimer des codes promo.**

- **Liste** : tous les codes avec leur statut (actif/inactif), type de réduction, valeur, contraintes (minimum, limite d'utilisations, expiration), compteur d'utilisations.
- **Créer** : formulaire — code (MAJUSCULES, unique), type (`pct` = pourcentage, `fixe` = montant en $), valeur, commande minimum ($), limite d'utilisations (optionnel), date d'expiration (optionnel).
- **Activer/Désactiver** : bouton toggle sans suppression.
- **Supprimer** : avec confirmation.
- **Déconnexion** : bouton présent sur la page (efface le cookie admin + redirige vers `/connexion`).

### 5.3 Avis clients (`/admin/avis`)

- Liste de tous les avis (tous produits confondus), filtrables par statut (`en_attente`/`publie`/`refuse`/tous), recherche par nom client ou texte.
- Actions : **Publier**, **Refuser**, ou **Remettre en attente**.
- Badge "Achat vérifié" affiché si `commande_verifiee = true`.

### 5.4 Paiements (`/admin/paiements`)

- Liste des preuves de paiement soumises, filtrable par statut (`en_attente`/`validé`/`refusé`/tous).
- Pour chaque paiement en attente : modale de décision avec note interne optionnelle → **Valider** ou **Refuser**.

### 5.5 Zones de livraison (`/admin/zones-livraison`)

- CRUD des zones : nom, frais HTG, seuil de livraison gratuite, actif/inactif.
- (Les champs `frais_usd`, `delai_min_heures`, `delai_max_heures` existent dans le modèle de données mais ne sont **pas encore éditables depuis ce formulaire admin** — ils ne sont définis que dans les données stub initiales.)

---

## 6. Règles de calcul (prix, livraison, promo)

```
sous_total            = Σ (prix_usd × quantité)  pour chaque article (affiché en USD)

montant_reduction     = si code promo de type "pct"  → sous_total × reduction_valeur
                       = si code promo de type "fixe" → MIN(reduction_valeur, sous_total)

sous_total_remise     = sous_total − montant_reduction

frais_livraison       = si type_livraison = "express" :
                            si zone.frais_express_usd défini → zone.frais_express_usd
                            sinon                            → zone.frais_express_htg ÷ 130
                       = si type_livraison = "standard" :
                            si pays = "usa"                  → zone USA (frais_usd = 26.90)
                            si zone trouvée ET sous_total_remise × 130 ≥ zone.seuil_gratuit → 0
                            si zone.frais_usd défini (sinon) → zone.frais_usd
                            si zone.frais_usd NULL           → zone.frais_htg ÷ 130
                            si zone introuvable              → 400 ÷ 130 ≈ $3.08

total_usd              = sous_total_remise + frais_livraison (en USD)
total_htg              = total_usd × 130  (utilisé uniquement pour affichage MonCash)
```

- **Affichage** : tous les montants sont en **USD** partout sur le site. Seule la confirmation MonCash affiche le total en HTG (car c'est la devise exigée par MonCash).
- Conversion HTG ↔ USD : taux fixe **1 USD = 130 HTG**, codé en dur (à rendre configurable en base, voir §9).
- Le code promo est validé au moment de la **soumission finale du paiement** (son compteur est incrémenté à ce moment-là uniquement).
- La validation du coupon au checkout (`/api/promo/valider`) vérifie le montant minimum — ce que ne fait pas la validation au moment de l'ajout au compte (`/api/promo/check`).

---

## 7. Authentification et sécurité — état actuel

| Aspect | État actuel | Action requise à terme |
|---|---|---|
| Mot de passe client | **Non stocké, jamais vérifié** | Implémenter hash (bcrypt/argon2) + vérification réelle à la connexion |
| Session client | Aucune (juste un `localStorage` côté navigateur, perdu si vidé) | Implémenter sessions serveur (JWT ou cookie signé comme pour l'admin) |
| Compte admin | Pas de table — identifiants fixes en variables d'environnement (`ADMIN_USERNAME`, `ADMIN_PASSWORD`), token de session signé HMAC-SHA256 stocké en cookie `httpOnly` 24h. L'état `isLoggedIn` est persisté en `localStorage` (`adminStore.partialize`) pour survivre aux navigations entre pages admin. | Décider si l'admin doit devenir un `Utilisateur` avec `role='admin'` en base, ou rester un compte spécial hors BDD |
| OTP d'inscription | **Stateless JWT** (`lib/otpJwt.ts`) — token signé HMAC-SHA256 retourné au client et stocké en `sessionStorage`. Aucun stockage serveur nécessaire. Après vérification réussie, **connexion automatique** (pendingUser extrait du token). Variable d'environnement `OTP_SECRET` requise. | ✅ Architecture finale — **pas de table BDD nécessaire** pour l'OTP |
| Réinitialisation mot de passe | Fonctionnel en mémoire (token 1h, `lib/resetTokens.ts`) | Migrer vers table `TokenReset`, brancher l'envoi d'email en production |
| Protection brute-force | Limite de 5 tentatives / 15 min **uniquement sur la connexion admin** | Étendre à la connexion client |
| Sécurité coupons | Validation côté serveur uniquement. `VALID_CODES` hardcodé retiré du frontend. Message d'erreur générique (ne révèle pas les codes existants). | ✅ Déjà implémenté |

---

## 8. Inventaire des stubs en mémoire à remplacer

Liste exhaustive des endroits où le code contient déjà des commentaires `// TODO (BDD)` indiquant la requête SQL prévue :

| Fichier | Donnée actuellement en mémoire | Requête prévue (déjà commentée dans le code) |
|---|---|---|
| `app/api/panier/route.ts` | Panier vide retourné systématiquement | `SELECT` jointure `PanierItem` / `Produit` / `Panier` par utilisateur |
| `app/api/panier/add/route.ts` | Ne fait rien, retourne `success: true` | `INSERT ... ON DUPLICATE KEY UPDATE quantite` |
| `app/api/avis/route.ts` | `Map` JS avec 5 avis d'exemple | `SELECT`/`INSERT INTO Avis` |
| `app/api/avis/[id]/route.ts` | Modifie la `Map` en mémoire | `UPDATE Avis SET statut = ?` |
| `app/api/produits/[id]/images/route.ts` | Retourne toujours un tableau vide | `SELECT * FROM ImageProduit WHERE id_produit = ?` |
| `app/api/zones-livraison/route.ts` | Tableau JS codé en dur (10 zones : 9 Haïti + 1 USA) | `SELECT * FROM ZoneLivraison WHERE actif = TRUE ORDER BY pays, frais_htg` |
| `app/api/promo/valider/route.ts` + `lib/promoStore.ts` | Tableau JS de 2 codes promo — validation complète (minimum inclus) | `SELECT`/`UPDATE CodePromo` |
| `app/api/promo/check/route.ts` | Tableau JS (même store) — validation légère pour ajout au compte (sans minimum) | `SELECT id FROM CodePromo WHERE code=? AND actif=TRUE AND ...` — retourne uniquement `{valid}` |
| `app/api/promo/admin/route.ts` | Tableau JS (`lib/promoStore.ts`) — CRUD admin des coupons | `SELECT/INSERT/UPDATE/DELETE CodePromo` (protégé par cookie admin) |
| `app/api/paiement/moncash/initier/route.ts` | Structure en place, nécessite `MONCASH_CLIENT_ID` + `MONCASH_CLIENT_SECRET` + `MONCASH_ENV` | Appel API MonCash : `POST /oauth/token` → `POST /Api/v1/CreatePayment` |
| `app/api/paiement/moncash/verifier/route.ts` | Structure en place | Appel API MonCash : `POST /Api/v1/RetrieveTransactionPayment` → `UPDATE Paiement SET statut='validé'` |
| `app/api/paiement/soumettre/route.ts` | `Map` JS en mémoire | `SELECT`/`INSERT`/`UPDATE Paiement` |
| `app/api/paiement/[id]/valider/route.ts` | Pas de stockage réel, retourne juste la décision | `UPDATE Paiement SET statut = ?, note_admin = ?` |
| `app/api/commandes/[id]/statut/route.ts` | Ne fait rien, retourne juste l'écho de la requête | `INSERT INTO HistoriqueStatutCommande` + `UPDATE Commande SET statut` |
| `app/api/mot-de-passe/request/route.ts` + `lib/resetTokens.ts` | `Map` JS en mémoire | `INSERT INTO TokenReset` |
| `app/api/mot-de-passe/reset/route.ts` | — | `UPDATE Utilisateur SET mot_de_passe_hash = ?` |
| `app/api/otp/envoyer/route.ts` + `lib/otpJwt.ts` | **Stateless JWT** — aucun stockage serveur. Token signé retourné au client, stocké en `sessionStorage`. | ✅ Pas de table BDD nécessaire — seulement la variable d'environnement `OTP_SECRET` |
| `app/api/otp/verifier/route.ts` | Vérifie le JWT + hash du code soumis. En cas de succès, retourne `pendingUser` (name, email, telephone, pseudo). | ✅ Pas de requête SQL — vérification cryptographique uniquement |
| `store/adminStore.ts` (`orders`, `customers`) | Toujours vide au démarrage (`[]`) — jamais peuplé car aucune vraie commande n'arrive encore de la BDD | À remplacer entièrement par des appels API qui lisent `Commande`/`Utilisateur` |
| `store/ordersStore.ts` | Commandes stockées seulement dans le `localStorage` du navigateur du client | Idem — à remplacer par lecture serveur des commandes du compte connecté |
| `store/favoritesStore.ts` | `localStorage` uniquement | Table `Favori` à créer (actuellement aucune route API n'existe même pour les favoris) |
| `store/authStore.ts` (adresses, coupons) | `localStorage` uniquement | Tables `Adresse` et `UtilisateurCodePromo` |
| `store/adminStore.ts` (`managedProducts`) | Initialisé depuis `data/products.ts` (fichier TypeScript statique, 8 produits individuels), persiste les modifications uniquement en `localStorage` du navigateur de l'admin | Table `Produit` comme source de vérité unique |

---

## 9. Questions ouvertes pour le gestionnaire BDD

Ces points ne sont **pas résolus par le code actuel** et nécessitent une décision avant de finaliser le schéma :

1. **Identifiant utilisateur réel** — `authStore.User` n'a actuellement pas de champ `id` ; tout le système d'avis (`id_utilisateur`) est câblé en dur à `0`. Il faudra introduire un vrai système de session qui expose l'ID utilisateur réel au front. Le `pseudo` (username) devra également être persisté en BDD lors de la création de compte.
2. **Mot de passe** — entièrement absent du flux actuel (ni stocké à l'inscription, ni vérifié à la connexion). À spécifier : politique de hash (recommandé : bcrypt/argon2), complexité minimale (actuellement "6 caractères minimum" côté front uniquement).
3. **Génération du numéro de commande** — actuellement générée **côté client** avec `crypto.getRandomValues` ; en production, doit être générée **côté serveur** pour garantir l'unicité (aucune vérification d'unicité n'est faite actuellement).
4. **Stockage des images produits** — actuellement en upload base64 dans le `localStorage` de l'admin (non viable en production) ; il faudra un service de stockage de fichiers (S3, Cloudinary, etc.) une fois la BDD branchée.
5. **Taux de change HTG/USD** — constante codée en dur (130) ; doit-il devenir configurable en base ?
6. **Zone USA** : ✅ déjà intégrée dans `ZoneLivraison` comme une entrée à part entière (`pays='usa'`, `nom_zone='USA Standard'`). Plus de constante codée en dur dans le frontend.
7. **Unification du statut de commande** — voir §2 ; nécessite un choix définitif de nomenclature unique avant la création de la table `Commande`.
8. **Rôle admin** — table séparée vs. champ `role` sur `Utilisateur` (voir §7). Actuellement les identifiants admin sont en variables d'environnement (pas de table).
9. **Préférence de langue (fr/en/es)** — stockée côté client uniquement. Si le métier veut influencer les e-mails transactionnels (OTP, reset) avec la langue choisie, ajouter `langue_preferee` sur `Utilisateur` ou utiliser un cookie serveur. Actuellement les e-mails s'envoient uniquement en français.
10. **Variables d'environnement requises en production** (non couvertes par la BDD mais bloquantes) : `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_COOKIE`, `OTP_SECRET`, `BREVO_LOGIN_EMAIL`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `MONCASH_CLIENT_ID`, `MONCASH_CLIENT_SECRET`, `MONCASH_ENV`, `NEXT_PUBLIC_BASE_URL`.

---

*Document généré à partir d'une analyse exhaustive du code source du site (pages, stores Zustand, routes API et leurs commentaires `TODO (BDD)` déjà présents dans le code). Aucune base de données n'a été créée ni modifiée dans le cadre de cette analyse.*
