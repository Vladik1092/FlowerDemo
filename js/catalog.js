document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalogGrid');
    const modal = document.getElementById('addProductModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addProductForm = document.getElementById('addProductForm');

    const cartDialog = document.getElementById('cartDialog');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartCount = document.getElementById('cartCount');
    const cartOrderForm = document.getElementById('cartOrderForm');

    let isAdminMode = false;
    let cart = [];

    const DEFAULT_PRODUCTS = [
        { id: 1, title: 'Солнечный комплимент', price: 2500, image: 'https://sun9-15.userapi.com/s/v1/ig2/w62qnA5GUUnTimR1tXvOeollDUcYg6PsUk677dtd0I6ANZoxg1XL15AC2B1owxvpJ-4N1mREtmow2uaW_h8CgOz5.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=apn80ycVqFVGhrVcgN5jXFWx1WD1iN-jaq53snkCUEs&cs=1080x0' },
        { id: 2, title: 'Алый бархат', price: 3800, image: 'https://sun9-7.userapi.com/s/v1/ig2/eYoiBPdN1MJNserFYYA5MM1Ka3B7_MfP_1bUX0_pmBwAc0fa2LhNhn4b-pVwKJbmLfmByLrgKEJZbrVsBEiknE0W.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=JLxUtXX_eslxeCJ34D47kKijqsjZqtwgCWMdiHlYEPg&cs=1080x0' },
        { id: 3, title: 'Нежность пионов', price: 3100, image: 'https://sun9-70.vkuserphoto.ru/s/v1/ig2/cXpmYJIJDVhHh7V8hQdPCoPy4yKFeJn71XAwPhabXkHkO3MOUvsf3lDlYN0rJumaWgIv96l46H0Ib6Jbda9g6Jz3.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=nXzlM14yG2ageho-5VM9rk3RNG2M8SBRBAE7oqojKoY&cs=1080x0' },
        { id: 4, title: 'Цветочная мелодия', price: 4200, image: 'https://sun9-7.userapi.com/s/v1/ig2/NpZuS2ZXwwMkWrqWN3glviVxtKxNs0BxMhEwtmXvVS_n2RlnBncI3otgIyFVZcxSITGIlefJHOg2eoZ8z_Nd20YN.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=dAVCYDmMUe2tBw4qQ--yrmPs5NofBHHuel0Se3SHgIk&cs=1080x0' }
    ];

function loadProducts() {
    try {
        const saved = localStorage.getItem('flower_fairy_products_v2');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [...DEFAULT_PRODUCTS];
}

function saveProducts() {
    try {
        localStorage.setItem('flower_fairy_products_v2', JSON.stringify(products));
    } catch (e) {}
}

    let products = loadProducts();

    function renderCatalog() {
        if (!catalogGrid) return;
        catalogGrid.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const deleteBtnHTML = isAdminMode
                ? `<button type="button" class="delete-product-btn" title="Удалить товар" data-id="${product.id}">&times;</button>`
                : '';

            const priceHTML = isAdminMode
                ? `<input type="number" class="price-edit-input" value="${product.price}" data-id="${product.id}" min="100"> ₽`
                : `${product.price.toLocaleString('ru-RU')} ₽`;

            card.innerHTML = `
                ${deleteBtnHTML}
                <div class="product-img-wrap">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title" ${isAdminMode ? 'contenteditable="true"' : ''} data-id="${product.id}">${product.title}</h3>
                    <div class="product-price-row">
                        Цена: ${priceHTML}
                    </div>
                    <button type="button" class="btn btn-primary btn-small order-bouquet-btn" data-id="${product.id}">Заказать</button>
                </div>
            `;

            catalogGrid.appendChild(card);
        });

        if (isAdminMode) {
            const addCard = document.createElement('div');
            addCard.className = 'add-product-card';
            addCard.innerHTML = `
                <div class="add-plus-circle">+</div>
                <h3>Создать товар</h3>
                <p>Нажмите, чтобы добавить новый букет в каталог</p>
            `;
            addCard.addEventListener('click', () => modal.classList.add('open'));
            catalogGrid.appendChild(addCard);
        }

        attachCardEvents();
    }

    function attachCardEvents() {
        document.querySelectorAll('.order-bouquet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isAdminMode) return;
                const id = Number(btn.dataset.id);
                const product = products.find(p => p.id === id);
                if (product) {
                    addToCart(product);
                    cartDialog.showModal();
                }
            });
        });

        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                if (confirm('Удалить этот букет из каталога?')) {
                    products = products.filter(item => item.id !== id);
                    saveProducts();
                    renderCatalog();
                }
            });
        });

        document.querySelectorAll('.price-edit-input').forEach(input => {
            input.addEventListener('change', () => {
                const id = Number(input.dataset.id);
                const newPrice = Number(input.value);
                const product = products.find(item => item.id === id);
                if (product && newPrice > 0) {
                    product.price = newPrice;
                    saveProducts();
                }
            });
        });

        document.querySelectorAll('.product-title[contenteditable="true"]').forEach(titleEl => {
            titleEl.addEventListener('blur', () => {
                const id = Number(titleEl.dataset.id);
                const product = products.find(item => item.id === id);
                if (product && titleEl.textContent.trim()) {
                    product.title = titleEl.textContent.trim();
                    saveProducts();
                }
            });
        });
    }

    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        renderCart();
    
    }

    function renderCart() {
        cartItemsList.innerHTML = '';
        let totalSum = 0;
        let totalQty = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 15px 0;">Корзина пока пуста</p>';
        } else {
            cart.forEach(item => {
                totalSum += item.price * item.qty;
                totalQty += item.qty;

                const row = document.createElement('div');
                row.className = 'cart-item';
                row.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.title}">
                        <div>
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽ × ${item.qty}</div>
                        </div>
                    </div>
                    <div class="cart-qty-controls">
                        <button type="button" class="qty-btn minus-btn" data-id="${item.id}">−</button>
                        <span>${item.qty}</span>
                        <button type="button" class="qty-btn plus-btn" data-id="${item.id}">+</button>
                    </div>
                `;
                cartItemsList.appendChild(row);
            });
        }

        cartTotalPrice.textContent = `${totalSum.toLocaleString('ru-RU')} ₽`;
        cartCount.textContent = totalQty;

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = cart.find(i => i.id === Number(btn.dataset.id));
                if (item) {
                    item.qty += 1;
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.qty -= 1;
                    if (item.qty <= 0) {
                        cart = cart.filter(i => i.id !== id);
                    }
                    renderCart();
                }
            });
        });
    }

    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            renderCart();
            cartDialog.showModal();
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => cartDialog.close());
    }
    if (cartDialog) {
        cartDialog.addEventListener('click', (e) => {
            if (e.target === cartDialog) cartDialog.close();
        });
    }

    if (cartOrderForm) {
        cartOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) {
alert('Добавьте хотя бы один букет в корзину!');
return;
}
    const name = document.getElementById('orderName').value;
    alert(`Спасибо, ${name}! Ваш заказ на сумму ${cartTotalPrice.textContent} принят. Флорист «Цветочной феи» скоро свяжется с вами.`);
    renderCart();
    cartOrderForm.reset();
    cartDialog.close();
});
}
    if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
}
if (modal) {
modal.addEventListener('click', (e) => {
if (e.target === modal) modal.classList.remove('open');
});
}
if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('newProductTitle').value.trim();
    const price = Number(document.getElementById('newProductPrice').value);
    const file = document.getElementById('newProductImage').files[0];
    if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        products.push({
        id: Date.now(),
        title: title,
        price: price,
        image: event.target.result
    });
        saveProducts();
        addProductForm.reset();
        modal.classList.remove('open');
        renderCatalog();
        };
        reader.readAsDataURL(file);
        }
});
}
// Привязываем режим владельца каталога к кнопке из config.js внутри DOMContentLoaded
    const globalEditBtn = document.getElementById('globalEditBtn');
    if (globalEditBtn) {
    globalEditBtn.addEventListener('click', () => {
    setTimeout(() => {
    isAdminMode = globalEditBtn.classList.contains('active');
    renderCatalog();
    }, 0);
});
}
// Сброс товаров каталога при нажатии на кнопку сброса конфига
    const resetConfigBtn = document.getElementById('resetConfigBtn');
    if (resetConfigBtn) {
    resetConfigBtn.addEventListener('click', () => {
    localStorage.removeItem('flower_fairy_products');
});
}
renderCatalog();
});