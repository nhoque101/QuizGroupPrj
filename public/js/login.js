document.addEventListener('DOMContentLoaded', () => {
   
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
   
    if (token && user) {
        try {
            const userData = JSON.parse(user);
            if (userData && userData.username) {
                window.location.href = 'profile.html';
                return;
            }
        } catch (error) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

   
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const googleBtn = document.querySelector('.google-btn');
    const githubBtn = document.querySelector('.github-btn');
    const guestBtn = document.querySelector('.guest-btn');

    
    const createErrorElement = (inputId) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.id = `${inputId}-error`;
        return errorDiv;
    };

    
    const inputs = [emailInput, passwordInput];
    inputs.forEach(input => {
        const errorDiv = createErrorElement(input.id);
        input.parentNode.parentNode.appendChild(errorDiv);
    });

   
    const showError = (inputId, message) => {
        const errorDiv = document.getElementById(`${inputId}-error`);
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        document.getElementById(inputId).classList.add('error');
    };

    
    const clearError = (inputId) => {
        const errorDiv = document.getElementById(`${inputId}-error`);
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        document.getElementById(inputId).classList.remove('error');
    };

   
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError('email', 'Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            return false;
        }
        clearError('email');
        return true;
    };

    
    const validatePassword = (password) => {
        if (!password) {
            showError('password', 'Password is required');
            return false;
        }
        clearError('password');
        return true;
    };

   
    emailInput.addEventListener('input', () => validateEmail(emailInput.value));
    passwordInput.addEventListener('input', () => validatePassword(passwordInput.value));

   
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.classList.toggle('fa-eye');
        passwordToggle.classList.toggle('fa-eye-slash');
    });

    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const remember = document.getElementById('remember').checked;

        
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        try {
            
            if (isEmailValid && isPasswordValid) {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

               
                window.location.href = '/profile.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('email', 'Invalid email or password');
            
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    
    googleBtn.addEventListener('click', () => {
        console.log('Google login clicked');
    });

    githubBtn.addEventListener('click', () => {
        console.log('GitHub login clicked');
    });

  
    guestBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}); 