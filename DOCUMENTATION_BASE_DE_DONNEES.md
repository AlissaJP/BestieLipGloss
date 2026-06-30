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
- **Devises** : toutes les commandes sont affichées en HTG (gourdes haïtiennes) et en USD. Taux de conversion fixe actuellement codé en dur : **1 USD = 130 HTG**.
- **Catalogue actuel** : **8 produits individuels**, chaque teinte de gloss étant désormais exposée comme un produit à part entière sur le site (plus de regroupement par "collection" ni de notion de variante/sous-teinte — ce système a été retiré à la demande du métier) :
  - 5 produits issus de l'ancienne collection *Honey* (Brown, Pink, Red, Rosée, Rouge Grenadier)
  - 3 produits issus de l'ancienne collection *Labubu* (Pastel, Pink, Red)
  - Tous les produits sont au même prix : **1690 HTG / 13 USD**.
  - L'admin ajoute un produit directement (nom, teinte, prix, photo, stock, ingrédients, bénéfices) sans devoir le rattacher à une catégorie ni définir de "photo d'introduction" séparée — chaque produit n'a qu'une seule photo.
- **Pas de passerelle de paiement automatisée.** Les paiements (MonCash, Zelle, Carte) sont déclaratifs : le client indique qu'il a payé et fournit une référence de transaction ; un administrateur valide manuellement la preuve de paiement après coup.

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
| pseudo | VARCHAR | — | Optionnel, modifiable depuis "Mes informations" |
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

**Relation N-N avec Utilisateur** : table de jonction `UtilisateurCodePromo(id_utilisateur, code_promo)` — un code promo peut être "assigné"/débloqué pour un client spécifique (actuellement, `user.coupons` est une simple liste de codes attachée au compte ; on ne voit pas dans le code comment un coupon est attribué à un utilisateur — à clarifier, voir §9).

---

### 3.12 ZoneLivraison

Déjà modélisé avec des données réelles dans `app/api/zones-livraison/route.ts`.

| Champ | Type | Notes |
|---|---|---|
| id | INT (PK) | |
| nom_zone | VARCHAR (UNIQUE) | Doit correspondre exactement au champ `ville` de l'adresse pour être retrouvé |
| frais_htg | DECIMAL | |
| frais_usd | DECIMAL (nullable) | Si NULL, le front convertit `frais_htg / 130` |
| seuil_gratuit | DECIMAL (nullable) | Sous-total à partir duquel la livraison est gratuite pour cette zone |
| delai_min_heures / delai_max_heures | INT (nullable) | Affiché au client ("livraison estimée sous 24–48h") |
| actif | BOOLEAN | |

**Cas spécial USA** : si l'adresse du client est aux USA, un tarif fixe de **3500 HTG** (≈ 26.9 USD) est appliqué, indépendamment de la table `ZoneLivraison` (constante `USA_FEE` dans le code — à voir si elle doit devenir configurable en base elle aussi).

---

### 3.13 Favoris

Relation N-N simple entre Utilisateur et Produit (actuellement stockée uniquement en `localStorage`, jamais envoyée au serveur).

| Table | Champs |
|---|---|
| **Favori** | id_utilisateur (FK), id_produit (FK), date_ajout — clé primaire composite (id_utilisateur, id_produit) |

---

### 3.14 OtpVerification (vérification d'inscription)

Données transitoires, déjà esquissées dans `lib/otpStore.ts`.

| Champ | Type | Notes |
|---|---|---|
| email | VARCHAR (PK) | |
| code | VARCHAR(6) | Code à 6 chiffres |
| expires_at | DATETIME | Validité de **2 minutes** |
| attempts | INT | Max **5 tentatives**, puis le code est invalidé |
| nom_en_attente | VARCHAR | Nom fourni à l'inscription, pas encore confirmé |
| telephone_en_attente | VARCHAR | |

➡️ Recommandation : cette table peut avoir un TTL automatique (ou un job de nettoyage) puisque les données n'ont de sens que pendant quelques minutes.

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

