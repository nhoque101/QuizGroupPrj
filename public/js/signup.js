document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordToggle = document.getElementById('password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const guestBtn = document.querySelector('.guest-btn');

    const createErrorElement = (inputId) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.id = `${inputId}-error`;
        return errorDiv;
    };

    const inputs = [usernameInput, emailInput, passwordInput, confirmPasswordInput];
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

    
    const validateEmail = async (email, isShowError = true) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email) {
            if (isShowError) showError('email', 'Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            if (isShowError) showError('email', 'Please enter a valid email address (example: name@domain.com)');
            return false;
        }
        clearError('email');
        return true;
    };

   
    const validateUsername = async (username, isShowError = true) => {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!username) {
            if (isShowError) showError('username', 'Username is required');
            return false;
        }
        if (!usernameRegex.test(username)) {
            if (isShowError) showError('username', 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
            return false;
        }
        clearError('username');
        return true;
    };

    
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    
    const checkEmailExists = debounce(async (email) => {
        if (!await validateEmail(email, false)) return;
        
        try {
            const response = await fetch('/api/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            
            if (data.exists) {
                showError('email', 'Email already registered');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking email:', error);
            return true; // Allow form submission on error
        }
    }, 500);

 
    const checkUsernameExists = debounce(async (username) => {
        if (!await validateUsername(username, false)) return;
        
        try {
            const response = await fetch('/api/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            
            if (data.exists) {
                showError('username', 'Username already taken');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking username:', error);
            return true; 
        }
    }, 500);

    
    emailInput.addEventListener('input', () => {
        validateEmail(emailInput.value);
        checkEmailExists(emailInput.value);
    });

    usernameInput.addEventListener('input', () => {
        validateUsername(usernameInput.value);
        checkUsernameExists(usernameInput.value);
    });

    // Add real-time password validation
    passwordInput.addEventListener('input', () => {
        validatePassword(passwordInput.value);
        if (confirmPasswordInput.value) {
            validateConfirmPassword(passwordInput.value, confirmPasswordInput.value);
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        validateConfirmPassword(passwordInput.value, confirmPasswordInput.value);
    });

    
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        if (!password) {
            showError('password', 'Password is required');
            return false;
        }

        if (password.length < minLength) {
            showError('password', 'Password must be at least 8 characters long');
            return false;
        }

        if (!(hasUpperCase && hasNumber)) {
            showError('password', 'Password must contain at least one uppercase letter and one number');
            return false;
        }

        clearError('password');
        return true;
    };

    
    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) {
            showError('confirm-password', 'Please confirm your password');
            return false;
        }
        if (password !== confirmPassword) {
            showError('confirm-password', 'Passwords do not match');
            return false;
        }
        clearError('confirm-password');
        return true;
    };

  
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.classList.toggle('fa-eye');
        passwordToggle.classList.toggle('fa-eye-slash');
    });

    confirmPasswordToggle.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        confirmPasswordToggle.classList.toggle('fa-eye');
        confirmPasswordToggle.classList.toggle('fa-eye-slash');
    });

    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

       
        if (!email) {
            showError('email', 'Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            showError('email', 'Please enter a valid email address (example: name@domain.com)');
        }

        if (!username) {
            showError('username', 'Username is required');
        } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
            showError('username', 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
        }

        validatePassword(password);
        validateConfirmPassword(password, confirmPassword);

       
        const hasErrors = Array.from(document.querySelectorAll('.error-message'))
            .some(errorDiv => errorDiv.style.display === 'block');

        if (hasErrors) {
            return;
        }

       
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error.includes('Email')) {
                    showError('email', data.error);
                } else if (data.error.includes('Username')) {
                    showError('username', data.error);
                } else {
                    
                    showError('email', 'Failed to create account. Please try again.');
                }
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

           
            window.location.href = '/profile.html';
        } catch (error) {
            console.error('Signup error:', error);
           
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

   
    guestBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}); 