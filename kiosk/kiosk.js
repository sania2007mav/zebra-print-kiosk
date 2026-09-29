const PRICE = { print: 150, copy: 150, scan: 200 };
const PIN = "1234";
const FILES = [
  { name: "Заявление.pdf", kind: "PDF", pages: 2 },
  { name: "Курсовая.docx", kind: "DOCX", pages: 18 },
  { name: "Смета.xlsx", kind: "XLS", pages: 3 },
  { name: "Фото.jpg", kind: "JPG", pages: 1 }
];
const ADS = [
  ["Печать с флешки", "PDF, Word, Excel и фото. Оплата через Kaspi, лист выходит после платежа."],
  ["Копия паспорта", "Положите документ на стекло. Одна сторона, число копий на экране."],
  ["Скан на флешку", "Файл записывается на носитель и сразу стирается с аппарата."]
];
const NAMES = {
  idle: "реклама",
  menu: "меню",
  print: "печать с флешки",
  copy: "ксерокопия",
  scan: "сканирование",
  pay: "оплата",
  work: "печать",
  done: "заберите документы",
  cancel: "заказ сброшен",
  jam: "замятие",
  pin: "PIN служебного меню",
  service: "служебное меню"
};

const view = document.getElementById("view");
const payBtn = document.getElementById("pay");
const jamBtn = document.getElementById("jam");
const nowEl = document.getElementById("now");

const state = {
  screen: "idle",
  ad: 0,
  file: 0,
  copies: 1,
  pin: "",
  pinError: false,
  left: 45,
  progress: 0,
  paper: 1240
};

let clock = null;
let adClock = null;
let hold = null;

function money(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₸";
}
function pages() {
  if (state.screen === "print" || (state.service === "print" && state.screen !== "menu")) return FILES[state.file].pages;
  return 1;
}
function unitPrice() {
  return PRICE[state.service] || PRICE.print;
}
function total() {
  return pages() * state.copies * unitPrice();
}
function clearClock() {
  if (clock) clearInterval(clock);
  clock = null;
}
function go(screen) {
  clearClock();
  state.screen = screen;
  if (screen === "idle") {
    state.copies = 1;
    state.service = null;
    state.pin = "";
  }
  render();
}

function startPay() {
  state.left = 45;
  state.screen = "pay";
  clearClock();
  clock = setInterval(function () {
    state.left -= 1;
    if (state.left <= 0) {
      go("cancel");
      setTimeout(function () { if (state.screen === "cancel") go("idle"); }, 3500);
      return;
    }
    render();
  }, 1000);
  render();
}

function startWork() {
  state.progress = 8;
  state.screen = "work";
  clearClock();
  clock = setInterval(function () {
    state.progress += 18;
    if (state.progress >= 100) {
      clearClock();
      const used = pages() * state.copies;
      state.paper = Math.max(0, state.paper - (state.service === "scan" ? 0 : used));
      go("done");
      setTimeout(function () { if (state.screen === "done") go("idle"); }, 4000);
      return;
    }
    render();
  }, 350);
  render();
}

function qrCells() {
  const cells = [];
  let n = total() + state.left * 17 + state.copies * 13;
  for (let i = 0; i < 121; i++) {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    const edge = i < 11 || i > 109 || i % 11 === 0 || i % 11 === 10;
    const finder = (i < 33 && (i % 11) < 3) || (i < 33 && (i % 11) > 7) || (i > 87 && (i % 11) < 3);
    cells.push(edge || finder || n % 3 !== 0);
  }
  return cells;
}

function shell(title, body, extra) {
  return '<div class="screen ' + (extra || "") + '"><div class="brand">Zebra Print</div><h2 class="screen-title">' + title + '</h2>' + body + '</div>';
}

