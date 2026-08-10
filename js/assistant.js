// Конфигурация Gemini API
const GEMINI_CONFIG = {
    apiKey: 'AQ.Ab8RN6J-k9T25TENCiLQy0bn6tK0w7pMdUWFuFcrOUTlUA_Wnw', // Вставьте ваш ключ от Google AI Studio
    model: 'gemini-1.5-flash',
    systemInstruction: `Ты — встроенный ИИ-эксперт базы знаний EVBase по китайским электромобилям (Zeekr, Lixiang, BYD, Voyah, Avatr, Xiaomi и др.). 
Твоя задача — давать четкие, технически грамотные ответы по:
- Диагностике программных ошибок и сбоев (OTA, мастер-аккаунты, русификация, сим-карты).
- Обслуживанию, замене расходников и подбору запчастей.
- Особенностям зарядки (GB/T, адаптеры, фазы, мощности).
Отвечай кратко, вежливо и по делу. Если не уверен в конкретном каталожном номере, честно предупреди об этом.`
};

// Элементы интерфейса чата
const chatWindow = document.getElementById('chatWindow');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const closeChatBtn = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// Переключение видимости окна чата
if (toggleChatBtn) {
    toggleChatBtn.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
}
if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));
}

// Отправка сообщения по кнопке или Enter
if (sendMessageBtn && chatInput) {
    sendMessageBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

/**
 * Обработка отправки сообщения пользователем
 */
async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Отображаем сообщение пользователя в чате
    appendMessage(text, 'user-message');
    chatInput.value = '';

    // 2. Показываем индикатор загрузки
    const loadingMessage = appendMessage('Ассистент думает...', 'ai-message loading');

    // 3. Отправляем запрос к Gemini API
    try {
        const responseText = await askGemini(text);
        loadingMessage.remove(); // Удаляем индикатор загрузки
        appendMessage(responseText, 'ai-message');
    } catch (error) {
        console.error('Ошибка Gemini API:', error);
        loadingMessage.remove();
        appendMessage('Извините, произошла ошибка при связи с ИИ. Проверьте API-ключ.', 'ai-message');
    }
}

/**
 * Добавление сообщения в блок чата
 */
function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Скролл вниз
    return msgDiv;
}

/**
 * Запрос к Gemini API с использованием REST API
 */
async function askGemini(userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }]
            }
        ],
        systemInstruction: {
            parts: [{ text: GEMINI_CONFIG.systemInstruction }]
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }

    const data = await response.json();
    
    // Извлекаем текст ответа от модели
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        return 'Не удалось получить ответ от ассистента.';
    }
}
