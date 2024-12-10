# UniverseAI

UniverseAI is an advanced AI toolset that allows users to generate images, code, and content through an interactive web interface. It integrates with a credit-based system, where users must have sufficient credits to perform generation tasks. Credits are refreshed automatically every 12 hours, and a clear modal system is implemented to inform users of their credit status.

## Live

Check out the live project here: [universeai.vercel.app](https://universeai.vercel.app)

## Features

- **Content Generation**: Users can generate written content using a simple interface.
- **Code Generation**: Generate code snippets based on user input.
- **Image Generation**: Generate images using text prompts.
- **Credits System**: Credits are required for each task. Users can view available credits, and credits automatically reset every 12 hours.
- **Modals for Alerts**: The app displays modals for insufficient credits or other issues, providing clear feedback to users.
  
## Technologies

- **Frontend**: React.js
- **Styling**: CSS
- **Backend**: API endpoints hosted on Render
- **Credit System**: Integrated with the API for managing credits (refreshed every 12 hours).

## API Endpoints

- **Fetch Credits**: `/api/credits`  
  Returns available credits: `{ "credits": <number> }`

- **Deduct Credits (Content & Code)**: `/api/deductcreditscontentcode`  
  Deducts credits for content or code generation.

- **Deduct Credits (Image)**: `/api/deductcreditsimage`  
  Deducts credits for image generation.

## How to Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/umangmtiwari/UniverseAI.git
   ```

2. Navigate to the project directory:

   ```bash
   cd UniverseAI
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up your `.env` file with the necessary configurations:

   ```env
   REACT_APP_AWS_ACCESS_KEY_ID
   REACT_APP_AWS_SECRET_ACCESS_KEY
   REACT_APP_AWS_REGION
   REACT_APP_API_DOMAIN
   ```

5. Start the development server:

   ```bash
   npm start
   ```

6. Visit `http://localhost:3000` in your browser to see the app in action.

## Deployment

The app is deployed to Vercel. The production URL is: [universeai.vercel.app](https://universeai.vercel.app)
