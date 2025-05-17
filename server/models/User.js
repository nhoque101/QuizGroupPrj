const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const categoryStatSchema = new mongoose.Schema({
    totalCorrect: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 }
});

const quizHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    category: String,
    questions: [{
        question: String,
        correctAnswer: String,
        userAnswer: String,
        isCorrect: Boolean
    }],
    totalCorrect: Number,
    totalQuestions: Number
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    totalCorrect: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    categoryStats: {
        'General Knowledge': categoryStatSchema,
        'Entertainment: Books': categoryStatSchema,
        'Entertainment: Film': categoryStatSchema,
        'Entertainment: Music': categoryStatSchema,
        'Entertainment: Musicals & Theatres': categoryStatSchema,
        'Entertainment: Television': categoryStatSchema,
        'Entertainment: Video Games': categoryStatSchema,
        'Entertainment: Board Games': categoryStatSchema,
        'Science & Nature': categoryStatSchema,
        'Science: Computers': categoryStatSchema,
        'Science: Mathematics': categoryStatSchema,
        'Mythology': categoryStatSchema,
        'Sports': categoryStatSchema,
        'Geography': categoryStatSchema,
        'History': categoryStatSchema,
        'Politics': categoryStatSchema,
        'Art': categoryStatSchema,
        'Celebrities': categoryStatSchema,
        'Animals': categoryStatSchema,
        'Vehicles': categoryStatSchema,
        'Entertainment: Comics': categoryStatSchema,
        'Science: Gadgets': categoryStatSchema,
        'Entertainment: Japanese Anime & Manga': categoryStatSchema,
        'Entertainment: Cartoon & Animations': categoryStatSchema
    },
    quizHistory: [quizHistorySchema]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema); 