# Resynox: AI Resume Builder

![Logo](./src/assets/logo.png)

## Overview
Resynox is an AI-powered resume and cover letter builder designed to help users create professional, visually stunning, and ATS-friendly resumes in minutes. Leveraging OpenAI for content generation and Stripe for subscription management, Resynox offers a seamless experience for both free and premium users, with advanced customization and smart AI tools for resume and cover letter creation.

---

## Features
- **AI-Powered Resume Generation**: Instantly generate summaries, work experiences, and cover letters using OpenAI.
- **Beautiful, Customizable Templates**: Choose colors, border styles, and layouts. Premium users unlock full design controls.
- **Drag-and-Drop Editing**: Easily reorder work experiences, education, and skills.
- **Auto-Save & Versioning**: Your progress is saved automatically as you edit.
- **Photo Upload**: Add a professional photo to your resume.
- **Multi-Section Support**: Personal info, work experience, education, skills, languages, summary, and cover letter.
- **Export & Print**: Download or print your resume directly from the app.
- **Authentication & Security**: User authentication via Clerk.
- **Subscription Management**: Upgrade to Pro for advanced features via Stripe billing.
- **Responsive & Accessible**: Works on all modern devices and browsers.

---

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: Clerk
- **AI Integration**: OpenAI API
- **Payments**: Stripe
- **State Management**: Zustand
- **Other**: Radix UI, React Hook Form, Zod, DnD Kit, Lucide Icons

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database
- OpenAI API key
- Clerk API credentials
- Stripe API keys

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/SaifAlmaliki/resynox.git
   cd resynox
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values:
     - Database URL (POSTGRES_URL)
     - Clerk keys
     - OpenAI API key
     - Stripe keys
4. **Set up the database:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Usage
- **Register/Login**: Sign up or log in with Clerk.
- **Create Resume**: Click "New Resume" and follow the step-by-step editor.
- **Edit Sections**: Fill in personal info, work experience, education, skills, languages, summary, and cover letter.
- **Use AI Tools**: Premium users can generate summaries, work experience, and cover letters with AI.
- **Customize Design**: Pick colors, border styles, and upload a photo.
- **Export/Print**: Download or print your resume.
- **Upgrade**: Unlock all features by subscribing to Pro in the Premium modal.

---

## Environment Variables
See `.env.example` for all required variables, including:
- `POSTGRES_URL`
- `CLERK_*` (Clerk authentication)
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY`

---

## Deployment
- **Production build:**
  ```bash
  npm run build
  npm start
  ```
- **Vercel/Netlify:**
  - Set environment variables in your dashboard.
  - Deploy as a Next.js app.

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License
See [LICENSE](./LICENSE) for details.

---

## Acknowledgements
- [OpenAI](https://openai.com/)
- [Clerk](https://clerk.com/)
- [Stripe](https://stripe.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Screenshots
> _Add screenshots/gifs of the editor, resume preview, and AI features here._

---

## Contact
For questions or support, please contact [Saif Almaliki](mailto:saifalmaliki.dev@gmail.com).