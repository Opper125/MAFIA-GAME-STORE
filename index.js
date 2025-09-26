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
    if (particles && typeof particlesJS !== 'undefined') {
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
        
        showNotification('အောင်မြင်သည်!', 'အကောင့်ဖန်တီးပြီးပါပြီ', 'success');
        
    } catch (error) {
        console.error('Account creation error:', error);
        showNotification('အမှားအယွင်း', 'အကောင့်ဖန်တီးရာတွင် အမှားတစ်ခုဖြစ်ပွားပါသည်', 'error');
    }
}

async function login() {
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showNotification('အချက်အလက်များ ပြည့်စုံမှု', 'အီးမေးလ်နှင့် စကားဝှက် ထည့်ပါ', 'warning');
            return;
        }
        
        showNotification('ဝင်ရောက်နေသည်...', 'ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ', 'info');
        
        // Find user by email and password
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();
        
        if (error || !user) {
            showNotification('ဝင်ရောက်မှု မအောင်မြင်', 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်', 'error');
            return;
        }
        
        // Update last login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        
        // Set current user
        currentUser = user;
        AppState.isLoggedIn = true;
        
        // Save session
        saveUserSession(user, AppState.deviceInfo);
        
        // Show dashboard with animation
        await showDashboardWithAnimation();
        
        // Load account info
        await loadAccountInfo();
        
        showNotification('ကြိုဆိုပါသည်!', 'အောင်မြင်စွာ ဝင်ရောက်ပါပြီ', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('အမှားအယွင်း', 'ဝင်ရောက်ရာတွင် အမှားတစ်ခုဖြစ်ပွားပါသည်', 'error');
    }
}

async function logout() {
    try {
        // Clear session
        clearUserSession();
        
        // Reset state
        currentUser = null;
        AppState.isLoggedIn = false;
        AppState.currentPage = 'home';
        
        // Show auth section
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('logoutBtn').style.display = 'none';
        
        showNotification('ထွက်ခြင်း', 'အကောင့်မှ အောင်မြင်စွာ ထွက်ပါပြီ', 'info');
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('အမှားအယွင်း', 'ထွက်ရောက်ရာတွင် အမှားတစ်ခုဖြစ်ပွားပါသည်', 'error');
    }
}

// ========================================
// PAGE NAVIGATION SYSTEM (FIXED)
// ========================================

function showPage(pageId) {
    // Update current page state
    AppState.currentPage = pageId;
    
    // Hide all page contents first
    const pageContents = document.querySelectorAll('.page-content');
    pageContents.forEach(page => {
        page.classList.remove('active');
    });
    
    // Hide all product pages
    const productPages = document.querySelectorAll('.product-page');
    productPages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show the selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        }
    });
    
    // Load page-specific content
    switch(pageId) {
        case 'home':
            loadHomeContent();
            break;
        case 'history':
            loadHistoryContent();
            break;
        case 'news':
            loadNewsContent();
            break;
        case 'mi':
            loadProfileContent();
            break;
    }
    
    console.log('Page switched to:', pageId);
}

function showProductPage(gameType) {
    // Hide main dashboard pages
    const pageContents = document.querySelectorAll('.page-content');
    pageContents.forEach(page => {
        page.classList.remove('active');
    });
    
    // Hide all product pages first
    const productPages = document.querySelectorAll('.product-page');
    productPages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show specific product page
    let targetPageId = '';
    if (gameType === 'pubg' || gameType === 'pubg_uc') {
        targetPageId = 'pubgUcPage';
        loadPubgProducts();
    } else if (gameType === 'ml' || gameType === 'mobile_legends') {
        targetPageId = 'mlPage';
        loadMlProducts();
    }
    
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
    }
    
    console.log('Product page shown:', targetPageId);
}

function goBack() {
    // Hide all product pages
    const productPages = document.querySelectorAll('.product-page');
    productPages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show home page
    showPage('home');
}

function showLogin() {
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
}

function showSignup() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'block';
}