function render() {
  nowEl.textContent = "Сейчас на экране: " + NAMES[state.screen];
  payBtn.disabled = state.screen !== "pay";
  jamBtn.disabled = state.screen !== "work";
  if (!adClock && state.screen === "idle") {
    adClock = setInterval(function () {
      if (state.screen !== "idle") return;
      state.ad = (state.ad + 1) % ADS.length;
      render();
    }, 4000);
  }

  if (state.screen === "idle") {
    const ad = ADS[state.ad];
    view.innerHTML = '<button type="button" class="screen ad" data-act="menu"><div class="ad-body"><div class="brand">Zebra Print</div><h2>' + ad[0] + '</h2><p>' + ad[1] + '</p><div class="touch">Коснитесь экрана</div></div></button>';
    return;
  }
  if (state.screen === "menu") {
    view.innerHTML = shell("Выберите услугу",
      '<div class="choices">' +
      '<button type="button" class="choice go" data-act="print"><b>Печать</b><span>Файл с флешки</span></button>' +
      '<button type="button" class="choice" data-act="copy"><b>Ксерокопия</b><span>Лист на стекле, одна сторона</span></button>' +
      '<button type="button" class="choice" data-act="scan"><b>Сканирование</b><span>PDF на ту же флешку</span></button>' +
      '</div><div class="foot">Лист ' + money(PRICE.print) + " · скан " + money(PRICE.scan) + "<br>Нужна помощь: +7 (7142) 00-00-00</div>");
    return;
  }
  if (state.screen === "print") {
    const files = FILES.map(function (file, index) {
      return '<button type="button" class="file' + (index === state.file ? " is-on" : "") + '" data-act="file" data-index="' + index + '"><span>' + file.name + '</span><b>' + file.pages + " стр.</b></button>";
    }).join("");
    view.innerHTML = shell("Флешка подключена",
      '<p class="sub">Выберите один документ. Программы с флешки не запускаются.</p><div class="files">' + files + '</div>' +
      stepper("Число копий") +
      '<button type="button" class="action" data-act="topay">К оплате · ' + money(total()) + '</button>' +
      '<div class="foot"><button type="button" class="linkish" data-act="menu">Назад</button></div>');
    return;
  }
  if (state.screen === "copy") {
    view.innerHTML = shell("Ксерокопия",
      '<p class="sub">Положите документ на стекло лицевой стороной вниз и совместите угол с меткой. Печать односторонняя.</p>' +
      stepper("Число копий") +
      '<button type="button" class="action" data-act="topay">К оплате · ' + money(total()) + '</button>' +
      '<div class="foot"><button type="button" class="linkish" data-act="menu">Назад</button></div>');
    return;
  }
  if (state.screen === "scan") {
    view.innerHTML = shell("Сканирование",
      '<p class="sub">Положите лист на стекло. После оплаты аппарат запишет PDF на флешку и удалит файл у себя.</p>' +
      '<div class="row"><span>Формат</span><b>PDF · 1 страница</b></div>' +
      '<button type="button" class="action" data-act="topay">К оплате · ' + money(total()) + '</button>' +
      '<div class="foot"><button type="button" class="linkish" data-act="menu">Назад</button></div>');
    return;
  }
  if (state.screen === "pay") {
    const cells = qrCells();
    let svg = '<svg class="qr" viewBox="0 0 11 11" shape-rendering="crispEdges">';
    cells.forEach(function (on, index) {
      if (!on) return;
      const x = index % 11;
      const y = Math.floor(index / 11);
      svg += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#1c1915"/>';
    });
    svg += "</svg>";
    view.innerHTML = '<div class="screen pay"><div class="brand">Оплата Kaspi</div><div class="sum">' + money(total()) + '</div><p class="timer">' + state.left + " сек</p>" + svg + '<p class="sub">Откройте Kaspi и наведите камеру. Это тестовый код, банк не вызывается.</p><div class="foot">Пока оплаты нет, лист не выйдет. Если время кончится, заказ и файлы удалятся.</div></div>';
    return;
  }
  if (state.screen === "work") {
    const verb = state.service === "scan" ? "Сканируем" : state.service === "copy" ? "Копируем" : "Печатаем";
    view.innerHTML = '<div class="screen"><div class="center"><div class="brand">Zebra Print</div><h2 class="screen-title">' + verb + '</h2><p class="sub">' + pages() + " стр. × " + state.copies + '</p><div class="bar"><i style="width:' + state.progress + '%"></i></div></div></div>';
    return;
  }
  if (state.screen === "done") {
    const text = state.service === "scan"
      ? "PDF записан на флешку. С аппарата файл удалён."
      : "Заберите документы из лотка.";
    view.innerHTML = '<div class="screen"><div class="center"><h2 class="screen-title">Готово</h2><p class="sub">' + text + '</p></div></div>';
    return;
  }
  if (state.screen === "cancel") {
    view.innerHTML = '<div class="screen"><div class="center"><h2 class="screen-title">Время вышло</h2><p class="sub">Оплаты не было. Заказ закрыт, файлы с компьютера стерты.</p></div></div>';
    return;
  }
  if (state.screen === "jam") {
    view.innerHTML = shell("Замятие бумаги",
      '<p class="sub">Вытащите лист. Печать остановлена, в панель и Telegram ушло сообщение. Оплаченные страницы, которые не вышли, видны владельцу.</p>' +
      '<button type="button" class="action" data-act="menu">Лист вытащен</button>');
    return;
  }
  if (state.screen === "pin") {
    view.innerHTML = shell("Служебный вход",
      '<p class="dots">' + "•".repeat(state.pin.length) + '</p>' +
      (state.pinError ? '<p class="error">Неверный PIN</p>' : '<p class="sub">Только для оператора</p>') +
      '<div class="pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (digit) {
        return '<button type="button" class="key" data-act="digit" data-digit="' + digit + '">' + digit + '</button>';
      }).join("") + '<button type="button" class="key" data-act="menu">×</button><button type="button" class="key" data-act="digit" data-digit="0">0</button><button type="button" class="key" data-act="del">⌫</button></div>');
    return;
  }
  if (state.screen === "service") {
    view.innerHTML = shell("Служебное меню",
      '<div class="row"><span>Бумага в лотке</span><b>' + new Intl.NumberFormat("ru-RU").format(state.paper) + '</b></div>' +
      '<div class="row"><span>Тонер</span><b>72%</b></div>' +
      '<button type="button" class="action" data-act="refill">Заправил 500 листов</button>' +
      '<button type="button" class="choice" data-act="test"><b>Тестовая страница</b><span>' + (state.tested ? "Отправлена на принтер" : "Один лист без оплаты") + '</span></button>' +
      '<div class="foot"><button type="button" class="linkish" data-act="idle">Закрыть</button></div>');
  }
}

