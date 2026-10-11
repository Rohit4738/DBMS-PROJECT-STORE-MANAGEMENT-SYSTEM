const SUPABASE_URL = 'https://nnigtowruubvfuwxermo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2qIAef096E-hfQgKF1HHBg_GPImBtIq';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentRole = '';
let cart = [];
let globalProducts = [];

window.onload = async function() {
    // Health check to see if Supabase is online/active
    try {
        const { error } = await _supabase.from('products').select('product_id').limit(1);
        if (error) throw error;
    } catch (err) {
        document.getElementById('offline-overlay').classList.remove('hidden');
        return;
    }

    const savedUser = localStorage.getItem('storems_username');
    const savedRole = localStorage.getItem('storems_role');

    if (savedUser && savedRole) {
        initSession(savedUser, savedRole);
    }
};

async function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    if (user === '67' && pass === '67') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('easter-egg-screen').classList.remove('hidden');
        return;
    }

    const { data, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', user)
        .eq('password', pass)
        .single();

    if (data) {
        localStorage.setItem('storems_username', data.username);
        localStorage.setItem('storems_role', data.role);
        initSession(data.username, data.role);
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

function initSession(username, role) {
    currentRole = role;
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('dashboard-title').innerText = `${username.toUpperCase()} Portal`;

    document.querySelectorAll('.role-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${role}`).classList.remove('hidden');

    loadDashboardData();
    loadInboxCount();
}

async function loadDashboardData() {
    const { data: products, error } = await _supabase.from('products').select('*').order('product_id');
    if (error) { console.error(error); return; }
    globalProducts = products;

    // OWNER GRID VIEW
    if (currentRole === 'owner') {
        const grid = document.getElementById('owner-grid');
        grid.innerHTML = products.map(p => `
            <div class="product-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">${p.category}</span>
                    <h4 class="font-bold text-slate-800 mt-2 text-base">${p.product_name}</h4>
                    <p class="text-blue-600 font-bold text-lg mt-1">₹${p.price}</p>
                </div>
                <div class="mt-4 pt-3 border-t text-xs flex justify-between text-slate-600">
                    <span>Store: <b class="text-blue-700">${p.store_stock}</b></span>
                    <span>Provider Whse: <b class="text-slate-800">${p.provider_stock}</b></span>
                </div>
            </div>
        `).join('');

        document.getElementById('restock-prod-select').innerHTML = products.map(p => `<option value="${p.product_name}">${p.product_name}</option>`).join('');
    }

    // PROVIDER GRID VIEW
    if (currentRole === 'provider') {
        const grid = document.getElementById('provider-grid');
        grid.innerHTML = products.map(p => `
            <div class="product-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">${p.category}</span>
                    <h4 class="font-bold text-slate-800 mt-2 text-base">${p.product_name}</h4>
                    <p class="text-indigo-600 font-bold text-base mt-1">Whse Stock: ${p.provider_stock}</p>
                </div>
                <button onclick="providerShip(${p.product_id}, ${p.provider_stock}, ${p.store_stock})" class="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Dispatch 10 Units</button>
            </div>
        `).join('');
    }

    // MANAGER GRID VIEW & PRICE EDIT DROPDOWN
    if (currentRole === 'manager') {
        const grid = document.getElementById('manager-grid');
        grid.innerHTML = products.map(p => `
            <div class="product-card bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold">${p.category}</span>
                    <h4 class="font-bold text-slate-800 mt-2 text-base">${p.product_name}</h4>
                    <p class="text-green-600 font-bold text-lg mt-1">₹${p.price}</p>
                    <p class="text-xs text-slate-500 mt-1">Available Stock: ${p.store_stock}</p>
                </div>
                <div class="mt-4 flex gap-2">
                    <input type="number" id="qty-${p.product_id}" min="1" value="1" class="w-16 p-1 border rounded text-center text-sm">
                    <button onclick="addToCart(${p.product_id}, '${p.product_name}', ${p.price}, ${p.store_stock})" class="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">Add to Cart</button>
                </div>
            </div>
        `).join('');

        const priceOptions = products.map(p => `<option value="${p.product_id}">${p.product_name} (Current: ₹${p.price})</option>`).join('');
        document.getElementById('price-product').innerHTML = priceOptions;
    }
}

// INBOX & REQUESTS SYSTEM
async function loadInboxCount() {
    const { data, error } = await _supabase.from('requests').select('*').eq('status', 'Pending');
    if (data) {
        document.getElementById('inbox-badge').innerText = data.length;
        const list = document.getElementById('inbox-list');
        if (data.length === 0) {
            list.innerHTML = `<p class="text-sm text-slate-600">No pending requests.</p>`;
            return;
        }

        list.innerHTML = data.map(req => `
            <div class="bg-white p-3 rounded-lg border flex justify-between items-center text-sm shadow-sm">
                <div>
                    <span class="font-bold text-blue-600">[${req.request_type.toUpperCase()}]</span> 
                    <b>${req.product_name}</b> (Qty: ${req.quantity}) - Requested by <i>${req.sender_role}</i>
                </div>
                <div class="flex gap-2">
                    <button onclick="approveRequest(${req.request_id}, '${req.request_type}', '${req.product_name}', ${req.quantity}, ${req.price || 0}, '${req.category || 'General'}')" class="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Approve</button>
                    <button onclick="rejectRequest(${req.request_id})" class="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                </div>
            </div>
        `).join('');
    }
}

function toggleInbox() {
    document.getElementById('inbox-view').classList.toggle('hidden');
}

function openRestockModal() { document.getElementById('restock-modal').classList.remove('hidden'); }
function openNewProductModal() { document.getElementById('newprod-modal').classList.remove('hidden'); }
function closeModals() { 
    document.getElementById('restock-modal').classList.add('hidden'); 
    document.getElementById('newprod-modal').classList.add('hidden'); 
}

async function submitRestockRequest() {
    const name = document.getElementById('restock-prod-select').value;
    const qty = parseInt(document.getElementById('restock-qty').value);

    await _supabase.from('requests').insert([{ sender_role: currentRole, product_name: name, quantity: qty, request_type: 'restock' }]);
    closeModals();
    alert("Restock request sent to Provider inbox!");
    loadInboxCount();
}

async function submitNewProductProposal() {
    const name = document.getElementById('np-name').value;
    const cat = document.getElementById('np-category').value;
    const price = parseFloat(document.getElementById('np-price').value);
    const qty = parseInt(document.getElementById('np-qty').value);

    await _supabase.from('requests').insert([{ sender_role: 'provider', product_name: name, category: cat, price: price, quantity: qty, request_type: 'new_product' }]);
    closeModals();
    alert("New product proposed to Owner inbox!");
    loadInboxCount();
}

async function approveRequest(id, type, name, qty, price, category) {
    if (type === 'restock') {
        const prod = globalProducts.find(p => p.product_name === name);
        if (prod) {
            await _supabase.from('products').update({ provider_stock: prod.provider_stock + qty }).eq('product_id', prod.product_id);
        }
    } else if (type === 'new_product') {
        await _supabase.from('products').insert([{ product_name: name, category: category, price: price, store_stock: 0, provider_stock: qty }]);
    }

    await _supabase.from('requests').update({ status: 'Approved' }).eq('request_id', id);
    alert("Request approved successfully!");
    loadDashboardData();
    loadInboxCount();
}

async function rejectRequest(id) {
    await _supabase.from('requests').update({ status: 'Rejected' }).eq('request_id', id);
    alert("Request rejected.");
    loadInboxCount();
}

async function providerShip(id, pStock, sStock) {
    if (pStock < 10) { alert("Insufficient provider stock!"); return; }
    await _supabase.from('products').update({ provider_stock: pStock - 10, store_stock: sStock + 10 }).eq('product_id', id);
    alert("Dispatched 10 units to store!");
    loadDashboardData();
}

function addToCart(id, name, price, stock) {
    const qty = parseInt(document.getElementById(`qty-${id}`).value);
    if (qty > stock) { alert("Exceeds available store stock!"); return; }

    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.qty + qty > stock) { alert("Total exceeds stock!"); return; }
        existing.qty += qty;
    } else {
        cart.push({ id, name, price, qty });
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = `<p class="text-slate-500 italic">Cart is empty</p>`;
        document.getElementById('cart-total').innerText = `₹0.00`;
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        let subtotal = item.price * item.qty;
        total += subtotal;
        return `<div class="flex justify-between items-center bg-white p-2 rounded border">
            <div><b>${item.name}</b> x ${item.qty}</div>
            <div class="text-blue-600 font-bold">₹${subtotal}</div>
        </div>`;
    }).join('');

    document.getElementById('cart-total').innerText = `₹${total.toFixed(2)}`;
}

