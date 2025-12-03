# Grindcycle

<img width="1869" height="918" alt="image" src="https://github.com/user-attachments/assets/830dc797-0c0a-4d35-9ad9-8b456f8934a6" />


Grindcycle est une plateforme d'e-commerce construite avec Next.js permettant d' échanger ses anciennes planches de skate contre des nouvelles.

## Stack Technique

- **Frontend & Backend**: [Next.js](https://nextjs.org/) (App Router)
- **Base de données**: [PostgreSQL](https://www.postgresql.org/) hébergée sur [Neon](https://neon.tech/)
- **Stockage des images**: [Supabase Storage](https://supabase.com/storage)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentification**: [Better Auth](https://www.better-auth.com/)
- **Paiements**: [Stripe](https://stripe.com/)
- **Emails**: [Nodemailer](https://nodemailer.com/) avec Gmail
- **Styles**: [Tailwind CSS](https://tailwindcss.com/)
- **Déploiement**: [Vercel](https://www.vercel.com/)
- **Documentation API**: Swagger UI / OpenAPI

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

- [Node.js](https://nodejs.org/) (version 22 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (optionnel, si vous souhaitez exécuter la base de données localement)

## 🛠️ Installation

### 1. Cloner le dépôt

```bash
git clone git@github.com:awenBourdon/RNCP-Grindcycle.git
cd grindcycle
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet en dupliquant l'exemple ci-dessous. Vous devez remplir les variables avec vos propres clés API.

```env
# Authentification (Better Auth)
BETTER_AUTH_SECRET="votre-secret-genere-aleatoirement"
NEXT_PUBLIC_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Base de données (Prisma / Neon)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="votre-connection-string-neon"

# Google OAuth (Pour la connexion via Google)
GOOGLE_CLIENT_ID="votre-google-client-id"
GOOGLE_CLIENT_SECRET="votre-google-client-secret"

# Configuration Email (Nodemailer)
NODEMAILER_USER="votre-email@gmail.com"
NODEMAILER_APP_PASSWORD="votre-mot-de-passe-application"

# Stripe (Paiements)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Supabase (Stockage images, etc.)
NEXT_PUBLIC_SUPABASE_URL="votre-url-projet-supabase"
SUPABASE_SERVICE_ROLE_KEY="votre-cle-service-role-supabase"
```

### 4. Mise en place de la Base de Données

#### Option A : Utiliser Neon

1. Créez un nouveau projet sur [Neon](https://neon.tech/).
2. Récupérez l'URL de connexion dans le tableau de bord.
3. Mettez à jour `DATABASE_URL` dans votre fichier `.env`.

> **Note** : Supabase est utilisé uniquement pour le stockage des images. Assurez-vous de configurer également vos clés Supabase dans le `.env`.

#### Option B : PostgreSQL Local avec Docker

Si vous préférez travailler en local sans dépendance externe :

```bash
# Assurez-vous d'avoir configuré une DATABASE_URL locale dans le .env
docker compose up -d
```

### 5. Migrations de la Base de Données

Une fois la base de données connectée, poussez le schéma Prisma pour créer les tables :

```bash
npx prisma db push

npx prisma generate
```

### 6. Lancer le Serveur de Développement

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## 📚 Documentation API

Le projet inclut une documentation API interactive générée automatiquement via Swagger.

- **Accès local** : Une fois le serveur lancé, rendez-vous sur [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
- **Contenu** : Vous y trouverez la liste de tous les endpoints (Produits, Commandes, Utilisateurs, etc.), les schémas de données, et la possibilité de tester les requêtes directement depuis le navigateur.
- **Fichier source** : La définition OpenAPI se trouve dans `src/lib/docs/openapi.ts`.

## 🔧 Guides de Configuration Détaillés

### Google OAuth

1. Rendez-vous sur la [Google Cloud Console](https://console.cloud.google.com/).
2. Créez un nouveau projet.
3. Allez dans "APIs & Services" > "Credentials".
4. Créez un identifiant "OAuth client ID".
5. Ajoutez `http://localhost:3000` dans les "Authorized JavaScript origins".
6. Ajoutez `http://localhost:3000/api/auth/callback/google` dans les "Authorized redirect URIs".

### Stripe

1. Créez un compte sur [Stripe](https://stripe.com/).
2. Récupérez vos clés API (Publishable et Secret) dans le tableau de bord développeur.
3. Pour tester les webhooks en local, utilisez le CLI Stripe :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Cela vous donnera votre `STRIPE_WEBHOOK_SECRET`.

### Emails (Gmail)

1. Activez l'authentification à deux facteurs (2FA) sur votre compte Google.
2. Générez un "Mot de passe d'application" (App Password) spécifique pour Nodemailer.
3. Utilisez ce mot de passe dans la variable `NODEMAILER_APP_PASSWORD`.

## 🚀 Déploiement

Le projet est optimisé pour être déployé sur [Vercel](https://vercel.com/), la plateforme créée par les auteurs de Next.js.

### Déploiement sur Vercel (Recommandé)

1. Poussez votre code sur un dépôt GitHub, GitLab ou Bitbucket.
2. Importez votre projet sur Vercel.
3. Configurez les variables d'environnement (copiez le contenu de votre `.env`).
4. Cliquez sur "Deploy".

Le projet est également compatible avec d'autres hébergeurs comme Koyeb ou tout environnement supportant Docker/Node.js.

### Build de production

Pour créer une version de production en local :

```bash
npm run build
npm start
```

## 📝 Fonctionnalités Principales

- **Authentification Complète** : Connexion par email/mot de passe et Google OAuth.
- **Catalogue Produits** : Navigation, filtrage et recherche de produits.
- **Panier & Commande** : Gestion du panier en temps réel et tunnel d'achat sécurisé.
- **Paiement** : Intégration Stripe pour les paiements par carte.
- **Espace Client** : Historique des commandes, gestion du profil et favoris.
- **Système de Points** : Fidélité et récompenses pour le recyclage.
- **Administration** : Interface dédiée pour la gestion des produits, commandes et utilisateurs.

## 📞 Support

Pour toute question ou demande de support, vous pouvez contacter l'équipe à hellogrindcycle@gmail.com ou ouvrir une issue sur le dépôt GitHub.