async function showDashboardWithAnimation() {
    // Hide auth section
    document.getElementById('authSection').style.display = 'none';
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'flex';
    dashboard.classList.add('active');
    
    // Show logout button
    document.getElementById('logoutBtn').style.display = 'flex';
    
    // Load initial content
    showPage('home');
    
    // Animation delay
    await new Promise(resolve => setTimeout(resolve, 300));
}

// ========================================
// CONTENT LOADING FUNCTIONS
// ========================================

async function loadHomeContent() {
    try {
        // Load PUBG games
        await loadPubgGames();
        
        // Load ML games
        await loadMlGames();
        
    } catch (error) {
        console.error('Error loading home content:', error);
    }
}

async function loadPubgGames() {
    const container = document.getElementById('pubgGames');
    if (!container) return;
    
    try {
        // Get PUBG products from database
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'uc')
            .eq('is_active', true)
            .order('order_index');
        
        if (error) throw error;
        
        // Create game cards
        const gameCards = [
            { title: 'UC မဝယ်ရန်', type: 'pubg_uc', icon: '💎' },
            { title: 'Account မဝယ်ရန်', type: 'pubg_account', icon: '🎮' }
        ];
        
        container.innerHTML = gameCards.map(game => `
            <div class="game-card cyber-card" onclick="showProductPage('${game.type}')">
                <div class="card-glow"></div>
                <div class="game-icon holographic">${game.icon}</div>
                <div class="game-title">${game.title}</div>
                <div class="card-shine"></div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading PUBG games:', error);
        container.innerHTML = '<p class="error-message">လုပ်ဆောင်မှုများ အချိန်မှာ ရရှိရန် မအောင်မြင်ပါ</p>';
    }
}

async function loadMlGames() {
    const container = document.getElementById('mlGames');
    if (!container) return;
    
    try {
        // Get ML products from database
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'diamond')
            .eq('is_active', true)
            .order('order_index');
        
        if (error) throw error;
        
        // Create game cards
        const gameCards = [
            { title: 'Diamond မဝယ်ရန်', type: 'ml', icon: '💎' },
            { title: 'Account မဝယ်ရန်', type: 'ml_account', icon: '🎮' }
        ];
        
        container.innerHTML = gameCards.map(game => `
            <div class="game-card cyber-card" onclick="showProductPage('${game.type}')">
                <div class="card-glow"></div>
                <div class="game-icon holographic">${game.icon}</div>
                <div class="game-title">${game.title}</div>
                <div class="card-shine"></div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading ML games:', error);
        container.innerHTML = '<p class="error-message">လုပ်ဆောင်မှုများ အချိန်မှာ ရရှိရန် မအောင်မြင်ပါ</p>';
    }
}

async function loadPubgProducts() {
    const container = document.getElementById('pubgProducts');
    if (!container) return;
    
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'uc')
            .eq('is_active', true)
            .order('amount');
        
        if (error) throw error;
        
        if (products && products.length > 0) {
            container.innerHTML = products.map(product => `
                <div class="product-card cyber-card" onclick="selectProduct('${product.id}')">
                    <div class="card-glow"></div>
                    <div class="product-amount">${product.amount} UC</div>
                    <div class="product-price">${product.price} ${product.currency}</div>
                    <div class="card-shine"></div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-products">လတ်တလောတွင် ထုတ်ကုန်များ မရှိပါ</p>';
        }
        
    } catch (error) {
        console.error('Error loading PUBG products:', error);
        container.innerHTML = '<p class="error-message">ထုတ်ကုန်များ လုပ်ဆောင်ရာတွင် အမှားဖြစ်ပါသည်</p>';
    }
}

async function loadMlProducts() {
    const container = document.getElementById('mlProducts');
    if (!container) return;
    
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('product_type', 'diamond')
            .eq('is_active', true)
            .order('amount');
        
        if (error) throw error;
        
        if (products && products.length > 0) {
            container.innerHTML = products.map(product => `
                <div class="product-card cyber-card" onclick="selectProduct('${product.id}')">
                    <div class="card-glow"></div>
                    <div class="product-amount">${product.amount} Diamond</div>
                    <div class="product-price">${product.price} ${product.currency}</div>
                    <div class="card-shine"></div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-products">လတ်တလောတွင် ထုတ်ကုန်များ မရှိပါ</p>';
        }
        
    } catch (error) {
        console.error('Error loading ML products:', error);
        container.innerHTML = '<p class="error-message">ထုတ်ကုန်များ လုပ်ဆောင်ရာတွင် အမှားဖြစ်ပါသည်</p>';
    }
}