async function checkoutCart() {
    if (cart.length === 0) { alert("Cart is empty!"); return; }

    let grandTotal = 0;
    for (let item of cart) {
        let subtotal = item.price * item.qty;
        grandTotal += subtotal;

        await _supabase.from('sales').insert([{ product_id: item.id, quantity_sold: item.qty, total_price: subtotal }]);
        const prod = globalProducts.find(p => p.product_id === item.id);
        await _supabase.from('products').update({ store_stock: prod.store_stock - item.qty }).eq('product_id', item.id);
    }

    document.getElementById('receipt-date').innerText = new Date().toLocaleString();
    document.getElementById('receipt-body').innerHTML = cart.map(i => `
        <div class="flex justify-between">
            <span>${i.name} (x${i.qty})</span>
            <span>₹${i.price * i.qty}</span>
        </div>
    `).join('');
    document.getElementById('receipt-grand-total').innerText = `₹${grandTotal.toFixed(2)}`;
    document.getElementById('receipt-modal').classList.remove('hidden');

    cart = [];
    renderCart();
    loadDashboardData();
}

async function updatePrice() {
    const productId = document.getElementById('price-product').value;
    const newPrice = parseFloat(document.getElementById('new-price').value);

    if (!newPrice || newPrice <= 0) { alert("Please enter a valid price."); return; }

    const { error } = await _supabase.from('products').update({ price: newPrice }).eq('product_id', productId);
    if (error) {
        alert("Error updating price.");
    } else {
        alert("Product price updated successfully in database!");
        document.getElementById('new-price').value = '';
        loadDashboardData();
    }
}

function closeReceipt() {
    document.getElementById('receipt-modal').classList.add('hidden');
}

function logout() {
    localStorage.clear();
    location.reload();
}
