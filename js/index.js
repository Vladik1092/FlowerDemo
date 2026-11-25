document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Анимация входа (показываем только один раз за сессию вкладки) ---
    const overlay = document.getElementById('intro-overlay');
    const typedTextEl = document.getElementById('typed-text');
    const brandName = 'Цветочная фея';
    const flowers = ['🌸', '🌺', '🌹', '🌷', '💮', '🍃', '✨'];

    if (overlay && typedTextEl) {
        if (sessionStorage.getItem('flower_fairy_intro_shown') === 'true') {
            overlay.remove();
        } else {
            sessionStorage.setItem('flower_fairy_intro_shown', 'true');
            document.body.style.overflow = 'hidden';

            let charIndex = 0;
            const typingSpeed = 95;

            function typeWriter() {
                if (charIndex < brandName.length) {
                    typedTextEl.textContent += brandName.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeWriter, typingSpeed);
                } else {
                    launchFlowers();

                    setTimeout(() => {
                        overlay.classList.add('fade-out');
                        document.body.style.overflow = '';

                        setTimeout(() => overlay.remove(), 800);
                    }, 1100);
                }
            }

            function launchFlowers() {
                const count = 28;
                for (let i = 0; i < count; i++) {
                    const flower = document.createElement('span');
                    flower.classList.add('flying-flower');
                    flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];

                    const angle = Math.random() * Math.PI * 2;
                    const distance = 120 + Math.random() * 280;
                    const tx = Math.cos(angle) * distance + 'px';
                    const ty = Math.sin(angle) * distance + 'px';
                    const rot = (Math.random() * 360 - 180) + 'deg';

                    flower.style.setProperty('--tx', tx);
                    flower.style.setProperty('--ty', ty);
                    flower.style.setProperty('--rot', rot);
                    flower.style.fontSize = (20 + Math.random() * 18) + 'px';

                    overlay.appendChild(flower);
                }
            }

            setTimeout(typeWriter, 300);
        }
    }

    // --- 2. Автоматический слайдер на главном экране (раз в 3 секунды) ---
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            if (dots[i]) {
                dots[i].classList.toggle('active', i === index);
            }
        });
        currentSlide = index;
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    if (slides.length > 1) {
        slideInterval = setInterval(nextSlide, 3000);

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const index = Number(dot.dataset.index);
                showSlide(index);
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 3000);
            });
        });
    }

    // --- 3. Привязка кнопки в блоке "О нас" к единому режиму владельца из config.js ---
    const demoBtn = document.getElementById('demo-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            const globalEditBtn = document.getElementById('globalEditBtn');
            if (globalEditBtn) {
                globalEditBtn.click();
            }
        });
    }

    // --- 4. Обработка отправки формы заказа ---
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Спасибо за заказ! Флорист «Цветочной феи» скоро свяжется с вами для уточнения деталей.');
            orderForm.reset();
        });
    }
});
