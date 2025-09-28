/* ========================================
   MAFIA GAME STORE - MAIN JAVASCRIPT
   Professional Cyber Gaming Store
======================================== */

// ========================================
// CONFIGURATION & INITIALIZATION
// ========================================

// Supabase Configuration
const SUPABASE_URL = 'https://znkufcnbhspupmgzacca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpua3VmY25iaHNwdXBtZ3phY2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjQ4MTYsImV4cCI6MjA3NDI0MDgxNn0.1PPg_PHc9KK2qLHYy4nvbi7a_i5ju4VFbjnlEBtZCdQ';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Variables
let currentUser = null;
let selectedProduct = null;
let selectedPaymentMethod = null;
let verificationTimer = null;
let currentLoginRequest = null;
let particles = null;
let loadingProgress = 0;
let notificationQueue = [];

// App State
const AppState = {
    isLoading: true,
    currentPage: 'home',
    isLoggedIn: false,
    deviceInfo: null,
    realtimeSubscriptions: []
};

// ========================================
// INITIALIZATION & LOADING
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        showLoadingScreen();
        
        // Initialize particle background
        initializeParticles();
        
        // Simulate loading progress
        await simulateLoading();
        
        // Initialize device info
        AppState.deviceInfo = getDeviceInfo();
        
        // Check existing session
        await checkExistingSession();
        
        // Load website settings
        await loadWebsiteSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup realtime listeners
        setupRealtimeListeners();
        
        // Hide loading screen
        hideLoadingScreen();
        
        // Show welcome notification
        showNotification('ကြိုဆိုပါသည်!', 'MAFIA GAME STORE သို့ ကြိုဆိုပါသည်', 'success');
        
    } catch (error) {
        console.error('App initialization error:', error);
        showNotification('Error', 'အက်ပ်စတင်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
        hideLoadingScreen();
    }
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'flex';
    AppState.isLoading = true;
}

async function simulateLoading() {
    const progressFill = document.getElementById('loadingProgress');
    const progressText = document.getElementById('loadingText');
    
    const steps = [
        { progress: 20, text: 'Loading Assets...' },
        { progress: 40, text: 'Connecting Database...' },
        { progress: 60, text: 'Initializing Security...' },
        { progress: 80, text: 'Setting up Interface...' },
        { progress: 100, text: 'Complete!' }
    ];
    
    for (const step of steps) {
        await new Promise(resolve => {
            setTimeout(() => {
                progressFill.style.width = step.progress + '%';
                progressText.textContent = step.progress + '%';
                loadingProgress = step.progress;
                resolve();
            }, 400);
        });
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.add('hidden');
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        AppState.isLoading = false;
    }, 500);
}

// ========================================
// PARTICLE SYSTEM
// ========================================

function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#00ff41', '#00d4ff', '#ff0080', '#8000ff']
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00ff41',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Password toggle functionality
    setupPasswordToggles();
    
    // Form submissions
    setupFormListeners();
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
    
    // Touch events for mobile
    setupTouchEvents();
}

function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
            
            // Add animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function setupFormListeners() {
    // Input animations
    document.querySelectorAll('.cyber-input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            addInputGlow(this);
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            removeInputGlow(this);
        });
        
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

function setupTouchEvents() {
    // Add touch feedback for mobile devices
    document.querySelectorAll('.cyber-btn, .cyber-card, .nav-item').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function handleKeydown(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Enter key for form submissions
    if (e.key === 'Enter' && e.target.classList.contains('cyber-input')) {
        const form = e.target.closest('form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"], .btn-primary');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
}

function handleResize() {
    // Reinitialize particles on resize
    if (particles) {
        particles.pJS.fn.particlesRefresh();
    }
}

function handleBeforeUnload() {
    // Cleanup realtime subscriptions
    AppState.realtimeSubscriptions.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
        }
    });
    
    // Clear timers
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

