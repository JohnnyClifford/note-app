# Note App

A note-taking app built with Node.js, Express, and MongoDB. This was a project for my Circuit Stream software development course.

## What It Does

- Create, view, edit, and delete notes
- Register and login with email/password
- Sign in with Google
- Add tags to organize notes
- Search notes by title or content
- Export notes as JSON file
- Import notes from JSON file
- 6 different color themes

## How I Built It

Backend:
- Node.js with Express
- MongoDB for database 
- JWT for authentication
- Passport.js for Google OAuth

Frontend:
- HTML, CSS, and plain JavaScript
- CSS variables for themes

Testing:
- Mocha, Chai, and Supertest

## Project Structure

Note App/
├── controllers/     # Functions for routes
├── models/          # Database schemas (User, Note)
├── routes/          # API endpoints
├── middleware/      # Auth and validation
├── public/          # Frontend files (HTML, CSS, JS)
├── test/            # Test files
├── server.js        # Server setup
└── .env             # Environment variables (not shared)

## Setup Instructions

### 1. Clone the repo
git clone https://github.com/JohnnyClifford/note-app.git
cd note-app

### 2. Install dependencies
npm install

### 3. Create a `.env` file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/noteapp
JWT_SECRET=my_secret__JWT_key_12345
SESSION_SECRET=my_secret_session_key_12345
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

### 4. Make sure MongoDB is running
mongod --dbpath ~/Documents/mongodb-data

### 5. Start the server
npm start

### 6. Open the app
Go to `http://localhost:5000` in your browser

## API Endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login to account |
| GET | `/api/auth/google` | Login with Google |
| GET | `/api/notes` | Get all your notes |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/notes/export` | Download your notes |
| POST | `/api/notes/import` | Upload notes from a file |


## What I Learned

### Challenges I faced:
- **Google OAuth setup** - Getting the redirect URIs right took a while
- **JWT authentication** - Understanding how tokens work and where to store them
- **Frontend & backend connection** - Making sure the frontend sends the token correctly
- **Export/Import** - Handling JSON files properly

### What I'd do differently next time:
- Add more tests early on
- Use a frontend framework (maybe React)