1. Le client remplit : prénom (obligatoire), nom (optionnel), email (obligatoire), indicatif pays + numéro WhatsApp (obligatoire), mot de passe + confirmation (obligatoire, min. 6 caractères).
2. Le formulaire envoie une requête à `/api/otp/envoyer` avec email/nom/téléphone → génère un code OTP à 6 chiffres, l'envoie par email (via Brevo/SMTP), et stocke temporairement les infos du futur compte ("pending user").
3. Le client est redirigé vers `/verification-email?email=...` où il saisit le code à 6 chiffres (6 cases séparées, focus automatique, collage supporté).
4. Code valable **2 minutes**, max **5 tentatives**. Bouton "Renvoyer le code" disponible seulement quand le minuteur atteint 0.
5. Une fois validé (`/api/otp/verifier`), le compte est considéré comme créé et l'utilisateur est redirigé vers la connexion / page d'accueil.

⚠️ **Le mot de passe saisi à l'étape 1 n'est actuellement stocké nulle part** — ni en mémoire, ni transmis à la création du compte final. C'est un point à corriger absolument lors du branchement de la BDD (hashage + stockage du mot de passe doivent être ajoutés au flux).

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
- Sélection d'une adresse enregistrée parmi celles du compte (ou redirection vers "Mes informations" pour en ajouter une si aucune n'existe).
- Champ "Instructions de livraison" (texte libre, optionnel, **propre à cette commande** et non à l'adresse elle-même).
- Un **numéro de commande est généré côté client** à ce moment (`BES-AAAA-XXXXXX`) s'il n'existe pas déjà pour cette session de checkout.

**Étape 2 — Paiement**
- Choix entre 3 méthodes : **MonCash** (HTG), **Zelle** (USD), **Carte** (USD, champs carte saisis mais non traités par une vraie passerelle — simulation).
- Affichage des instructions spécifiques à chaque méthode (numéro MonCash, email Zelle, montant exact à envoyer).
- Champ "Référence de transaction" — **obligatoire** pour MonCash/Zelle, optionnel pour carte.
- Champ "Note pour la commande" (optionnel).
- Validation finale → `POST /api/paiement/soumettre` avec toutes les infos (numéro commande, mode, montant déclaré, devise, référence, note, code promo appliqué).
  - Si une preuve de paiement existe déjà pour cette commande et est `en_attente` ou `validé`, la soumission est bloquée avec un message adapté.
  - Si le code promo est valide, son compteur d'utilisation est incrémenté à cet instant (pas avant).
- En cas de succès : la commande est enregistrée dans l'historique du compte (`ordersStore`), le panier est vidé, passage à l'étape 3.

**Étape 3 — Confirmation**
- Numéro de commande affiché, délai de livraison estimé selon la zone, rappel du numéro WhatsApp de contact pour toute question.

### 4.6 Espace "Mon compte"

- **Vue d'ensemble** (`/mon-compte`) : liens vers informations, commandes, favoris.
- **Mes informations** (`/mon-compte/informations`) :
  - Identité (nom complet, pseudo) — modifiable.
  - Email — modifiable avec confirmation (double saisie).
  - Téléphone — modifiable (indicatif + numéro).
  - Mot de passe — modifiable (mot de passe actuel + nouveau + confirmation). ⚠️ Actuellement purement visuel, aucune vérification ni mise à jour réelle de mot de passe.
  - Adresses de livraison — ajout multiple, suppression. Formulaire dynamique selon le pays (Haïti : département → commune en cascade ; USA : état → ville en cascade + code postal).
- **Mes commandes** (`/mon-compte/commandes`) : onglets par statut (`attente/valide/livraison/livre/annule`), avec possibilité d'**annuler** une commande tant qu'elle est en statut `attente` uniquement.
- **Mes favoris** (`/mon-compte/favoris`) : produits ajoutés en favoris (actuellement stocké uniquement en local, jamais synchronisé serveur).

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

### 5.2 Avis clients (`/admin/avis`)

- Liste de tous les avis (tous produits confondus), filtrables par statut (`en_attente`/`publie`/`refuse`/tous), recherche par nom client ou texte.
- Actions : **Publier**, **Refuser**, ou **Remettre en attente**.
- Badge "Achat vérifié" affiché si `commande_verifiee = true`.

### 5.3 Paiements (`/admin/paiements`)

- Liste des preuves de paiement soumises, filtrable par statut (`en_attente`/`validé`/`refusé`/tous).
- Pour chaque paiement en attente : modale de décision avec note interne optionnelle → **Valider** ou **Refuser**.

### 5.4 Zones de livraison (`/admin/zones-livraison`)

- CRUD des zones : nom, frais HTG, seuil de livraison gratuite, actif/inactif.
- (Les champs `frais_usd`, `delai_min_heures`, `delai_max_heures` existent dans le modèle de données mais ne sont **pas encore éditables depuis ce formulaire admin** — ils ne sont définis que dans les données stub initiales.)

---

## 6. Règles de calcul (prix, livraison, promo)

```
sous_total            = Σ (prix_unitaire_devise × quantité)  pour chaque article du panier

montant_reduction     = si code promo de type "pct"  → sous_total × reduction_valeur
                       = si code promo de type "fixe" → MIN(reduction_valeur, sous_total)

sous_total_remise     = sous_total − montant_reduction

frais_livraison (HTG) = si adresse.pays = "usa"            → 3500 HTG (constante fixe)
                       = si zone trouvée ET sous_total_remise ≥ zone.seuil_gratuit → 0
                       = si zone trouvée (sinon)            → zone.frais_htg
                       = si zone introuvable                → 400 HTG (valeur par défaut)
                       = seuil par défaut si zone introuvable → 2000 HTG

frais_livraison (USD) = si zone.frais_usd défini            → zone.frais_usd
                       = sinon                               → frais_livraison_htg ÷ 130

total                  = sous_total_remise + frais_livraison
```

- Conversion HTG ↔ USD : taux fixe **1 USD = 130 HTG**, codé en dur dans le front (à terme : ce taux devrait probablement être configurable en base plutôt que fixé dans le code, voir §9).
- Le code promo n'est validé (et son compteur incrémenté) qu'au moment de la **soumission finale du paiement**, pas à l'application du code dans le panier — un client peut donc appliquer un code, l'enlever, et il ne sera décompté que si la commande va jusqu'au bout.

---

## 7. Authentification et sécurité — état actuel

| Aspect | État actuel | Action requise à terme |
|---|---|---|
| Mot de passe client | **Non stocké, jamais vérifié** | Implémenter hash (bcrypt/argon2) + vérification réelle à la connexion |
| Session client | Aucune (juste un `localStorage` côté navigateur, perdu si vidé) | Implémenter sessions serveur (JWT ou cookie signé comme pour l'admin) |
| Compte admin | Pas de table — identifiants fixes en variables d'environnement (`ADMIN_USERNAME`, `ADMIN_PASSWORD`), token de session signé HMAC-SHA256 stocké en cookie `httpOnly` 24h | Décider si l'admin doit devenir un `Utilisateur` avec `role='admin'` en base, ou rester un compte spécial hors BDD |
| OTP d'inscription | Fonctionnel (code 6 chiffres, email réel via Brevo SMTP), mais en mémoire (perdu au redémarrage du serveur) | Migrer vers une table avec expiration |
| Réinitialisation mot de passe | Fonctionnel en mémoire (token 1h) | Migrer vers une table, et brancher réellement l'envoi d'email en production (actuellement le lien n'est loggé qu'en dev) |
| Protection brute-force | Limite de 5 tentatives / 15 min **uniquement sur la connexion admin** | Étendre la même protection à la connexion client une fois les mots de passe réels en place |

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
| `app/api/zones-livraison/route.ts` | Tableau JS codé en dur (9 zones) | `SELECT * FROM ZoneLivraison WHERE actif = TRUE` |
| `app/api/promo/valider/route.ts` + `lib/promoStore.ts` | Tableau JS de 2 codes promo | `SELECT`/`UPDATE CodePromo` |
| `app/api/paiement/soumettre/route.ts` | `Map` JS en mémoire | `SELECT`/`INSERT`/`UPDATE Paiement` |
| `app/api/paiement/[id]/valider/route.ts` | Pas de stockage réel, retourne juste la décision | `UPDATE Paiement SET statut = ?, note_admin = ?` |
| `app/api/commandes/[id]/statut/route.ts` | Ne fait rien, retourne juste l'écho de la requête | `INSERT INTO HistoriqueStatutCommande` + `UPDATE Commande SET statut` |
| `app/api/mot-de-passe/request/route.ts` + `lib/resetTokens.ts` | `Map` JS en mémoire | `INSERT INTO TokenReset` |
| `app/api/mot-de-passe/reset/route.ts` | — | `UPDATE Utilisateur SET mot_de_passe_hash = ?` |
| `app/api/otp/envoyer/route.ts` + `lib/otpStore.ts` | `Map` JS en mémoire | `INSERT INTO OtpVerification` (et création finale du compte une fois vérifié) |
| `store/adminStore.ts` (`orders`, `customers`) | Toujours vide au démarrage (`[]`) — jamais peuplé car aucune vraie commande n'arrive encore de la BDD | À remplacer entièrement par des appels API qui lisent `Commande`/`Utilisateur` |
| `store/ordersStore.ts` | Commandes stockées seulement dans le `localStorage` du navigateur du client | Idem — à remplacer par lecture serveur des commandes du compte connecté |
| `store/favoritesStore.ts` | `localStorage` uniquement | Table `Favori` à créer (actuellement aucune route API n'existe même pour les favoris) |
| `store/authStore.ts` (adresses, coupons) | `localStorage` uniquement | Tables `Adresse` et `UtilisateurCodePromo` |
| `store/adminStore.ts` (`managedProducts`) | Initialisé depuis `data/products.ts` (fichier TypeScript statique, 8 produits individuels), persiste les modifications uniquement en `localStorage` du navigateur de l'admin | Table `Produit` comme source de vérité unique |

---

## 9. Questions ouvertes pour le gestionnaire BDD

Ces points ne sont **pas résolus par le code actuel** et nécessitent une décision avant de finaliser le schéma :

1. **Identifiant utilisateur réel** — `authStore.User` n'a actuellement pas de champ `id` ; tout le système d'avis (`id_utilisateur`) est câblé en dur à `0`. Il faudra introduire un vrai système de session qui expose l'ID utilisateur réel au front.
2. **Mot de passe** — entièrement absent du flux actuel (ni stocké à l'inscription, ni vérifié à la connexion). À spécifier : politique de hash, complexité minimale (actuellement seulement "6 caractères minimum" côté validation front).
3. **Attribution des codes promo aux comptes** — le code ne montre aucun mécanisme qui ajoute un coupon à `user.coupons` (pas de formulaire, pas de logique d'attribution automatique observée). À clarifier avec le métier : promo générale appliquée par tout client via un champ libre, vs. codes personnalisés assignés un par un ?
4. **Génération du numéro de commande** — actuellement générée **côté client** avec `crypto.getRandomValues` (4 octets aléatoires) ; en production, ceci devrait être généré côté serveur pour garantir l'unicité (actuellement aucune vérification d'unicité n'est faite).
5. **Stockage des images produits** — actuellement en upload base64 directement dans le `localStorage` de l'admin (non viable en production) ; il faudra un vrai service de stockage de fichiers (S3, Cloudinary, etc.) une fois la BDD branchée.
6. **Taux de change HTG/USD** — actuellement une constante codée en dur (130) ; doit-il devenir un paramètre configurable en base (pour suivre les fluctuations réelles) ?
7. **Frais USA fixes** — la constante `USA_FEE = 3500 HTG` est codée en dur dans `app/panier/page.tsx`, séparée de la table `ZoneLivraison`. Faut-il l'intégrer comme une "zone" à part entière dans cette même table ?
8. **Unification du statut de commande** — voir §2 ; nécessite un choix définitif de nomenclature unique.
9. **Rôle admin** — table séparée vs. champ `role` sur `Utilisateur` (voir §7).
10. **Préférence de langue (fr/en/es)** — actuellement stockée uniquement côté client (`localStorage`, jamais envoyée au serveur). Si le métier veut que la langue choisie influence aussi le contenu généré côté serveur (titre de page, e-mails transactionnels), il faudra soit l'ajouter comme colonne sur `Utilisateur` (`langue_preferee`), soit la propager via un cookie lisible côté serveur. Actuellement les e-mails (OTP, reset mot de passe) sont envoyés uniquement en français quelle que soit la langue du site.

---

*Document généré à partir d'une analyse exhaustive du code source du site (pages, stores Zustand, routes API et leurs commentaires `TODO (BDD)` déjà présents dans le code). Aucune base de données n'a été créée ni modifiée dans le cadre de cette analyse.*
