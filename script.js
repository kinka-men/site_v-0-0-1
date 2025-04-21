document.addEventListener('DOMContentLoaded', function() {
    // --- Основные элементы DOM ---
    const mainTabs = document.querySelectorAll('.tab'); // Основные вкладки навигации
    const contentPlaceholder = document.getElementById('content-placeholder'); // Контейнер для загрузки контента
    const mainTabsContainer = document.querySelector('.tabs-container'); // Контейнер основных вкладок для скролла

    // --- Настройки для навигации в разделе "История" ---
    const historyTotalSections = 11; // Общее количество файлов (1.html ... 11.html)
    const historyFilePrefix = ''; // Путь к файлам истории (если в той же папке, то пустой)
    const historyFileSuffix = '.html';
    let currentHistorySectionIndex = 0; // Индекс текущего раздела (0 = 1.html, 1 = 2.html, ...)

    // --- ФУНКЦИЯ: Загрузка основного контента раздела ---
    async function loadMainPageContent(pageName) {
        // Показываем индикатор загрузки
        contentPlaceholder.innerHTML = '<p>Загрузка...</p>';
        const fileName = `${pageName}.html`;

        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                // Выводим статус ошибки для лучшей диагностики
                throw new Error(`Ошибка ${response.status} (${response.statusText}) при загрузке ${fileName}`);
            }
            const html = await response.text();
            contentPlaceholder.innerHTML = html; // Вставляем загруженный HTML

            // Если загружен раздел истории, инициализируем его специальную навигацию
            if (pageName === 'history') {
                // Небольшая задержка может помочь, если элементы появляются не мгновенно
                // Хотя с innerHTML обычно это не нужно, но на всякий случай
                setTimeout(initializeHistoryNavigation, 0);
            }

        } catch (error) {
            console.error("Не удалось загрузить основной контент:", error);
            contentPlaceholder.innerHTML = `<p style="color: red; text-align: center;">Не удалось загрузить раздел '${pageName}'.<br><small>${error.message}</small></p>`;
        }
    }

    // --- ФУНКЦИЯ: Обновление iframe и состояния навигации в истории ---
    function updateHistorySection(newIndex) {
        // Ищем элементы навигации истории КАЖДЫЙ РАЗ внутри #content-placeholder
        const historyIframe = contentPlaceholder.querySelector('#history-iframe');
        const prevButton = contentPlaceholder.querySelector('#history-prev');
        const nextButton = contentPlaceholder.querySelector('#history-next');
        const titleButton = contentPlaceholder.querySelector('#history-title');
        const dropdown = contentPlaceholder.querySelector('#history-dropdown');
        const dropdownLinks = contentPlaceholder.querySelectorAll('#history-dropdown a'); // Ссылки в dropdown

        // Проверка наличия ОСНОВНЫХ элементов (iframe и кнопок)
        if (!historyIframe || !prevButton || !nextButton || !titleButton || !dropdown) {
            console.error("Не найдены основные элементы навигации истории!");
            return; // Прерываем выполнение, если чего-то не хватает
        }

        // Валидация индекса
        if (newIndex < 0 || newIndex >= historyTotalSections) {
            console.warn(`Попытка переключиться на неверный индекс раздела: ${newIndex}`);
            return;
        }

        // Обновляем глобальный индекс
        currentHistorySectionIndex = newIndex;

        // Формируем имя файла и заголовок
        const fileName = `${historyFilePrefix}${currentHistorySectionIndex + 1}${historyFileSuffix}`;
        // Пытаемся получить реальный заголовок из соответствующей ссылки в dropdown
        let sectionTitle = `Раздел ${currentHistorySectionIndex + 1}`; // Заголовок по умолчанию
        if (dropdownLinks && dropdownLinks[currentHistorySectionIndex]) {
             sectionTitle = dropdownLinks[currentHistorySectionIndex].textContent || sectionTitle;
        }


        // 1. Обновляем SRC у iframe
        historyIframe.src = fileName;

        // 2. Обновляем текст кнопки-заголовка
        titleButton.textContent = sectionTitle;

        // 3. Обновляем состояние disabled у кнопок-стрелок
        prevButton.disabled = (currentHistorySectionIndex === 0);
        nextButton.disabled = (currentHistorySectionIndex === historyTotalSections - 1);

        // 4. Скрываем выпадающий список
        dropdown.style.display = 'none';

        console.log(`История: Переключено на раздел ${currentHistorySectionIndex + 1} (${fileName})`);
    }

    // --- ФУНКЦИЯ: Инициализация навигации ИСТОРИИ (после загрузки history.html) ---
    function initializeHistoryNavigation() {
        console.log("Инициализация навигации истории...");
        // Просто вызываем updateHistorySection с текущим (или начальным) индексом,
        // чтобы установить правильное состояние кнопок и заголовка для 1.html
        updateHistorySection(currentHistorySectionIndex);
    }

    // --- ОБРАБОТЧИК: Клик по ОСНОВНЫМ вкладкам ---
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            mainTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const pageName = this.getAttribute('data-page');

            // Сбрасываем индекс истории при переходе НА или С раздела истории
            if (pageName === 'history') {
                currentHistorySectionIndex = 0; // Всегда начинаем с первого при входе в раздел
            }

            loadMainPageContent(pageName);
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // --- ОБРАБОТЧИК: Делегирование кликов ВНУТРИ #content-placeholder ---
    contentPlaceholder.addEventListener('click', function(event) {
        const target = event.target; // Элемент, по которому кликнули

        // Проверяем, находимся ли мы внутри навигации истории
        const historyNav = target.closest('.history-navigation');
        const dropdownLink = target.closest('#history-dropdown a');
        const isClickInsideDropdown = target.closest('#history-dropdown');

        // --- Клик по стрелке НАЗАД ---
        if (target.matches('#history-prev') || target.closest('#history-prev')) {
            // Проверяем, что кнопка не отключена (на всякий случай)
            if (!target.closest('button').disabled) {
                 updateHistorySection(currentHistorySectionIndex - 1);
            }
        }
        // --- Клик по стрелке ВПЕРЕД ---
        else if (target.matches('#history-next') || target.closest('#history-next')) {
             if (!target.closest('button').disabled) {
                updateHistorySection(currentHistorySectionIndex + 1);
             }
        }
        // --- Клик по НАЗВАНИЮ раздела (открыть/закрыть dropdown) ---
        else if (target.matches('#history-title') || target.closest('#history-title')) {
            const dropdown = contentPlaceholder.querySelector('#history-dropdown');
            if (dropdown) {
                const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
                dropdown.style.display = isHidden ? 'block' : 'none';
                console.log(`Dropdown ${isHidden ? 'открыт' : 'закрыт'}`);
            } else {
                 console.error("Dropdown не найден при клике на title");
            }
        }
        // --- Клик по ССЫЛКЕ внутри dropdown ---
        else if (dropdownLink) {
             event.preventDefault(); // Отменяем переход по '#'
             const sectionIndex = parseInt(dropdownLink.getAttribute('data-section-index'), 10);
             if (!isNaN(sectionIndex)) {
                  updateHistorySection(sectionIndex); // Список закроется внутри этой функции
             } else {
                 console.warn("Не удалось получить section-index из ссылки dropdown");
             }
        }
        // --- Клик ВНЕ активных элементов навигации истории (для закрытия dropdown) ---
        else {
             const dropdown = contentPlaceholder.querySelector('#history-dropdown');
             // Закрываем, если он открыт И клик был не внутри самой навигации
             if (dropdown && dropdown.style.display === 'block' && !historyNav && !isClickInsideDropdown) {
                 dropdown.style.display = 'none';
                 console.log("Dropdown закрыт кликом вне области");
             }
        }

        // Сюда можно будет добавить обработку других интерактивных элементов,
        // загружаемых в #content-placeholder, например, для галереи.
        // const clickedImage = target.closest('.gallery-item img');
        // if (clickedImage) { /* ... */ }
    });


    // --- ИНИЦИАЛИЗАЦИЯ при первой загрузке страницы ---
    const initialActiveMainTab = document.querySelector('.tab.active');
    if (initialActiveMainTab) {
        loadMainPageContent(initialActiveMainTab.getAttribute('data-page'));
    } else if (mainTabs.length > 0) {
        // Если нет активной по умолчанию, делаем активной первую и загружаем ее
        mainTabs[0].classList.add('active');
        loadMainPageContent(mainTabs[0].getAttribute('data-page'));
    } else {
        // Если вообще нет вкладок, можно показать сообщение или загрузить что-то по умолчанию
        contentPlaceholder.innerHTML = '<p>Нет доступных разделов.</p>';
    }


    // --- Горизонтальная прокрутка ОСНОВНЫХ вкладок колесиком мыши ---
    if (mainTabsContainer) {
        mainTabsContainer.addEventListener('wheel', function(e) {
            // Прокручиваем только если есть горизонтальный скролл
            if (this.scrollWidth > this.clientWidth) {
                e.preventDefault(); // Предотвращаем вертикальный скролл страницы
                this.scrollLeft += e.deltaY > 0 ? 60 : -60; // Скорость прокрутки
            }
        }, { passive: false }); // passive: false нужен для preventDefault
    }

}); // Конец DOMContentLoaded
