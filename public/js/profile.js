document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    let currentPage = 0;
    const quizzesPerPage = 5;
    let totalQuizzes = 0;

    const usernameElement = document.getElementById('username');
    const joinDateElement = document.getElementById('joinDate');
    const totalQuestionsElement = document.getElementById('totalQuestions');
    const correctAnswersElement = document.getElementById('correctAnswers');
    const accuracyElement = document.getElementById('accuracy');
    const performanceMessageElement = document.getElementById('performanceMessage');
    const topCategoriesElement = document.getElementById('topCategories');
    const quizHistoryElement = document.getElementById('quizHistory');
    const noQuizzesElement = document.getElementById('noQuizzes');
    const prevQuizzesBtn = document.getElementById('prevQuizzes');
    const nextQuizzesBtn = document.getElementById('nextQuizzes');
    const takeQuizBtn = document.getElementById('takeQuizBtn');
    const quizzesTakenElement = document.getElementById('quizzesTaken');

    fetchUserData();

    takeQuizBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    prevQuizzesBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.quizHistory) {
                const sortedHistory = [...userData.quizHistory].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                fetchQuizHistory(sortedHistory);
            }
        }
    });

    nextQuizzesBtn.addEventListener('click', () => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.quizHistory) {
            const maxPage = Math.ceil(userData.quizHistory.length / quizzesPerPage) - 1;
            if (currentPage < maxPage) {
                currentPage++;
                const sortedHistory = [...userData.quizHistory].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                fetchQuizHistory(sortedHistory);
            }
        }
    });

    async function fetchUserData() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            usernameElement.textContent = userData.username;
            const joinDate = new Date(parseInt(userData._id.substring(0, 8), 16) * 1000);
            joinDateElement.textContent = `Joined: ${joinDate.toLocaleDateString()}`;

            const totalQuestions = userData.totalQuestions || 0;
            const correctAnswers = userData.totalCorrect || 0;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const quizzesTaken = userData.quizHistory?.length || 0;

            updateStatWithColor('totalQuestions', totalQuestions, [10, 20]);
            updateStatWithColor('correctAnswers', correctAnswers, [5, 15]);
            updateStatWithColor('accuracy', accuracy, [50, 80], true);
            updateStatWithColor('quizzesTaken', quizzesTaken, [3, 7]);

            setPerformanceMessage(accuracy);

            displayTopCategories(userData.categoryStats);

            if (userData.quizHistory && userData.quizHistory.length > 0) {
                const sortedHistory = [...userData.quizHistory].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                
                totalQuizzes = sortedHistory.length;
                fetchQuizHistory(sortedHistory);
                noQuizzesElement.classList.add('hidden');
                quizHistoryElement.classList.remove('hidden');
            } else {
                noQuizzesElement.classList.remove('hidden');
                quizHistoryElement.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        }
    }

    function updateStatWithColor(elementId, value, [lowThreshold, highThreshold], isPercentage = false) {
        const element = document.getElementById(elementId);
        const statItem = element.closest('.stat-item');
        
        statItem.classList.remove('low', 'medium', 'high');
        
        element.textContent = isPercentage ? `${value}%` : value;
        
        if (value >= highThreshold) {
            statItem.classList.add('high');
        } else if (value >= lowThreshold) {
            statItem.classList.add('medium');
        } else {
            statItem.classList.add('low');
        }
    }

    function setPerformanceMessage(accuracy) {
        let message = '';
        if (accuracy >= 90) {
            message = 'Excellent! You\'re a quiz master!';
        } else if (accuracy >= 70) {
            message = 'Great work! You\'re doing well.';
        } else if (accuracy >= 50) {
            message = 'Good job! Keep learning.';
        } else {
            message = 'Keep practicing to improve!';
        }
        performanceMessageElement.textContent = message;
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
            .filter(cat => cat.total > 0) 
            .sort((a, b) => b.accuracy - a.accuracy) 
            .slice(0, 3); 

       
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

    function getAccuracyClass(accuracy) {
        if (accuracy >= 80) return 'accuracy-high';
        if (accuracy >= 50) return 'accuracy-medium';
        return 'accuracy-low';
    }

    function fetchQuizHistory(quizHistory = []) {
        if (!quizHistory.length) return;

        const start = currentPage * quizzesPerPage;
        const end = start + quizzesPerPage;
        const quizzes = quizHistory.slice(start, end);

        quizHistoryElement.innerHTML = '';

        quizzes.forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'quiz-card';
            
            const date = new Date(quiz.date);
            const accuracy = Math.round((quiz.totalCorrect / quiz.totalQuestions) * 100);
            
            card.innerHTML = `
                <div class="quiz-date">${date.toLocaleDateString()}</div>
                <div class="quiz-category">${quiz.category}</div>
                <div class="quiz-score">${quiz.totalCorrect}/${quiz.totalQuestions}</div>
                <div class="accuracy-value ${getAccuracyClass(accuracy)}">${accuracy}%</div>
            `;
            
            quizHistoryElement.appendChild(card);
        });

        prevQuizzesBtn.disabled = currentPage === 0;
        nextQuizzesBtn.disabled = (currentPage + 1) * quizzesPerPage >= totalQuizzes;
    }
}); 