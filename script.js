const form = document.getElementById("cardForm");
const textInput = document.getElementById("text");
const senderInput = document.getElementById("sender");
const recipientInput = document.getElementById("recipient");
const themeSelect = document.getElementById("theme");
const sendButton = document.getElementById("sendButton");
const history = document.getElementById("history");
const message = document.getElementById("message");
const storageKey = "postcards-pr4";
const decorations = {
    light: "✉", dark: "☾  ✦", flowers: "❀  ❁  ❀",
    birthday: "✦  ♬  ✦", winter: "❄  ❄  ❄"
};
let cards = [];

function updatePreview() {
    const text = textInput.value.trim();
    const sender = senderInput.value.trim();
    const recipient = recipientInput.value.trim();
    sendButton.disabled = !text || !sender || !recipient;
    document.getElementById("preview").className = "postcard " + themeSelect.value;
    document.querySelector("#preview .decoration").textContent = decorations[themeSelect.value];
    document.getElementById("previewText").textContent = text || "Здесь появится ваше пожелание.";
    document.getElementById("previewTo").textContent = "Кому: " + (recipient || "получатель");
    document.getElementById("previewFrom").textContent = "От: " + (sender || "ваше имя");
}

function showHistory() {
    history.replaceChildren();
    document.getElementById("emptyHistory").hidden = cards.length > 0;
    document.getElementById("clearHistory").disabled = cards.length === 0;
    for (const card of cards) {
        const article = document.createElement("article");
        article.className = "postcard " + card.theme;
        const decoration = document.createElement("div");
        decoration.className = "decoration";
        decoration.setAttribute("aria-hidden", "true");
        decoration.textContent = decorations[card.theme];
        const to = document.createElement("p");
        to.className = "to";
        to.textContent = "Кому: " + card.recipient;
        const text = document.createElement("p");
        text.className = "card-text";
        text.textContent = card.text;
        const from = document.createElement("p");
        from.className = "from";
        from.textContent = "От: " + card.sender;
        article.append(decoration, to, text, from);
        history.append(article);
    }
}

// Сохраняем массив открыток как строку JSON, как в примере localStorage.
function saveCards(updatedCards) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(updatedCards));
        cards = updatedCards;
        showHistory();
        return true;
    } catch {
        message.textContent = "Не удалось сохранить историю. Проверьте доступ к хранилищу браузера или его свободное место.";
        return false;
    }
}

function loadCards() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(saved)) throw new Error("Неверный формат истории");
        cards = saved.filter(function(card) {
            return card && typeof card.text === "string" && typeof card.sender === "string" &&
                typeof card.recipient === "string" && Object.hasOwn(decorations, card.theme);
        });
    } catch {
        cards = [];
        message.textContent = "Не удалось прочитать сохранённую историю.";
    }
    showHistory();
}

form.addEventListener("input", updatePreview);
themeSelect.addEventListener("change", updatePreview);
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const card = {
        text: textInput.value.trim(),
        sender: senderInput.value.trim(),
        recipient: recipientInput.value.trim(),
        theme: themeSelect.value
    };
    if (!card.text || !card.sender || !card.recipient) return;
    if (saveCards([card, ...cards])) {
        textInput.value = "";
        senderInput.value = "";
        recipientInput.value = "";
        updatePreview();
        message.textContent = "Открытка добавлена в историю и сохранена в этом браузере.";
    }
});
document.getElementById("clearHistory").addEventListener("click", function() {
    if (saveCards([])) message.textContent = "История открыток очищена.";
});
// Обновляем историю, если её изменили в другой вкладке этого сайта.
window.addEventListener("storage", function(event) {
    if (event.key === storageKey || event.key === null) loadCards();
});
loadCards();
updatePreview();
