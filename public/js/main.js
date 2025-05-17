document.addEventListener('DOMContentLoaded', () => {
    
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    function toggleMenu(show) {
        if (show) {
            navLinks.classList.add('show');
            hamburgerMenu.classList.add('active');
            body.classList.add('nav-open');
        } else {
            navLinks.classList.remove('show');
            hamburgerMenu.classList.remove('active');
            body.classList.remove('nav-open');
        }
    }

    if (hamburgerMenu && navLinks) {
        
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const isShown = navLinks.classList.contains('show');
            toggleMenu(!isShown);
        });

       
        document.addEventListener('click', (e) => {
            const isClickInside = navLinks.contains(e.target) || hamburgerMenu.contains(e.target);
            if (!isClickInside && navLinks.classList.contains('show')) {
                toggleMenu(false);
            }
        });

        
        navLinks.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                toggleMenu(false);
            }
        });

       
        navLinks.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    const questionCountSlider = document.getElementById('question-count');
    const questionCountValue = document.getElementById('question-count-value');
    const categorySelect = document.getElementById('category');
    const timerOptions = document.querySelectorAll('input[name="timer-type"]');
    const perQuestionTimerContainer = document.getElementById('per-question-timer-container');
    const entireQuizTimerContainer = document.getElementById('entire-quiz-timer-container');
    const perQuestionDurationSlider = document.getElementById('per-question-duration');
    const perQuestionDurationValue = document.getElementById('per-question-duration-value');
    const entireQuizDurationSlider = document.getElementById('entire-quiz-duration');
    const entireQuizDurationValue = document.getElementById('entire-quiz-duration-value');
    const startQuizButton = document.getElementById('start-quiz');
    
    
    const fromResults = sessionStorage.getItem('fromResults') === 'true';
    if (fromResults) {
       
        const quizSettings = JSON.parse(sessionStorage.getItem('quizSettings') || '{}');
        if (quizSettings.questionCount) {
            questionCountSlider.value = quizSettings.questionCount;
            questionCountValue.textContent = quizSettings.questionCount;
        }
        
        if (quizSettings.timerType) {
            const timerOption = document.getElementById(quizSettings.timerType + '-timer');
            if (timerOption) {
                timerOption.checked = true;
                
                if (quizSettings.timerType === 'question') {
                    perQuestionTimerContainer.classList.remove('hidden');
                    if (quizSettings.timerDuration) {
                        perQuestionDurationSlider.value = quizSettings.timerDuration;
                        perQuestionDurationValue.textContent = quizSettings.timerDuration;
                    }
                } else if (quizSettings.timerType === 'quiz') {
                    entireQuizTimerContainer.classList.remove('hidden');
                    if (quizSettings.timerDuration) {
                        entireQuizDurationSlider.value = quizSettings.timerDuration;
                        entireQuizDurationValue.textContent = quizSettings.timerDuration;
                    }
                }
            }
        }
        
        
        sessionStorage.removeItem('fromResults');
    }
    
    
    if (questionCountSlider && questionCountValue) {
        questionCountSlider.addEventListener('input', () => {
            questionCountValue.textContent = questionCountSlider.value;
        });
    }
    
    
    if (timerOptions) {
        timerOptions.forEach(option => {
            option.addEventListener('change', () => {
                perQuestionTimerContainer?.classList.add('hidden');
                entireQuizTimerContainer?.classList.add('hidden');
                
                if (option.value === 'question') {
                    perQuestionTimerContainer?.classList.remove('hidden');
                } else if (option.value === 'quiz') {
                    entireQuizTimerContainer?.classList.remove('hidden');
                }
            });
        });
    }
    
   
    if (perQuestionDurationSlider && perQuestionDurationValue) {
        perQuestionDurationSlider.addEventListener('input', () => {
            perQuestionDurationValue.textContent = perQuestionDurationSlider.value;
        });
    }
    
   
    if (entireQuizDurationSlider && entireQuizDurationValue) {
        entireQuizDurationSlider.addEventListener('input', () => {
            entireQuizDurationValue.textContent = entireQuizDurationSlider.value;
        });
    }
    
    if (startQuizButton) {
        startQuizButton.addEventListener('click', () => {
            const selectedTimerOption = document.querySelector('input[name="timer-type"]:checked');
            const timerType = selectedTimerOption ? selectedTimerOption.value : 'none';
            
            let timerDuration = 0;
            if (timerType === 'question') {
                timerDuration = parseInt(perQuestionDurationSlider.value);
            } else if (timerType === 'quiz') {
                timerDuration = parseInt(entireQuizDurationSlider.value) * 60;
            }
            
            const quizSettings = {
                questionCount: parseInt(questionCountSlider.value),
                category: parseInt(categorySelect.value),
                timerType: timerType,
                timerDuration: timerDuration
            };
            
            const quizId = 'quiz_' + Date.now();
            
            sessionStorage.setItem('quizSettings', JSON.stringify(quizSettings));
            sessionStorage.setItem('quizId', quizId);
            sessionStorage.setItem('quizStartTime', Date.now().toString());
            
            window.location.href = 'quiz.html';
        });
    }
});
