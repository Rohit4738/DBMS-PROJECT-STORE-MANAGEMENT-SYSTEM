// REPLACE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://nnigtowruubvfuwxermo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2qIAef096E-hfQgKF1HHBg_GPImBtIq';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentRole = '';

async function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    const { data, error } = await _supabase
        .from('users')
        .select('*')
        .eq('username', user)
        .eq('password', pass)
        .single();

    if (data) {
        currentRole = data.role;
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('dashboard-title').innerText = `${data.username.toUpperCase()} Portal`;

        document.querySelectorAll('.role-view').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${data.role}`).classList.remove('hidden');

        loadDashboardData();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

async function loadDashboardData() {
    const { data: products, error } = await _supabase.from('products').select('*').order('product_id');
    if (error) { console.error(error); return; }

    // Owner Table with Low-Stock Highlights
    if (currentRole === 'owner') {
        const tbody = document.getElementById('owner-table-body');
        tbody.innerHTML = products.map(p => {
            const stockBadge = p.store_stock < 10 
                ? `<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Low: ${p.store_stock}</span>` 
                : `<span class="text-blue-600 font-bold">${p.store_stock}</span>`;
            
            return `
                <tr class="border-b border-slate-200">
                    <td class="p-3 text-slate-500">${p.product_id}</td>
                    <td class="p-3 font-medium text-slate-800">${p.product_name}</td>
                    <td class="p-3 text-slate-600">${p.category}</td>
                    <td class="p-3 text-slate-700">₹${p.price}</td>
                    <td class="p-3">${stockBadge}</td>
                    <td class="p-3 font-medium text-slate-600">${p.provider_stock}</td>
                </tr>
            `;
        }).join('');
    }

    // Provider Table
    if (currentRole === 'provider') {
        const tbody = document.getElementById('provider-table-body');
        tbody.innerHTML = products.map(p => `
            <tr class="border-b border-slate-200">
                <td class="p-3 font-medium text-slate-800">${p.product_name}</td>
                <td class="p-3 font-medium text-slate-600">${p.provider_stock}</td>
                <td class="p-3 font-bold text-blue-600">${p.store_stock}</td>
                <td class="p-3">
                    <button onclick="shipStock(${p.product_id}, ${p.provider_stock}, ${p.store_stock})" class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition">Ship 10 Items</button>
                </td>
            </tr>
        `).join('');
    }

    // Manager Select Dropdowns
    if (currentRole === 'manager') {
        const options = products.map(p => `<option value="${p.product_id}" data-price="${p.price}" data-stock="${p.store_stock}">${p.product_name} (Stock: ${p.store_stock})</option>`).join('');
        document.getElementById('bill-product').innerHTML = options;
        document.getElementById('price-product').innerHTML = options;
    }
}

async function shipStock(id, pStock, sStock) {
    if (pStock < 10) { alert("Insufficient stock in provider warehouse!"); return; }
    const { error } = await _supabase.from('products').update({
        provider_stock: pStock - 10,
        store_stock: sStock + 10
    }).eq('product_id', id);

    if (error) alert("Error processing shipment.");
    else { alert("Successfully dispatched 10 units to store inventory!"); loadDashboardData(); }
}

async function processSale() {
    const select = document.getElementById('bill-product');
    const productId = select.value;
    const qtySold = parseInt(document.getElementById('bill-qty').value);
    const selectedOption = select.options[select.selectedIndex];
    const currentStock = parseInt(selectedOption.text.match(/Stock: (\d+)/)[1]);
    const price = parseFloat(selectedOption.getAttribute('data-price'));

    if (qtySold > currentStock) { alert("Checkout failed: Stock quantity is less than requested sale quantity!"); return; }

    const totalPrice = price * qtySold;

    await _supabase.from('sales').insert([{ product_id: productId, quantity_sold: qtySold, total_price: totalPrice }]);
    await _supabase.from('products').update({ store_stock: currentStock - qtySold }).eq('product_id', productId);

    document.getElementById('bill-message').innerText = `Receipt Generated! Total Bill Amount: ₹${totalPrice}`;
    loadDashboardData();
}

async function updatePrice() {
    const productId = document.getElementById('price-product').value;
    const newPrice = parseFloat(document.getElementById('new-price').value);

    if (!newPrice || newPrice <= 0) { alert("Please input a valid price value."); return; }

    const { error } = await _supabase.from('products').update({ price: newPrice }).eq('product_id', productId);
    if (error) alert("Error modifying price.");
    else { alert("Product price updated successfully!"); loadDashboardData(); }
}

function logout() {
    location.reload();
}
