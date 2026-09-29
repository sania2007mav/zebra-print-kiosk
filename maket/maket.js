const FILES = [
  { name: "Извещение запрос котировок.doc", pages: 4 },
  { name: "Извещение.docx", pages: 2 },
  { name: "Обоснование.docx", pages: 1 },
  { name: "ПРОЕКТ ДОГОВОРА.docx", pages: 1 },
  { name: "Часть 3.ТЗ(1).doc", pages: 2 },
  { name: "Часть 4. Проект договора.docx", pages: 1 },
  { name: "Часть 5. Формы документов.docx", pages: 1 }
];
const PAGE = 15;
const ROWS = [41.35, 47.14, 53.39, 58.85, 64.64, 70.57, 76.35];

const shot = document.getElementById("shot");
const spots = document.getElementById("spots");
const marks = document.getElementById("marks");
const toast = document.getElementById("toast");
const now = document.getElementById("now");

const state = { screen: "home", picked: [] };
let toastTimer = null;

function say(text) {
  toast.hidden = false;
  toast.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.hidden = true; }, 2400);
}

function spot(area, label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "spot";
  button.style.left = area[0] + "%";
  button.style.top = area[1] + "%";
  button.style.width = area[2] + "%";
  button.style.height = area[3] + "%";
  button.setAttribute("aria-label", label);
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    action();
  });
  spots.appendChild(button);
}

function go(screen) {
  state.screen = screen;
  toast.hidden = true;
  render();
}

function render() {
  const screens = {
    home: ["img/home.png", "Начальный экран"],
    print: ["img/print.png", "Печать документов"],
    copy: ["img/copy.png", "Ксерокопирование"],
    scan: ["img/scan.png", "Сканирование"],
    ads: ["img/ads.png", "Реклама в ожидании"]
  };
  shot.src = screens[state.screen][0];
  shot.alt = screens[state.screen][1];
  now.textContent = "Сейчас: " + screens[state.screen][1];
  spots.replaceChildren();
  marks.replaceChildren();

  if (state.screen === "home") {
    spot([82, 1.2, 14, 6], "Настройки", function () { go("ads"); });
    spot([4, 13.8, 92, 10.5], "Печать документов", function () { go("print"); });
    spot([4, 24.6, 46, 8], "Свои файлы", function () { go("print"); });
    spot([50, 24.6, 46, 8], "Готовые шаблоны", function () {
      say("Отдельной картинки шаблонов в папке нет. Есть печать, сканер, копия и реклама.");
    });
    spot([4, 33.4, 92, 13.4], "Сканирование", function () { go("scan"); });
    spot([4, 47.8, 92, 11.6], "Ксерокопия", function () { go("copy"); });
    spot([5, 92.5, 34, 5], "Цены и примеры", function () {
      say("На экране копии 4 страницы стоят 60 ₽, то есть 15 ₽ за страницу.");
    });
    return;
  }

  if (state.screen === "print") {
    spot([2, 1.5, 14, 7], "Назад", function () { go("home"); });
    spot([4, 15, 31, 8], "USB", function () { say("USB уже выбран на этом макете: флешка обнаружена."); });
    spot([36, 15, 29, 8], "Telegram", function () { say("На картинке Telegram ещё ждёт файл. Список ниже — с флешки."); });
    spot([66, 15, 30, 8], "MAX", function () { say("На картинке MAX ещё ждёт файл."); });
    spot([4, 23.5, 31, 9], "Браузер", function () { say("На картинке браузер ещё ждёт файл."); });
    spot([36, 23.5, 30, 9], "Wi-Fi киоска", function () { say("На картинке Wi-Fi киоска ещё ждёт файл."); });
    ROWS.forEach(function (top, index) {
      spot([4, top - 2.6, 92, 5.2], FILES[index].name, function () {
        const at = state.picked.indexOf(index);
        if (at === -1) state.picked.push(index);
        else state.picked.splice(at, 1);
        render();
      });
    });
    spot([60, 93.2, 37, 5.8], "Печать", function () {
      if (!state.picked.length) {
        say("Сумма 0 ₽. Сначала отметьте файлы в списке.");
        return;
      }
      const pages = state.picked.reduce(function (sum, index) { return sum + FILES[index].pages; }, 0);
      say("К печати " + pages + " стр. на " + pages * PAGE + " ₽. Дальнейших шагов в картинках нет, это шаг 1 из 4.");
    });
    state.picked.forEach(function (index) {
      const mark = document.createElement("i");
      mark.className = "tick";
      mark.style.left = "89%";
      mark.style.top = ROWS[index] + "%";
      marks.appendChild(mark);
    });
    if (state.picked.length) {
      const pages = state.picked.reduce(function (sum, index) { return sum + FILES[index].pages; }, 0);
      const price = document.createElement("p");
      price.className = "price";
      price.textContent = pages * PAGE + " ₽";
      marks.appendChild(price);
    }
    return;
  }

  if (state.screen === "copy") {
    spot([2, 1.5, 14, 7], "Назад", function () { go("home"); });
    spot([6, 15, 44, 13], "Сканировать документ", function () {
      say("На этом макете уже лежат 3 документа и 4 страницы. Новый скан в картинку не добавлен.");
    });
    spot([60, 93.4, 37, 5.6], "Распечатать", function () {
      say("В макете к печати 4 страницы на 60 ₽.");
    });
    return;
  }

  if (state.screen === "scan") {
    spot([2, 1.5, 14, 7], "Назад", function () { go("home"); });
    spot([6, 15, 44, 17], "Сканировать документ", function () {
      say("Лист снят. На макете внизу всё ещё написано, что документов нет: отдельной картинки результата нет.");
    });
    spot([68, 94, 28, 5], "Сохранить", function () {
      go("home");
      say("Кнопка «Сохранить» на макете не показывает готовый файл. Возврат на начальный экран.");
    });
    return;
  }

  if (state.screen === "ads") {
    spot([1, 10, 12, 6], "На главный экран", function () { go("home"); });
    spot([1, 90, 14, 5], "Домой", function () { go("home"); });
    spot([1, 95, 14, 4.5], "Выключение", function () { go("home"); });
    spot([78, 42, 18, 4], "Импорт с USB", function () {
      say("На макете уже лежит Group 1000001104.png, 186 КБ.");
    });
  }
}

document.getElementById("home").addEventListener("click", function () { go("home"); });
render();
