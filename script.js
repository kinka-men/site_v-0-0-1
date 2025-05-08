// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('ServiceWorker зарегистрирован успешно:', registration.scope);
          
          // После успешной регистрации проверяем, нужно ли кэшировать ресурсы
          setTimeout(() => {
            checkAndPreloadResources();
          }, 2000); // Небольшая задержка для завершения загрузки страницы
        })
        .catch(error => {
          console.log('Ошибка при регистрации ServiceWorker:', error);
        });
    });
}

// Проверка наличия ресурсов в кэше перед загрузкой
async function checkAndPreloadResources() {
  // Проверяем, были ли уже загружены ресурсы
  if (localStorage.getItem('resourcesPreloaded')) {
    console.log('Ресурсы уже были предзагружены ранее');
    return;
  }
  
  console.log('Начинаем предварительную загрузку ресурсов...');
  
  // Предварительная загрузка HTML-файлов
  const htmlFiles = [
    'home.html',
    'history.html',
    'monuments.html',
    'archive.html',
    'items.html',
    'war-history.html',
    'svo.html',
    '1.html',
    '2.html',
    '3.html',
    '4.html',
    '5.html',
    '6.html',
    '7.html',
    '8.html',
    '9.html',
    '10.html',
    '11.html'
  ];
  
  // Загружаем HTML файлы
  for (const file of htmlFiles) {
    try {
      const isCached = await isResourceCached(file);
      if (!isCached) {
        await fetch(file);
      }
    } catch (err) {
      console.log(`Не удалось предзагрузить ${file}`, err);
    }
  }
  
  // Предварительная загрузка изображений с no-cors
  const imageUrls = [
    'https://archive.org/download/image2_20250424/image2.png',
    'https://archive.org/download/20151224_103912_20250425_145529/20151224_103912.jpg',
    'https://archive.org/download/20151224_103902_20250425_145418/20151224_103902.jpg',
    'https://archive.org/download/20151224_103905_20250425_145346/20151224_103905.jpg',
    'https://archive.org/download/20151224_103847_20250425_145311/20151224_103847.jpg',
    'https://archive.org/download/20151224_103817_20250425_145226/20151224_103817.jpg',
    'https://archive.org/download/20151224_103810_20250425_145153/20151224_103810.jpg',
    'https://archive.org/download/img-20250425-064007/IMG_20250425_063855.jpg',
    'https://archive.org/download/img-20250425-064007/IMG_20250425_063946.jpg',
    'https://archive.org/download/img-20250425-064007/IMG_20250425_063918.jpg',
    'https://archive.org/download/img-20250425-064007/IMG_20250425_064007.jpg'
  ];
  
  // Загружаем изображения, если они еще не в кэше
  for (const url of imageUrls) {
    try {
      const isCached = await isResourceCached(url);
      if (!isCached) {
        await fetch(url, { mode: 'no-cors' });
        console.log(`Предзагружен ресурс: ${url}`);
        
        // Дополнительно через Image для изображений
        const img = new Image();
        img.src = url;
      } else {
        console.log(`Ресурс уже в кэше: ${url}`);
      }
    } catch (err) {
      console.log(`Не удалось предзагрузить ${url}`, err);
    }
  }
  
  // Предварительная загрузка постеров для видео
  const posterUrls = [
    'https://archive.org/services/img/Marina_small_20250425_084033',
    'https://archive.org/services/img/T.Alesha_small_20250425_084121',
    'https://archive.org/services/img/Roma_small_20250425_084156',
    'https://archive.org/services/img/Ania_small_20250425_084243',
    'https://archive.org/services/img/Bal_zhinima_small_20250425_084348',
    'https://archive.org/services/img/Dasha_small_20250425_084634',
    'https://archive.org/services/img/O.Aleksei_small_20250425_084751',
    'https://archive.org/services/img/Il_ia_small_20250425_084957',
    'https://archive.org/services/img/Arsenii_small_20250425_085024',
    'https://archive.org/services/img/Fedor_small_20250425_085055',
    'https://archive.org/services/img/small_20250423',
    'https://archive.org/services/img/online-video-cutter.com-small'
  ];
  
  // Загружаем постеры, если они еще не в кэше
  for (const url of posterUrls) {
    try {
      const isCached = await isResourceCached(url);
      if (!isCached) {
        await fetch(url, { mode: 'no-cors' });
        console.log(`Предзагружен постер: ${url}`);
      } else {
        console.log(`Постер уже в кэше: ${url}`);
      }
    } catch (err) {
      console.log(`Не удалось предзагрузить постер ${url}`, err);
    }
  }
  
  // Отмечаем, что ресурсы были предзагружены
  localStorage.setItem('resourcesPreloaded', 'true');
  
  // После загрузки изображений начинаем проверять видео
  setTimeout(() => {
    checkAndCacheVideos();
  }, 3000);
}

