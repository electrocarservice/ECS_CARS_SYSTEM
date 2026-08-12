// Открытые RSS-источники новостей
const NEWS_FEEDS = [
    'https://insideevs.com/rss/news/all/',
    'https://electrek.co/category/electrek-guides/feed/',
    'https://news.drom.ru/rss/ev/'
];

// Дефолтная заглушка, если в источнике нет картинки
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80';

document.addEventListener('DOMContentLoaded', () => {
    fetchLatestEVNews();

    const refreshBtn = document.getElementById('refreshNewsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchLatestEVNews(true);
        });
    }
});

/**
 * Загрузка и обработка новостей
 */
async function fetchLatestEVNews(isManualRefresh = false) {
    const container = document.getElementById('newsContainer');
    const refreshBtn = document.getElementById('refreshNewsBtn');

    if (!container) return;

    if (isManualRefresh && refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '⏳ Обновление...';
    }

    container.innerHTML = '<div class="loading-spinner">Получение свежих новостей...</div>';

    try {
        let allArticles = [];

        // Запрашиваем RSS-ленты через RSS2JSON
        const fetchPromises = NEWS_FEEDS.map(feed => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`)
                .then(res => res.json())
                .then(data => data.status === 'ok' ? data.items : [])
                .catch(() => [])
        );

        const results = await Promise.all(fetchPromises);
        results.forEach(items => {
            allArticles = allArticles.concat(items);
        });

        if (allArticles.length === 0) {
            container.innerHTML = '<p class="empty-news">Не удалось загрузить новости. Попробуйте обновить позже.</p>';
            return;
        }

        // Сортировка по дате (от новых к старым)
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Отбираем ровно 5 свежих новостей
        const top5Articles = allArticles.slice(0, 5);

        renderNewsCards(top5Articles);

    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        container.innerHTML = '<p class="empty-news">Произошла ошибка при загрузке ленты новостей.</p>';
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 Обновить';
        }
    }
}

/**
 * Извлечение URL изображения из объекта новости или её HTML-текста
 */
function extractImageUrl(item) {
    // 1. Поле thumbnail из RSS2JSON
    if (item.thumbnail && item.thumbnail.startsWith('http')) {
        return item.thumbnail;
    }

    // 2. Медиа-вложения (enclosure / media)
    if (item.enclosure && item.enclosure.link) {
        return item.enclosure.link;
    }

    // 3. Поиск первого <img> в HTML-описании или контенте
    const htmlContent = item.description || item.content || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const imgTag = tempDiv.querySelector('img');

    if (imgTag && imgTag.src && imgTag.src.startsWith('http')) {
        return imgTag.src;
    }

    // Заглушка, если изображение не найдено
    return DEFAULT_IMAGE;
}

/**
 * Отрисовка карточек новостей
 */
function renderNewsCards(articles) {
    const container = document.getElementById('newsContainer');
    if (!container) return;

    container.innerHTML = articles.map(item => {
        // Очистка HTML-тегов для текста
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.description || item.content || '';
        let cleanText = tempDiv.textContent || tempDiv.innerText || '';

        // Дата публикации
        const pubDate = new Date(item.pubDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Поиск изображения
        const imageUrl = extractImageUrl(item);

        // Ограничение длины текста (не более 500 символов суммарно с заголовком и метаинформацией)
        const maxTextLength = 320;
        if (cleanText.length > maxTextLength) {
            cleanText = cleanText.substring(0, maxTextLength).trim() + '...';
        }

        return `
            <article class="news-card media-card">
                <div class="news-image-wrapper">
                    <img src="${imageUrl}" alt="${item.title}" class="news-image" onerror="this.src='${DEFAULT_IMAGE}'">
                </div>
                <div class="news-content-wrapper">
                    <div class="news-card-header">
                        <span class="news-date">${pubDate}</span>
                        <span class="news-source">${item.author || 'EV News'}</span>
                    </div>
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-excerpt">${cleanText}</p>
                    <div class="news-card-footer">
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                            Читать источник ↗
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}