async function loadHistoryContent() {
    const container = document.getElementById('historyContent');
    if (!container || !currentUser) return;
    
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                products (name, product_type, amount),
                payment_methods (name)
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (orders && orders.length > 0) {
            container.innerHTML = orders.map(order => `
                <div class="history-item">
                    <div class="order-header">
                        <span class="order-number">#${order.order_number}</span>
                        <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>ထုတ်ကုန်:</strong> ${order.products?.name || 'N/A'}</p>
                        <p><strong>ပမာဏ:</strong> ${order.amount || 'N/A'}</p>
                        <p><strong>စျေးနှုန်း:</strong> ${order.total_price} ${order.currency}</p>
                        <p><strong>နေ့စွဲ:</strong> ${formatDate(order.created_at)}</p>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-history">သင့်တွင် ဝယ်ယူမှုမှတ်တမ်း မရှိသေးပါ</p>';
        }
        
    } catch (error) {
        console.error('Error loading history:', error);
        container.innerHTML = '<p class="error-message">မှတ်တမ်းများ လုပ်ဆောင်ရာတွင် အမှားဖြစ်ပါသည်</p>';
    }
}

async function loadNewsContent() {
    const container = document.getElementById('newsContent');
    if (!container) return;
    
    try {
        const { data: news, error } = await supabase
            .from('news_posts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        if (news && news.length > 0) {
            container.innerHTML = news.map(item => `
                <div class="news-item">
                    <div class="news-header">
                        <span class="news-platform platform-${item.platform}">${item.platform.toUpperCase()}</span>
                        <span class="news-date">${formatDate(item.created_at)}</span>
                    </div>
                    <h4 class="news-title">${item.title}</h4>
                    <p class="news-description">${item.description || ''}</p>
                    <div class="news-actions">
                        <a href="${item.video_url}" target="_blank" class="btn btn-primary btn-small">ကြည့်ရန်</a>
                        ${item.telegram_link ? `<a href="${item.telegram_link}" target="_blank" class="btn btn-secondary btn-small">Telegram</a>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-news">လတ်တလောတွင် သတင်းများ မရှိပါ</p>';
        }
        
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<p class="error-message">သတင်းများ လုပ်ဆောင်ရာတွင် အမှားဖြစ်ပါသည်</p>';
    }
}

async function loadProfileContent() {
    const accountInfo = document.getElementById('accountInfo');
    const contactList = document.getElementById('contactList');
    
    if (accountInfo && currentUser) {
        accountInfo.innerHTML = `
            <div class="info-item">
                <span class="info-label">အီးမေးလ်:</span>
                <span class="info-value">${currentUser.email}</span>
            </div>
            <div class="info-item">
                <span class="info-label">အကောင့်ဖန်တီးသည်:</span>
                <span class="info-value">${formatDate(currentUser.created_at)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">နောက်ဆုံးဝင်ရောက်သည်:</span>
                <span class="info-value">${formatDate(currentUser.last_login)}</span>
            </div>
        `;
    }
    
    if (contactList) {
        try {
            const { data: contacts, error } = await supabase
                .from('about_content')
                .select('*')
                .eq('is_active', true)
                .order('order_index');
            
            if (error) throw error;
            
            if (contacts && contacts.length > 0) {
                contactList.innerHTML = contacts.map(contact => `
                    <div class="contact-card cyber-card">
                        <div class="card-glow"></div>
                        <div class="contact-icon">${contact.icon_url || '📞'}</div>
                        <div class="contact-title">${contact.title}</div>
                        <a href="${contact.link}" target="_blank" class="contact-link">ဆက်သွယ်ရန်</a>
                        <div class="card-shine"></div>
                    </div>
                `).join('');
            } else {
                contactList.innerHTML = '<p class="no-contacts">ဆက်သွယ်ရေးအချက်အလက်များ မရှိပါ</p>';
            }
            
        } catch (error) {
            console.error('Error loading contacts:', error);
            contactList.innerHTML = '<p class="error-message">ဆက်သွယ်ရေးအချက်အလက်များ လုပ်ဆောင်ရာတွင် အမှားဖြစ်ပါသည်</p>';
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generateRandomPassword() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getDeviceInfo() {
    return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        browser: getBrowser(),
        screenWidth: screen.width,
        screenHeight: screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

function getBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return '127.0.0.1';
    }
}

async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return `${data.city}, ${data.country_name}`;
    } catch (error) {
        console.error('Error getting location:', error);
        return 'Unknown';
    }
}

function saveUserSession(user, deviceInfo) {
    const sessionData = {
        user: user,
        deviceInfo: deviceInfo,
        timestamp: Date.now()
    };
    localStorage.setItem('mafia_game_session', JSON.stringify(sessionData));
}

function clearUserSession() {
    localStorage.removeItem('mafia_game_session');
}

async function checkExistingSession() {
    try {
        const sessionData = localStorage.getItem('mafia_game_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            
            // Check if session is not expired (24 hours)
            if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
                currentUser = session.user;
                AppState.isLoggedIn = true;
                AppState.deviceInfo = session.deviceInfo;
                
                await showDashboardWithAnimation();
                await loadAccountInfo();
                
                return true;
            } else {
                clearUserSession();
            }
        }
        return false;
    } catch (error) {
        console.error('Session check error:', error);
        clearUserSession();
        return false;
    }
}

async function loadWebsiteSettings() {
    try {
        const { data: settings, error } = await supabase
            .from('website_settings')
            .select('*');
        
        if (error) throw error;
        
        // Apply settings to website
        if (settings) {
            settings.forEach(setting => {
                switch(setting.setting_key) {
                    case 'website_name':
                        const nameEl = document.getElementById('websiteName');
                        if (nameEl) nameEl.textContent = setting.setting_value;
                        break;
                    case 'logo_url':
                        const logoEl = document.querySelector('.logo-img');
                        if (logoEl) logoEl.src = setting.setting_value;
                        break;
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading website settings:', error);
    }
}

async function loadAccountInfo() {
    if (!currentUser) return;
    
    // Update profile info if elements exist
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        profileImage.textContent = currentUser.email.charAt(0).toUpperCase();
    }
}

function setupRealtimeListeners() {
    if (!supabase) return;
    
    try {
        // Listen for order updates
        const orderSubscription = supabase
            .channel('orders')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'orders' }, 
                (payload) => {
                    console.log('Order update received:', payload);
                    if (AppState.currentPage === 'history') {
                        loadHistoryContent();
                    }
                    
                    if (payload.eventType === 'UPDATE' && payload.new.user_id === currentUser?.id) {
                        showNotification(
                            'အော်ဒါအပ်ဒိတ်', 
                            `သင့်အော်ဒါ #${payload.new.order_number} ရဲ့ အခြေအနေ ${getStatusText(payload.new.status)} သို့ ပြောင်းလဲပါပြီ`, 
                            'info'
                        );
                    }
                }
            )
            .subscribe();
            
        AppState.realtimeSubscriptions.push(orderSubscription);
        
    } catch (error) {
        console.error('Error setting up realtime listeners:', error);
    }
}