// Функция для проверки наличия ресурса в кэше
async function isResourceCached(url) {
  try {
    if (!('caches' in window)) {
      return false;
    }
    
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      if (response) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Ошибка при проверке кэша:', error);
    return false;
  }
}

// Функция для принудительного кэширования видео
function cacheVideo(videoUrl) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_VIDEO',
      url: videoUrl
    });
    console.log('Запрос на кэширование видео отправлен:', videoUrl);
    return true;
  }
  return false;
}

// Функция для проверки и кэширования всех видео
async function checkAndCacheVideos() {
  // Проверяем, были ли уже кэшированы видео
  if (localStorage.getItem('videosCached')) {
    console.log('Видео уже были кэшированы ранее');
    return;
  }
  
  console.log('Начинаем кэширование всех видео...');
  
  const videoUrls = [
    'https://archive.org/download/Marina_small_20250425_084033/%D0%9C%D0%B0%D1%80%D0%B8%D0%BD%D0%B0_small.mp4',
    'https://archive.org/download/T.Alesha_small_20250425_084121/%D0%A2.%D0%90%D0%BB%D0%B5%D1%88%D0%B0_small.mp4',
    'https://archive.org/download/Roma_small_20250425_084156/%D0%A0%D0%BE%D0%BC%D0%B0_small.mp4',
    'https://archive.org/download/Ania_small_20250425_084243/%D0%90%D0%BD%D1%8F_small.mp4',
    'https://archive.org/download/Bal_zhinima_small_20250425_084348/%D0%91%D0%B0%D0%BB%D1%8C%D0%B6%D0%B8%D0%BD%D0%B8%D0%BC%D0%B0_small.mp4',
    'https://archive.org/download/Dasha_small_20250425_084634/%D0%94%D0%B0%D1%88%D0%B0_small.mp4',
    'https://archive.org/download/O.Aleksei_small_20250425_084751/%D0%9E.%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B5%D0%B9_small.mp4',
    'https://archive.org/download/Il_ia_small_20250425_084957/%D0%98%D0%BB%D1%8C%D1%8F_small.mp4',
    'https://archive.org/download/Arsenii_small_20250425_085024/%D0%90%D1%80%D1%81%D0%B5%D0%BD%D0%B8%D0%B9_small.mp4',
    'https://archive.org/download/Fedor_small_20250425_085055/%D0%A4%D0%B5%D0%B4%D0%BE%D1%80_small.mp4',
    'https://archive.org/download/small_20250423/%D0%92%D0%BE%D0%B9%D0%BD%D0%B0%20%D0%B2%20%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D0%B8%20%D0%BC%D0%BE%D0%B5%D0%B9%20%D1%81%D0%B5%D0%BC%D1%8C%D0%B8_small.mp4',
    'https://archive.org/download/small_20250423/%D0%92%D0%BE%D0%B9%D0%BD%D0%B0%20%D0%B2%20%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D0%B8%20%D1%81%D0%B5%D0%BC%D1%8C%D0%B8_small.mp4',
    'https://archive.org/download/online-video-cutter.com-small/Герои%20села%20Улюн%20(online-video-cutter.com)_small.mp4'
  ];
  
  // Кэшируем видео с задержкой, чтобы не перегружать сеть
  let index = 0;
  
  async function cacheNextVideo() {
    if (index < videoUrls.length) {
      const url = videoUrls[index];
      
      // Проверяем, есть ли видео уже в кэше
      const isCached = await isResourceCached(url);
      
      if (!isCached) {
        cacheVideo(url);
        console.log(`Запущено кэширование видео ${index + 1} из ${videoUrls.length}: ${url}`);
      } else {
        console.log(`Видео уже в кэше: ${url}`);
      }
      
      index++;
      
      // Задержка 3 секунды между запросами на кэширование
      setTimeout(cacheNextVideo, 3000);
    } else {
      console.log('Кэширование всех видео завершено');
      localStorage.setItem('videosCached', 'true');
    }
  }
  
  // Запускаем процесс кэширования
  cacheNextVideo();
}

