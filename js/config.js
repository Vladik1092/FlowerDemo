const DEFAULT_CONFIG = {
    brandName: 'Цветочная фея',
    phoneDisplay: '+7 (927) 726-32-73',
    phoneHref: 'tel:+79277263273',
    footerTitle: 'Наши контакты',
    privacyText: 'Все данные защищены политикой конфиденциальности',
    // Хранилище для произвольных текстов по их data-key
    texts: {}
};

// Загрузка конфига из localStorage
function loadConfig() {
    try {
        const saved = localStorage.getItem('flower_fairy_config');
        if (saved) {
            return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Ошибка чтения конфига:', e);
    }
    return { ...DEFAULT_CONFIG };
}

// Сохранение конфига в localStorage
function saveConfig(config) {
    localStorage.setItem('flower_fairy_config', JSON.stringify(config));
}

// Применение конфига ко всем элементам текущей страницы
function applyConfigToPage() {
    const config = loadConfig();

    // 1. Синхронизируем логотип везде
    document.querySelectorAll('[data-config="brandName"]').forEach(el => {
        el.textContent = config.brandName;
    });

    // 2. Синхронизируем телефон в шапке и в подвале на всех страницах
    document.querySelectorAll('[data-config="phone"]').forEach(el => {
        // Если в шапке есть иконка трубки, аккуратно обновляем текст
        const hasIcon = el.dataset.icon === 'true';
        el.textContent = hasIcon ? `📞 ${config.phoneDisplay}` : config.phoneDisplay;
        if (el.tagName === 'A') {
            el.setAttribute('href', config.phoneHref);
        }
    });

    // 3. Синхронизируем тексты в подвале
    document.querySelectorAll('[data-config="footerTitle"]').forEach(el => {
        el.textContent = config.footerTitle;
    });
    document.querySelectorAll('[data-config="privacyText"]').forEach(el => {
        el.textContent = config.privacyText;
    });

    // 4. Подгружаем остальные отредактированные тексты страницы (по data-edit-id)
    document.querySelectorAll('[data-edit-id]').forEach(el => {
        const key = el.dataset.editId;
        if (config.texts && config.texts[key]) {
            el.textContent = config.texts[key];
        }
    });
}

// Глобальное управление режимом владельца (работает и на главной, и в каталоге)
document.addEventListener('DOMContentLoaded', () => {
    applyConfigToPage();

    // Создаём плавающую панель владельца в правом нижнем углу
    const ownerBar = document.createElement('div');
    ownerBar.className = 'owner-floating-bar';
    ownerBar.innerHTML = `
        <button type="button" id="globalEditBtn" class="owner-bar-btn">✏️ Режим владельца</button>
        <button type="button" id="resetConfigBtn" class="owner-bar-reset" title="Вернуть исходные тексты" style="display: none;">↺ Сброс</button>
    `;
    document.body.appendChild(ownerBar);

    const globalEditBtn = document.getElementById('globalEditBtn');
    const resetConfigBtn = document.getElementById('resetConfigBtn');
    const catalogAdminToggle = document.getElementById('adminModeToggle'); // Чекбокс на странице каталога, если он есть

    let isGlobalEdit = false;

    function preventClicks(e) {
        if (isGlobalEdit) e.preventDefault();
    }

    function toggleGlobalEditMode(state) {
        isGlobalEdit = state;

        // Синхронизируем с переключателем каталога, если мы на странице catalog.html
        if (catalogAdminToggle && catalogAdminToggle.checked !== isGlobalEdit) {
            catalogAdminToggle.checked = isGlobalEdit;
            catalogAdminToggle.dispatchEvent(new Event('change'));
        }

        // Все элементы, доступные для редактирования текста
        const editableElements = document.querySelectorAll(
            '[data-config], [data-edit-id], .nav-links a, .hero-text .btn, .bouquet-card .btn'
        );

        if (isGlobalEdit) {
            globalEditBtn.textContent = '✅ Сохранить изменения';
            globalEditBtn.classList.add('active');
            resetConfigBtn.style.display = 'inline-block';

            editableElements.forEach(el => {
                el.setAttribute('contenteditable', 'true');
                el.setAttribute('spellcheck', 'false');
                el.classList.add('editable-highlight');

                if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                    el.addEventListener('click', preventClicks);
                }

                // Сохраняем изменения при потере фокуса (blur)
                el.addEventListener('blur', handleElementSave);
            });
        } else {
            globalEditBtn.textContent = '✏️ Режим владельца';
            globalEditBtn.classList.remove('active');
            resetConfigBtn.style.display = 'none';

            editableElements.forEach(el => {
                el.removeAttribute('contenteditable');
                el.removeAttribute('spellcheck');
                el.classList.remove('editable-highlight');

                if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                    el.removeEventListener('click', preventClicks);
                }
                el.removeEventListener('blur', handleElementSave);
            });

            // Переприменяем конфиг, чтобы телефон сразу обновился во всех местах текущей страницы
            applyConfigToPage();
        }
    }

    function handleElementSave(e) {
        const el = e.target;
        const config = loadConfig();
        const newText = el.textContent.trim();

        if (!newText) return;

        // Если это общий элемент конфига (телефон, бренд, футер)
        if (el.dataset.config) {
            const field = el.dataset.config;
            if (field === 'phone') {
                // Очищаем от эмодзи трубки, если пользователь редактировал телефон в шапке
                const cleanPhone = newText.replace('📞', '').trim();
                config.phoneDisplay = cleanPhone;
                config.phoneHref = 'tel:' + cleanPhone.replace(/[^+\d]/g, '');
            } else {
                config[field] = newText;
            }
        }

        // Если это уникальный текстовый блок страницы
        if (el.dataset.editId) {
            if (!config.texts) config.texts = {};
            config.texts[el.dataset.editId] = newText;
        }

        saveConfig(config);
    }

    globalEditBtn.addEventListener('click', () => {
        toggleGlobalEditMode(!isGlobalEdit);
    });

    // Если нажали переключатель в шапке каталога — включаем и текстовый редактор тоже
    if (catalogAdminToggle) {
        catalogAdminToggle.addEventListener('change', () => {
            if (catalogAdminToggle.checked !== isGlobalEdit) {
                toggleGlobalEditMode(catalogAdminToggle.checked);
            }
        });
    }

    // Сброс всех текстовых правок к исходным
    resetConfigBtn.addEventListener('click', () => {
        if (confirm('Вернуть все тексты и номер телефона к исходным значениям?')) {
            localStorage.removeItem('flower_fairy_config');
            location.reload();
        }
    });
});

    // --- Мобильное бургер-меню (работает на всех страницах) ---
    const burgerBtn = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');

    if (burgerBtn && navLinks) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
        });

        // Закрываем меню при клике на любой пункт (удобно для якорных ссылок #about, #order)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('open');
                navLinks.classList.remove('active');
            });
        });

        // Закрываем меню при клике вне его области
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !burgerBtn.contains(e.target)) {
                burgerBtn.classList.remove('open');
                navLinks.classList.remove('active');
            }
        });
    }