// ========================================
// GAME ID VERIFICATION
// ========================================

async function verifyGameId(gameType) {
    try {
        let userId, serverId;
        
        if (gameType === 'pubg') {
            userId = document.getElementById('pubgUserId').value;
            if (!userId) {
                showNotification('User ID လိုအပ်သည်', 'PUBG User ID ထည့်ပါ', 'warning');
                return;
            }
        } else if (gameType === 'ml') {
            userId = document.getElementById('mlUserId').value;
            serverId = document.getElementById('mlServerId').value;
            if (!userId || !serverId) {
                showNotification('အချက်အလက်များ လိုအပ်သည်', 'User ID နှင့် Server ID နှစ်ခုလုံး ထည့်ပါ', 'warning');
                return;
            }
        }
        
        showNotification('စစ်ဆေးနေသည်...', 'Game ID ကို စစ်ဆေးနေပါသည်', 'info');
        
        // Simulate verification (you can implement real verification here)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, assume verification is successful
        const isValid = Math.random() > 0.2; // 80% success rate
        
        if (isValid) {
            showNotification('အတည်ပြုပြီး!', 'Game ID မှန်ကန်ပါသည်', 'success');
            
            // Store verified game ID
            if (gameType === 'pubg') {
                sessionStorage.setItem('verified_pubg_id', userId);
            } else if (gameType === 'ml') {
                sessionStorage.setItem('verified_ml_id', userId);
                sessionStorage.setItem('verified_ml_server', serverId);
            }
            
        } else {
            showNotification('မမှန်ကန်သော ID', 'Game ID ကို မတွေ့ရှိပါ။ ပြန်စစ်ဆေးပါ', 'error');
        }
        
    } catch (error) {
        console.error('Game ID verification error:', error);
        showNotification('စစ်ဆေးမှု အမှား', 'Game ID စစ်ဆေးရာတွင် အမှားဖြစ်ပါသည်', 'error');
    }
}

// ========================================
// PRODUCT SELECTION
// ========================================

function selectProduct(productId) {
    selectedProduct = productId;
    console.log('Product selected:', productId);
    showNotification('ထုတ်ကုန်ရွေးချယ်ပြီး', 'ငွေပေးချေရန် နောက်ဆက်တွဲလုပ်ငန်းများ လုပ်ဆောင်ရန်', 'success');
    
    // Here you could show payment options or redirect to payment
    // For now, just show a message
}

function showAllProducts() {
    console.log('Show all products clicked');
    showNotification('လုပ်ဆောင်မှု', 'အားလုံးထုတ်ကုန်များ စာမျက်နှာသို့ သွားမည်', 'info');
    // You can implement showing all products page here
}

// ========================================
// SETTINGS FUNCTIONS
// ========================================

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        if (modal.style.display === 'none' || !modal.style.display) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
}

function toggleParticles() {
    const particleToggle = document.getElementById('particleToggle');
    const particlesContainer = document.getElementById('particles-js');
    
    if (particleToggle && particlesContainer) {
        if (particleToggle.checked) {
            particlesContainer.style.opacity = '0.3';
            initializeParticles();
        } else {
            particlesContainer.style.opacity = '0';
        }
    }
}

function toggleSound() {
    const soundToggle = document.getElementById('soundToggle');
    console.log('Sound toggle:', soundToggle?.checked);
    // Implement sound toggle functionality
}

function toggleNotifications() {
    const notificationToggle = document.getElementById('notificationToggle');
    console.log('Notification toggle:', notificationToggle?.checked);
    // Implement notification toggle functionality
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function addInputGlow(input) {
    input.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
}

function removeInputGlow(input) {
    input.style.boxShadow = '';
}

function validateInput(input) {
    // Basic validation
    if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(input.value)) {
            input.style.borderColor = '#00ff88';
        } else {
            input.style.borderColor = '#ff0080';
        }
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling.nextElementSibling; // Skip the label
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
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'စောင့်ဆိုင်းနေ',
        'approved': 'အတည်ပြုပြီး',
        'rejected': 'ငြင်းပယ်ပြီး',
        'processing': 'လုပ်ဆောင်နေ',
        'completed': 'ပြီးစီးပြီး'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('my-MM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
