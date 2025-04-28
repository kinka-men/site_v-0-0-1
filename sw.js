const CACHE_NAME = 'museum-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  
  // Основные страницы
  'home.html',
  'history.html',
  'monuments.html',
  'archive.html',
  'items.html',
  'war-history.html',
  'svo.html',
  
  // Дополнительные HTML файлы (от 1 до 11)
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
  '11.html',
  
  // Изображения георгиевской ленты
  'https://archive.org/download/image2_20250424/image2.png',
  
  // Изображения предметов эпохи
  'https://archive.org/download/20151224_103912_20250425_145529/20151224_103912.jpg',
  'https://archive.org/download/20151224_103902_20250425_145418/20151224_103902.jpg',
  'https://archive.org/download/20151224_103905_20250425_145346/20151224_103905.jpg',
  'https://archive.org/download/20151224_103847_20250425_145311/20151224_103847.jpg',
  'https://archive.org/download/20151224_103817_20250425_145226/20151224_103817.jpg',
  'https://archive.org/download/20151224_103810_20250425_145153/20151224_103810.jpg',
  
  // Дополнительные изображения
  'https://archive.org/download/img-20250425-064007/IMG_20250425_063855.jpg',
  'https://archive.org/download/img-20250425-064007/IMG_20250425_063946.jpg',
  'https://archive.org/download/img-20250425-064007/IMG_20250425_063918.jpg',
  'https://archive.org/download/img-20250425-064007/IMG_20250425_064007.jpg',
  
  // Постеры для видео
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
  'https://archive.org/services/img/online-video-cutter.com-small',
  
  // Видеофайлы
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
  'https://archive.org/download/online-video-cutter.com-small/Герои%20села%20Улюн%20(online-video-cutter.com)_small.mp4',
  
  // Офлайн-страница
  'offline.html'
];

// Максимальный размер файла для кэширования (120 МБ)
const MAX_FILE_SIZE = 120 * 1024 * 1024;

// Установка Service Worker и кэширование ресурсов
self.addEventListener('install', event => {
  self.skipWaiting(); // Принудительная активация нового Service Worker
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Открыт кэш');
        
        // Кэшируем ресурсы по частям, чтобы избежать проблем с большими файлами
        // Сначала кэшируем HTML, CSS и JS файлы
        const essentialResources = urlsToCache.filter(url => 
          url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js') || 
          url === '/' || url.includes('/services/img/')
        );
        
        return cache.addAll(essentialResources).then(() => {
          console.log('Основные ресурсы кэшированы');
          
          // Затем кэшируем изображения
          const imageResources = urlsToCache.filter(url => 
            url.endsWith('.jpg') || url.endsWith('.jpeg') || 
            url.endsWith('.png') || url.endsWith('.gif') || 
            url.endsWith('.svg')
          );
          
          return cache.addAll(imageResources).then(() => {
            console.log('Изображения кэшированы');
            
            // В последнюю очередь кэшируем видео
            const videoResources = urlsToCache.filter(url => 
              url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')
            );
            
            // Для видео используем отдельные запросы с таймаутами
            const videoPromises = videoResources.map(url => {
              // Создаем контроллер для возможности отмены запроса
              const controller = new AbortController();
              const signal = controller.signal;
              
              // Устанавливаем таймаут 30 секунд для каждого видео
              const timeoutId = setTimeout(() => controller.abort(), 30000);
              
              return fetch(url, { signal })
                .then(response => {
                  clearTimeout(timeoutId);
                  
                  if (!response || response.status !== 200) {
                    console.log(`Не удалось загрузить видео ${url}: статус ${response?.status}`);
                    return;
                  }
                  
                  // Проверяем размер файла
                  const contentLength = response.headers.get('content-length');
                  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
                    console.log(`Видео ${url} слишком большое для кэширования (${Math.round(parseInt(contentLength, 10) / 1024 / 1024)} МБ)`);
                    return;
                  }
                  
                  return cache.put(url, response);
                })
                .catch(err => {
                  clearTimeout(timeoutId);
                  console.log(`Ошибка при кэшировании видео ${url}:`, err.message);
                });
            });
            
            return Promise.allSettled(videoPromises).then(results => {
              const succeeded = results.filter(r => r.status === 'fulfilled').length;
              console.log(`Видео кэшированы: ${succeeded} из ${videoResources.length}`);
            });
          });
        });
      })
  );
});

