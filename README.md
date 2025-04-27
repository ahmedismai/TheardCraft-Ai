# 🚀 ThreadCraft AI

**ThreadCraft AI** is a full-stack AI-powered application designed to generate engaging social media content for platforms like **Twitter, Instagram, and LinkedIn**. Built with the latest **Next.js **, it leverages **Google's Gemini AI** to automate and streamline social media strategy creation.

## ✨ Features

- 🔮 AI-powered content generation (Google Gemini)
- 🔐 User authentication with Clerk
- 📄 Content preview & history tracking
- 🎯 Points-based system for content usage
- 📱 Fully responsive design for all devices
- 💳 Stripe integration for subscription payments
- 🌐 Deployment-ready with Vercel

## 🛠️ Tech Stack

- **Framework**: Next.js , TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **AI Integration**: Google Generative AI (Gemini)
- **Database**: Drizzle ORM + Neon
- **Payments**: Stripe
- **Deployment**: Vercel

## 📦 Installation

```bash
git clone https://github.com/ahmedismai/ThreadCraft-Ai.git
cd threadcraft-Ai
npm install
```

## 🔧 Configuration

Create a .env.local file in the root of the project and add the following:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key  
CLERK_SECRET_KEY=your_clerk_secret_key  
WEBHOOK_SECRET=your_webhook_secret  
DATABASE_URL=your_database_url  
MAILTRAP_API_TOKEN=your_mailtrap_api_token  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key  
STRIPE_SECRET_KEY=your_stripe_secret_key  
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret  
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```
Replace values with your actual credentials.

## 🚀 Usage

```bash
npm run dev
```
Open http://localhost:3000 in your browser to see the app in action.

## 🧠 How It Works
1- Users sign up/login via Clerk.

2- They generate threads or posts using the Gemini AI integration.

3- Each generation deducts points from their balance.

4- Users can preview, manage, or purchase additional credits via Stripe.


## Made with ❤️ Ahmed Ismail Amer
