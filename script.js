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
        contentPlaceholder.innerHTML = '<p>Загрузка...</p>';
        const fileName = `${pageName}.html`;
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`Ошибка ${response.status} (${response.statusText}) при загрузке ${fileName}`);
            }
            const html = await response.text();
            contentPlaceholder.innerHTML = html;
            if (pageName === 'history') {
                // Используем requestAnimationFrame для большей надежности,
                // чтобы браузер успел отрисовать DOM перед инициализацией
                requestAnimationFrame(initializeHistoryNavigation);
            }
        } catch (error) {
            console.error("Не удалось загрузить основной контент:", error);
            contentPlaceholder.innerHTML = `<p style="color: red; text-align: center;">Не удалось загрузить раздел '${pageName}'.<br><small>${error.message}</small></p>`;
        }
    }

    // --- ФУНКЦИЯ: Обновление iframe и состояния навигации в истории ---
    function updateHistorySection(newIndex) {
        const historyIframe = contentPlaceholder.querySelector('#history-iframe');
        const prevButton = contentPlaceholder.querySelector('#history-prev');
        const nextButton = contentPlaceholder.querySelector('#history-next');
        const titleButton = contentPlaceholder.querySelector('#history-title');
        const dropdown = contentPlaceholder.querySelector('#history-dropdown');
        const dropdownLinks = contentPlaceholder.querySelectorAll('#history-dropdown a');

        if (!historyIframe || !prevButton || !nextButton || !titleButton || !dropdown) {
            console.error("Не найдены основные элементы навигации истории при обновлении!");
            // Можно добавить return; если критично, но лучше попытаться обновить что можно
        }

        if (newIndex < 0 || newIndex >= historyTotalSections) {
            console.warn(`Попытка переключиться на неверный индекс раздела: ${newIndex}`);
            return;
        }

        currentHistorySectionIndex = newIndex;
        const fileName = `${historyFilePrefix}${currentHistorySectionIndex + 1}${historyFileSuffix}`;
        let sectionTitle = `Раздел ${currentHistorySectionIndex + 1}`; // Заголовок по умолчанию
        if (dropdownLinks && dropdownLinks[currentHistorySectionIndex]) {
             sectionTitle = dropdownLinks[currentHistorySectionIndex].textContent || sectionTitle;
        }

        // 1. Обновляем SRC у iframe (только если он найден)
        if (historyIframe) {
             historyIframe.src = fileName;
        }

        // 2. Обновляем текст кнопки-заголовка (только если она найдена)
        if (titleButton) {
            titleButton.textContent = sectionTitle;
        }

        // 3. Обновляем состояние disabled у кнопок-стрелок (только если они найдены)
        if (prevButton) {
             prevButton.disabled = (currentHistorySectionIndex === 0);
        }
         if (nextButton) {
            nextButton.disabled = (currentHistorySectionIndex === historyTotalSections - 1);
         }

        // 4. Скрываем выпадающий список, удаляя класс (только если он найден)
        if (dropdown) {
             dropdown.classList.remove('visible');
        }

        console.log(`История: Переключено на раздел ${currentHistorySectionIndex + 1} (${fileName})`);
    }

    // --- ФУНКЦИЯ: Инициализация навигации ИСТОРИИ (после загрузки history.html) ---
    function initializeHistoryNavigation() {
        console.log("Инициализация навигации истории...");
        updateHistorySection(currentHistorySectionIndex);
    }

    // --- ОБРАБОТЧИК: Клик по ОСНОВНЫМ вкладкам ---
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            mainTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const pageName = this.getAttribute('data-page');
            if (pageName === 'history') {
                currentHistorySectionIndex = 0; // Сброс индекса при входе
            }
            loadMainPageContent(pageName);
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // --- ОБРАБОТЧИК: Делегирование кликов ВНУТРИ #content-placeholder ---
    contentPlaceholder.addEventListener('click', function(event) {
        const target = event.target;

        // --- Клик по стрелке НАЗАД ---
        const prevBtn = target.closest('#history-prev');
        if (prevBtn && !prevBtn.disabled) {
            updateHistorySection(currentHistorySectionIndex - 1);
            return; // Выходим, чтобы не сработали другие проверки
        }

        // --- Клик по стрелке ВПЕРЕД ---
        const nextBtn = target.closest('#history-next');
        if (nextBtn && !nextBtn.disabled) {
            updateHistorySection(currentHistorySectionIndex + 1);
            return;
        }

        // --- Клик по НАЗВАНИЮ раздела (открыть/закрыть dropdown) ---
        const titleBtn = target.closest('#history-title');
        if (titleBtn) {
            const dropdown = contentPlaceholder.querySelector('#history-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('visible');
                console.log(`Dropdown ${dropdown.classList.contains('visible') ? 'открыт' : 'закрыт'}`);
            } else { console.error("Dropdown не найден при клике на title"); }
            return;
        }

        // --- Клик по ССЫЛКЕ внутри dropdown ---
        const dropdownLink = target.closest('#history-dropdown a');
        if (dropdownLink) {
             event.preventDefault();
             const sectionIndex = parseInt(dropdownLink.getAttribute('data-section-index'), 10);
             if (!isNaN(sectionIndex)) {
                  updateHistorySection(sectionIndex);
             } else { console.warn("Не удалось получить section-index из ссылки dropdown"); }
             return; // Предотвращаем закрытие по клику на ссылку
        }

        // --- Клик ВНЕ активных элементов навигации истории (для закрытия dropdown) ---
        const dropdownVisible = contentPlaceholder.querySelector('#history-dropdown.visible');
        // Закрываем, если он видимый И клик был не внутри самой навигации
        if (dropdownVisible && !target.closest('.history-navigation')) {
             dropdownVisible.classList.remove('visible');
             console.log("Dropdown закрыт кликом вне области");
        }

    });


    // --- ИНИЦИАЛИЗАЦИЯ при первой загрузке страницы ---
    const initialActiveMainTab = document.querySelector('.tab.active');
    if (initialActiveMainTab) {
        loadMainPageContent(initialActiveMainTab.getAttribute('data-page'));
    } else if (mainTabs.length > 0) {
        mainTabs[0].classList.add('active');
        loadMainPageContent(mainTabs[0].getAttribute('data-page'));
    } else {
        contentPlaceholder.innerHTML = '<p>Нет доступных разделов.</p>';
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