// Автоматическое кэширование видео при просмотре
document.addEventListener('DOMContentLoaded', () => {
  // Находим все видео на странице
  const videos = document.querySelectorAll('video');
  
  videos.forEach(video => {
    // Получаем URL видео
    const sources = video.querySelectorAll('source');
    sources.forEach(source => {
      const videoUrl = source.src;
      if (videoUrl) {
        // Проверяем, есть ли видео в кэше перед кэшированием
        isResourceCached(videoUrl).then(isCached => {
          if (!isCached) {
            // Автоматически кэшируем видео при взаимодействии с ним
            video.addEventListener('play', () => {
              cacheVideo(videoUrl);
            }, { once: true }); // Запускаем только один раз
          }
        });
      }
    });
  });
});

// Функция для проверки состояния сети
function updateOnlineStatus() {
  const status = navigator.onLine ? 'онлайн' : 'офлайн';
  console.log(`Статус сети: ${status}`);
  
  // Можно добавить индикатор состояния сети на страницу
  const statusIndicator = document.getElementById('network-status');
  if (statusIndicator) {
    statusIndicator.textContent = `Режим: ${status}`;
    statusIndicator.className = navigator.onLine ? 'online' : 'offline';
  }
}

// Отслеживаем изменения состояния сети
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // Проверяем при загрузке

