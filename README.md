# Fiszki AI

> AI-powered flashcard generator for efficient learning

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Fiszki AI is a web application that enables quick and efficient creation of educational flashcards using artificial intelligence. The app addresses the time-consuming problem of manually creating flashcards, which discourages many learners from using the effective spaced repetition learning method.

The application allows users to generate flashcards based on inputted text, review them, edit, and delete them. It's targeted at anyone who wants to learn from their own textual materials. The MVP handles texts from 1000 to 10000 words in length.

Fiszki AI uses OpenAI's o3-mini model to generate high-quality educational flashcards and Supabase to manage user accounts and store data.

## Tech Stack

### Frontend
- **Astro 5**: For creating fast, efficient pages with minimal JavaScript
- **React 19**: For interactive components
- **TypeScript 5**: For static typing and better IDE support
- **Tailwind 4**: For convenient styling
- **Shadcn/ui**: For accessible React UI components

### Backend
- **Supabase**: Comprehensive backend solution
  - PostgreSQL database
  - Multi-language SDK as Backend-as-a-Service
  - Built-in user authentication

### AI
- **Openrouter.ai**: For AI model communication
  - Access to various models (OpenAI, Anthropic, Google, etc.)
  - Financial limits on API keys

### CI/CD & Hosting
- **GitHub Actions**: For CI/CD pipelines
- **DigitalOcean**: For application hosting via docker

### Testing
- **Unit & Integration Testing**: 
  - **Vitest**: Fast unit testing framework compatible with Vite for testing React components, hooks and utility functions
  - **Testing Library**: For testing React components with focus on user interactions and behavior
- **E2E Testing**:
  - **Playwright**: For comprehensive browser-based end-to-end testing across Chrome, Firefox, and Safari
- **Component Testing**:
  - **Storybook**: For isolated visual testing of UI components
- **Accessibility Testing**:
  - **axe-core**: For automated accessibility testing against WCAG 2.1 AA standards
- **Performance Testing**: 
  - **Lighthouse**: For measuring performance, SEO, and accessibility metrics

## Getting Started Locally

### Prerequisites
- Node.js 22.14.0 (use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions)
- A Supabase account and project
- API access to Openrouter.ai

### Installation

1. Clone the repository
```bash
git clone https://github.com/wola86/fiszki.git
cd fiszki
```

2. Use the correct Node.js version
```bash
nvm use
```

3. Install dependencies
```bash
npm install
```

4. Set up environment variables (create a `.env` file)
```
# Example .env file
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

5. Start the development server
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:4321`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Lint and automatically fix issues
- `npm run format` - Format code with Prettier

## Project Scope

### Core Features
- Generate flashcards from input text (1000-10000 words)
- Generate a minimum of 5 flashcards per source text
- Accept or reject each generated flashcard
- Regenerate rejected flashcards
- Manually create flashcards
- Review, edit, and delete flashcards
- User account system
- Learning mode for reviewing flashcards

### Technical Constraints
- Text data only
- Generation time: up to 30 seconds
- Loading time: up to 2 seconds
- AI Model: o3-mini from OpenAI
- UI in Polish, flashcards can be in any language
- Minimalist, warm, neutral design interface

### Out of Scope (MVP)
- Advanced spaced repetition algorithms (like SuperMemo, Anki)
- PDF, DOCX, and other format imports
- Flashcard sharing between users
- Integrations with other educational platforms
- Mobile applications
- Categorization/tagging of flashcards
- Flashcard export
- Generation parameters configuration

## Project Status

The project is currently in MVP development stage. The timeline for development is 4 weeks of part-time work (approximately 14 hours of actual work).

### Success Metrics
- 75% of AI-generated flashcards are accepted by users
- Users create 75% of flashcards using AI (only 25% manually)
- Generation time under 30 seconds
- Loading time under 2 seconds
- Minimum 5 flashcards from one source text

## License

This project is currently not licensed. Please add a license that meets your requirements.

---

Created with ❤️ for efficient learning 