document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const contentPlaceholder = document.getElementById('content-placeholder'); // Контейнер для загрузки контента
    const tabsContainer = document.querySelector('.tabs-container'); // Контейнер вкладок для скролла

    // --- Функция для загрузки и отображения контента страницы ---
    async function loadPageContent(pageName) {
        // Показываем индикатор загрузки (можно сделать красивее)
        contentPlaceholder.innerHTML = '<p>Загрузка...</p>';

        const fileName = `${pageName}.html`; // Имя файла для загрузки (e.g., "history.html")

        try {
            const response = await fetch(fileName); // Запрашиваем HTML-фрагмент

            if (!response.ok) { // Проверка статуса ответа
                throw new Error(`Ошибка загрузки ${fileName}: ${response.status} ${response.statusText}`);
            }

            const html = await response.text(); // Получаем HTML как текст
            contentPlaceholder.innerHTML = html; // Вставляем загруженный HTML в контейнер

            // Опционально: Прокрутка к началу контента после загрузки
            // contentPlaceholder.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error("Не удалось загрузить контент:", error);
            // Показываем сообщение об ошибке пользователю
            contentPlaceholder.innerHTML = `<p style="color: red; text-align: center;">Не удалось загрузить раздел '${pageName}'. Пожалуйста, проверьте консоль или попробуйте позже.</p>`;
        }
    }

    // --- Обработка кликов по вкладкам ---
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем стандартное поведение ссылки

            // 1. Снимаем класс 'active' со всех вкладок
            tabs.forEach(t => t.classList.remove('active'));

            // 2. Добавляем класс 'active' к нажатой вкладке
            this.classList.add('active');

            // 3. Получаем имя страницы из атрибута 'data-page'
            const pageName = this.getAttribute('data-page');

            // 4. Загружаем и отображаем соответствующий контент
            loadPageContent(pageName);

            // 5. Прокручиваем контейнер вкладок, чтобы нажатая была видна (опционально)
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // --- Загрузка контента для активной вкладки при первоначальной загрузке ---
    const initialActiveTab = document.querySelector('.tab.active');
    if (initialActiveTab) {
        loadPageContent(initialActiveTab.getAttribute('data-page'));
    } else if (tabs.length > 0) {
        // Если нет активной по умолчанию, делаем активной первую и загружаем ее
        tabs[0].classList.add('active');
        loadPageContent(tabs[0].getAttribute('data-page'));
    }

    // --- (Опционально) Горизонтальная прокрутка вкладок колесиком мыши ---
    if (tabsContainer) {
        tabsContainer.addEventListener('wheel', function(e) {
            // Только если есть горизонтальный скролл
            if (this.scrollWidth > this.clientWidth) {
                // Предотвращаем вертикальную прокрутку страницы, только если колесо крутится НАД блоком вкладок
                e.preventDefault();
                // Прокручиваем контейнер вкладок влево/вправо
                this.scrollLeft += e.deltaY > 0 ? 60 : -60; // Увеличил чувствительность
            }
        }, { passive: false }); // passive: false обязательно для preventDefault
    }
});