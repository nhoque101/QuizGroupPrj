
# Quiz Master


# Project Team Responsibilities ( shared between **Naimul Hoque** and **Mauricio Monje**)


 **Naimul Hoque**

### User Authentication System & Auth & Leaderboard Page & User Schrema for MongoDB

- Created the **User model**: `server/models/User.js`
- Implemented auth endpoints:
- Developed frontend auth logic:
  - `auth.js`
  - `login.js`
  - `signup.js`
- Did the JWT authentication
- Built on top of his Project 2

### Quiz Core System

- Integrated **OpenTrivia API**
- Implemented quiz processing logic and session management
- Designed quiz interface and timer
- Built leaderboard UI
- Wrote database query logic for leaderboard

---

**Mauricio Monje**

### User Authentication's UI & Quiz Submission & Profile Page & Testing/Debugging

- Developed UI for Signup and Login pages
- Added form validation for both pages
- Implemented quiz result submission to the database
- Created profile page UI
- Displayed quiz scores and history
- Wrote database queries for user profiles
- Debugged and tested the entire project
- Helped with fetching and parsing data from OpenTrivia API
- Added dummy users to make the LeaderBoard look nicer

---

## Joint Responsibilities

- Set up initial **project structure**
- Configured basic **Express server**
- Established **MongoDB connection**
- Agreed on **page layouts and UI conventions**
- Standardized file naming and code organization
- Held **daily progress checks**
- Tested authentication with leaderboard integration
- Verified quiz scores appearing in user profiles and LeaderBoard
- Resolved code conflicts and handled merge operations

Naimul Hoque and MARCIO

A modern, interactive quiz application that allows users to test their knowledge across various categories with customizable settings and features.

## Project Structure
```
quiz-master/
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── vercel.json
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── leaderboard.js
│   │   ├── login.js
│   │   ├── main.js
│   │   ├── profile.js
│   │   ├── quiz.js
│   │   ├── results.js
│   │   └── signup.js
│   ├── index.html
│   ├── leaderboard.html
│   ├── login.html
│   ├── profile.html
│   ├── quiz.html
│   ├── results.html
│   ├── signup.html
│   └── signup-success.html
└── server/
    ├── controllers/
    ├── models/
    │   └── User.js
    ├── routes/
    │   └── leaderboard.js
    └── server.js
```

## 🌟 Features

- **User Authentication**
  - Secure signup and login system
  - JWT-based authentication
  - Profile management

- **Quiz Customization**
  - Multiple categories (30+ topics)
  - Adjustable number of questions (5-20)
  - Flexible timer options:
    - No timer
    - Per-question timer
    - Full quiz timer
  - Difficulty selection

- **Interactive UI**
  - Modern and responsive design
  - Real-time score tracking
  - Progress indicators
  - Mobile-friendly interface

- **Leaderboard System**
  - ranking by most overall correct answer
  - or ranking by specific categories
  - comparason agaisnt users
  - LeaderBoard page Changes Based on Whether logged in or not
  
  

## 🚀 Tech Stack

- **Frontend**
  - HTML5
  - CSS3 (with responsive design)
  - JavaScript (Vanilla)
  - Font Awesome icons

- **Backend**
  - Node.js
  - Express.js
  - MongoDB (with Mongoose)
  - JWT for authentication


#UserFlow
1. Create an account or log in or Guest Mode
2. Select quiz preferences ( Guest mode allowed):
   - Number of questions
   - Category
   - Timer settings
3. Start the quiz
4. Answer questions within the time limit (if enabled)
5. View your results and check the leaderboard 

## 🔒 Security Features

- Encrypted passwords using bcrypt
- JWT-based authentication
- Secure environment variable handling
- Protected API endpoints

## 📦 API Integration

The application uses the Open Trivia Database API for quiz questions, supporting:
- Multiple categories
- selected amount of questions



## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.



