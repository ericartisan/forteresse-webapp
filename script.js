// ===== TELEGRAM WEB APP INITIALIZATION =====
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Enable haptic feedback
function hapticFeedback(type = 'light') {
    if (tg.HapticFeedback) {
        if (type === 'light') {
            tg.HapticFeedback.impactOccurred('light');
        } else if (type === 'medium') {
            tg.HapticFeedback.impactOccurred('medium');
        } else if (type === 'heavy') {
            tg.HapticFeedback.impactOccurred('heavy');
        } else if (type === 'success') {
            tg.HapticFeedback.notificationOccurred('success');
        } else if (type === 'error') {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }
}

// ===== MENU ITEMS CONFIGURATION =====
const MENU_ITEMS = {
    ice: { name: 'Ice', price: 70, emoji: '❄️' },
    flash: { name: 'Flash', price: 10, emoji: '⚡' },
    clover: { name: 'Clover', price: 50, emoji: '☘️' }
};

// ===== CART STATE =====
let cart = {
    ice: 0,
    flash: 0,
    clover: 0
};

// ===== USER DATA =====
let userData = {
    username: tg.initDataUnsafe?.user?.username || 'Initié',
    orderCount: 0,
    loyaltyStars: 0,
    refCount: 0,
    personalCode: 'CLI-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
};

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
    hapticFeedback('light');
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ===== CART MANAGEMENT =====
function updateQty(item, change) {
    hapticFeedback('light');
    
    cart[item] = Math.max(0, cart[item] + change);
    
    // Update display
    document.getElementById(`qty-${item}`).textContent = cart[item];
    
    // Update cart summary
    updateCartSummary();
}

function updateCartSummary() {
    const total = calculateTotal();
    document.getElementById('total-price').textContent = `${total}€`;
    
    const cartItemsDiv = document.getElementById('cart-items');
    const hasItems = Object.values(cart).some(qty => qty > 0);
    
    if (!hasItems) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Panier vide</p>';
        return;
    }
    
    let html = '';
    for (const [item, qty] of Object.entries(cart)) {
        if (qty > 0) {
            const itemTotal = qty * MENU_ITEMS[item].price;
            html += `
                <div class="cart-item">
                    <span>${qty} × ${MENU_ITEMS[item].emoji} ${MENU_ITEMS[item].name}</span>
                    <span>${itemTotal}€</span>
                </div>
            `;
        }
    }
    cartItemsDiv.innerHTML = html;
}

function calculateTotal() {
    let total = 0;
    for (const [item, qty] of Object.entries(cart)) {
        total += qty * MENU_ITEMS[item].price;
    }
    return total;
}

// ===== ORDER FLOW =====
function proceedToOrder() {
    const total = calculateTotal();
    
    if (total === 0) {
        tg.showAlert('Panier vide ! Ajoute des articles avant de valider.');
        hapticFeedback('error');
        return;
    }
    
    hapticFeedback('medium');
    
    // Update order summary
    const orderSummaryDiv = document.getElementById('order-items-summary');
    let html = '';
    for (const [item, qty] of Object.entries(cart)) {
        if (qty > 0) {
            html += `<p>${qty} × ${MENU_ITEMS[item].emoji} ${MENU_ITEMS[item].name} — ${qty * MENU_ITEMS[item].price}€</p>`;
        }
    }
    orderSummaryDiv.innerHTML = html;
    document.getElementById('order-total').textContent = `${total}€`;
    
    showSection('order-section');
}

function submitOrder() {
    const address = document.getElementById('address').value.trim();
    const digicode = document.getElementById('digicode').value.trim();
    const interphone = document.getElementById('interphone').value.trim();
    
    if (!address) {
        tg.showAlert('Adresse requise !');
        hapticFeedback('error');
        return;
    }
    
    if (!digicode) {
        tg.showAlert('Digicode requis !');
        hapticFeedback('error');
        return;
    }
    
    hapticFeedback('heavy');
    
    // Prepare order data
    const orderData = {
        cart: cart,
        address: address,
        digicode: digicode,
        interphone: interphone,
        total: calculateTotal(),
        timestamp: new Date().toISOString()
    };
    
    // Send data to bot
    if (tg.sendData) {
        tg.sendData(JSON.stringify(orderData));
    } else {
        // Fallback for testing
        console.log('Order data:', orderData);
        simulateOrderProcess();
    }
}

function simulateOrderProcess() {
    showSection('loading-section');
    
    // Animate loading steps
    const steps = document.querySelectorAll('.loading-step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove('active');
        }
        
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                showSection('success-section');
                hapticFeedback('success');
                
                // Update user stats
                userData.orderCount++;
                userData.loyaltyStars = Math.min(5, Math.floor(userData.orderCount / 5));
                updateProfileDisplay();
            }, 500);
        }
    }, 1500);
}

// ===== PROFILE MANAGEMENT =====
function updateProfileDisplay() {
    document.getElementById('profile-username').textContent = `@${userData.username}`;
    document.getElementById('order-count').textContent = userData.orderCount;
    document.getElementById('loyalty-stars').textContent = '⭐'.repeat(userData.loyaltyStars) + '☆'.repeat(5 - userData.loyaltyStars);
    document.getElementById('ref-count').textContent = userData.refCount;
    document.getElementById('personal-code').textContent = userData.personalCode;
}

function showReferral() {
    hapticFeedback('light');
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    tg.showAlert(`Code de parrainage : ${referralCode}\n\nEnvoie ce code à la personne que tu souhaites parrainer. Elle devra l'entrer au /start.`);
}

function showSupport() {
    hapticFeedback('light');
    tg.showAlert('Pour contacter la Forteresse, utilise le bouton "Contacter la Forteresse" dans le bot Telegram principal.');
}

// ===== APP RESET =====
function resetApp() {
    hapticFeedback('medium');
    
    // Reset cart
    cart = { ice: 0, flash: 0, clover: 0 };
    
    // Reset displays
    for (const item of Object.keys(cart)) {
        document.getElementById(`qty-${item}`).textContent = '0';
    }
    
    updateCartSummary();
    
    // Clear form
    document.getElementById('address').value = '';
    document.getElementById('digicode').value = '';
    document.getElementById('interphone').value = '';
    
    // Reset loading steps
    document.querySelectorAll('.loading-step').forEach(step => {
        step.classList.remove('active');
    });
    
    showSection('welcome-section');
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile display
    updateProfileDisplay();
    
    // Setup theme based on Telegram
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0a0a0a');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ecf0f1');
    }
    
    // Handle back button
    tg.BackButton.onClick(() => {
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id !== 'welcome-section') {
            showSection('welcome-section');
        } else {
            tg.close();
        }
    });
    
    // Show back button when not on welcome section
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                if (mutation.target.id !== 'welcome-section') {
                    tg.BackButton.show();
                } else {
                    tg.BackButton.hide();
                }
            }
        });
    });
    
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id !== 'welcome-section') {
            showSection('welcome-section');
        }
    }
});