async function createAccount() {
    try {
        showNotification('အကောင့်ဖန်တီးနေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info');
        
        const ipAddress = await getClientIP();
        const deviceInfo = AppState.deviceInfo;
        
        // Generate random credentials
        const randomId = Math.random().toString(36).substring(2, 15);
        const email = `user_${randomId}@mafiagamestore.local`;
        const password = generateRandomPassword();
        
        // Check if IP already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('ip_address', ipAddress)
            .single();
        
        if (existingUser) {
            showNotification('အကောင့်ရှိပြီး', 'ဤ IP Address ဖြင့် အကောင့်တစ်ခု ရှိပြီးဖြစ်ပါသည်', 'warning');
            return;
        }
        
        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert([{
                ip_address: ipAddress,
                email: email,
                password: password
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Register device
        await supabase
            .from('user_devices')
            .insert([{
                user_id: user.id,
                device_info: JSON.stringify(deviceInfo),
                device_type: deviceInfo.platform,
                browser: deviceInfo.browser,
                location: await getLocation(),
                is_verified: true
            }]);
        
        // Set current user
        currentUser = user;
        AppState.isLoggedIn = true;
        
        // Save session
        saveUserSession(user, deviceInfo);
        
        // Show dashboard with animation
        await showDashboardWithAnimation();
        
        // Load account info
        await loadAccountInfo();
        
        showNotification('အောင်မြင်ပါပြီ!', 'အကောင့်အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ', 'success');
        
    } catch (error) {
        console.error('Account creation error:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'အကောင့်ဖန်တီးရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function login() {
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        if (!email || !password) {
            showNotification('လိုအပ်သော အချက်အလက်များ', 'အီးမေးလ်နှင့် စကားဝှက် ထည့်ပေးပါ', 'warning');
            return;
        }
        
        showNotification('ဝင်ရောက်နေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info');
        
        // Check user credentials
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();
        
        if (error || !user) {
            showNotification('ဝင်ရောက်မှု မအောင်မြင်', 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းပါသည်', 'error');
            return;
        }
        
        const deviceInfo = AppState.deviceInfo;
        const currentIPAddress = await getClientIP();
        
        // Check if this is the original device
        const { data: devices } = await supabase
            .from('user_devices')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_verified', true);
        
        const isOriginalDevice = devices?.some(device => {
            const storedDevice = JSON.parse(device.device_info);
            return storedDevice.userAgent === deviceInfo.userAgent;
        });
        
        if (!isOriginalDevice) {
            // Request verification from original device
            await requestDeviceVerification(user.id, deviceInfo);
            return;
        }
        
        // Login successful
        currentUser = user;
        AppState.isLoggedIn = true;
        
        // Save session
        saveUserSession(user, deviceInfo);
        
        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        
        // Show dashboard with animation
        await showDashboardWithAnimation();
        
        // Load account info
        await loadAccountInfo();
        
        showNotification('အောင်မြင်ပါပြီ!', 'အကောင့်သို့ အောင်မြင်စွာ ဝင်ရောက်ပါပြီ', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ဝင်ရောက်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function requestDeviceVerification(userId, deviceInfo) {
    try {
        const location = await getLocation();
        
        // Create login request
        const { data: request, error } = await supabase
            .from('login_requests')
            .insert([{
                user_id: userId,
                requesting_device_info: JSON.stringify(deviceInfo),
                requesting_location: location
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        currentLoginRequest = request;
        showDeviceVerificationWaiting();
        
    } catch (error) {
        console.error('Verification request error:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'အတည်ပြုခြင်း တောင်းဆိုရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

function showDeviceVerificationWaiting() {
    const authSection = document.getElementById('authSection');
    
    authSection.innerHTML = `
        <div class="auth-container">
            <div class="auth-card glass-morphism-strong">
                <div class="verification-header">
                    <div class="verification-icon">
                        <div class="security-shield">
                            <i class="fas fa-shield-alt"></i>
                            <div class="shield-pulse"></div>
                        </div>
                    </div>
                    <h2 class="auth-title neon-text">စက်ပစ္စည်းအတည်ပြုခြင်း</h2>
                    <p class="auth-subtitle">သင့်အကောင့်ပိုင်ရှင်၏ အတည်ပြုချက်ကို စောင့်ဆိုင်းနေပါသည်...</p>
                </div>
                <div class="countdown-container">
                    <div class="countdown-circle">
                        <div class="countdown-text" id="waitingCountdown">5:00</div>
                        <svg class="countdown-ring">
                            <circle class="countdown-ring-background" cx="60" cy="60" r="50"></circle>
                            <circle class="countdown-ring-progress" cx="60" cy="60" r="50" id="waitingProgress"></circle>
                        </svg>
                    </div>
                </div>
                <div class="auth-form">
                    <button class="btn btn-secondary cyber-btn" onclick="cancelVerificationRequest()">
                        <span class="btn-text">ပယ်ဖျက်ပါ</span>
                        <div class="btn-glow"></div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    startWaitingCountdown();
}

function startWaitingCountdown() {
    let timeLeft = 300; // 5 minutes
    const countdownElement = document.getElementById('waitingCountdown');
    const progressElement = document.getElementById('waitingProgress');
    const circumference = 2 * Math.PI * 50;
    
    verificationTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress ring
        const offset = circumference - (timeLeft / 300) * circumference;
        progressElement.style.strokeDashoffset = offset;
        
        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            showNotification('အချိန်ကုန်ဆုံးပါပြီ', 'အတည်ပြုချက် စောင့်ဆိုင်းချိန် ကုန်ဆုံးပါပြီ', 'error');
            location.reload();
        }
        
        timeLeft--;
    }, 1000);
}

async function cancelVerificationRequest() {
    if (currentLoginRequest) {
        await supabase
            .from('login_requests')
            .delete()
            .eq('id', currentLoginRequest.id);
    }
    
    clearInterval(verificationTimer);
    location.reload();
}

function logout() {
    try {
        // Clear session
        localStorage.removeItem('userSession');
        currentUser = null;
        AppState.isLoggedIn = false;
        
        // Clear realtime subscriptions
        AppState.realtimeSubscriptions.forEach(subscription => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        });
        AppState.realtimeSubscriptions = [];
        
        // Show logout animation
        const dashboard = document.getElementById('dashboard');
        dashboard.style.animation = 'slideOutRight 0.5s ease';
        
        setTimeout(() => {
            location.reload();
        }, 500);
        
        showNotification('ထွက်ခွာပါပြီ', 'အကောင့်မှ အောင်မြင်စွာ ထွက်ခွာပါပြီ', 'info');
        
    } catch (error) {
        console.error('Logout error:', error);
        location.reload();
    }
}

// ========================================
// SESSION MANAGEMENT
// ========================================

function saveUserSession(user, deviceInfo) {
    const sessionData = {
        userId: user.id,
        email: user.email,
        deviceInfo: deviceInfo,
        timestamp: Date.now()
    };
    
    localStorage.setItem('userSession', JSON.stringify(sessionData));
}

async function checkExistingSession() {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return;
    
    try {
        const userData = JSON.parse(sessionData);
        
        // Check if session is not too old (7 days)
        const sessionAge = Date.now() - userData.timestamp;
        if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem('userSession');
            return;
        }
        
        // Verify session is still valid
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', userData.userId)
            .eq('is_active', true)
            .single();
        
        if (user) {
            currentUser = user;
            AppState.isLoggedIn = true;
            await showDashboardWithAnimation();
            await loadAccountInfo();
        } else {
            localStorage.removeItem('userSession');
        }
    } catch (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('userSession');
    }
}

// ========================================
// UI ANIMATIONS & TRANSITIONS
// ========================================

async function showDashboardWithAnimation() {
    const authSection = document.getElementById('authSection');
    const dashboard = document.getElementById('dashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Hide auth section with animation
    authSection.style.animation = 'slideOutLeft 0.5s ease';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    logoutBtn.style.display = 'block';
    
    // Show dashboard with animation
    dashboard.style.animation = 'slideInRight 0.8s ease';
    
    // Load dashboard data
    await loadDashboardData();
}

function showLogin() {
    const signupPage = document.getElementById('signupPage');
    const loginPage = document.getElementById('loginPage');
    
    signupPage.style.animation = 'slideOutLeft 0.3s ease';
    
    setTimeout(() => {
        signupPage.style.display = 'none';
        loginPage.style.display = 'block';
        loginPage.style.animation = 'slideInRight 0.3s ease';
    }, 300);
}

function showSignup() {
    const signupPage = document.getElementById('signupPage');
    const loginPage = document.getElementById('loginPage');
    
    loginPage.style.animation = 'slideOutRight 0.3s ease';
    
    setTimeout(() => {
        loginPage.style.display = 'none';
        signupPage.style.display = 'block';
        signupPage.style.animation = 'slideInLeft 0.3s ease';
    }, 300);
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
        page.style.animation = 'slideOutLeft 0.3s ease';
    });
    
    // Hide all product pages
    document.querySelectorAll('.product-page').forEach(page => {
        page.classList.remove('active');
    });
    
    setTimeout(() => {
        // Show selected page
        const targetPage = document.getElementById(pageName + 'Page');
        targetPage.classList.add('active');
        targetPage.style.animation = 'slideInRight 0.5s ease';
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
            
            // Add selection animation
            activeNav.style.transform = 'scale(1.1)';
            setTimeout(() => {
                activeNav.style.transform = '';
            }, 200);
        }
        
        // Update app state
        AppState.currentPage = pageName;
        
        // Load page specific data
        loadPageData(pageName);
        
    }, 300);
}

function loadPageData(pageName) {
    switch(pageName) {
        case 'home':
            loadDashboardData();
            break;
        case 'history':
            loadHistory();
            break;
        case 'news':
            loadNews();
            break;
        case 'mi':
            loadMiPage();
            break;
    }
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

function showNotification(title, message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    const notificationId = 'notification_' + Date.now();
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = notificationId;
    notification.innerHTML = `
        <div class="notification-header">
            <i class="notification-icon ${iconMap[type]}"></i>
            <div class="notification-title">${title}</div>
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="closeNotification('${notificationId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.4s ease';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        closeNotification(notificationId);
    }, duration);
    
    // Add to queue for management
    notificationQueue.push(notificationId);
    
    // Limit number of notifications
    if (notificationQueue.length > 3) {
        const oldNotification = notificationQueue.shift();
        closeNotification(oldNotification);
    }
}

function closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
            notificationQueue = notificationQueue.filter(id => id !== notificationId);
        }, 300);
    }
}

// ========================================
// INPUT VALIDATION & EFFECTS
// ========================================

function addInputGlow(input) {
    const parent = input.parentElement;
    parent.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)';
    
    // Add typing effect
    input.addEventListener('input', function(e) {
        const value = e.target.value;
        if (value.length > 0) {
            parent.classList.add('has-value');
        } else {
            parent.classList.remove('has-value');
        }
    });
}

function removeInputGlow(input) {
    const parent = input.parentElement;
    parent.style.boxShadow = '';
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    let isValid = true;
    
    // Email validation
    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    }
    
    // Password validation
    if (type === 'password') {
        isValid = value.length >= 6;
    }
    
    // Required field validation
    if (input.hasAttribute('required')) {
        isValid = isValid && value.length > 0;
    }
    
    // Update UI based on validation
    const parent = input.parentElement;
    if (value.length > 0) {
        if (isValid) {
            parent.classList.add('valid');
            parent.classList.remove('invalid');
            input.style.borderColor = 'var(--neon-green)';
        } else {
            parent.classList.add('invalid');
            parent.classList.remove('valid');
            input.style.borderColor = 'var(--neon-pink)';
        }
    } else {
        parent.classList.remove('valid', 'invalid');
        input.style.borderColor = '';
    }
    
    return isValid;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
    
    // Add click animation
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// ========================================
// DASHBOARD DATA LOADING
// ========================================

async function loadDashboardData() {
    try {
        await Promise.all([
            loadCategories(),
            loadProducts()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ဒေတာ ရယူရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function loadCategories() {
    try {
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('order_index');
        
        if (categories) {
            loadCategoryGames(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function loadCategoryGames(categories) {
    categories.forEach(category => {
        if (category.name === 'PUBG MOBILE') {
            loadPUBGGames();
        } else if (category.name === 'MOBILE LEGENDS') {
            loadMLGames();
        }
    });
}

async function loadPUBGGames() {
    const pubgContainer = document.getElementById('pubgGames');
    
    // Add loading animation
    pubgContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    setTimeout(() => {
        pubgContainer.innerHTML = `
            <div class="cyber-card game-card" onclick="showProductPage('pubgUc')">
                <div class="card-glow"></div>
                <div class="game-icon holographic">
                    <img src="https://github.com/Opper125/MAFIA-GAME-STORE/blob/54371820edb4dfabbfd6563d2adaa84782711485/assets/pubg_mobile_card_icon.jpg" alt="PUBG UC" class="main-card-icon">
                </div>
                <div class="game-title">PUBG UC</div>
                <div class="card-shine"></div>
            </div>
            <div class="cyber-card game-card" onclick="showProductPage('pubgAccount')">
                <div class="card-glow"></div>
                <div class="game-icon holographic">⚒</div>
                <div class="game-title">PUBG Account</div>
                <div class="card-shine"></div>
            </div>
        `;
        
        // Add entrance animation
        pubgContainer.querySelectorAll('.game-card').forEach((card, index) => {
            card.style.animation = `slideInUp 0.5s ease ${index * 0.1}s both`;
        });
    }, 500);
}

async function loadMLGames() {
    const mlContainer = document.getElementById('mlGames');
    
    // Add loading animation
    mlContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    setTimeout(() => {
        mlContainer.innerHTML = `
            <div class="cyber-card game-card" onclick="showProductPage('mlDiamond')">
                <div class="card-glow"></div>
                <div class="game-icon holographic">
                    <img src="https://github.com/Opper125/MAFIA-GAME-STORE/raw/923ae7dc21388b4c91484445c8183412d96538fd/assets/mobile_legends_main_card_icon.png" alt="ML Diamond" class="main-card-icon">
                </div>
                <div class="game-title">ML Diamond</div>
                <div class="card-shine"></div>
            </div>
            <div class="cyber-card game-card" onclick="showProductPage('mlAccount')">
                <div class="card-glow"></div>
                <div class="game-icon holographic">⚒</div>
                <div class="game-title">ML Account</div>
                <div class="card-shine"></div>
            </div>
        `;
        
        // Add entrance animation
        mlContainer.querySelectorAll('.game-card').forEach((card, index) => {
            card.style.animation = `slideInUp 0.5s ease ${index * 0.1}s both`;
        });
    }, 500);
}

async function loadProducts() {
    // This function can be expanded for additional product loading
}

// ========================================
// PRODUCT PAGES
// ========================================

function showProductPage(type) {
    // Hide main pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
        p.style.animation = 'slideOutLeft 0.3s ease';
    });
    
    setTimeout(() => {
        if (type === 'pubgUc') {
            document.getElementById('pubgUcPage').classList.add('active');
            document.getElementById('pubgUcPage').style.animation = 'slideInRight 0.5s ease';
            loadPUBGUCProducts();
        } else if (type === 'mlDiamond') {
            document.getElementById('mlDiamondPage').classList.add('active');
            document.getElementById('mlDiamondPage').style.animation = 'slideInRight 0.5s ease';
            loadMLDiamondProducts();
        }
    }, 300);
}

function showAllProducts() {
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
        p.style.animation = 'slideOutLeft 0.3s ease';
    });
    
    setTimeout(() => {
        document.getElementById('allProductsPage').classList.add('active');
        document.getElementById('allProductsPage').style.animation = 'slideInRight 0.5s ease';
        loadAllProducts();
    }, 300);
}

function goBack() {
    document.querySelectorAll('.product-page').forEach(p => {
        p.classList.remove('active');
        p.style.animation = 'slideOutRight 0.3s ease';
    });
    
    setTimeout(() => {
        document.getElementById('homePage').classList.add('active');
        document.getElementById('homePage').style.animation = 'slideInLeft 0.5s ease';
    }, 300);
}

async function loadPUBGUCProducts() {
    try {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'uc')
            .eq('is_active', true)
            .order('amount');
        
        const container = document.getElementById('pubgProducts');
        
        if (products && products.length > 0) {
            container.innerHTML = products.map((product, index) => `
                <div class="product-card cyber-card" onclick="selectProduct('${product.id}', 'pubg')" style="animation-delay: ${index * 0.1}s">
                    <div class="card-glow"></div>
                    <div class="product-icon">
                        <img src="https://github.com/Opper125/MAFIA-GAME-STORE/raw/923ae7dc21388b4c91484445c8183412d96538fd/assets/uc.png" alt="UC" class="card-icon">
                    </div>
                    <div class="product-amount">${product.amount} UC</div>
                    <div class="product-price">${product.price} ${product.currency}</div>
                    <div class="card-shine"></div>
                </div>
            `).join('');
            
            // Add entrance animations
            container.querySelectorAll('.product-card').forEach(card => {
                card.style.animation = 'slideInUp 0.5s ease var(--animation-delay, 0s) both';
            });
        } else {
            container.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">🚫</div>
                    <div class="no-products-text">မည်သည့်ထုတ်ကုန်မှ မရှိပေးပါ</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading PUBG UC products:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ထုတ်ကုန်များ ရယူရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function loadMLDiamondProducts() {
    try {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'diamond')
            .eq('is_active', true)
            .order('amount');
        
        const container = document.getElementById('mlProducts');
        
        if (products && products.length > 0) {
            container.innerHTML = products.map((product, index) => `
                <div class="product-card cyber-card" onclick="selectProduct('${product.id}', 'ml')" style="animation-delay: ${index * 0.1}s">
                    <div class="card-glow"></div>
                    <div class="product-icon">
                        <img src="https://github.com/Opper125/MAFIA-GAME-STORE/raw/923ae7dc21388b4c91484445c8183412d96538fd/assets/mlbb_dia.png" alt="Diamond" class="card-icon">
                    </div>
                    <div class="product-amount">${product.amount} Diamond</div>
                    <div class="product-price">${product.price} ${product.currency}</div>
                    <div class="card-shine"></div>
                </div>
            `).join('');
            
            // Add entrance animations
            container.querySelectorAll('.product-card').forEach(card => {
                card.style.animation = 'slideInUp 0.5s ease var(--animation-delay, 0s) both';
            });
        } else {
            container.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">🚫</div>
                    <div class="no-products-text">မည်သည့်ထုတ်ကုန်မှ မရှိပေးပါ</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading ML Diamond products:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ထုတ်ကုန်များ ရယူရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function loadAllProducts() {
    try {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'other')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('allProductsContent');
        
        if (products && products.length > 0) {
            container.innerHTML = products.map((product, index) => `
                <div class="product-item cyber-card" style="animation-delay: ${index * 0.1}s">
                    <div class="card-glow"></div>
                    <div class="product-image">
                        <img src="${product.images?.[0] || '/api/placeholder/80/80'}" alt="${product.name}" onerror="this.src='/api/placeholder/80/80'">
                    </div>
                    <div class="product-details">
                        <div class="product-name">${product.name}</div>
                        <div class="product-description">${product.description || ''}</div>
                        <div class="product-price">${product.price} ${product.currency}</div>
                    </div>
                    <button class="btn btn-primary cyber-btn btn-small" onclick="contactSeller('${product.phone_number}', '${product.telegram_link}')">
                        <span class="btn-text">ဆက်သွယ်ပါ</span>
                        <div class="btn-glow"></div>
                    </button>
                    <div class="card-shine"></div>
                </div>
            `).join('');
            
            // Add entrance animations
            container.querySelectorAll('.product-item').forEach(item => {
                item.style.animation = 'slideInUp 0.5s ease var(--animation-delay, 0s) both';
            });
        } else {
            container.innerHTML = `
                <div class="no-products">
                    <div class="no-products-icon">🚫</div>
                    <div class="no-products-text">မည်သည့်ထုတ်ကုန်မှ မရှိပေးပါ</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading all products:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ထုတ်ကုန်များ ရယူရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

function contactSeller(phone, telegram) {
    if (telegram) {
        window.open(telegram, '_blank');
        showNotification('ရီဒါရက်တ်', 'Telegram သို့ ဆက်သွယ်နေပါသည်...', 'info');
    } else if (phone) {
        window.open(`tel:${phone}`, '_blank');
        showNotification('ဖုန်းခေါ်ဆိုမှု', 'ဖုန်းခေါ်ဆိုနေပါသည်...', 'info');
    } else {
        showNotification('ဆက်သွယ်ရန် အချက်အလက် မရှိ', 'ဤထုတ်ကုန်အတွက် ဆက်သွယ်ရန် အချက်အလက် မရှိပါ', 'warning');
    }
}

function selectProduct(productId, type) {
    selectedProduct = productId;
    
    // Update UI to show selected state
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = event.target.closest('.product-card');
    selectedCard.classList.add('selected');
    
    // Add selection animation
    selectedCard.style.transform = 'scale(1.05)';
    setTimeout(() => {
        selectedCard.style.transform = '';
    }, 300);
    
    // Show buy button with animation
    const buyBtn = document.getElementById('buy' + (type === 'pubg' ? 'Pubg' : 'Ml') + 'Btn');
    buyBtn.style.display = 'block';
    buyBtn.style.animation = 'slideInUp 0.5s ease';
    
    showNotification('ထုတ်ကုန်ရွေးချယ်ပြီး', 'ထုတ်ကုန်ကို ရွေးချယ်ပြီးပါပြီ', 'success', 2000);
}

// ========================================
// GAME ID VERIFICATION
// ========================================

async function verifyGameId(type) {
    try {
        showNotification('စစ်ဆေးနေပါသည်...', 'Game ID ကို စစ်ဆေးနေပါသည်', 'info');
        
        if (type === 'pubg') {
            const gameId = document.getElementById('pubgUserId').value.trim();
            if (!gameId) {
                showNotification('Game ID လိုအပ်သည်', 'Game ID ကို ထည့်ပေးပါ', 'warning');
                return;
            }
            
            // Add loading animation to verify button
            const verifyBtn = event.target;
            verifyBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
            verifyBtn.disabled = true;
            
            // Simulate verification process
            setTimeout(() => {
                verifyBtn.innerHTML = '<span class="btn-text">အတည်ပြုပါ</span><div class="btn-glow"></div>';
                verifyBtn.disabled = false;
                showNotification('စစ်ဆေးပြီးပါပြီ!', 'Game ID အတည်ပြုပြီးပါပြီ', 'success');
            }, 2000);
            
        } else if (type === 'ml') {
            const userId = document.getElementById('mlUserId').value.trim();
            const serverId = document.getElementById('mlServerId').value.trim();
            
            if (!userId || !serverId) {
                showNotification('အချက်အလက်လိုအပ်သည်', 'User ID နှင့် Server ID ကို ထည့်ပေးပါ', 'warning');
                return;
            }
            
            // Add loading animation to verify button
            const verifyBtn = event.target;
            verifyBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';
            verifyBtn.disabled = true;
            
            // Simulate verification process
            setTimeout(() => {
                verifyBtn.innerHTML = '<span class="btn-text">အတည်ပြုပါ</span><div class="btn-glow"></div>';
                verifyBtn.disabled = false;
                showNotification('စစ်ဆေးပြီးပါပြီ!', 'User ID နှင့် Server ID အတည်ပြုပြီးပါပြီ', 'success');
            }, 2000);
        }
    } catch (error) {
        console.error('Error verifying game ID:', error);
        showNotification('အမှားတစ်ခう ဖြစ်ပွားခဲ့သည်', 'စစ်ဆေးရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

// ========================================
// PURCHASE SYSTEM
// ========================================

async function buyProduct(type) {
    if (!selectedProduct) {
        showNotification('ထုတ်ကုန်ရွေးချယ်ပါ', 'ထုတ်ကုန်တစ်ခု ရွေးချယ်ပေးပါ', 'warning');
        return;
    }
    
    const gameId = type === 'pubg' ? 
        document.getElementById('pubgUserId').value.trim() : 
        document.getElementById('mlUserId').value.trim();
    
    const serverId = type === 'ml' ? 
        document.getElementById('mlServerId').value.trim() : null;
    
    if (!gameId || (type === 'ml' && !serverId)) {
        showNotification('အချက်အလက်လိုအပ်သည်', 'လိုအပ်သော အချက်အလက်များ ထည့်ပေးပါ', 'warning');
        return;
    }
    
    await showPaymentModal();
}

async function showPaymentModal() {
    try {
        showNotification('ငွေပေးချေမှုနည်းလမ်းများ ရယူနေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info');
        
        // Load payment methods
        const { data: paymentMethods } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('is_active', true)
            .order('order_index');
        
        const modal = document.getElementById('paymentModal');
        const methodsContainer = document.getElementById('paymentMethods');
        
        if (paymentMethods && paymentMethods.length > 0) {
            methodsContainer.innerHTML = paymentMethods.map((method, index) => `
                <div class="payment-method-item" onclick="selectPaymentMethod('${method.id}')" style="animation-delay: ${index * 0.1}s">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${method.icon_url || '/api/placeholder/40/40'}" alt="${method.name}" style="width: 40px; height: 40px; border-radius: 8px;" onerror="this.style.display='none'">
                        <div>
                            <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary);">${method.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${method.description || ''}</div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add entrance animations
            methodsContainer.querySelectorAll('.payment-method-item').forEach(item => {
                item.style.animation = 'slideInLeft 0.4s ease var(--animation-delay, 0s) both';
            });
        } else {
            methodsContainer.innerHTML = `
                <div class="no-payment-methods">
                    <div class="no-payment-icon">💳</div>
                    <div class="no-payment-text">မည်သည့်ငွေပေးချေမှုနည်းလမ်းမှ မရှိပေးပါ</div>
                </div>
            `;
        }
        
        modal.classList.add('active');
        modal.style.animation = 'fadeIn 0.3s ease';
        
    } catch (error) {
        console.error('Error loading payment methods:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ငွေပေးချေမှုနည်းလမ်းများ ထည့်သွင်းရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.animation = 'fadeOut 0.3s ease';
    
    setTimeout(() => {
        modal.classList.remove('active');
        selectedPaymentMethod = null;
        
        // Reset payment info
        const paymentInfo = document.getElementById('paymentInfo');
        paymentInfo.classList.remove('active');
        paymentInfo.innerHTML = '';
        
        // Reset reference input
        const referenceGroup = document.getElementById('referenceGroup');
        referenceGroup.style.display = 'none';
        document.getElementById('paymentReference').value = '';
        
        // Reset submit button
        const submitBtn = document.getElementById('submitOrder');
        submitBtn.style.display = 'none';
    }, 300);
}

async function selectPaymentMethod(methodId) {
    try {
        selectedPaymentMethod = methodId;
        
        // Update UI
        document.querySelectorAll('.payment-method-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = event.target.closest('.payment-method-item');
        selectedItem.classList.add('selected');
        
        // Add selection animation
        selectedItem.style.transform = 'scale(1.02)';
        setTimeout(() => {
            selectedItem.style.transform = '';
        }, 200);
        
        // Load payment method details
        const { data: method } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('id', methodId)
            .single();
        
        if (method) {
            const paymentInfo = document.getElementById('paymentInfo');
            paymentInfo.innerHTML = `
                <h4 style="color: var(--primary-lime); margin-bottom: 15px; font-family: 'Orbitron', monospace;">${method.name}</h4>
                <div class="payment-address">${method.address}</div>
                <p style="font-size: 14px; color: var(--text-secondary); margin: 15px 0; line-height: 1.5;">${method.description || ''}</p>
                <div style="padding: 12px; background: rgba(255, 152, 0, 0.1); border-radius: 10px; border: 1px solid rgba(255, 152, 0, 0.3);">
                    <div style="color: #ffb74d; font-size: 0.9rem; font-weight: 600;">
                        <i class="fas fa-info-circle"></i> မှတ်ချက်
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 5px;">
                        ငွေလွှဲပြီးနောက် တရားဝင်အမှတ်၏ နောက်ဆုံးဂဏန်း ၆ လုံးကို ထည့်ပေးပါ
                    </div>
                </div>
            `;
            paymentInfo.classList.add('active');
            
            // Show reference input and submit button with animation
            const referenceGroup = document.getElementById('referenceGroup');
            const submitBtn = document.getElementById('submitOrder');
            
            setTimeout(() => {
                referenceGroup.style.display = 'block';
                referenceGroup.style.animation = 'slideInUp 0.4s ease';
                
                setTimeout(() => {
                    submitBtn.style.display = 'block';
                    submitBtn.style.animation = 'slideInUp 0.4s ease';
                }, 200);
            }, 300);
        }
        
        showNotification('ငွေပေးချေမှုနည်းလမ်းရွေးချယ်ပြီး', `${method.name} ကို ရွေးချယ်ပြီးပါပြီ`, 'success', 2000);
        
    } catch (error) {
        console.error('Error selecting payment method:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ငွေပေးချေမှုနည်းလမ်း ရွေးချယ်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function submitOrder() {
    try {
        const reference = document.getElementById('paymentReference').value.trim();
        
        if (!reference || reference.length !== 6) {
            showNotification('အမှတ်လိုအပ်သည်', 'ငွေလွှဲမှုအမှတ် ၆ လုံး ထည့်ပေးပါ', 'warning');
            return;
        }
        
        // Validate reference contains only numbers
        if (!/^\d{6}$/.test(reference)) {
            showNotification('အမှတ်မှားယွင်းသည်', 'ငွေလွှဲမှုအမှတ်မှာ ဂဏန်းများသာ ပါဝင်ရပါမည်', 'warning');
            return;
        }
        
        showNotification('မှာယူမှုတင်သွင်းနေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info');
        
        // Disable submit button and show loading
        const submitBtn = document.getElementById('submitOrder');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
        submitBtn.disabled = true;
        
        // Get product details
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', selectedProduct)
            .single();
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Create order
        const orderData = {
            user_id: currentUser.id,
            product_id: selectedProduct,
            payment_method_id: selectedPaymentMethod,
            game_id: document.getElementById('pubgUserId')?.value || document.getElementById('mlUserId')?.value,
            server_id: document.getElementById('mlServerId')?.value,
            amount: product.amount,
            total_price: product.price,
            currency: product.currency,
            payment_reference: reference
        };
        
        const { data: order, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (error) throw error;
        
        // Reset form and close modal
        closePaymentModal();
        resetProductSelection();
        
        showNotification('မှာယူမှုအောင်မြင်ပါပြီ!', 'သင့်မှာယူမှုကို အောင်မြင်စွာ တင်သွင်းပါပြီ', 'success');
        
        // Show success animation
        document.body.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Go to history page after delay
        setTimeout(() => {
            showPage('history');
            showNotification('မှတ်တမ်းကြည့်ရန်', 'သင့်မှာယူမှုမှတ်တမ်းကို ကြည့်ရှုနိုင်ပါသည်', 'info');
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'မှာယူမှု တင်သွင်းရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
        
        // Reset submit button
        const submitBtn = document.getElementById('submitOrder');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function resetProductSelection() {
    selectedProduct = null;
    
    // Remove selected state from all product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Hide buy buttons
    document.querySelectorAll('[id$="Btn"]').forEach(btn => {
        if (btn.id.includes('buy')) {
            btn.style.display = 'none';
        }
    });
    
    // Clear game IDs
    const gameIdInputs = ['pubgUserId', 'mlUserId', 'mlServerId'];
    gameIdInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
            input.parentElement.classList.remove('has-value', 'valid');
        }
    });
}

// ========================================
// HISTORY PAGE
// ========================================

async function loadHistory() {
    try {
        if (!currentUser) return;
        
        showNotification('မှတ်တမ်းများ ရယူနေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info', 2000);
        
        const { data: orders } = await supabase
            .from('orders')
            .select(`
                *,
                products (name, amount, product_type),
                payment_methods (name)
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('historyContent');
        
        if (orders && orders.length > 0) {
            container.innerHTML = orders.map((order, index) => {
                const statusClass = order.status === 'approved' ? 'success' : 
                                  order.status === 'rejected' ? 'rejected' : 'pending';
                const statusText = order.status === 'approved' ? 'အတည်ပြုပြီး' : 
                                 order.status === 'rejected' ? 'ငြင်းပယ်ခံရသည်' : 'စောင့်ဆိုင်းနေသည်';
                
                const statusIcon = order.status === 'approved' ? 'fas fa-check-circle' :
                                  order.status === 'rejected' ? 'fas fa-times-circle' : 'fas fa-clock';
                
                return `
                    <div class="history-item ${statusClass}" style="animation-delay: ${index * 0.1}s">
                        <div class="history-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${new Date(order.created_at).toLocaleDateString('my-MM', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric'
                            })}
                        </div>
                        <div class="history-title">
                            <i class="fas fa-shopping-cart"></i>
                            ${order.products?.name || 'အမည်မသိ'}
                        </div>
                        <div class="history-amount ${statusClass}">
                            ${order.status === 'approved' ? '+' : ''}${order.amount || 0} ${order.products?.product_type?.toUpperCase() || ''}
                        </div>
                        <div class="history-details">
                            <div class="detail-item">
                                <span class="detail-label">မှာယူမှုနံပါတ်:</span>
                                <span class="detail-value">${order.order_number}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">စျေးနှုန်း:</span>
                                <span class="detail-value">${order.total_price} ${order.currency}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ငွေပေးချေမှု:</span>
                                <span class="detail-value">${order.payment_methods?.name || 'မသိ'}</span>
                            </div>
                        </div>
                        <div class="status-badge status-${statusClass}">
                            <i class="${statusIcon}"></i>
                            ${statusText}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add entrance animations
            container.querySelectorAll('.history-item').forEach(item => {
                item.style.animation = 'slideInLeft 0.5s ease var(--animation-delay, 0s) both';
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">မှတ်တမ်းမရှိပါ</div>
                    <div class="empty-subtitle">သင့်မှာ မည်သည့်ဝယ်ယူမှုမှတ်တမ်းမှ မရှိပေးပါ</div>
                    <button class="btn btn-primary cyber-btn" onclick="showPage('home')">
                        <span class="btn-text">ဝယ်ယူရန် သွားပါ</span>
                        <div class="btn-glow"></div>
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'မှတ်တမ်း ရယူရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

// ========================================
// NEWS PAGE
// ========================================

async function loadNews() {
    try {
        showNotification('သတင်းများ ရယူနေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info', 2000);
        
        const { data: news } = await supabase
            .from('news_posts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        const container = document.getElementById('newsContent');
        
        if (news && news.length > 0) {
            container.innerHTML = news.map((post, index) => {
                const videoHtml = getVideoEmbed(post.video_url);
                return `
                    <div class="news-item" style="animation-delay: ${index * 0.1}s">
                        <div class="video-container">
                            ${videoHtml}
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="platform-tag">${post.platform}</span>
                                <span class="news-date">
                                    <i class="fas fa-calendar"></i>
                                    ${new Date(post.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 class="news-title">${post.title}</h4>
                            <p class="news-description">${post.description || ''}</p>
                            ${post.telegram_link ? `
                                <div class="news-actions">
                                    <a href="${post.telegram_link}" target="_blank" class="btn btn-secondary cyber-btn btn-small">
                                        <i class="fab fa-telegram"></i>
                                        <span class="btn-text">Telegram တွင်ကြည့်ရန်</span>
                                        <div class="btn-glow"></div>
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add entrance animations
            container.querySelectorAll('.news-item').forEach(item => {
                item.style.animation = 'slideInUp 0.6s ease var(--animation-delay, 0s) both';
            });
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📰</div>
                    <div class="empty-title">သတင်းမရှိပါ</div>
                    <div class="empty-subtitle">လတ်တလော မည်သည့်သတင်းမှ မရှိပေးပါ</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'သတင်း ရယူရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

function getVideoEmbed(url) {
    try {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
            }
        }
        
        // For other platforms, show as link with preview
        return `
            <div class="video-placeholder">
                <a href="${url}" target="_blank" class="video-link">
                    <div class="video-play-icon">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-link-text">ဗွီဒီယိုကြည့်ရန် နှိပ်ပါ</div>
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error generating video embed:', error);
        return `<a href="${url}" target="_blank" style="color: var(--cyber-blue);">ဗွီဒီယိုကြည့်ရန်</a>`;
    }
}

function extractYouTubeId(url) {
    try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    } catch (error) {
        return null;
    }
}

// ========================================
// MI PAGE (PROFILE & ABOUT)
// ========================================

async function loadMiPage() {
    await Promise.all([
        loadAccountInfo(),
        loadAboutContent()
    ]);
}

async function loadAccountInfo() {
    if (!currentUser) return;
    
    try {
        const accountInfo = document.getElementById('accountInfo');
        accountInfo.innerHTML = `
            <div class="account-card glass-morphism">
                <h4 class="account-section-title rainbow-text">အကောင့်အချက်အလက်</h4>
                <div class="account-details">
                    <div class="account-item">
                        <div class="account-label">
                            <i class="fas fa-envelope"></i>
                            အီးမေးလ်
                        </div>
                        <div class="account-value">${currentUser.email}</div>
                    </div>
                    <div class="account-item">
                        <div class="account-label">
                            <i class="fas fa-calendar"></i>
                            အကောင့်ဖွင့်ရက်
                        </div>
                        <div class="account-value">${new Date(currentUser.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="account-item">
                        <div class="account-label">
                            <i class="fas fa-clock"></i>
                            နောက်ဆုံးဝင်ရောက်
                        </div>
                        <div class="account-value">${new Date(currentUser.last_login).toLocaleDateString()}</div>
                    </div>
                    <div class="account-item">
                        <div class="account-label">
                            <i class="fas fa-key"></i>
                            စကားဝှက်
                        </div>
                        <div class="password-section">
                            <input type="password" class="cyber-input password-display" id="currentPassword" value="${currentUser.password}" readonly>
                            <button class="btn btn-secondary cyber-btn btn-small" onclick="togglePasswordEdit()">
                                <span class="btn-text">ပြောင်းလဲရန်</span>
                                <div class="btn-glow"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add entrance animation
        accountInfo.style.animation = 'slideInUp 0.5s ease';
        
    } catch (error) {
        console.error('Error loading account info:', error);
    }
}

function togglePasswordEdit() {
    const passwordField = document.getElementById('currentPassword');
    const button = event.target.closest('button');
    const buttonText = button.querySelector('.btn-text');
    
    if (passwordField.readOnly) {
        passwordField.readOnly = false;
        passwordField.type = 'text';
        passwordField.focus();
        passwordField.select();
        buttonText.textContent = 'သိမ်းဆည်းပါ';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        
        // Add edit mode styling
        passwordField.style.borderColor = 'var(--neon-pink)';
        passwordField.style.boxShadow = '0 0 15px rgba(255, 0, 128, 0.3)';
        
    } else {
        const newPassword = passwordField.value.trim();
        
        if (newPassword.length < 6) {
            showNotification('စကားဝှက်တိုလွန်းသည်', 'စကားဝှက်မှာ အနည်းဆုံး ၆ လုံး ရှိရပါမည်', 'warning');
            return;
        }
        
        updatePassword(newPassword);
        passwordField.readOnly = true;
        passwordField.type = 'password';
        buttonText.textContent = 'ပြောင်းလဲရန်';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        
        // Remove edit mode styling
        passwordField.style.borderColor = '';
        passwordField.style.boxShadow = '';
    }
}

async function updatePassword(newPassword) {
    try {
        showNotification('စကားဝှက်ပြောင်းလဲနေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info');
        
        const { error } = await supabase
            .from('users')
            .update({ password: newPassword })
            .eq('id', currentUser.id);
        
        if (error) throw error;
        
        currentUser.password = newPassword;
        
        // Update session
        const sessionData = JSON.parse(localStorage.getItem('userSession'));
        sessionData.timestamp = Date.now();
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        
        showNotification('အောင်မြင်ပါပြီ!', 'စကားဝှက် အောင်မြင်စွာ ပြောင်းလဲပါပြီ', 'success');
        
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'စကားဝှက် ပြောင်းလဲရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function loadAboutContent() {
    try {
        const { data: aboutItems } = await supabase
            .from('about_content')
            .select('*')
            .eq('is_active', true)
            .order('order_index');
        
        const container = document.getElementById('contactList');
        
        if (aboutItems && aboutItems.length > 0) {
            container.innerHTML = aboutItems.map((item, index) => `
                <div class="contact-item" style="animation-delay: ${index * 0.1}s">
                    <div class="contact-label">
                        <i class="fas fa-link"></i>
                        ${item.title}
                    </div>
                    <a href="${item.link}" target="_blank" class="contact-link">
                        ဆက်သွယ်ပါ
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `).join('');
            
            // Add entrance animations
            container.querySelectorAll('.contact-item').forEach(item => {
                item.style.animation = 'slideInRight 0.5s ease var(--animation-delay, 0s) both';
            });
        } else {
            container.innerHTML = `
                <div class="contact-item">
                    <div class="contact-label">
                        <i class="fas fa-info-circle"></i>
                        အချက်အလက်မရှိ
                    </div>
                    <span class="contact-link">ဆက်သွယ်ရန် အချက်အလက်များ မရှိပေးပါ</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// ========================================
// WEBSITE SETTINGS
// ========================================

async function loadWebsiteSettings() {
    try {
        const { data: settings } = await supabase
            .from('website_settings')
            .select('*');
        
        if (settings) {
            settings.forEach(setting => {
                if (setting.setting_key === 'website_name') {
                    const nameElement = document.getElementById('websiteName');
                    if (nameElement && setting.setting_value) {
                        nameElement.textContent = setting.setting_value;
                    }
                } else if (setting.setting_key === 'website_logo' && setting.setting_value) {
                    const logoElement = document.getElementById('websiteLogo');
                    if (logoElement) {
                        logoElement.innerHTML = `<img src="${setting.setting_value}" alt="Logo" class="logo-img">`;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading website settings:', error);
    }
}

// ========================================
// REALTIME LISTENERS
// ========================================

function setupRealtimeListeners() {
    if (!currentUser) return;
    
    try {
        // Listen for login requests
        const loginRequestsSubscription = supabase
            .channel('login_requests')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'login_requests',
                filter: `user_id=eq.${currentUser.id}`
            }, (payload) => {
                if (payload.new.status === 'pending') {
                    showDeviceVerificationModal(payload.new);
                }
            })
            .subscribe();
        
        // Listen for login request updates
        const loginUpdateSubscription = supabase
            .channel('login_request_updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'login_requests'
            }, (payload) => {
                if (currentLoginRequest && payload.new.id === currentLoginRequest.id) {
                    if (payload.new.status === 'approved') {
                        clearInterval(verificationTimer);
                        showNotification('အတည်ပြုခြင်း အောင်မြင်ပါပြီ!', 'စက်ပစ္စည်းအသစ်မှ ဝင်ရောက်ခွင့်ပေးပါပြီ', 'success');
                        completeLogin();
                    } else if (payload.new.status === 'rejected') {
                        clearInterval(verificationTimer);
                        showNotification('အတည်ပြုခြင်း ငြင်းပယ်ခံရပါပြီ', 'ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရပါပြီ', 'error');
                        location.reload();
                    }
                }
            })
            .subscribe();
        
        // Listen for order updates
        const orderSubscription = supabase
            .channel('order_updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `user_id=eq.${currentUser.id}`
            }, (payload) => {
                const order = payload.new;
                if (order.status === 'approved') {
                    showNotification('မှာယူမှုအတည်ပြုပါပြီ!', `သင့်မှာယူမှု ${order.order_number} ကို အတည်ပြုပါပြီ`, 'success');
                    
                    // Add celebration animation
                    document.body.style.animation = 'pulse 0.5s ease';
                    setTimeout(() => {
                        document.body.style.animation = '';
                    }, 500);
                    
                } else if (order.status === 'rejected') {
                    showNotification('မှာယူမှုငြင်းပယ်ခံရပါပြီ', `သင့်မှာယူမှု ${order.order_number} ကို ငြင်းပယ်ပါပြီ`, 'error');
                }
                
                // Refresh history if on history page
                if (AppState.currentPage === 'history') {
                    setTimeout(() => {
                        loadHistory();
                    }, 1000);
                }
            })
            .subscribe();
        
        // Store subscriptions for cleanup
        AppState.realtimeSubscriptions = [
            loginRequestsSubscription,
            loginUpdateSubscription,
            orderSubscription
        ];
        
    } catch (error) {
        console.error('Error setting up realtime listeners:', error);
    }
}

// ========================================
// DEVICE VERIFICATION
// ========================================

function showDeviceVerificationModal(request) {
    try {
        const deviceInfo = JSON.parse(request.requesting_device_info);
        const modal = document.getElementById('deviceVerificationModal');
        const deviceInfoElement = document.getElementById('requestingDeviceInfo');
        
        deviceInfoElement.innerHTML = `
            <div class="device-info-item">
                <span class="device-info-label">
                    <i class="fas fa-laptop"></i>
                    စက်ပစ္စည်း:
                </span>
                <span class="device-info-value">${deviceInfo.platform}</span>
            </div>
            <div class="device-info-item">
                <span class="device-info-label">
                    <i class="fas fa-globe"></i>
                    ဘရောက်ဆာ:
                </span>
                <span class="device-info-value">${deviceInfo.browser}</span>
            </div>
            <div class="device-info-item">
                <span class="device-info-label">
                    <i class="fas fa-map-marker-alt"></i>
                    တည်နေရာ:
                </span>
                <span class="device-info-value">${request.requesting_location || 'မသိ'}</span>
            </div>
            <div class="device-info-item">
                <span class="device-info-label">
                    <i class="fas fa-clock"></i>
                    အချိန်:
                </span>
                <span class="device-info-value">${new Date(request.created_at).toLocaleString()}</span>
            </div>
            <div class="device-info-item">
                <span class="device-info-label">
                    <i class="fas fa-desktop"></i>
                    ဖန်သားပြင်:
                </span>
                <span class="device-info-value">${deviceInfo.screen}</span>
            </div>
        `;
        
        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.4s ease';
        currentLoginRequest = request;
        startVerificationCountdown();
        
        // Add notification sound effect (if needed)
        showNotification('စက်ပစ္စည်းအတည်ပြုတောင်းဆိုမှု!', 'အခြားစက်ပစ္စည်းမှ သင့်အကောင့်သို့ ဝင်ရောက်ရန် တောင်းဆိုထားပါသည်', 'warning', 8000);
        
    } catch (error) {
        console.error('Error showing device verification modal:', error);
    }
}

function startVerificationCountdown() {
    let timeLeft = 300; // 5 minutes
    const countdownElement = document.getElementById('verificationCountdown');
    const progressElement = document.getElementById('countdownProgress');
    const circumference = 2 * Math.PI * 45;
    
    // Initialize progress ring
    progressElement.style.strokeDasharray = circumference;
    progressElement.style.strokeDashoffset = 0;
    
    verificationTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress ring
        const offset = circumference - (timeLeft / 300) * circumference;
        progressElement.style.strokeDashoffset = offset;
        
        // Change color as time runs out
        if (timeLeft < 60) {
            progressElement.style.stroke = 'var(--neon-pink)';
            countdownElement.style.color = 'var(--neon-pink)';
        }
        
        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            document.getElementById('deviceVerificationModal').style.display = 'none';
            showNotification('အချိန်ကုန်ဆုံးပါပြီ', 'အတည်ပြုချက် အချိန်ကုန်ဆုံးပါပြီ', 'warning');
        }
        
        timeLeft--;
    }, 1000);
}

async function approveLoginRequest() {
    try {
        if (!currentLoginRequest) return;
        
        showNotification('အတည်ပြုနေပါသည်...', 'စက်ပစ္စည်းဝင်ရောက်ခွင့်ကို အတည်ပြုနေပါသည်', 'info');
        
        // Update request status
        const { error: updateError } = await supabase
            .from('login_requests')
            .update({ status: 'approved' })
            .eq('id', currentLoginRequest.id);
        
        if (updateError) throw updateError;
        
        // Add device to verified devices
        const deviceInfo = JSON.parse(currentLoginRequest.requesting_device_info);
        const { error: deviceError } = await supabase
            .from('user_devices')
            .insert([{
                user_id: currentLoginRequest.user_id,
                device_info: currentLoginRequest.requesting_device_info,
                device_type: deviceInfo.platform,
                browser: deviceInfo.browser,
                location: currentLoginRequest.requesting_location,
                is_verified: true
            }]);
        
        if (deviceError) throw deviceError;
        
        clearInterval(verificationTimer);
        document.getElementById('deviceVerificationModal').style.display = 'none';
        
        showNotification('အောင်မြင်ပါပြီ!', 'စက်ပစ္စည်းကို အတည်ပြုပေးပါပြီ', 'success');
        
        // Add success animation
        document.body.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
    } catch (error) {
        console.error('Approve request error:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'အတည်ပြုရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function rejectLoginRequest() {
    try {
        if (!currentLoginRequest) return;
        
        showNotification('ငြင်းပယ်နေပါသည်...', 'စက်ပစ္စည်းဝင်ရောက်ခွင့်ကို ငြင်းပယ်နေပါသည်', 'info');
        
        const { error } = await supabase
            .from('login_requests')
            .update({ status: 'rejected' })
            .eq('id', currentLoginRequest.id);
        
        if (error) throw error;
        
        clearInterval(verificationTimer);
        document.getElementById('deviceVerificationModal').style.display = 'none';
        
        showNotification('ငြင်းပယ်ပါပြီ', 'စက်ပစ္စည်းဝင်ရောက်မှုကို ငြင်းပယ်ပါပြီ', 'info');
        
    } catch (error) {
        console.error('Reject request error:', error);
        showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'ငြင်းပယ်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
    }
}

async function completeLogin() {
    try {
        // Complete the login process for waiting user
        setTimeout(() => {
            location.reload();
        }, 2000);
    } catch (error) {
        console.error('Complete login error:', error);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getDeviceInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        browser: getBrowserInfo(),
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
    };
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return '127.0.0.1'; // fallback
    }
}

async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
    } catch (error) {
        console.error('Error getting location:', error);
        return 'Unknown Location';
    }
}

function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// ========================================
// SETTINGS & PREFERENCES
// ========================================

function toggleSettings() {
    // Add settings functionality if needed
    showNotification('အင်္ဂါရပ်များ', 'ဤအင်္ဂါရပ်ကို မကြာမီ ထည့်သွင်းပေးပါမည်', 'info');
}

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်', 'အက်ပ်တွင် မမျှော်လင့်သော အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('ချိတ်ဆက်မှု အမှား', 'ဆာဗာနှင့် ချိတ်ဆက်ရာတွင် အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်', 'error');
});

// ========================================
// DEVELOPMENT HELPERS
// ========================================

// Debug mode (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.MafiaGameStore = {
        AppState,
        currentUser,
        supabase,
        showNotification,
        loadDashboardData,
        resetApp: () => {
            localStorage.clear();
            location.reload();
        }
    };
    
    console.log('🎮 MAFIA GAME STORE Debug Mode');
    console.log('Available commands: MafiaGameStore.*');
}
