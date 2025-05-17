const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const { decode } = require('html-entities');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const leaderboardRoutes = require('./routes/leaderboard');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://naimul991:lk4OwzfPbX5VF2cW@cluster0.pszjzn0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let isConnectedToMongo = false;

async function connectToMongoDB(retryCount = 0) {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');
        isConnectedToMongo = true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        if (retryCount < 3) {
            console.log(`Retrying connection... Attempt ${retryCount + 1}`);
            setTimeout(() => connectToMongoDB(retryCount + 1), 3000);
        }
    }
}

connectToMongoDB();

const checkMongoConnection = (req, res, next) => {
    if (!isConnectedToMongo) {
        return res.status(503).json({ error: 'Database connection is not available. Please try again later.' });
    }
    next();
};

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const sessionQuestions = new Map();

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function fetchQuestions(amount, category) {
  try {
    const response = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=${category}`);
    const data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error('Failed to fetch questions from API');
    }

    return data.results.map(q => {
      const incorrectAnswers = q.incorrect_answers || [];
      while (incorrectAnswers.length < 3) {
        incorrectAnswers.push('No answer');
      }

      return {
        question: decode(q.question),
        A: decode(q.correct_answer),
        B: decode(incorrectAnswers[0]),
        C: decode(incorrectAnswers[1]),
        D: decode(incorrectAnswers[2]),
        answer: 'A'
      };
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

app.get('/api/questions', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const category = parseInt(req.query.category) || 9;
    const quizId = req.query.quizId;
    
    if (!quizId) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }
    
    const questions = await fetchQuestions(count, category);
    
    const processedQuestions = questions.map(q => {
      const options = [
        { letter: 'A', text: q.A },
        { letter: 'B', text: q.B },
        { letter: 'C', text: q.C },
        { letter: 'D', text: q.D }
      ];
      
      const shuffledOptions = shuffleArray(options);
      
      const newQuestion = {
        question: q.question,
        answer: shuffledOptions.find(opt => opt.text === q.A).letter
      };
      
      shuffledOptions.forEach(opt => {
        newQuestion[opt.letter] = opt.text;
      });
      
      return newQuestion;
    });
    
    sessionQuestions.set(quizId, processedQuestions);
    
    res.json(processedQuestions);
  } catch (error) {
    console.error('Error serving questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/submit/:quizId', async (req, res) => {
  try {
    const { answers, timeSpent, category } = req.body;
    const quizId = req.params.quizId;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }
    
    const questions = sessionQuestions.get(quizId);
    if (!questions) {
      return res.status(400).json({ error: 'Quiz session not found' });
    }
    
    let correctCount = 0;
    const details = answers.map((answer, index) => {
      const question = questions[index];
      const isCorrect = question && answer.selectedAnswer === question.answer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      return {
        question: answer.question,
        selectedAnswer: answer.selectedAnswer,
        selectedAnswerText: answer.selectedAnswerText,
        correctAnswer: question.answer,
        correctAnswerText: question[question.answer],
        isCorrect
      };
    });
    
    const totalQuestions = answers.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    const results = {
      quizId,
      score,
      correctCount,
      wrongCount: totalQuestions - correctCount,
      totalQuestions,
      timeSpent,
      details
    };

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          user.totalCorrect = (user.totalCorrect || 0) + correctCount;
          user.totalQuestions = (user.totalQuestions || 0) + totalQuestions;

          const categoryNames = {
            9: 'General Knowledge',
            10: 'Entertainment: Books',
            11: 'Entertainment: Film',
            12: 'Entertainment: Music',
            13: 'Entertainment: Musicals & Theatres',
            14: 'Entertainment: Television',
            15: 'Entertainment: Video Games',
            16: 'Entertainment: Board Games',
            17: 'Science & Nature',
            18: 'Science: Computers',
            19: 'Science: Mathematics',
            20: 'Mythology',
            21: 'Sports',
            22: 'Geography',
            23: 'History',
            24: 'Politics',
            25: 'Art',
            26: 'Celebrities',
            27: 'Animals',
            28: 'Vehicles',
            29: 'Entertainment: Comics',
            30: 'Science: Gadgets',
            31: 'Entertainment: Japanese Anime & Manga',
            32: 'Entertainment: Cartoon & Animations'
          };

          const categoryName = categoryNames[category] || 'General Knowledge';

          if (!user.categoryStats) {
            user.categoryStats = {};
          }

          if (!user.categoryStats[categoryName]) {
            user.categoryStats[categoryName] = {
              totalCorrect: correctCount,
              totalQuestions: totalQuestions
            };
          } else {
            user.categoryStats[categoryName].totalCorrect += correctCount;
            user.categoryStats[categoryName].totalQuestions += totalQuestions;
          }

          const quizRecord = {
            date: new Date(),
            category: categoryName,
            totalQuestions: totalQuestions,
            totalCorrect: correctCount,
            timeSpent: timeSpent
          };

          if (!user.quizHistory) {
            user.quizHistory = [];
          }
          user.quizHistory.push(quizRecord);

          await user.save();
        }
      } catch (error) {
        console.error('Error updating user stats:', error);
       
      }
    }
    
    
    res.json(results);
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

app.post('/api/signup', checkMongoConnection, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
            });
        }

        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'Signup successful',
            token,
            user: {
                username: user.username,
                email: user.email,
                totalCorrect: 0,
                totalQuestions: 0,
                categoryStats: {},
                quizHistory: []
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Server error checking email' });
    }
});

app.post('/api/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        const existingUser = await User.findOne({ username });
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ error: 'Server error checking username' });
    }
});

app.post('/api/login', checkMongoConnection, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                username: user.username,
                email: user.email,
                totalCorrect: user.totalCorrect,
                totalQuestions: user.totalQuestions,
                categoryStats: user.categoryStats,
                quizHistory: user.quizHistory
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.get('/api/check-auth', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            username: user.username,
            _id: user._id,
            totalCorrect: user.totalCorrect,
            totalQuestions: user.totalQuestions,
            categoryStats: user.categoryStats,
            quizHistory: user.quizHistory
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/signup-success', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup-success.html'));
});

app.get('/quiz', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/quiz.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/results.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
