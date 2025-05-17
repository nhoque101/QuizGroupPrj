
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
}

function updateNavigation() {
    const body = document.body;
    const navLinks = document.querySelector('.nav-links');
    
    if (isAuthenticated()) {
        body.classList.add('is-authenticated');
        body.classList.remove('is-guest');
        
        
        navLinks.innerHTML = `
            <a href="index.html" class="nav-link"><i class="fas fa-home"></i> Home</a>
            <a href="profile.html" class="nav-link"><i class="fas fa-user"></i> Profile</a>
            <a href="leaderboard.html" class="nav-link"><i class="fas fa-trophy"></i> Leaderboard</a>
            <button id="logoutBtn" class="nav-link logout-btn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        
       
        document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    } else {
        body.classList.add('is-guest');
        body.classList.remove('is-authenticated');
        
        
        navLinks.innerHTML = `
            <a href="index.html" class="nav-link"><i class="fas fa-home"></i> Home</a>
            <a href="leaderboard.html" class="nav-link"><i class="fas fa-trophy"></i> Leaderboard</a>
            <a href="login.html" class="nav-link"><i class="fas fa-sign-in-alt"></i> Login</a>
            <a href="signup.html" class="nav-link"><i class="fas fa-user-plus"></i> Sign Up</a>
        `;
        
       
        const protectedPages = ['profile.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
    
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeLink = navLinks.querySelector(`[href="${currentPage}"]`);
    if (activeLink) {
        navLinks.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    window.location.href = 'index.html';
}


document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});


window.isAuthenticated = isAuthenticated;
window.updateNavigation = updateNavigation;
window.handleLogout = handleLogout; 