// Остальной код вашего script.js

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
        contentPlaceholder.innerHTML = '<div class="loader"><div class="spinner"></div><p>Загрузка...</p></div>';
        const fileName = `${pageName}.html`;
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`Ошибка ${response.status} (${response.statusText}) при загрузке ${fileName}`);
            }
            const html = await response.text();
            contentPlaceholder.innerHTML = html;

            // Инициализация разделов после загрузки контента
            if (pageName === 'history') {
                requestAnimationFrame(initializeHistoryNavigation);
            }
            if (pageName === 'war-history') {
                requestAnimationFrame(initAccordions);
            }
            if (pageName === 'items') {
                requestAnimationFrame(initPhotoGallery);
            }
            
            // Сохраняем текущую страницу в localStorage
            localStorage.setItem('currentPage', pageName);
            
            // Обновляем URL без перезагрузки страницы
            const newUrl = `#page=${pageName}`;
            if (window.location.hash !== newUrl) {
                window.history.pushState({ page: pageName }, '', newUrl);
            }
        } catch (error) {
            console.error("Не удалось загрузить основной контент:", error);
            contentPlaceholder.innerHTML = `
                <div class="error-message">
                    <h2>Ошибка загрузки страницы</h2>
                    <p>${error.message}</p>
                    <button onclick="document.querySelector('.tab[data-page=home]').click()">Вернуться на главную</button>
                </div>
            `;
        }
    }

    // --- ФУНКЦИЯ: Обновление iframe и состояния навигации в истории ---
    function updateHistorySection(newIndex) {
        const historyIframe = contentPlaceholder.querySelector('#history-iframe');
        const prevButton = contentPlaceholder.querySelector('#history-prev');
        const nextButton = contentPlaceholder.querySelector('#history-next');
        const titleSummary = contentPlaceholder.querySelector('#history-title');
        const detailsElement = contentPlaceholder.querySelector('#history-details');
        const dropdownLinks = contentPlaceholder.querySelectorAll('#history-dropdown a');

        if (!historyIframe || !prevButton || !nextButton || !titleSummary || !detailsElement) {
            console.error("Не найдены основные элементы навигации истории при обновлении!");
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

        if (historyIframe) historyIframe.src = fileName;
        if (titleSummary) titleSummary.textContent = sectionTitle;
        if (prevButton) prevButton.disabled = (currentHistorySectionIndex === 0);
        if (nextButton) nextButton.disabled = (currentHistorySectionIndex === historyTotalSections - 1);
        if (detailsElement) detailsElement.removeAttribute('open');
    }

    // --- ФУНКЦИЯ: Инициализация навигации ИСТОРИИ ---
    function initializeHistoryNavigation() {
        const detailsElement = contentPlaceholder.querySelector('#history-details');
        if (detailsElement) detailsElement.removeAttribute('open');
        updateHistorySection(currentHistorySectionIndex);
    }

    // --- ФУНКЦИЯ: Инициализация аккордеонов ---
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

    // --- ФУНКЦИЯ: Инициализация фотогалереи с модальным увеличением ---
    function initPhotoGallery() {
        const gallery = document.querySelector('.photo-gallery');
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modalImg');
        const closeBtn = document.getElementById('closeBtn');
        const zoomBtn = document.getElementById('zoomBtn');
        const modalContent = document.getElementById('modalContent');
        let isFullscreen = false;

        if (!gallery || !modal) return;

        gallery.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG') {
                modalImg.src = e.target.src;
                modal.classList.add('open');
                modalContent.classList.remove('fullscreen');
                isFullscreen = false;
            }
        });

        closeBtn.addEventListener('click', function() {
            modal.classList.remove('open');
            modalImg.src = '';
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('open');
                modalImg.src = '';
            }
        });

        zoomBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            isFullscreen = !isFullscreen;
            if (isFullscreen) {
                modalContent.classList.add('fullscreen');
            } else {
                modalContent.classList.remove('fullscreen');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (modal.classList.contains('open') && e.key === 'Escape') {
                modal.classList.remove('open');
                modalImg.src = '';
            }
        });
    }

    // --- ФУНКЦИЯ: Установка активной вкладки ---
    function setActiveTab(pageName) {
        mainTabs.forEach(tab => {
            if (tab.getAttribute('data-page') === pageName) {
                tab.classList.add('active');
                // Прокручиваем к активной вкладке, если она не видна
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                tab.classList.remove('active');
            }
        });
    }

    // --- ОБРАБОТЧИК: Клик по ОСНОВНЫМ вкладкам ---
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            setActiveTab(pageName);
            if (pageName === 'history') {
                currentHistorySectionIndex = 0;
            }
            loadMainPageContent(pageName);
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
                  updateHistorySection(sectionIndex);
             }
        }

        // --- Клик по ЗАГОЛОВКУ <summary> ---
        const titleSummary = target.closest('#history-title');
        if (titleSummary) {
            // Можно добавить логику, если нужно
        }

        // --- Закрытие <details> при клике ВНЕ его области ---
        const detailsElement = contentPlaceholder.querySelector('#history-details');
        if (detailsElement && detailsElement.hasAttribute('open') && !target.closest('#history-details')) {
            if (!target.closest('#history-title')) {
                detailsElement.removeAttribute('open');
            }
        }
    });

    // --- Обработчик изменения хэша URL (для навигации по истории) ---
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash.startsWith('#page=')) {
            const pageName = hash.replace('#page=', '');
            setActiveTab(pageName);
            loadMainPageContent(pageName);
        }
    });

    // --- Обработчик кнопки "назад" в браузере ---
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            setActiveTab(event.state.page);
            loadMainPageContent(event.state.page);
        } else {
            // Если нет состояния, проверяем хэш
            const hash = window.location.hash;
            if (hash.startsWith('#page=')) {
                const pageName = hash.replace('#page=', '');
                setActiveTab(pageName);
                loadMainPageContent(pageName);
            }
        }
    });

    // --- ИНИЦИАЛИЗАЦИЯ при первой загрузке страницы ---
    function initializePage() {
        // Проверяем хэш URL
        const hash = window.location.hash;
        let pageName = 'home'; // По умолчанию
        
        if (hash.startsWith('#page=')) {
            pageName = hash.replace('#page=', '');
        } else {
            // Если хэша нет, проверяем localStorage
            const savedPage = localStorage.getItem('currentPage');
            if (savedPage) {
                pageName = savedPage;
                // Обновляем URL без перезагрузки страницы
                window.history.replaceState({ page: pageName }, '', `#page=${pageName}`);
            }
        }
        
        setActiveTab(pageName);
        loadMainPageContent(pageName);
    }

    // Запускаем инициализацию
    initializePage();

    // --- Горизонтальная прокрутка ОСНОВНЫХ вкладок колесиком мыши ---
    if (mainTabsContainer) {
        mainTabsContainer.addEventListener('wheel', function(e) {
            if (this.scrollWidth > this.clientWidth) {
                e.preventDefault();
                this.scrollLeft += e.deltaY > 0 ? 60 : -60;
            }
        }, { passive: false });
    }
});