function stepper(label) {
  return '<div class="row"><span>' + label + '</span><div class="step"><button type="button" data-act="dec">−</button><b>' + state.copies + '</b><button type="button" data-act="inc">+</button></div></div>';
}

view.addEventListener("click", function (event) {
  const target = event.target.closest("[data-act]");
  if (!target) return;
  const act = target.getAttribute("data-act");
  if (act === "menu") {
    state.pin = "";
    state.pinError = false;
    go("menu");
  } else if (act === "idle") {
    go("idle");
  } else if (act === "print" || act === "copy" || act === "scan") {
    state.service = act;
    state.copies = 1;
    go(act);
  } else if (act === "file") {
    state.file = Number(target.getAttribute("data-index"));
    render();
  } else if (act === "inc") {
    state.copies = Math.min(20, state.copies + 1);
    render();
  } else if (act === "dec") {
    state.copies = Math.max(1, state.copies - 1);
    render();
  } else if (act === "topay") {
    startPay();
  } else if (act === "digit") {
    if (state.pin.length >= 4) return;
    state.pin += target.getAttribute("data-digit");
    state.pinError = false;
    if (state.pin.length === 4) {
      if (state.pin === PIN) go("service");
      else {
        state.pin = "";
        state.pinError = true;
        render();
      }
      return;
    }
    render();
  } else if (act === "del") {
    state.pin = state.pin.slice(0, -1);
    render();
  } else if (act === "refill") {
    state.paper += 500;
    render();
  } else if (act === "test") {
    state.tested = true;
    state.paper = Math.max(0, state.paper - 1);
    render();
  }
});

document.getElementById("hotspot").addEventListener("pointerdown", function (event) {
  event.preventDefault();
  hold = setTimeout(function () {
    state.pin = "";
    state.pinError = false;
    go("pin");
  }, 700);
});
["pointerup", "pointerleave", "pointercancel"].forEach(function (name) {
  document.getElementById("hotspot").addEventListener(name, function () {
    clearTimeout(hold);
  });
});

payBtn.addEventListener("click", function () {
  if (state.screen === "pay") startWork();
});
jamBtn.addEventListener("click", function () {
  if (state.screen === "work") go("jam");
});
document.getElementById("reset").addEventListener("click", function () {
  go("idle");
});

render();
