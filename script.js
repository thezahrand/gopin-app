// Dummy Data
const products = [
    { id: 1, name: 'Chitato Sapi Panggang', price: 11000, category: 'makanan-ringan', image: 'https://placehold.co/200x200?text=Chitato' },
    { id: 2, name: 'Oreo Original', price: 9500, category: 'makanan-ringan', image: 'https://placehold.co/200x200?text=Oreo' },
    { id: 3, name: 'Pocari Sweat 500ml', price: 8000, category: 'minuman', image: 'https://placehold.co/200x200?text=Pocari' },
    { id: 4, name: 'Teh Pucuk Harum', price: 4000, category: 'minuman', image: 'https://placehold.co/200x200?text=Teh+Pucuk' },
    { id: 5, name: 'Indomie Goreng', price: 3500, category: 'makanan-berat', image: 'https://placehold.co/200x200?text=Indomie' },
    { id: 6, name: 'Pop Mie Ayam Bawang', price: 6000, category: 'makanan-berat', image: 'https://placehold.co/200x200?text=Pop+Mie' },
    { id: 7, name: 'Sabun Lifebuoy', price: 5000, category: 'alat-mandi', image: 'https://placehold.co/200x200?text=Lifebuoy' },
    { id: 8, name: 'Shampoo Clear', price: 22000, category: 'alat-mandi', image: 'https://placehold.co/200x200?text=Clear' },
    { id: 9, name: 'Pulpen Pilot', price: 3000, category: 'alat-tulis', image: 'https://placehold.co/200x200?text=Pulpen' },
    { id: 10, name: 'Buku Tulis Sidu', price: 5000, category: 'alat-tulis', image: 'https://placehold.co/200x200?text=Buku+Sidu' },
];

// State
let cart = JSON.parse(localStorage.getItem('gopin_cart')) || [];
// const SHIPPING_FEE = 2000; // Removed constant
const ADMIN_PHONE = '6281311782688'; // Updated admin number

function calculateShipping(totalItems) {
    if (totalItems === 0) return 0;
    if (totalItems <= 5) return 2000;
    return 5000; // 6-10 and above
}

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const catBtns = document.querySelectorAll('.cat-btn');

// Initialization
function init() {
    renderProducts('all');
    updateCartUI();
    setupEventListeners();
}

// Render Products
function renderProducts(category) {
    productGrid.innerHTML = '';
    const filtered = category === 'all'
        ? products
        : products.filter(p => p.category === category);

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category.replace('-', ' ')}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    + Tambah
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Cart Logic
window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartUI();
    // Optional: Show feedback (toast)
};

window.updateQty = function (id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartUI();
    }
};

function saveCart() {
    localStorage.setItem('gopin_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update Badge
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;

    // Update Cart Items
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Keranjang masih kosong nih.</p>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</div>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    // Update Totals
    // totalQty is already calculated at the top of the function
    const shippingFee = calculateShipping(totalQty);
    const total = subtotal + shippingFee;

    cartSubtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('cart-shipping').textContent = `Rp ${shippingFee.toLocaleString('id-ID')}`;
    cartTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Checkout Logic
function handleCheckout() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }

    const name = document.getElementById('customer-name').value;
    const room = document.getElementById('customer-room').value;

    if (!name || !room) {
        alert('Mohon isi Nama dan Nomor Kamar ya!');
        return;
    }

    // Generate Order ID
    const orderId = generateOrderId(cart);

    let message = `Halo Kak, saya mau pesan dong:%0A`;
    message += `No. Pesanan: *${orderId}*%0A`;
    message += `--------------------------------%0A`;

    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;
        message += `${index + 1}. ${item.name} (${item.qty}x) - Rp ${(item.price * item.qty).toLocaleString('id-ID')}%0A`;
    });

    // Calculate shipping based on total items
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const shippingFee = calculateShipping(totalQty);
    const total = subtotal + shippingFee;

    message += `--------------------------------%0A`;
    message += `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}%0A`;
    message += `Ongkir: Rp ${shippingFee.toLocaleString('id-ID')}%0A`;
    message += `*Total Bayar: Rp ${total.toLocaleString('id-ID')}*%0A%0A`;
    message += `Nama: ${name}%0A`;
    message += `Kamar: ${room}`;

    const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${message}`;
    window.open(waUrl, '_blank');
}

function generateOrderId(cart) {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T.Z]/g, '').slice(2, 12); // YYMMDDHHMM
    const itemsStr = cart.map(i => i.id + '' + i.qty).join('');
    const combined = dateStr + itemsStr;

    // Simple hash to get 8 digits
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Ensure positive and take last 8 digits
    const positiveHash = Math.abs(hash);
    const hashStr = positiveHash.toString().padEnd(8, '0').slice(0, 8);

    return hashStr;
}

// Event Listeners
function setupEventListeners() {
    // Category Filtering
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.category);
        });
    });

    // Modal Toggle
    cartBtn.addEventListener('click', () => {
        cartModal.classList.remove('hidden');
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.add('hidden');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.add('hidden');
        }
    });

    // Checkout
    checkoutBtn.addEventListener('click', handleCheckout);
}

// Run
init();
