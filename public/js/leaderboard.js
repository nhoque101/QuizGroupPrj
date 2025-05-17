document.addEventListener('DOMContentLoaded', () => {
  
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const categorySelector = document.querySelector('.category-selector');
    const categorySelect = document.getElementById('categorySelect');
    const leaderboardEntries = document.getElementById('leaderboardEntries');
    
   
    const totalQuestionsElement = document.getElementById('totalQuestions');
    const correctAnswersElement = document.getElementById('correctAnswers');
    const accuracyElement = document.getElementById('accuracy');
    const quizzesTakenElement = document.getElementById('quizzesTaken');
    const topCategoriesElement = document.getElementById('topCategories');
    
    
    let currentView = 'overall';
    let currentCategory = 'General Knowledge';
    
   
    loadUserStats();
    loadLeaderboard();
    
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            if (view !== currentView) {
             
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
               
                currentView = view;
                categorySelector.classList.toggle('hidden', view === 'overall');
                
                
                loadLeaderboard();
            }
        });
    });
    
    categorySelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        loadLeaderboard();
    });

   
    async function loadUserStats() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

       
        const totalQuestions = user.totalQuestions || 0;
        const correctAnswers = user.totalCorrect || 0;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const quizzesTaken = user.quizHistory ? user.quizHistory.length : 0;

        totalQuestionsElement.textContent = totalQuestions;
        correctAnswersElement.textContent = correctAnswers;
        accuracyElement.textContent = `${accuracy}%`;
        quizzesTakenElement.textContent = quizzesTaken;

        
        updateStatWithColor('totalQuestions', totalQuestions, [10, 20]);
        updateStatWithColor('correctAnswers', correctAnswers, [5, 15]);
        updateStatWithColor('accuracy', accuracy, [50, 80], true);
        updateStatWithColor('quizzesTaken', quizzesTaken, [3, 7]);

       
        displayTopCategories(user.categoryStats);
    }

    function updateStatWithColor(elementId, value, [lowThreshold, highThreshold], isPercentage = false) {
        const element = document.getElementById(elementId);
        const statItem = element.closest('.stat-item');
        
       
        statItem.classList.remove('low', 'medium', 'high');
        
        
        if (value >= highThreshold) {
            statItem.classList.add('high');
        } else if (value >= lowThreshold) {
            statItem.classList.add('medium');
        } else {
            statItem.classList.add('low');
        }
    }

    function displayTopCategories(categoryStats) {
        if (!categoryStats) return;

        
        const categories = Object.entries(categoryStats)
            .map(([category, stats]) => ({
                category: category,
                correct: stats.totalCorrect || 0,
                total: stats.totalQuestions || 0,
                accuracy: stats.totalQuestions > 0 
                    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
                    : 0
            }))
            .filter(cat => cat.total > 0) // Only show categories with attempts
            .sort((a, b) => b.accuracy - a.accuracy) // Sort by accuracy
            .slice(0, 3); // Get top 3

       
        topCategoriesElement.innerHTML = '';

        
        categories.forEach(cat => {
            const row = document.createElement('div');
            row.className = 'category-row';
            
            let accuracyClass = getAccuracyClass(cat.accuracy);

            row.innerHTML = `
                <span>${cat.category}</span>
                <span>${cat.correct}</span>
                <span>${cat.total}</span>
                <span class="accuracy-value ${accuracyClass}">${cat.accuracy}%</span>
            `;
            
            topCategoriesElement.appendChild(row);
        });

       
        if (categories.length === 0) {
            topCategoriesElement.innerHTML = '<div class="no-data">No quiz attempts yet</div>';
        }
    }

   
    async function loadLeaderboard() {
        try {
            leaderboardEntries.innerHTML = '<div class="loading">Loading leaderboard data...</div>';
            
            const endpoint = currentView === 'overall' 
                ? '/api/leaderboard/overall'
                : `/api/leaderboard/category/${encodeURIComponent(currentCategory)}`;
            
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard data');
            }
            
            const data = await response.json();
            displayLeaderboard(data);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            leaderboardEntries.innerHTML = '<div class="error">Failed to load leaderboard data. Please try again later.</div>';
        }
    }
    
   
    function displayLeaderboard(users) {
       
        leaderboardEntries.innerHTML = '';
        
                   
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        users.forEach((user, index) => {
            const rank = index + 1;
            const accuracy = calculateAccuracy(user);
            const accuracyClass = getAccuracyClass(accuracy);
            
            const entry = document.createElement('div');
            entry.className = `entry${currentUser && currentUser.username === user.username ? ' highlighted' : ''}`;
            
            let correctAnswers, totalQuestions;
            if (currentView === 'overall') {
                correctAnswers = user.totalCorrect || 0;
                totalQuestions = user.totalQuestions || 0;
            } else {
                const categoryStats = user.categoryStats && user.categoryStats[currentCategory];
                correctAnswers = categoryStats ? (categoryStats.totalCorrect || 0) : 0;
                totalQuestions = categoryStats ? (categoryStats.totalQuestions || 0) : 0;
            }
            
            entry.innerHTML = `
                <div class="rank${rank <= 3 ? ' rank-' + rank : ''}">${rank}</div>
                <div class="username">${user.username}</div>
                <div class="correct">${correctAnswers}</div>
                <div class="attempted">${totalQuestions}</div>
                <div class="accuracy ${accuracyClass}">${accuracy}%</div>
            `;
            
            leaderboardEntries.appendChild(entry);
        });
        
       
        if (users.length === 0) {
            leaderboardEntries.innerHTML = '<div class="no-data">No leaderboard data available.</div>';
        }
    }
    
    function calculateAccuracy(user) {
        let correct = 0, total = 0;
        
        if (currentView === 'overall') {
            correct = user.totalCorrect || 0;
            total = user.totalQuestions || 0;
        } else {
            const categoryStats = user.categoryStats && user.categoryStats[currentCategory];
            if (categoryStats) {
                correct = categoryStats.totalCorrect || 0;
                total = categoryStats.totalQuestions || 0;
            }
        }
        
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    }
    
    
    function getAccuracyClass(accuracy) {
        if (accuracy >= 80) return 'accuracy-high';
        if (accuracy >= 50) return 'accuracy-medium';
        return 'accuracy-low';
    }
}); 