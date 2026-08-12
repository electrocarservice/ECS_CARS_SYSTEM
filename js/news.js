// Открытые RSS-источники новостей
const NEWS_FEEDS = [
    'https://insideevs.com/rss/news/all/',
    'https://electrek.co/category/electrek-guides/feed/',
    'https://news.drom.ru/rss/ev/'
];

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
 * Загрузка и обработка новостей из открытых источников
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

        // Получаем новости из всех источников через бесплатный RSS-to-JSON API
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

        // Берем ровно 5 свежих записей
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
 * Отрисовка 5 карточек новостей (не более 500 символов на новость)
 */
function renderNewsCards(articles) {
    const container = document.getElementById('newsContainer');
    if (!container) return;

    container.innerHTML = articles.map(item => {
        // Очищаем описание от HTML-тегов
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

        // Лимит в 500 символов с учетом ссылки
        const maxTextLength = 380; // Оставляем запас под заголовок, дату и ссылку
        if (cleanText.length > maxTextLength) {
            cleanText = cleanText.substring(0, maxTextLength).trim() + '...';
        }

        return `
            <article class="news-card">
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
            </article>
        `;
    }).join('');
}
