# Resynox: AI-Powered Career Preparation Platform

![Logo](./src/assets/logo.png)

## Overview
Resynox is a comprehensive AI-powered career preparation platform that combines resume building with mock interview practice. Designed to help job seekers land their dream roles, the platform offers professional resume creation, AI-powered voice interviews, and detailed performance feedback. With modern design, seamless user experience, and advanced AI integrations, Resynox provides everything needed for successful job search preparation.

---

## Features

### Resume Builder
- **AI-Powered Resume Generation**: Generate professional summaries, work experiences, and cover letters using AI
- **Beautiful, Customizable Templates**: Choose colors, border styles, and layouts with premium design controls
- **Drag-and-Drop Editing**: Easily reorder work experiences, education, and skills sections
- **Auto-Save & Versioning**: Automatic progress saving with version control
- **Photo Upload**: Add professional photos to resumes using blob storage
- **Multi-Section Support**: Personal info, work experience, education, skills, languages, summary, and cover letter
- **Export & Print**: Download or print resumes directly from the app

### Mock Interview System
- **AI Voice Interviews**: Conduct realistic mock interviews using ElevenLabs Conversational AI integration
- **Personalized Interview Questions**: Tailored questions based on role, experience level, and tech stack
- **Real-time Voice Interaction**: Natural conversation flow with AI interviewer
- **Performance Feedback**: Detailed AI-generated feedback with scoring and improvement suggestions
- **Interview History**: Track and review past interview sessions
- **Multi-format Support**: Support for various interview types (technical, behavioral, etc.)

### General Features
- **Authentication & Security**: Secure user authentication via Clerk
- **Subscription Management**: Freemium model with Pro features via Stripe billing
- **Responsive Design**: Works seamlessly on all modern devices and browsers
- **Dark/Light Theme**: System-based theme switching with Next.js themes
- **Real-time Updates**: Live data synchronization and state management

---

## Tech Stack

### Frontend
- **Next.js 15**: React-based full-stack framework with App Router
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible UI component primitives
- **Lucide Icons**: Modern icon library
- **Next Themes**: Theme switching functionality

### Backend & Database
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access layer
- **PostgreSQL**: Production-ready relational database
- **Vercel Blob**: File storage for images and documents

### AI & Voice Integration
- **Google AI SDK**: AI content generation and processing
- **OpenAI API**: Alternative AI provider for content generation
- **ElevenLabs Conversational AI**: Real-time voice interview functionality
- **AI SDK**: Unified AI integration layer

### Authentication & Payments
- **Clerk**: Complete authentication and user management
- **Stripe**: Payment processing and subscription management

### State Management & Utilities
- **Zustand**: Lightweight state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **DnD Kit**: Drag and drop functionality
- **React Color**: Color picker components
- **Date-fns**: Date manipulation utilities

### Development Tools
- **ESLint & Prettier**: Code formatting and linting
- **PostCSS**: CSS processing
- **T3 Env**: Type-safe environment variable management

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database
- Google AI API key or OpenAI API key
- Clerk authentication credentials
- Stripe API keys
- ElevenLabs account and API keys
- Vercel Blob storage token

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
   Create a `.env` file with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id

   # Google AI
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

   # Payments (Stripe)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=your_stripe_price_id

   # Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   # App Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

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

### Resume Building
- **Register/Login**: Sign up or log in using Clerk authentication
- **Create Resume**: Click "New Resume" and use the step-by-step editor
- **Edit Sections**: Fill in personal information, work experience, education, skills, languages, and summary
- **Use AI Tools**: Generate content using AI-powered suggestions (Premium feature)
- **Customize Design**: Choose colors, border styles, and upload professional photos
- **Export/Print**: Download or print your completed resume

### Mock Interviews
- **Start Interview**: Select interview type, role, and experience level
- **Voice Interaction**: Engage in realistic conversations with AI interviewer
- **Real-time Feedback**: Receive immediate responses and follow-up questions
- **Performance Analysis**: Get detailed feedback with scoring and improvement areas
- **Track Progress**: Review interview history and performance trends

### Premium Features
- **Upgrade to Pro**: Unlock advanced AI features and unlimited usage
- **Enhanced AI**: Access to premium AI models for better content generation
- **Advanced Analytics**: Detailed performance metrics and insights
- **Priority Support**: Faster response times and dedicated assistance

---

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── interview/         # Interview-related pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── interview/         # Interview-specific components
│   └── premium/           # Premium feature components
├── lib/                   # Utility functions and services
│   ├── actions/           # Server actions
│   ├── elevenlabs.*.ts    # ElevenLabs integration files
│   └── validation.ts      # Schema validation
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── constants/             # Application constants
```

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Setup
- Ensure all environment variables are properly configured
- Set up PostgreSQL database (recommended: Neon, Supabase, or Railway)
- Configure Stripe webhooks for subscription management
- Set up ElevenLabs agent and voice configurations

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Acknowledgements
- [ElevenLabs](https://elevenlabs.io/) - Conversational AI Platform for interview functionality
- [Google AI](https://ai.google.dev/) - AI content generation
- [OpenAI](https://openai.com/) - Alternative AI provider
- [Clerk](https://clerk.com/) - Authentication and user management
- [Stripe](https://stripe.com/) - Payment processing
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Deployment and blob storage

---

## Support
For questions, support, or feature requests, please contact [Saif Almaliki](mailto:saifalmaliki.dev@gmail.com).

---

## Screenshots
> _Add screenshots/gifs showcasing the resume editor, interview interface, and AI features here._