// Перехват запросов и обслуживание из кэша
self.addEventListener('fetch', event => {
  // Стратегия: сначала кэш, затем сеть с обновлением кэша
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Возвращаем кэшированный ответ, если он есть
        if (cachedResponse) {
          // Асинхронно обновляем кэш для следующего раза
          fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                // Проверяем размер файла
                const contentLength = response.headers.get('content-length');
                if (!contentLength || parseInt(contentLength, 10) <= MAX_FILE_SIZE) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, response.clone()))
                    .catch(err => console.log('Ошибка при обновлении кэша:', err));
                }
              }
            })
            .catch(() => {/* Игнорируем ошибки обновления */});
          
          return cachedResponse;
        }
        
        // Если нет в кэше, делаем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Проверяем, что ответ валидный
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Проверяем размер файла
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
              console.log('Файл слишком большой для кэширования:', event.request.url);
              return response;
            }
            
            // Клонируем ответ, так как он может быть использован только один раз
            const responseToCache = response.clone();
            
            // Добавляем ответ в кэш
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.log('Ошибка при добавлении в кэш:', err));
              
            return response;
          });
      })
      .catch(error => {
        console.log('Ошибка при загрузке:', error);
        
        // Для видео возвращаем специальное сообщение
        if (event.request.url.match(/\.(mp4|webm|ogg)$/)) {
          return new Response('<div style="display:flex;justify-content:center;align-items:center;height:100%;background:#000;color:#fff;text-align:center;padding:20px;">Видео недоступно в офлайн-режиме</div>', {
            headers: {
              'Content-Type': 'text/html'
            }
          });
        }
        
        // Для изображений возвращаем SVG-заглушку
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#999">Изображение недоступно</text></svg>', {
            headers: {
              'Content-Type': 'image/svg+xml'
            }
          });
        }
        
        // Для остальных ресурсов возвращаем офлайн-страницу
        return caches.match('offline.html');
      })
  );
});

// Обновление Service Worker и удаление старых кэшей
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  // Принимаем контроль над клиентами сразу после активации
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
                // Удаляем старые кэши
                return caches.delete(cacheName);
              }
            })
          );
        })
      ])
    );
  });
  
  // Обработка сообщений от клиента
  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    
    // Обработка запроса на принудительное кэширование видео
    if (event.data && event.data.type === 'CACHE_VIDEO') {
      const videoUrl = event.data.url;
      if (!videoUrl) return;
      
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Принудительное кэширование видео:', videoUrl);
          
          // Создаем контроллер для возможности отмены запроса
          const controller = new AbortController();
          const signal = controller.signal;
          
          // Устанавливаем таймаут 60 секунд
          const timeoutId = setTimeout(() => controller.abort(), 60000);
          
          return fetch(videoUrl, { signal })
            .then(response => {
              clearTimeout(timeoutId);
              
              if (!response || response.status !== 200) {
                console.log(`Не удалось загрузить видео ${videoUrl}: статус ${response?.status}`);
                return;
              }
              
              // Проверяем размер файла
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
                console.log(`Видео ${videoUrl} слишком большое для кэширования (${Math.round(parseInt(contentLength, 10) / 1024 / 1024)} МБ)`);
                return;
              }
              
              return cache.put(videoUrl, response);
            })
            .catch(err => {
              clearTimeout(timeoutId);
              console.log(`Ошибка при кэшировании видео ${videoUrl}:`, err.message);
            });
        });
    }
  });
  
  // Периодическая проверка и очистка кэша для управления размером
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'cleanup-cache') {
      event.waitUntil(cleanupCache());
    }
  });
  
  // Функция для очистки старых элементов кэша
  async function cleanupCache() {
    try {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      
      // Получаем информацию о размере кэша (приблизительно)
      let totalSize = 0;
      const cacheItems = [];
      
      for (const request of requests) {
        const response = await cache.match(request);
        const blob = await response.blob();
        const size = blob.size;
        
        cacheItems.push({
          request,
          size,
          url: request.url,
          timestamp: response.headers.get('date') ? new Date(response.headers.get('date')).getTime() : Date.now()
        });
        
        totalSize += size;
      }
      
      console.log(`Текущий размер кэша: ${Math.round(totalSize / 1024 / 1024)} МБ`);
      
      // Если кэш превышает 500 МБ, удаляем старые элементы
      const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 МБ
      
      if (totalSize > MAX_CACHE_SIZE) {
        // Сортируем по времени (старые в начале)
        cacheItems.sort((a, b) => a.timestamp - b.timestamp);
        
        // Удаляем старые элементы, пока размер не станет приемлемым
        let removedSize = 0;
        
        for (const item of cacheItems) {
          // Не удаляем HTML, CSS и JS файлы
          if (item.url.endsWith('.html') || item.url.endsWith('.css') || item.url.endsWith('.js')) {
            continue;
          }
          
          await cache.delete(item.request);
          removedSize += item.size;
          console.log(`Удален из кэша: ${item.url}`);
          
          if (totalSize - removedSize <= MAX_CACHE_SIZE * 0.8) { // Оставляем 80% от максимума
            break;
          }
        }
        
        console.log(`Очистка кэша завершена. Удалено: ${Math.round(removedSize / 1024 / 1024)} МБ`);
      }
    } catch (error) {
      console.error('Ошибка при очистке кэша:', error);
    }
  }
  
  // Функция для проверки доступности сети
  async function isOnline() {
    try {
      const response = await fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }