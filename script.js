// ===== TELEGRAM WEB APP INITIALIZATION =====
let tg = window.Telegram.WebApp;
try {
    tg.expand();
} catch (e) {
    console.log('Telegram WebApp not available');
}

// ===== HAPTIC FEEDBACK WRAPPER =====
function hapticFeedback(type) {
    if (tg && tg.HapticFeedback) {
        try {
            switch(type) {
                case 'success':
                    tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'error':
                    tg.HapticFeedback.notificationOccurred('error');
                    break;
                case 'warning':
                    tg.HapticFeedback.notificationOccurred('warning');
                    break;
                case 'light':
                    tg.HapticFeedback.impactOccurred('light');
                    break;
                case 'medium':
                    tg.HapticFeedback.impactOccurred('medium');
                    break;
                case 'heavy':
                    tg.HapticFeedback.impactOccurred('heavy');
                    break;
            }
        } catch (e) {
            console.log('Haptic feedback not available');
        }
    }
}

// ===== ACCESS CODES =====
const ACCESS_CODES = {
    'CLIENT1': { role: 'client', username: '@initie' },
    'LIVREUR75001': { role: 'driver', username: '@livreur' },
    'RAVITAILLEUR666': { role: 'supplier', username: '@ravitailleur' },
    'adminfafa666': { role: 'admin', username: '@admin' }
};

// ===== MENU ITEMS =====
const MENU_ITEMS = {
    'ice': { name: 'Ice', price: 70, medal: 'I', emoji: '✦' },
    'flash': { name: 'Flash', price: 10, medal: 'II', emoji: '⚡' },
    'clover': { name: 'Clover', price: 50, medal: 'III', emoji: '☘' }
};

// ===== APP STATE =====
let currentRole = null;
let cart = {};
let userStats = {
    orders: 0,
    loyalty: '☆☆☆☆☆',
    referrals: 0
};

// ===== NAVIGATION =====
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ===== AUTHENTICATION =====
function authenticate() {
    const codeInput = document.getElementById('auth-code');
    const code = codeInput.value.trim().toUpperCase();
    const errorDisplay = document.getElementById('auth-error');
    
    if (ACCESS_CODES[code]) {
        currentRole = ACCESS_CODES[code].role;
        errorDisplay.textContent = '';
        
        // Generate random personal code
        const personalCode = generatePersonalCode(code);
        document.getElementById('personal-code').textContent = personalCode;
        
        // Update username
        document.getElementById('profile-username').textContent = ACCESS_CODES[code].username;
        
        // Navigate to appropriate welcome section
        switch(currentRole) {
            case 'client':
                showSection('client-welcome-section');
                break;
            case 'driver':
                showSection('driver-welcome-section');
                break;
            case 'supplier':
                showSection('supplier-welcome-section');
                break;
            case 'admin':
                showSection('admin-welcome-section');
                break;
        }
        
        // Clear input
        codeInput.value = '';
        
        // Haptic feedback
        hapticFeedback('success');
    } else {
        errorDisplay.textContent = 'Sceau invalide. Réessaie.';
        codeInput.value = '';
        
        // Haptic feedback
        hapticFeedback('error');
    }
}

function generatePersonalCode(baseCode) {
    const prefixes = {
        'CLIENT1': 'CLI',
        'LIVREUR75001': 'LIV',
        'RAVITAILLEUR666': 'RAV',
        'adminfafa666': 'ADM'
    };
    
    const prefix = prefixes[baseCode] || 'UNK';
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `${prefix}-${randomPart}-${randomPart2}`;
}

function logout() {
    currentRole = null;
    cart = {};
    showSection('auth-section');
    
    // Reset cart display
    updateCartDisplay();
    
    // Haptic feedback
    hapticFeedback('warning');
}

// ===== MENU FUNCTIONALITY =====
function updateQty(item, change) {
    if (!cart[item]) {
        cart[item] = 0;
    }
    
    cart[item] += change;
    
    if (cart[item] < 0) {
        cart[item] = 0;
    }
    
    // Update display
    const qtyElement = document.getElementById(`qty-${item}`);
    if (qtyElement) {
        qtyElement.textContent = cart[item];
    }
    
    // Update cart display
    updateCartDisplay();
    
    // Haptic feedback
    hapticFeedback('light');
}

function updateCartDisplay() {
    const cartItemsElement = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    let total = 0;
    let cartHTML = '';
    let hasItems = false;
    
    for (const [item, qty] of Object.entries(cart)) {
        if (qty > 0) {
            hasItems = true;
            const itemInfo = MENU_ITEMS[item];
            const itemTotal = itemInfo.price * qty;
            total += itemTotal;
            
            cartHTML += `
                <div class="cart-item">
                    <span>${itemInfo.medal} ${itemInfo.name} x${qty}</span>
                    <span>${itemTotal}€</span>
                </div>
            `;
        }
    }
    
    if (!hasItems) {
        cartHTML = '<p class="empty-cart">Panier vide</p>';
    }
    
    cartItemsElement.innerHTML = cartHTML;
    totalPriceElement.textContent = `${total}€`;
}

function proceedToOrder() {
    // Check if cart has items
    let hasItems = false;
    for (const qty of Object.values(cart)) {
        if (qty > 0) {
            hasItems = true;
            break;
        }
    }
    
    if (!hasItems) {
        alert('Ton panier est vide. Sélectionne des articles avant de valider.');
        return;
    }
    
    // Update order summary
    const orderSummaryElement = document.getElementById('order-items-summary');
    let summaryHTML = '';
    let total = 0;
    
    for (const [item, qty] of Object.entries(cart)) {
        if (qty > 0) {
            const itemInfo = MENU_ITEMS[item];
            const itemTotal = itemInfo.price * qty;
            total += itemTotal;
            
            summaryHTML += `
                <div class="cart-item">
                    <span>${itemInfo.medal} ${itemInfo.name} x${qty}</span>
                    <span>${itemTotal}€</span>
                </div>
            `;
        }
    }
    
    orderSummaryElement.innerHTML = summaryHTML;
    document.getElementById('order-total').textContent = `${total}€`;
    
    showSection('client-order-section');
}

function submitOrder() {
    const address = document.getElementById('address').value.trim();
    const digicode = document.getElementById('digicode').value.trim();
    
    if (!address) {
        alert('Entre ton adresse complète.');
        return;
    }
    
    if (!digicode) {
        alert('Entre le digicode de l\'immeuble.');
        return;
    }
    
    // Update user stats
    userStats.orders++;
    document.getElementById('order-count').textContent = userStats.orders;
    
    // Show loading
    showSection('loading-section');
    
    // Simulate loading steps
    simulateLoading();
}

function simulateLoading() {
    const steps = ['step1', 'step2', 'step3'];
    let currentStep = 0;
    
    function activateNextStep() {
        if (currentStep < steps.length) {
            const stepElement = document.getElementById(steps[currentStep]);
            stepElement.classList.add('active');
            currentStep++;
            
            setTimeout(activateNextStep, 1500);
        } else {
            // Show success after loading
            setTimeout(() => {
                showSection('success-section');
            }, 1000);
        }
    }
    
    activateNextStep();
}

function resetApp() {
    // Clear cart
    cart = {};
    
    // Reset quantities
    for (const item of Object.keys(MENU_ITEMS)) {
        const qtyElement = document.getElementById(`qty-${item}`);
        if (qtyElement) {
            qtyElement.textContent = '0';
        }
    }
    
    // Clear form
    document.getElementById('address').value = '';
    document.getElementById('digicode').value = '';
    document.getElementById('interphone').value = '';
    
    // Reset loading steps
    document.querySelectorAll('.loading-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Update cart display
    updateCartDisplay();
    
    // Return to menu
    showSection('client-menu-section');
}

// ===== DRIVER FUNCTIONALITY =====
let driverOnline = true;

function toggleDriverStatus() {
    driverOnline = !driverOnline;
    
    const statusElement = document.getElementById('driver-status');
    const statusBtn = document.getElementById('status-btn');
    
    if (driverOnline) {
        statusElement.textContent = '🟢 En ligne';
        statusBtn.textContent = 'Se mettre hors ligne';
    } else {
        statusElement.textContent = '🔴 Hors ligne';
        statusBtn.textContent = 'Se mettre en ligne';
    }
    
    // Haptic feedback
    hapticFeedback('medium');
}

function requestRecharge() {
    alert('Demande de recharge envoyée à la Forteresse. Un ravitailleur te contactera bientôt.');
    
    // Haptic feedback
    hapticFeedback('success');
}

// ===== SUPPLIER FUNCTIONALITY =====
// Placeholder for supplier-specific functions

// ===== ADMIN FUNCTIONALITY =====
// Placeholder for admin-specific functions

// ===== CLIENT PROFILE FUNCTIONALITY =====
function showReferral() {
    alert('Ton code de parrainage : ' + document.getElementById('personal-code').textContent + '\nPartage-le avec de nouveaux initiés.');
}

function showSupport() {
    alert('Un message sera envoyé à la Forteresse. Les gardiens te répondront bientôt.');
}

// ===== KEYBOARD SUPPORT =====
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id === 'auth-section') {
            authenticate();
        }
    }
});

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    try {
        if (tg) {
            tg.ready();
            tg.expand();
        }
    } catch (e) {
        console.log('Telegram WebApp initialization failed');
    }
    
    // Set initial theme
    document.body.style.backgroundColor = 'var(--deep-black)';
});