const User = require('../models/User');

exports.getOverallLeaderboard = async (req, res) => {
    try {
        const users = await User.find({
            totalQuestions: { $gt: 0 } 
        })
        .select('username totalCorrect totalQuestions') 
        .sort({ totalCorrect: -1 }) 
        .limit(10); 

        res.json(users);
    } catch (error) {
        console.error('Error fetching overall leaderboard:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard data' });
    }
};


exports.getCategoryLeaderboard = async (req, res) => {
    try {
        const category = req.params.category;
        
        
        const users = await User.find({
            [`categoryStats.${category}.totalQuestions`]: { $gt: 0 }
        })
        .select('username categoryStats') 
        .sort({ [`categoryStats.${category}.totalCorrect`]: -1 }) 
        .limit(10); 

        res.json(users);
    } catch (error) {
        console.error('Error fetching category leaderboard:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard data' });
    }
}; 