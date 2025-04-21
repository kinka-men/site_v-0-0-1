document.addEventListener('DOMContentLoaded', function() {
    const mainTabs = document.querySelectorAll('.tab'); // Основные вкладки навигации
    const contentPlaceholder = document.getElementById('content-placeholder'); // Контейнер для загрузки контента
    const mainTabsContainer = document.querySelector('.tabs-container'); // Контейнер основных вкладок для скролла

    // --- Функция для загрузки и отображения основного контента (HTML-фрагменты) ---
    async function loadMainPageContent(pageName) {
        // Показываем индикатор загрузки
        contentPlaceholder.innerHTML = '<p>Загрузка...</p>';
        const fileName = `${pageName}.html`; // Имя файла для загрузки (e.g., "history.html")

        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки ${fileName}: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            contentPlaceholder.innerHTML = html; // Вставляем загруженный HTML

            // Важно: Инициализация iframe, если он был загружен (например, в history.html)
            // Можно вызвать функцию инициализации здесь, если она нужна сразу после загрузки
            // или положиться на делегирование событий.

        } catch (error) {
            console.error("Не удалось загрузить основной контент:", error);
            contentPlaceholder.innerHTML = `<p style="color: red; text-align: center;">Не удалось загрузить раздел '${pageName}'. Пожалуйста, проверьте консоль или попробуйте позже.</p>`;
        }
    }

    // --- Обработка кликов по ОСНОВНЫМ вкладкам навигации ---
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // 1. Снимаем класс 'active' со всех ОСНОВНЫХ вкладок
            mainTabs.forEach(t => t.classList.remove('active'));
            // 2. Добавляем класс 'active' к нажатой ОСНОВНОЙ вкладке
            this.classList.add('active');
            // 3. Получаем имя страницы из атрибута 'data-page'
            const pageName = this.getAttribute('data-page');
            // 4. Загружаем и отображаем соответствующий основной контент
            loadMainPageContent(pageName);
            // 5. Прокручиваем контейнер ОСНОВНЫХ вкладок
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // --- Обработка кликов ВНУТРИ #content-placeholder (Делегирование событий) ---
    // Этот обработчик будет ловить клики по элементам, загруженным динамически,
    // включая вложенные вкладки .sub-tab
    contentPlaceholder.addEventListener('click', function(event) {

        // --- Логика для ВЛОЖЕННЫХ вкладок (.sub-tab) ---
        const clickedSubTab = event.target.closest('.sub-tab');
        if (clickedSubTab) {
            event.preventDefault(); // Отменяем переход по ссылке '#'

            // Ищем iframe и все вложенные вкладки ВНУТРИ #content-placeholder
            const historyIframe = contentPlaceholder.querySelector('#history-iframe');
            const allSubTabs = contentPlaceholder.querySelectorAll('.sub-tab');

            if (!historyIframe) {
                console.error("Не найден iframe #history-iframe внутри #content-placeholder при клике на sub-tab");
                return;
            }

            // 1. Убираем класс 'active' со ВСЕХ вложенных вкладок
            allSubTabs.forEach(t => t.classList.remove('active'));
            // 2. Добавляем класс 'active' к НАЖАТОЙ вложенной вкладке
            clickedSubTab.classList.add('active');
            // 3. Получаем имя файла из атрибута 'data-iframe-src'
            const iframeSrc = clickedSubTab.getAttribute('data-iframe-src');
            // 4. Меняем 'src' у iframe
            if (iframeSrc) {
                historyIframe.src = iframeSrc;
                console.log(`(Делегирование) Загрузка в iframe: ${iframeSrc}`);
            } else {
                console.warn("(Делегирование) Атрибут 'data-iframe-src' не найден у нажатой вкладки.");
            }
             // 5. Прокрутка контейнера вложенных вкладок
             clickedSubTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // --- Сюда можно добавить обработку других кликов внутри контента, если нужно ---
        // Например, для модальных окон галереи и т.п.
        // const clickedGalleryImage = event.target.closest('.gallery-item img');
        // if (clickedGalleryImage) {
        //     // Логика открытия изображения
        // }
    });

    // --- Инициализация при загрузке страницы ---
    const initialActiveMainTab = document.querySelector('.tab.active');
    if (initialActiveMainTab) {
        loadMainPageContent(initialActiveMainTab.getAttribute('data-page'));
    } else if (mainTabs.length > 0) {
        // Если нет активной по умолчанию, делаем активной первую и загружаем ее
        mainTabs[0].classList.add('active');
        loadMainPageContent(mainTabs[0].getAttribute('data-page'));
    }

    // --- Горизонтальная прокрутка ОСНОВНЫХ вкладок колесиком мыши ---
    if (mainTabsContainer) {
        mainTabsContainer.addEventListener('wheel', function(e) {
            if (this.scrollWidth > this.clientWidth) {
                e.preventDefault();
                this.scrollLeft += e.deltaY > 0 ? 60 : -60;
            }
        }, { passive: false });
    }

}); // Конец DOMContentLoaded
