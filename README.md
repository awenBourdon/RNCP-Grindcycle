# GrindCycle


<img width="1920" height="997" alt="image" src="https://github.com/user-attachments/assets/9215a891-fa0b-48a4-81dc-471ffe4735b4" />

A web e-commerce application built with Next.js featuring authentication, payments, and database integration.

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js
- **Database**: PostgreSQL with Supabase
- **ORM**: Prisma
- **Authentication**: Better Auth
- **Payments**: Stripe
- **Email**: Nodemailer with Gmail
- **Styling**: Tailwind
- **Deployment**: Koyeb

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 22 or higher)
- npm or yarn
- Docker (if running locally)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone git@github.com:awenBourdon/RNCP-Grindcycle.git
cd grindcycle
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
# Authentication
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Database
DATABASE_URL="your-database-connection-string"

# Admin Configuration
ADMIN_EMAIL="your-admin-email@example.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
NODEMAILER_USER="your-email@gmail.com"
NODEMAILER_APP_PASSWORD="your-app-password"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 4. Database Setup

#### Option A: Using Supabase (Recommended)
1. Create a new project on [Supabase](https://supabase.com/)
2. Get your database URL from the project settings
3. Update the `DATABASE_URL` in your `.env`

#### Option B: Local PostgreSQL with Docker
```bash
# Uncomment the Docker DATABASE_URL in your .env
docker compose -up
```

### 5. Run Database Migrations

```bash
# Add your migration command here
npx prisma db push
```

### 6. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔧 Configuration

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

### Stripe Setup
1. Create a [Stripe account](https://stripe.com/)
2. Get your publishable and secret keys from the dashboard
3. Set up webhooks for your application events

### Email Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use this password in your `NODEMAILER_APP_PASSWORD`

## 🚀 Deployment

TODO

## 📝 Features

- User authentication with Better-Auth and Google OAuth
- Payment processing with Stripe
- Email notifications
- Admin panel access
- Database integration with Supabase

## 📄 License

TODO

## 📞 Support

For support, email hellogrindcycle@gmail.com or create an issue in the repository.
