document.addEventListener('DOMContentLoaded', function() {
    // --- Основные элементы DOM ---
    const mainTabs = document.querySelectorAll('.tab');
    const contentPlaceholder = document.getElementById('content-placeholder');
    const mainTabsContainer = document.querySelector('.tabs-container');

    // --- Настройки для навигации в разделе "История" ---
    const historyTotalSections = 11;
    const historyFilePrefix = '';
    const historyFileSuffix = '.html';
    let currentHistorySectionIndex = 0;

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
        const titleSummary = contentPlaceholder.querySelector('#history-title'); // <summary>
        const detailsElement = contentPlaceholder.querySelector('#history-details'); // <details>
        const dropdownLinks = contentPlaceholder.querySelectorAll('#history-dropdown a');

        if (!historyIframe || !prevButton || !nextButton || !titleSummary || !detailsElement) {
            console.error("Не найдены основные элементы навигации истории при обновлении!");
            // Можно добавить return; если критично
        }

        if (newIndex < 0 || newIndex >= historyTotalSections) {
            console.warn(`Попытка переключиться на неверный индекс раздела: ${newIndex}`);
            return;
        }

        currentHistorySectionIndex = newIndex;
        const fileName = `${historyFilePrefix}${currentHistorySectionIndex + 1}${historyFileSuffix}`;
        let sectionTitle = `Раздел ${currentHistorySectionIndex + 1}`;
        if (dropdownLinks && dropdownLinks[currentHistorySectionIndex]) {
             sectionTitle = dropdownLinks[currentHistorySectionIndex].textContent || sectionTitle;
        }

        // Обновляем iframe (если найден)
        if (historyIframe) historyIframe.src = fileName;
        // Обновляем текст <summary> (если найден)
        if (titleSummary) titleSummary.textContent = sectionTitle;
        // Обновляем состояние кнопок (если найдены)
        if (prevButton) prevButton.disabled = (currentHistorySectionIndex === 0);
        if (nextButton) nextButton.disabled = (currentHistorySectionIndex === historyTotalSections - 1);
        // Закрываем <details> (если найден)
        if (detailsElement) detailsElement.removeAttribute('open');

        console.log(`История: Переключено на раздел ${currentHistorySectionIndex + 1} (${fileName})`);
    }

    // --- ФУНКЦИЯ: Инициализация навигации ИСТОРИИ ---
    function initializeHistoryNavigation() {
        console.log("Инициализация навигации истории (details/summary)...");
        const detailsElement = contentPlaceholder.querySelector('#history-details');
        if (detailsElement) detailsElement.removeAttribute('open'); // Убедимся, что закрыт
        updateHistorySection(currentHistorySectionIndex); // Установим начальное состояние
    }

    // --- ОБРАБОТЧИК: Клик по ОСНОВНЫМ вкладкам ---
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            mainTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const pageName = this.getAttribute('data-page');
            if (pageName === 'history') {
                currentHistorySectionIndex = 0;
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
            return;
        }

        // --- Клик по стрелке ВПЕРЕД ---
        const nextBtn = target.closest('#history-next');
        if (nextBtn && !nextBtn.disabled) {
            updateHistorySection(currentHistorySectionIndex + 1);
            return;
        }

        // --- Клик по ССЫЛКЕ внутри dropdown ---
        const dropdownLink = target.closest('#history-dropdown a');
        if (dropdownLink) {
             event.preventDefault();
             const sectionIndex = parseInt(dropdownLink.getAttribute('data-section-index'), 10);
             if (!isNaN(sectionIndex)) {
                  updateHistorySection(sectionIndex); // Список закроется в этой функции
             } else { console.warn("Не удалось получить section-index из ссылки dropdown"); }
             // Не делаем return, чтобы стандартное поведение details (закрытие) тоже сработало, если нужно
        }

        // --- Клик по ЗАГОЛОВКУ <summary> ---
        // Явных действий не требуется, браузер сам откроет/закроет
        const titleSummary = target.closest('#history-title');
        if (titleSummary) {
            console.log("Клик по summary");
            // Если нужно закрывать другие открытые <details> на странице (если их будет несколько),
            // можно добавить логику здесь, но сейчас это не требуется.
        }

        // --- Закрытие <details> при клике ВНЕ его области ---
        // Стандартное поведение обычно закрывает details при потере фокуса,
        // но можно добавить явное закрытие для большей надежности
        const detailsElement = contentPlaceholder.querySelector('#history-details');
        if (detailsElement && detailsElement.hasAttribute('open') && !target.closest('#history-details')) {
             // Дополнительная проверка: не был ли клик на самом summary (чтобы не закрыть сразу после открытия)
            if (!target.closest('#history-title')) {
                 detailsElement.removeAttribute('open');
                 console.log("Dropdown (<details>) закрыт кликом вне области");
            }
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
// --- Аккордеоны (уникальные классы, не конфликтуют с Bootstrap и др.) ---
document.addEventListener('DOMContentLoaded', function() {
    // Открытие/закрытие аккордеонов по клику
    document.querySelectorAll('.my-accordion-header').forEach(header => {
      header.addEventListener('click', function() {
        // Если нужно, чтобы только один аккордеон был открыт:
        document.querySelectorAll('.my-accordion').forEach(acc => {
          if (acc !== this.parentElement) acc.classList.remove('open');
        });
        this.parentElement.classList.toggle('open');
      });
    });
    // По умолчанию открыт аккордеон с презентациями (можно поменять на видео)
    document.getElementById('pdf-accordion').classList.add('open');
  });

  function initMyAccordions() {
    document.querySelectorAll('.my-accordion-header').forEach(header => {
      header.onclick = function() {
        document.querySelectorAll('.my-accordion').forEach(acc => {
          if (acc !== this.parentElement) acc.classList.remove('open');
        });
        this.parentElement.classList.toggle('open');
      };
    });
    // По умолчанию открыть аккордеон с презентациями, если есть
    const pdfAcc = document.getElementById('pdf-accordion');
    if (pdfAcc) pdfAcc.classList.add('open');
  }

  contentPlaceholder.innerHTML = html;
initMyAccordions();

// В конец функции loadMainPageContent добавь:
if (pageName === 'war-history') {
    initAccordions();
  }
  
  // Добавь эту функцию в script.js:
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.classList.toggle('active');
      });
    });
    
    // Открыть первый аккордеон по умолчанию
    const firstAccordion = document.querySelector('.accordion');
    if (firstAccordion) {
      firstAccordion.classList.add('active');
    }
  }