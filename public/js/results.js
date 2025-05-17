document.addEventListener('DOMContentLoaded', () => {
    
    if (!sessionStorage.getItem('quizResults')) {
        console.log('Quiz results not found. Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
   
    const scorePercentage = document.getElementById('score-percentage');
    const scoreFraction = document.getElementById('score-fraction');
    const scoreCircle = document.querySelector('.score-circle');
    const timeTaken = document.getElementById('time-taken');
    const correctAnswers = document.getElementById('correct-answers');
    const wrongAnswers = document.getElementById('wrong-answers');
    const performanceMessage = document.getElementById('performance-message');
    const showAnswersBtn = document.getElementById('show-answers-btn');
    const answersDetails = document.getElementById('answers-details');
    const answersList = document.getElementById('answers-list');
    const retryBtn = document.getElementById('retry-btn');
    const newSettingsBtn = document.getElementById('new-settings-btn');
    const homeBtn = document.getElementById('home-btn');
    
    
    const quizResults = JSON.parse(sessionStorage.getItem('quizResults'));
    
    
    displayResults();
    
    
    function displayResults() {
       
        const score = quizResults.score;
        scorePercentage.textContent = `${score}%`;
        scoreFraction.textContent = `${quizResults.correctCount} / ${quizResults.totalQuestions}`;
        
        
        if (score < 40) {
            scoreCircle.style.borderColor = 'var(--low-score-color)';
        } else if (score < 70) {
            scoreCircle.style.borderColor = 'var(--medium-score-color)';
        } else {
            scoreCircle.style.borderColor = 'var(--high-score-color)';
        }
        
        
        timeTaken.textContent = formatTime(quizResults.timeSpent);
        correctAnswers.textContent = quizResults.correctCount;
        wrongAnswers.textContent = quizResults.wrongCount;
        
        
        if (score < 40) {
            performanceMessage.textContent = 'Keep practicing to improve!';
        } else if (score < 70) {
            performanceMessage.textContent = 'Good job! Keep learning.';
        } else if (score < 90) {
            performanceMessage.textContent = 'Great work! You\'re doing well.';
        } else {
            performanceMessage.textContent = 'Excellent! You\'re a quiz master!';
        }
        
        
        populateAnswerDetails();
    }
    
    
    function formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            if (remainingSeconds === 0) {
                return `${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
            }
        }
    }
    
    
    function populateAnswerDetails() {
       
        answersList.innerHTML = '';
        
        
        quizResults.details.forEach((detail, index) => {
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';
            
           
            const questionNumber = document.createElement('div');
            questionNumber.className = 'answer-question';
            questionNumber.textContent = `Question ${index + 1}: ${detail.question}`;
            
         
            const answerDetails = document.createElement('div');
            answerDetails.className = 'answer-details';
            
          
            const yourAnswer = document.createElement('div');
            yourAnswer.className = detail.isCorrect ? 'correct-answer' : 'wrong-answer';
            
            
            const yourAnswerText = detail.selectedAnswer === null ? 
                'Not answered' : 
                `${detail.selectedAnswer} - ${detail.selectedAnswerText}`;
            
            yourAnswer.innerHTML = `Your Answer: <strong>${yourAnswerText}</strong>`;
            answerDetails.appendChild(yourAnswer);
            
           
            if (!detail.isCorrect) {
                const correctAnswer = document.createElement('div');
                correctAnswer.className = 'correct-answer';
                const correctAnswerText = `${detail.correctAnswer} - ${detail.correctAnswerText}`;
                correctAnswer.innerHTML = `Correct Answer: <strong>${correctAnswerText}</strong>`;
                answerDetails.appendChild(correctAnswer);
            }
            
           
            answerItem.appendChild(questionNumber);
            answerItem.appendChild(answerDetails);
            answersList.appendChild(answerItem);
        });
    }
    
    
    
    
    showAnswersBtn.addEventListener('click', () => {
        if (answersDetails.classList.contains('hidden')) {
            answersDetails.classList.remove('hidden');
            showAnswersBtn.textContent = 'Hide Answer Details';
        } else {
            answersDetails.classList.add('hidden');
            showAnswersBtn.textContent = 'Show Answer Details';
        }
    });
    
    
    retryBtn.addEventListener('click', () => {
        
        sessionStorage.setItem('quizStartTime', Date.now().toString());
        
        
        window.location.href = 'quiz.html';
    });
    
    
    newSettingsBtn.addEventListener('click', () => {
        
        sessionStorage.setItem('fromResults', 'true');
        
        
        window.location.href = 'index.html';
    });
    
    
    homeBtn.addEventListener('click', () => {
        
        window.location.href = 'index.html';
    });
});