// Глобальные переменные для работы с изображением
let itemsZoomLevel = 1;
let itemsMaxZoom = 5;
let itemsIsDragging = false;
let itemsStartX, itemsStartY;
let itemsTranslateX = 0, itemsTranslateY = 0;

// Делегирование событий для галереи предметов
document.addEventListener('click', function(event) {
    // Проверяем, был ли клик по элементу галереи
    let galleryItem = event.target.closest('.gallery-item');
    if (galleryItem && document.getElementById('items-gallery')) {
        const imgSrc = galleryItem.getAttribute('data-src');
        const modalImage = document.getElementById('items-modalImage');
        const modal = document.getElementById('items-imageModal');
        
        if (modalImage && modal) {
            // Сбрасываем зум и позицию
            resetImageZoomAndPosition();
            
            modalImage.src = imgSrc;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокировка прокрутки
        }
    }
    
    // Обработка клика по кнопке закрытия
    if (event.target.closest('#items-closeModal')) {
        closeItemsModal();
    }
    
    // Обработка клика по фону модального окна
    if (event.target.classList.contains('items-modal')) {
        closeItemsModal();
    }
    
    // Обработка клика по кнопке полноэкранного режима
    if (event.target.closest('#items-fullscreenBtn')) {
        const modalContent = document.querySelector('.items-modal-content');
        if (modalContent) {
            modalContent.classList.toggle('fullscreen');
        }
    }
    
    // Обработка клика по кнопке увеличения (зум +)
    if (event.target.closest('#items-zoomInBtn')) {
        zoomImage(0.5); // Увеличиваем на 50%
    }
    
    // Обработка клика по кнопке уменьшения (зум -)
    if (event.target.closest('#items-zoomOutBtn')) {
        zoomImage(-0.5); // Уменьшаем на 50%
    }
    
    // Обработка клика по кнопке сброса зума
    if (event.target.closest('#items-resetZoomBtn')) {
        resetImageZoomAndPosition();
    }
});

// Обработка клавиши Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeItemsModal();
    }
});

// Обработчики для перетаскивания изображения
document.addEventListener('mousedown', startDragging);
document.addEventListener('touchstart', startDragging, { passive: false });

document.addEventListener('mousemove', moveImage);
document.addEventListener('touchmove', moveImage, { passive: false });

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);
document.addEventListener('mouseleave', stopDragging);

// Функция для закрытия модального окна
function closeItemsModal() {
    const modal = document.getElementById('items-imageModal');
    const modalContent = document.querySelector('.items-modal-content');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Разблокировка прокрутки
        
        if (modalContent) {
            setTimeout(() => {
                modalContent.classList.remove('fullscreen');
                resetImageZoomAndPosition();
            }, 300);
        }
    }
}

