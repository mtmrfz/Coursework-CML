document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. ЛОГИКА МОДАЛЬНОГО ОКНА (Покупка билета)
    // ==========================================
    const modal = document.getElementById('ticketModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const purchaseForm = document.getElementById('purchaseForm');
    const paymentSuccessModal = document.getElementById('paymentSuccessModal');
    const closePaymentSuccessBtn = document.getElementById('closePaymentSuccessBtn');
    const okPaymentSuccessBtn = document.getElementById('okPaymentSuccessBtn');

    // Закрытие окна по крестику
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.close());
    }

    // Обработка формы "Перейти к оплате"
    if (purchaseForm && paymentSuccessModal && modal) {
        purchaseForm.addEventListener('submit', (e) => {
            e.preventDefault(); // предотвращаем отправку
            modal.close(); // закрываем окно оформления
            paymentSuccessModal.showModal(); // открываем уведомление
            purchaseForm.reset(); // сбрасываем форму
        });
    }

    // Закрытие окна успешной заявки
    const closePaymentSuccess = () => {
        if (paymentSuccessModal) paymentSuccessModal.close();
    };
    if (closePaymentSuccessBtn) closePaymentSuccessBtn.addEventListener('click', closePaymentSuccess);
    if (okPaymentSuccessBtn) okPaymentSuccessBtn.addEventListener('click', closePaymentSuccess);

    // ==========================================
    // 1.1 ПОИСК РЕЙСОВ С ГЛАВНОЙ СТРАНИЦЫ
    // ==========================================
    const indexSearchBtn = document.getElementById('indexSearchBtn');
    if (indexSearchBtn) {
        indexSearchBtn.addEventListener('click', () => {
            const fromVal = document.getElementById('from').value.trim();
            const toVal = document.getElementById('to').value.trim();
            const dateVal = document.getElementById('date').value;
            
            const params = new URLSearchParams();
            if (fromVal) params.append('from', fromVal);
            if (toVal) params.append('to', toVal);
            if (dateVal) params.append('date', dateVal);

            // Переход на страницу расписания с параметрами в URL
            window.location.href = `schedule.html?${params.toString()}`;
        });
    }

    // ==========================================
    // 2. ЗАГРУЗКА ОТЗЫВОВ ИЗ XML (Для главной)
    // ==========================================
    const reviewsContainer = document.getElementById('reviews-container');

    if (reviewsContainer) {
        fetch('data/reviews.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const reviews = xmlDoc.getElementsByTagName('review');

                let htmlContent = '';

                for (let i = 0; i < reviews.length; i++) {
                    const author = reviews[i].getElementsByTagName('author')[0].textContent;
                    const date = reviews[i].getElementsByTagName('date')[0].textContent;
                    const text = reviews[i].getElementsByTagName('text')[0].textContent;
                    const rating = reviews[i].getElementsByTagName('rating')[0].textContent;
                    
                    const firstLetter = author.charAt(0).toUpperCase();

                    htmlContent += `
                        <article class="review-card">
                            <div class="review-header">
                                <div class="avatar">${firstLetter}</div>
                                <div class="author-info">
                                    <span class="author-name">${author}</span>
                                    <span>${date}</span>
                                </div>
                            </div>
                            <p class="review-text">${text}</p>
                            <div class="rating">★ ${rating}</div>
                        </article>
                    `;
                }
                reviewsContainer.innerHTML = htmlContent;
            })
            .catch(error => {
                console.error('Ошибка загрузки отзывов:', error);
                reviewsContainer.innerHTML = '<p style="color: white;">Не удалось загрузить отзывы.</p>';
            });
    }

    // ==========================================
    // 3. ЗАГРУЗКА РАСПИСАНИЯ ИЗ XML (Для страницы расписания)
    // ==========================================
    const scheduleContainer = document.getElementById('schedule-container');
    const filterFrom = document.getElementById('filter-from');
    const filterTo = document.getElementById('filter-to');
    const filterDate = document.getElementById('filter-date');
    const filterBtn = document.getElementById('scheduleSearchBtn');

    if (scheduleContainer) {
        let allRoutes = []; // Здесь будем хранить все рейсы из XML

        // Заполняем фильтры из URL (с главной страницы), если они есть
        const urlParams = new URLSearchParams(window.location.search);
        if (filterFrom && urlParams.has('from')) filterFrom.value = urlParams.get('from');
        if (filterTo && urlParams.has('to')) filterTo.value = urlParams.get('to');
        if (filterDate && urlParams.has('date')) filterDate.value = urlParams.get('date');

        // Функция для отрисовки массива рейсов
        const renderRoutes = (routes, showAll = false) => {
            if (routes.length === 0) {
                scheduleContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px 0;">По вашему запросу рейсов не найдено.</p>';
                return;
            }

            let htmlContent = '';
            const limit = 5; // Количество рейсов для первоначального показа
            const routesToRender = showAll ? routes : routes.slice(0, limit);

            for (let i = 0; i < routesToRender.length; i++) {
                const departure = routesToRender[i].getElementsByTagName('departure')[0].textContent;
                const arrival = routesToRender[i].getElementsByTagName('arrival')[0].textContent;
                const timeStart = routesToRender[i].getElementsByTagName('time_start')[0].textContent;
                const timeEnd = routesToRender[i].getElementsByTagName('time_end')[0].textContent;
                const duration = routesToRender[i].getElementsByTagName('duration')[0].textContent;
                const price = routesToRender[i].getElementsByTagName('price')[0].textContent;
                const busType = routesToRender[i].getElementsByTagName('bus_type')[0].textContent;

                htmlContent += `
                    <div class="route-card">
                        <div class="route-info">
                            <div class="route-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 16C4 16.55 4.45 17 5 17H6V19C6 19.55 6.45 20 7 20C7.55 20 8 19.55 8 19V17H16V19C16 19.55 16.45 20 17 20C17.55 20 18 19.55 18 19V17H19C19.55 17 20 16.55 20 16V6C20 3.5 16.42 2 12 2C7.58 2 4 3.5 4 6V16ZM7.5 13C6.67 13 6 12.33 6 11.5C6 10.67 6.67 10 7.5 10C8.33 10 9 10.67 9 11.5C9 12.33 8.33 13 7.5 13ZM16.5 13C15.67 13 15 12.33 15 11.5C15 10.67 15.67 10 16.5 10C17.33 10 18 10.67 18 11.5C18 12.33 17.33 13 16.5 13ZM6 7V6C6 4.9 8.69 4 12 4C15.31 4 18 4.9 18 6V7H6Z" fill="currentColor"/></svg>
                            </div>
                            <div class="route-details">
                                <h4>${departure} — ${arrival}</h4>
                                <span class="time">${timeStart} - ${timeEnd}</span>
                                <span class="meta">В пути: ${duration} | ${busType}</span>
                            </div>
                        </div>
                        <div class="route-action">
                            <div class="price">${price}</div>
                            <button class="btn-buy dynamic-buy-btn">Купить</button>
                        </div>
                    </div>
                `;
            }

            // Вставляем сгенерированный HTML в контейнер
            scheduleContainer.innerHTML = htmlContent;

            // Если есть еще рейсы и мы не показываем все, добавляем кнопку "Показать все рейсы"
            if (!showAll && routes.length > limit) {
                const showMoreBtn = document.createElement('button');
                showMoreBtn.className = 'btn-primary';
                showMoreBtn.textContent = 'Показать все рейсы (' + (routes.length - limit) + ' еще)';
                showMoreBtn.style.margin = '20px auto 0';
                showMoreBtn.style.display = 'block';
                
                showMoreBtn.addEventListener('click', () => {
                    renderRoutes(routes, true);
                });
                
                scheduleContainer.appendChild(showMoreBtn);
            }

            // Навешиваем обработчик клика на новые кнопки покупки
            const dynamicBuyBtns = document.querySelectorAll('.dynamic-buy-btn');
            dynamicBuyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (modal) modal.showModal();
                });
            });
        };

        fetch('data/schedule.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                // Преобразуем HTMLCollection в массив для удобной фильтрации
                allRoutes = Array.from(xmlDoc.getElementsByTagName('route'));
                
                // Применяем фильтры (в том числе из URL) и отрисовываем
                applyFilters();

            })
            .catch(error => {
                console.error('Ошибка загрузки расписания:', error);
                scheduleContainer.innerHTML = '<p style="text-align: center; color: #666;">Ошибка при загрузке расписания. Проверьте локальный сервер.</p>';
            });

        const applyFilters = () => {
            const fromVal = filterFrom ? filterFrom.value.trim().toLowerCase() : '';
            const toVal = filterTo ? filterTo.value.trim().toLowerCase() : '';

            // Фильтруем массив всех рейсов
            const filteredRoutes = allRoutes.filter(route => {
                const dep = route.getElementsByTagName('departure')[0].textContent.toLowerCase();
                const arr = route.getElementsByTagName('arrival')[0].textContent.toLowerCase();
                
                // Если поле пустое, то считаем, что оно подходит под любой город
                const matchFrom = fromVal === '' || dep.includes(fromVal);
                const matchTo = toVal === '' || arr.includes(toVal);

                return matchFrom && matchTo;
            });

            // Отрисовываем отфильтрованные рейсы
            renderRoutes(filteredRoutes);
        };

        // Логика фильтрации при нажатии на кнопку "Показать"
        if (filterBtn) {
            filterBtn.addEventListener('click', applyFilters);
        }
    }

    // ==========================================
    // 4. БУРГЕР МЕНЮ (Мобильная навигация)
    // ==========================================
    const burgerMenu = document.querySelector('.burger-menu');
    const mainNav = document.querySelector('.main-nav');

    if (burgerMenu && mainNav) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // ==========================================
    // 5. АВТОМАТИЧЕСКАЯ ПОДСВЕТКА ТЕКУЩЕЙ СТРАНИЦЫ
    // ==========================================
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav ul a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        
        // Если текущий путь совпадает с адресом ссылки
        if (currentPath === linkPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
            link.style.color = '#3B2A5D';
            link.style.borderBottom = '2px solid #3B2A5D';
            link.style.paddingBottom = '5px';
        }
    });

    // ==========================================
    // 6. ПОДПИСКА НА НОВОСТИ
    // ==========================================
    const subscribeForm = document.querySelector('.subscribe-form');
    const subscribeModal = document.getElementById('subscribeModal');
    const closeSubscribeBtn = document.getElementById('closeSubscribeBtn');
    const okSubscribeBtn = document.getElementById('okSubscribeBtn');

    if (subscribeForm && subscribeModal) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            subscribeModal.showModal();
            subscribeForm.reset();
        });

        const closeSub = () => subscribeModal.close();
        if (closeSubscribeBtn) closeSubscribeBtn.addEventListener('click', closeSub);
        if (okSubscribeBtn) okSubscribeBtn.addEventListener('click', closeSub);
    }

    // ==========================================
    // 7. ФОРМА ОБРАТНОЙ СВЯЗИ (Контакты)
    // ==========================================
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackSuccessModal = document.getElementById('feedbackSuccessModal');
    const closeFeedbackSuccessBtn = document.getElementById('closeFeedbackSuccessBtn');
    const okFeedbackSuccessBtn = document.getElementById('okFeedbackSuccessBtn');

    if (feedbackForm && feedbackSuccessModal) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем перезагрузку страницы
            feedbackSuccessModal.showModal(); // Показываем окно успеха
            feedbackForm.reset(); // Очищаем форму
        });

        const closeFeedback = () => feedbackSuccessModal.close();
        if (closeFeedbackSuccessBtn) closeFeedbackSuccessBtn.addEventListener('click', closeFeedback);
        if (okFeedbackSuccessBtn) okFeedbackSuccessBtn.addEventListener('click', closeFeedback);
    }
});