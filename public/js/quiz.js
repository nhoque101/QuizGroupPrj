document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('quizSettings') || !sessionStorage.getItem('quizStartTime')) {
        console.log('Quiz settings not found. Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
    let isSubmittingQuiz = false;
    
    window.addEventListener('beforeunload', (e) => {
        if (isSubmittingQuiz) {
            return;
        }
        e.preventDefault();
        e.returnValue = '';
    });
    
    const progressBar = document.getElementById('progress-bar');
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const optionA = document.getElementById('text-a');
    const optionB = document.getElementById('text-b');
    const optionC = document.getElementById('text-c');
    const optionD = document.getElementById('text-d');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const homeButton = document.getElementById('home-btn');
    const restartButton = document.getElementById('restart-btn');
    const quitButton = document.getElementById('quit-btn');
    const errorMessage = document.getElementById('error-message');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const timerDisplay = document.getElementById('timer-display');
    const timerValue = document.getElementById('timer-value');
    
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let quizSettings = JSON.parse(sessionStorage.getItem('quizSettings'));
    let quizId = sessionStorage.getItem('quizId');
    let timerInterval = null;
    let timeRemaining = 0;
    
    initQuiz();
    
    async function initQuiz() {
        try {
            const response = await fetch(`/api/questions?count=${quizSettings.questionCount}&category=${quizSettings.category}&quizId=${quizId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch questions from API');
            }
            questions = await response.json();
            
            userAnswers = questions.map(() => null);
            
            if (quizSettings.timerType === 'none') {
                timerDisplay.style.display = 'none';
            }
            
            displayQuestion(0);
            
            
            if (quizSettings.timerType !== 'none') {
                initTimer();
            }
        } catch (error) {
            console.error('Error initializing quiz:', error);
            alert('Failed to load quiz questions. Please try again.');
            window.location.href = 'index.html';
        }
    }
    
  
    function displayQuestion(index) {
        const question = questions[index];
        
        
        questionText.textContent = question.question;
        
        optionA.textContent = question.A;
        optionB.textContent = question.B;
        optionC.textContent = question.C;
        optionD.textContent = question.D;
        
        questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
        
        const progress = ((index + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        
        prevButton.disabled = quizSettings.timerType === 'question' || index === 0;
        
        if (index === questions.length - 1) {
            nextButton.textContent = 'Submit';
        } else {
            nextButton.textContent = 'Next';
        }
        
        clearSelectedOption();
        
        if (userAnswers[index] !== null) {
            const option = document.getElementById(`option-${userAnswers[index].toLowerCase()}`);
            if (option) {
                option.checked = true;
            }
        }
        
        errorMessage.classList.add('hidden');
        
        if (quizSettings.timerType === 'question') {
            resetQuestionTimer();
        }
    }
    
    function clearSelectedOption() {
        const options = document.querySelectorAll('input[name="answer"]');
        options.forEach(option => {
            option.checked = false;
        });
    }
    
    function getSelectedOption() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        return selectedOption ? selectedOption.value : null;
    }
    
    function initTimer() {
        if (quizSettings.timerType === 'none') {
            timerDisplay.style.display = 'none';
            return;
        }
        
        timerDisplay.style.display = 'flex';
        
        if (quizSettings.timerType === 'quiz') {
            timeRemaining = quizSettings.timerDuration;
            updateTimerDisplay();
            
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    submitQuiz();
                }
            }, 1000);
        } else if (quizSettings.timerType === 'question') {
            resetQuestionTimer();
        }
    }
    
    function resetQuestionTimer() {
        if (quizSettings.timerType !== 'question') return;
        
        clearInterval(timerInterval);
        timeRemaining = quizSettings.timerDuration;
        updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                
                if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    displayQuestion(currentQuestionIndex);
                } else {
                    submitQuiz();
                }
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    async function submitQuiz() {
        isSubmittingQuiz = true;
        
        clearInterval(timerInterval);
        
        const startTime = parseInt(sessionStorage.getItem('quizStartTime'));
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds
        
        const quizSettings = JSON.parse(sessionStorage.getItem('quizSettings'));
        
        const answers = questions.map((question, index) => {
            const selectedAnswer = userAnswers[index];
            const selectedAnswerText = selectedAnswer ? question[selectedAnswer] : 'Not answered';
            
            return {
                question: question.question,
                selectedAnswer: selectedAnswer || null,
                selectedAnswerText: selectedAnswerText,
                isCorrect: selectedAnswer === question.answer
            };
        });
        
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`/api/submit/${quizId}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    answers,
                    timeSpent,
                    category: parseInt(quizSettings.category) 
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit quiz');
            }
            
            const results = await response.json();
            
            
            sessionStorage.setItem('quizResults', JSON.stringify(results));
            
            
            window.location.href = 'results.html';
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    }
    
    
    function showConfirmationModal(title, message, confirmAction) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        modalConfirm.onclick = () => {
            modalOverlay.classList.add('hidden');
            confirmAction();
        };
        
        modalCancel.onclick = () => {
            modalOverlay.classList.add('hidden');
        };
        
        modalOverlay.classList.remove('hidden');
    }
    
   
    
    
    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });
    
    
    nextButton.addEventListener('click', () => {
        
        const selectedOption = getSelectedOption();
        
        
        if (!selectedOption) {
            errorMessage.classList.remove('hidden');
            document.getElementById('question-container').classList.add('shake');
            
           
            setTimeout(() => {
                document.getElementById('question-container').classList.remove('shake');
            }, 500);
            
            return;
        }
        
       
        userAnswers[currentQuestionIndex] = selectedOption;
        
        
        if (currentQuestionIndex === questions.length - 1) {
            submitQuiz();
        } else {
            
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    });
    
    
    homeButton.addEventListener('click', () => {
        showConfirmationModal(
            'Return to Home',
            'Return to home? Your progress will be lost.',
            () => {
                clearInterval(timerInterval);
                window.location.href = 'index.html';
            }
        );
    });
    
    
    restartButton.addEventListener('click', () => {
        showConfirmationModal(
            'Restart Quiz',
            'Restart quiz? Your current progress will be lost.',
            () => {
                clearInterval(timerInterval);
                sessionStorage.setItem('quizStartTime', Date.now().toString());
                window.location.href = 'quiz.html';
            }
        );
    });
    
    
    quitButton.addEventListener('click', () => {
        showConfirmationModal(
            'Quit Quiz?',
            'Quit quiz? Your progress will be lost.',
            () => {
                clearInterval(timerInterval);
                window.location.href = 'index.html';
            }
        );
    });
    
    
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', () => {
            errorMessage.classList.add('hidden');
        });
    });

    const isUserAuthenticated = isAuthenticated();

    const homeLink = document.querySelector('a[href="index.html"]');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            showConfirmationModal('Are you sure you want to quit? Your progress will be lost.', () => {
                window.location.href = 'index.html';
            });
        });
    }

    const navLinks = document.querySelectorAll('.nav-link:not(#logout-btn)');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (isQuizInProgress()) {
                e.preventDefault();
                showConfirmationModal('Are you sure you want to leave? Your progress will be lost.', () => {
                    window.location.href = link.href;
                });
            }
        });
    });
});

function isQuizInProgress() {
   
    return true; 
}
