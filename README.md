# Matcha Cup Rater 🍵

A React-based web application that analyzes matcha quality using AI-powered image analysis.

## Features

- 📸 **Image Capture**: Take photos or upload images of matcha
- 🤖 **AI Analysis**: Get detailed analysis of matcha quality, color, texture, and froth
- ⭐ **Rating System**: Rate and save your matcha experiences
- 🖼️ **Gallery**: View and manage your saved ratings
- 💬 **Comments**: Add personal notes to your ratings

## Tech Stack

- **Frontend**: React + Vite
- **AI Service**: Google Gemini API
- **Backend**: Node.js + Express
- **Database**: Local storage (can be extended to use external DB)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/claiireyu/matcha-rater.git
   cd matcha-rater
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd my-react-app
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and add your Gemini API key
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Get API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env.local` file

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd my-react-app
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## Security Best Practices

### API Key Management

- ✅ **Use environment variables** - Never hardcode API keys
- ✅ **Keep .env.local in .gitignore** - Never commit sensitive data
- ✅ **Rotate keys regularly** - Change API keys every 90 days
- ✅ **Monitor usage** - Check for unusual API activity

### Environment Files

- `.env` - Your actual API keys (never commit)
- `.env.example` - Template showing required variables (safe to commit)

## Project Structure

```
matcha/
├── my-react-app/          # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   └── index.js          # Express server
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
