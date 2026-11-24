document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalogGrid');
    const adminToggle = document.getElementById('adminModeToggle');
    const modal = document.getElementById('addProductModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addProductForm = document.getElementById('addProductForm');

    // Элементы корзины и dialog
    const cartDialog = document.getElementById('cartDialog');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartCount = document.getElementById('cartCount');
    const cartOrderForm = document.getElementById('cartOrderForm');

    let isAdminMode = false;
    let cart = []; // Массив товаров в корзине: { id, title, price, image, qty }

    // Начальный список букетов (замени пути ../img/... на свои картинки)
    let products = [
        { id: 1, title: 'Нежность рассвета', price: 2500, image: 'https://sun9-15.userapi.com/s/v1/ig2/w62qnA5GUUnTimR1tXvOeollDUcYg6PsUk677dtd0I6ANZoxg1XL15AC2B1owxvpJ-4N1mREtmow2uaW_h8CgOz5.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=apn80ycVqFVGhrVcgN5jXFWx1WD1iN-jaq53snkCUEs&cs=1080x0' },
        { id: 2, title: 'Алый бархат', price: 3800, image: 'https://sun9-7.userapi.com/s/v1/ig2/eYoiBPdN1MJNserFYYA5MM1Ka3B7_MfP_1bUX0_pmBwAc0fa2LhNhn4b-pVwKJbmLfmByLrgKEJZbrVsBEiknE0W.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=JLxUtXX_eslxeCJ34D47kKijqsjZqtwgCWMdiHlYEPg&cs=1080x0' },
        { id: 3, title: 'Аромат любви', price: 3100, image: 'https://sun9-70.vkuserphoto.ru/s/v1/ig2/cXpmYJIJDVhHh7V8hQdPCoPy4yKFeJn71XAwPhabXkHkO3MOUvsf3lDlYN0rJumaWgIv96l46H0Ib6Jbda9g6Jz3.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=nXzlM14yG2ageho-5VM9rk3RNG2M8SBRBAE7oqojKoY&cs=1080x0' },
        { id: 4, title: 'Цветочная симфония', price: 4200, image: 'https://sun9-53.vkuserphoto.ru/s/v1/ig2/FIKfMM0q_vliFDlHgEjNVUpf0SeFi0DMPNoG5EKQWfCzVtAbuo4jK9pUohBsXekZ5Ah1Qw55p7NuAh3VV7DPlUbJ.jpg?quality=95&crop=0,0,1920,2560&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=sTpQP73fLpWFsOINn3XduwdeGb7IcTnCHGIJmLZQLic&cs=1080x0' }
    ];

    // --- Отрисовка каталога ---
    function renderCatalog() {
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

    // --- События на карточках товаров ---
    function attachCardEvents() {
        // Кнопка "Заказать" -> добавляет в корзину и открывает dialog
        document.querySelectorAll('.order-bouquet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Если включён режим редактирования текста — не открываем корзину
                if (isAdminMode) return;

                const id = Number(btn.dataset.id);
                const product = products.find(p => p.id === id);
                if (product) {
                    addToCart(product);
                    cartDialog.showModal();
                }
            });
        });

        // Удаление товара (в режиме владельца)
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                if (confirm('Удалить этот букет из каталога?')) {
                    products = products.filter(item => item.id !== id);
                    renderCatalog();
                }
            });
        });

        // Изменение цены (в режиме владельца)
        document.querySelectorAll('.price-edit-input').forEach(input => {
            input.addEventListener('change', () => {
                const id = Number(input.dataset.id);
                const newPrice = Number(input.value);
                const product = products.find(item => item.id === id);
                if (product && newPrice > 0) {
                    product.price = newPrice;
                }
            });
        });

        // Изменение названия (в режиме владельца)
        document.querySelectorAll('.product-title[contenteditable="true"]').forEach(titleEl => {
            titleEl.addEventListener('blur', () => {
                const id = Number(titleEl.dataset.id);
                const product = products.find(item => item.id === id);
                if (product && titleEl.textContent.trim()) {
                    product.title = titleEl.textContent.trim();
                }
            });
        });
    }

    // --- Логика корзины и <dialog> ---
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
        openCartBtn.style.display = totalQty > 0 ? 'flex' : 'none';

        // Кнопки + и - в корзине
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

    // Открытие / закрытие dialog
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => cartDialog.showModal());
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => cartDialog.close());
    }
    // Закрытие при клике по тёмному фону вокруг dialog
    if (cartDialog) {
        cartDialog.addEventListener('click', (e) => {
            if (e.target === cartDialog) {
                cartDialog.close();
            }
        });
    }

    // Отправка заказа из корзины
    if (cartOrderForm) {
        cartOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert('Добавьте хотя бы один букет в корзину!');
                return;
            }
            const name = document.getElementById('orderName').value;
            alert(`Спасибо, ${name}! Ваш заказ на сумму ${cartTotalPrice.textContent} принят. Флорист «Цветочной феи» скоро свяжется с вами.`);
            cart = [];
            renderCart();
            cartOrderForm.reset();
            cartDialog.close();
        });
    }

    // --- Переключение режима владельца ---
    if (adminToggle) {
        adminToggle.addEventListener('change', () => {
            isAdminMode = adminToggle.checked;
            renderCatalog();
        });
    }

    // --- Модальное окно создания нового товара ---
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
        const file = document.getElementById('newProductImage').files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
        products.push({
        id: Date.now(),
        title: title,
        price: price,
        image: event.target.result
    });
        addProductForm.reset();
        modal.classList.remove('open');
        renderCatalog();
    };
            reader.readAsDataURL(file);
            }
        });
    }
    renderCatalog();
    });

        const globalEditBtn = document.getElementById('globalEditBtn');
    if (globalEditBtn) {
        globalEditBtn.addEventListener('click', () => {
            // Небольшая задержка, чтобы config.js успел переключить своё состояние
            setTimeout(() => {
                isAdminMode = globalEditBtn.classList.contains('active');
                renderCatalog();
            }, 10);
        });
    }