// Функция для изменения масштаба изображения
function zoomImage(delta) {
    const modalImage = document.getElementById('items-modalImage');
    const zoomLevelElement = document.getElementById('items-zoomLevel');
    
    if (!modalImage) return;
    
    // Изменяем уровень зума
    itemsZoomLevel += delta;
    
    // Ограничиваем зум от 1 до itemsMaxZoom
    if (itemsZoomLevel < 1) itemsZoomLevel = 1;
    if (itemsZoomLevel > itemsMaxZoom) itemsZoomLevel = itemsMaxZoom;
    
    // Применяем трансформацию
    applyTransform(modalImage);
    
    // Обновляем отображение уровня зума
    if (zoomLevelElement) {
        zoomLevelElement.textContent = Math.round(itemsZoomLevel * 100) + '%';
    }
}

// Функция для начала перетаскивания
function startDragging(e) {
    const modalImage = document.getElementById('items-modalImage');
    const imageContainer = document.getElementById('items-imageContainer');
    
    if (!modalImage || !imageContainer) return;
    
    // Проверяем, что клик был по изображению и зум больше 1
    if ((e.target === modalImage || e.target.closest('#items-modalImage')) && itemsZoomLevel > 1) {
        e.preventDefault();
        itemsIsDragging = true;
        
        // Получаем начальные координаты
        if (e.type === 'mousedown') {
            itemsStartX = e.clientX;
            itemsStartY = e.clientY;
        } else if (e.type === 'touchstart') {
            itemsStartX = e.touches[0].clientX;
            itemsStartY = e.touches[0].clientY;
        }
    }
}

// Функция для перемещения изображения
function moveImage(e) {
    const modalImage = document.getElementById('items-modalImage');
    
    if (!itemsIsDragging || !modalImage) return;
    
    e.preventDefault();
    
    let currentX, currentY;
    
    if (e.type === 'mousemove') {
        currentX = e.clientX;
        currentY = e.clientY;
    } else if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
    }
    
    // Вычисляем смещение
    const deltaX = currentX - itemsStartX;
    const deltaY = currentY - itemsStartY;
    
    // Обновляем позицию
    itemsTranslateX += deltaX;
    itemsTranslateY += deltaY;
    
    // Ограничиваем перемещение в зависимости от зума
    const maxTranslate = (itemsZoomLevel - 1) * 100;
    itemsTranslateX = Math.max(-maxTranslate, Math.min(maxTranslate, itemsTranslateX));
    itemsTranslateY = Math.max(-maxTranslate, Math.min(maxTranslate, itemsTranslateY));
    
    // Применяем трансформацию
    applyTransform(modalImage);
    
    // Обновляем начальные координаты
    itemsStartX = currentX;
    itemsStartY = currentY;
}

// Функция для остановки перетаскивания
function stopDragging() {
    itemsIsDragging = false;
}

// Функция для применения трансформации к изображению
function applyTransform(element) {
    if (!element) return;
    
    element.style.transform = `scale(${itemsZoomLevel}) translate(${itemsTranslateX / itemsZoomLevel}px, ${itemsTranslateY / itemsZoomLevel}px)`;
}

// Функция для сброса зума и позиции изображения
function resetImageZoomAndPosition() {
    const modalImage = document.getElementById('items-modalImage');
    const zoomLevelElement = document.getElementById('items-zoomLevel');
    
    if (!modalImage) return;
    
    itemsZoomLevel = 1;
    itemsTranslateX = 0;
    itemsTranslateY = 0;
    
    applyTransform(modalImage);
    
    if (zoomLevelElement) {
        zoomLevelElement.textContent = '100%';
    }
}

// Экспортируем функции для доступа из других модулей
window.resetImageZoomAndPosition = resetImageZoomAndPosition;
window.closeItemsModal = closeItemsModal;
window.zoomImage = zoomImage;
