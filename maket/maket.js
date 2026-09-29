const RATE_BW = 15;
const RATE_COLOR = 40;

const I = {
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 17h10v4H7z"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3"/><circle cx="12" cy="12" r="3"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="7" width="12" height="12" rx="2"/><path d="M5 15V5h10"/></svg>',
  usb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v10"/><path d="M8 7l4-4 4 4"/><rect x="8" y="13" width="8" height="8" rx="2"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v6h6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11 12 4l8 7"/><path d="M7 10v9h10v-9"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v8"/><path d="M7 6a8 8 0 1 0 10 0"/></svg>',
  ads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>'
};

const TITLES = {
  home: "Начальный экран",
  files: "Печать, выбор файлов",
  options: "Параметры печати",
  pay: "Оплата",
  work: "Печать",
  done: "Документы готовы",
  fail: "Оплата не прошла",
  copy: "Ксерокопия",
  scan: "Сканирование",
  templates: "Готовые шаблоны",
  prices: "Цены",
  ads: "Реклама",
  off: "Аппарат выключен",
  ad: "Реклама на экране"
};

let seq = 100;
function uid() { seq += 1; return "f" + seq; }
function esc(value) {
  return String(value).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}
function rub(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}
function rate(color) { return color === "color" ? RATE_COLOR : RATE_BW; }
function formatSize(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " КБ";
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " МБ";
}

const view = document.getElementById("view");
const nowEl = document.getElementById("now");
let payTimer = null;
let workTimer = null;
let adTimer = null;
let adClose = null;
let waitToken = 0;

const state = {
  screen: "home",
  mode: "usb",
  source: "usb",
  copies: 1,
  color: "gray",
  duplex: false,
  selected: {},
  selTpl: {},
  payLeft: 45,
  payBack: "options",
  progress: 0,
  job: null,
  copyPaper: "A4",
  copyColor: "gray",
  copyN: 5,
  tuneId: null,
  preview: null,
  scanPaper: "A4",
  scanColor: "color",
  scanFormat: "pdf",
  scanQuality: "std",
  scanPages: [],
  scanN: 0,
  scanSaved: "",
  waiting: null,
  seen: {},
  adsOn: false,
  adsType: "image",
  adsDelay: 8,
  adsShow: 8,
  adItem: null,
  inbox: {
    usb: [
      { id: "u1", name: "Извещение запрос котировок.doc", size: "339 КБ", pages: 6 },
      { id: "u2", name: "Извещение.docx", size: "96 КБ", pages: 2 },
      { id: "u3", name: "Обоснование.docx", size: "19 КБ", pages: 1 },
      { id: "u4", name: "ПРОЕКТ ДОГОВОРА.docx", size: "35 КБ", pages: 2 },
      { id: "u5", name: "Часть 3.ТЗ(1).doc", size: "98 КБ", pages: 3 },
      { id: "u6", name: "Часть 4. Проект договора.docx", size: "47 КБ", pages: 2 },
      { id: "u7", name: "Часть 5. Формы документов.docx", size: "35 КБ", pages: 1 }
    ],
    telegram: [],
    max: [],
    browser: [],
    wifi: []
  },
  templates: [
    { id: "t1", name: "Заявление.pdf", pages: 1, size: "PDF-форма" },
    { id: "t2", name: "Согласие на обработку данных.pdf", pages: 1, size: "PDF-форма" },
    { id: "t3", name: "Объяснительная.pdf", pages: 1, size: "PDF-форма" },
    { id: "t4", name: "Доверенность.pdf", pages: 2, size: "PDF-форма" }
  ],
  docs: [
    { id: "c1", name: "Copy_001.pdf", pages: 1, size: "1,9 МБ", color: "gray", paper: "A4", merged: false },
    { id: "c2", name: "merged-20260715-1.pdf", pages: 2, size: "3,8 МБ", color: "gray", paper: "A4", merged: true },
    { id: "c3", name: "Copy_004.pdf", pages: 1, size: "1,9 МБ", color: "gray", paper: "A4", merged: false }
  ],
  adsItems: [
    { id: "a1", name: "Group 1000001104.png", size: "186 КБ", url: "", video: false, on: true }
  ]
};

function stopPay() { clearInterval(payTimer); payTimer = null; }
function stopWork() { clearInterval(workTimer); workTimer = null; }

function go(screen) {
  stopPay();
  stopWork();
  clearTimeout(adTimer);
  clearTimeout(adClose);
  state.preview = null;
  state.screen = screen;
  render();
}

function selectedItems() {
  return Object.keys(state.inbox).reduce(function (all, key) {
    return all.concat(state.inbox[key]);
  }, []).filter(function (file) { return state.selected[file.id]; });
}
function draft() {
  const items = state.mode === "tpl"
    ? state.templates.filter(function (item) { return state.selTpl[item.id]; })
    : selectedItems();
  const pages = items.reduce(function (sum, item) { return sum + item.pages; }, 0);
  return {
    kind: state.mode,
    items: items,
    pages: pages,
    copies: state.copies,
    color: state.color,
    duplex: state.duplex,
    amount: pages * state.copies * rate(state.color),
    impressions: pages * state.copies,
    title: items.map(function (item) { return item.name; }).join(", ")
  };
}
function copyPages() {
  return state.docs.reduce(function (sum, doc) { return sum + doc.pages; }, 0);
}

function beginPay(back) {
  stopPay();
  state.payBack = back;
  state.payLeft = 45;
  state.screen = "pay";
  render();
  payTimer = setInterval(function () {
    state.payLeft -= 1;
    if (state.payLeft <= 0) {
      stopPay();
      state.selected = {};
      state.selTpl = {};
      state.screen = "fail";
      render();
      return;
    }
    const el = document.getElementById("pay-left");
    if (el) el.textContent = String(state.payLeft);
  }, 1000);
}

function beginWork() {
  stopPay();
  stopWork();
  state.progress = 8;
  state.screen = "work";
  render();
  workTimer = setInterval(function () {
    state.progress = Math.min(100, state.progress + 12);
    const bar = document.getElementById("bar");
    if (bar) bar.style.width = state.progress + "%";
    if (state.progress >= 100) finish();
  }, 220);
}

function finish() {
  stopWork();
  if (!state.job) return;
  if (state.job.kind === "copy") state.docs = [];
  if (state.job.kind === "tpl") state.selTpl = {};
  if (state.job.kind === "usb") state.selected = {};
  state.screen = "done";
  render();
  setTimeout(function () { if (state.screen === "done") go("home"); }, 4200);
}

function armAd() {
  clearTimeout(adTimer);
  if (!state.adsOn || state.screen !== "home") return;
  const pool = state.adsItems.filter(function (item) { return item.on; });
  const typed = pool.filter(function (item) { return state.adsType === "video" ? item.video : !item.video; });
  state.adItem = (typed[0] || pool[0]) || null;
  if (!state.adItem) return;
  adTimer = setTimeout(function () {
    if (state.screen !== "home" || !state.adsOn) return;
    clearTimeout(adTimer);
    state.screen = "ad";
    render();
    adClose = setTimeout(function () {
      if (state.screen === "ad") go("home");
    }, state.adsShow * 1000);
  }, state.adsDelay * 1000);
}

function activateSource(source) {
  state.source = source;
  if ((source === "telegram" || source === "max") && !state.seen[source]) {
    state.seen[source] = true;
    state.waiting = source;
    render();
    const token = ++waitToken;
    setTimeout(function () {
      if (waitToken !== token) return;
      const file = source === "telegram"
        ? { id: uid(), name: "Договор из Telegram.pdf", size: "240 КБ", pages: 3 }
        : { id: uid(), name: "Фото из MAX.jpg", size: "1,4 МБ", pages: 1 };
      state.inbox[source].push(file);
      state.selected[file.id] = true;
      if (state.waiting === source) state.waiting = null;
      if (state.screen === "files" && state.source === source) render();
    }, 1400);
    return;
  }
  render();
}

async function addUpload(file) {
  let pages = 1;
  const isPdf = window.pdfjsLib && /\.pdf$/i.test(file.name);
  if (isPdf) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      pages = doc.numPages;
    } catch (error) {
      pages = 1;
    }
  }
  const item = { id: uid(), name: file.name, size: formatSize(file.size), pages: pages };
  state.inbox[state.source].push(item);
  state.selected[item.id] = true;
}

function head(step) {
  return '<div class="head"><button type="button" class="back" data-act="back" aria-label="Назад">←</button>' +
    (step ? '<span class="step-pill">' + step + "</span>" : "") + "</div>";
}
function fileButton(file, on) {
  return '<button type="button" class="row" data-act="pick" data-id="' + file.id + '">' +
    '<span class="doc-ic">' + I.doc + "</span>" +
    '<span class="meta"><b>' + esc(file.name) + "</b><small>" + esc(file.size) + " · " + file.pages + " стр.</small></span>" +
    '<span class="box' + (on ? " on" : "") + '"></span></button>';
}
function qr(seed) {
  let n = seed;
  let svg = '<svg class="qr" viewBox="0 0 11 11" shape-rendering="crispEdges">';
  for (let i = 0; i < 121; i++) {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    const edge = i < 11 || i > 109 || i % 11 === 0 || i % 11 === 10;
    if (edge || n % 3 === 0) {
      svg += '<rect x="' + (i % 11) + '" y="' + Math.floor(i / 11) + '" width="1" height="1" fill="#1c1915"/>';
    }
  }
  return svg + "</svg>";
}

function renderHome() {
  return '<div class="screen">' +
    '<div class="top"><div class="brand"><span class="dot u">U</span><span class="dot t">T</span><span class="dot s">S</span><span><b>Принт-киоск</b><small>Самообслуживание</small></span></div>' +
    '<span class="lang">RU</span><button type="button" class="gear" data-act="ads" aria-label="Реклама">' + I.gear + "</button></div>" +
    "<h1>Выберите услугу, чтобы начать</h1>" +
    '<article class="card"><button type="button" class="card-main" data-act="print"><span class="ic">' + I.print + "</span><span><b>Печать документов</b><span>Печать с USB-накопителя или загрузка с телефона</span>" +
    '<span class="tags"><span class="tag">PDF</span><span class="tag">DOCX/DOC</span><span class="tag">PNG/JPEG</span><span class="tag">XLS/XLS</span></span></span></button>' +
    '<div class="subrow"><button type="button" class="sub" data-act="print"><span class="mini">' + I.usb + '</span><span><b>Свои файлы</b><small>С USB или телефона</small></span><span class="chev">›</span></button>' +
    '<button type="button" class="sub" data-act="templates"><span class="mini">' + I.doc + '</span><span><b>Готовые шаблоны</b><small>PDF-формы</small></span><span class="chev">›</span></button></div></article>' +
    '<button type="button" class="card card-main" data-act="scan"><span class="ic">' + I.scan + "</span><span><b>Сканирование документов</b><span>Сохраните отсканированные документы на USB или телефон</span>" +
    '<span class="tags"><span class="tag">PDF</span><span class="tag">PNG</span></span></span><span class="chev">›</span></button>' +
    '<button type="button" class="card card-main" data-act="copy"><span class="ic">' + I.copy + "</span><span><b>Ксерокопия</b><span>Сначала отсканируйте, затем сразу распечатайте копии</span>" +
    '<span class="tags"><span class="tag">Односторонняя</span><span class="tag">Двусторонняя</span></span></span><span class="chev">›</span></button>' +
    '<footer class="home-foot"><button type="button" class="prices" data-act="prices">Цены и примеры</button>' +
    '<a class="help" href="tel:+79999999999">Если нужна помощь, позвоните +7 (999) 999-99-99</a></footer></div>';
}

function sourceCard(id, title, text, badge, status) {
  return '<button type="button" class="src' + (state.source === id ? " on" : "") + '" data-act="source" data-source="' + id + '">' +
    '<span class="badge ' + badge + '">' + I.usb + "</span><b>" + title + "</b><small>" + text + "</small><small class=\"" + status[1] + '">' + status[0] + "</small></button>";
}
function renderFiles() {
  const files = state.inbox[state.source] || [];
  const chosen = selectedItems();
  const pages = chosen.reduce(function (sum, file) { return sum + file.pages; }, 0);
  const waiting = state.waiting === state.source;
  let body = "";
  if (state.source === "usb") {
    body = '<p class="crumb"><b>USB-накопитель</b> › Другие документы</p><div class="list">' +
      files.map(function (file) { return fileButton(file, !!state.selected[file.id]); }).join("") + "</div>";
  } else if (waiting) {
    body = '<div class="wait-box"><p><b>Ожидание файлов…</b></p>' + qr(state.source.length * 40) +
      "<p>Канал открыт. Сейчас придёт тестовый документ.</p></div>";
  } else if (state.source === "browser" || state.source === "wifi") {
    body = '<p class="crumb"><b>' + (state.source === "browser" ? "Браузер" : "Wi-Fi киоска") + "</b> › Загрузка</p>" +
      '<label class="upload">Выбрать файл с телефона или компьютера<input id="file-in" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,image/*,application/pdf"></label>' +
      '<div class="list" style="margin-top:10px">' + files.map(function (file) { return fileButton(file, !!state.selected[file.id]); }).join("") + "</div>";
  } else {
    body = '<p class="crumb"><b>' + (state.source === "telegram" ? "Telegram" : "MAX") + "</b> › Входящие</p><div class=\"list\">" +
      (files.length ? files.map(function (file) { return fileButton(file, !!state.selected[file.id]); }).join("") : "<p>Файлов пока нет.</p>") + "</div>";
  }
  const usbStatus = files.length ? ["USB обнаружен", "ok"] : ["USB обнаружен", "ok"];
  const channelStatus = function (id) {
    if (state.waiting === id) return ["Ожидание файлов…", "wait"];
    if ((state.inbox[id] || []).length) return ["Файл получен", "ok"];
    return ["Ожидание файлов…", "wait"];
  };
  return '<div class="screen">' + head("Шаг 1 из 4 · Выбор файлов") +
    "<h1>Печать документов</h1><p class=\"lead\">Выберите файлы с USB-накопителя, через Telegram или в браузере.</p>" +
    '<div class="sources">' +
    sourceCard("usb", "USB-накопитель", "Выберите файлы с подключённой флешки", "usb", usbStatus) +
    sourceCard("telegram", "Telegram", "Отсканируйте QR — откроется Telegram", "tg", channelStatus("telegram")) +
    sourceCard("max", "MAX", "Отсканируйте QR — откроется MAX", "max", channelStatus("max")) +
    sourceCard("browser", "Браузер", "Отсканируйте QR — откроется страница загрузки", "web", channelStatus("browser")) +
    sourceCard("wifi", "Wi-Fi киоска", "Загрузка по Wi-Fi киоска, без интернета", "wifi", channelStatus("wifi")) +
    "</div>" + body +
    '<footer class="dock"><div><small>Выберите файлы для продолжения</small><p class="sum">' + rub(pages * RATE_BW) + '</p><small>Ориентировочная сумма</small></div>' +
    '<button type="button" class="btn dark" data-act="next"' + (pages ? "" : " disabled") + ">Печать</button></footer></div>";
}

function renderOptions() {
  const job = draft();
  const colors = [["gray", "Серый"], ["bw", "Ч/Б"], ["color", "Цветной"]];
  return '<div class="screen">' + head("Шаг 2 из 4 · Параметры") +
    '<div class="panel"><h2>' + job.pages + " стр. × " + state.copies + " коп.</h2><p class=\"lead\">" + esc(job.title || "Ничего не выбрано") + "</p>" +
    '<div class="between"><span>Число копий</span><div class="stepper"><button type="button" data-act="copies-dec">−</button><b>' + state.copies + '</b><button type="button" data-act="copies-inc">+</button></div></div>' +
    '<p class="label">Цвет</p><div class="seg">' + colors.map(function (item) {
      return '<button type="button" data-act="set-color" data-value="' + item[0] + '"' + (state.color === item[0] ? ' class="on"' : "") + ">" + item[1] + "</button>";
    }).join("") + "</div>" +
    '<p class="label">Стороны</p><div class="seg">' +
    '<button type="button" data-act="set-duplex" data-value="0"' + (!state.duplex ? ' class="on"' : "") + ">Односторонняя</button>" +
    '<button type="button" data-act="set-duplex" data-value="1"' + (state.duplex ? ' class="on"' : "") + ">Двусторонняя</button></div>" +
    "<p>" + (state.duplex ? "Листы выйдут с двух сторон. Цена считается по страницам." : "Каждая страница на своём листе.") + "</p></div>" +
    '<button type="button" class="btn dark block" data-act="to-pay"' + (job.pages ? "" : " disabled") + ">К оплате · " + rub(job.amount) + "</button></div>";
}

function renderPay() {
  const job = state.job;
  return '<div class="screen pay">' + head("Шаг 3 из 4 · Оплата") +
    '<div class="center"><p class="lead">' + esc(job.title) + "</p><p class=\"sum\">" + rub(job.amount) + "</p>" +
    "<p>" + job.impressions + " стр. · " + (job.duplex ? "двусторонняя" : "односторонняя") + "</p>" +
    qr(job.amount + job.impressions) +
    '<p class="timer"><span id="pay-left">' + state.payLeft + "</span> сек</p>" +
    '<button type="button" class="btn dark block" data-act="pay-now">Оплатить</button>' +
    "<p class=\"lead\">Тестовая оплата: деньги не списываются. Без неё печать не начнётся.</p></div></div>";
}

function renderWork() {
  return '<div class="screen"><div class="center"><p class="step-pill">Шаг 4 из 4</p><h1>Печатаем</h1><p class="lead">' +
    esc(state.job.title) + "</p><div class=\"bar\"><i id=\"bar\" style=\"width:" + state.progress + '%"></i></div></div></div>';
}
function renderDone() {
  return '<div class="screen"><div class="center"><h1>Заберите документы</h1><p class="lead">Оплачено ' + rub(state.job.amount) + ". Заказ закрыт.</p>" +
    '<button type="button" class="btn dark" data-act="home">Готово</button></div></div>';
}
function renderFail() {
  return '<div class="screen"><div class="center"><h1>Время вышло</h1><p class="lead">Оплаты не было, печать не началась. Отмеченные файлы сброшены.</p>' +
    '<button type="button" class="btn dark" data-act="home">На главный экран</button></div></div>';
}

function renderCopy() {
  const pages = copyPages();
  const docs = state.docs.map(function (doc) {
    const open = state.tuneId === doc.id;
    return '<article class="doc"><div class="doc-top"><span class="doc-ic">' + I.doc + '</span><span class="meta"><b>' + esc(doc.name) +
      "</b><small>" + esc(doc.size) + " · " + doc.pages + " стр. · " + doc.paper + " · " + (doc.color === "bw" ? "Ч/Б" : "Серый") +
      "</small></span>" + (doc.merged ? '<span class="mark">Объединён</span>' : "") + "</div>" +
      '<div class="tools"><button type="button" data-act="preview" data-id="' + doc.id + '">Просмотр</button>' +
      '<button type="button" data-act="tune" data-id="' + doc.id + '">Настройки</button>' +
      (doc.merged ? '<button type="button" data-act="split" data-id="' + doc.id + '">Разделить</button>' : "") +
      '<button type="button" data-act="del" data-id="' + doc.id + '">Удалить</button></div>' +
      (open ? '<p class="label">Размер</p><div class="seg"><button type="button" data-act="set-doc-paper" data-id="' + doc.id + '" data-value="A4"' + (doc.paper === "A4" ? ' class="on"' : "") + '>A4</button><button type="button" data-act="set-doc-paper" data-id="' + doc.id + '" data-value="A5"' + (doc.paper === "A5" ? ' class="on"' : "") + ">A5</button></div>" +
        '<p class="label">Цвет</p><div class="seg"><button type="button" data-act="set-doc-color" data-id="' + doc.id + '" data-value="gray"' + (doc.color === "gray" ? ' class="on"' : "") + '>Серый</button><button type="button" data-act="set-doc-color" data-id="' + doc.id + '" data-value="bw"' + (doc.color === "bw" ? ' class="on"' : "") + ">Ч/Б</button></div>" : "") +
      "</article>";
  }).join("");
  const modal = state.preview ? '<div class="modal" data-act="close-preview"><div class="dialog" data-act="noop"><h2>' + esc(state.preview.name) +
    "</h2><p>" + state.preview.pages + " стр. · " + state.preview.paper + "</p><div class=\"page\"></div><button type=\"button\" class=\"btn dark\" data-act=\"close-preview\">Закрыть</button></div></div>" : "";
  return '<div class="screen">' + head("") + "<h1>Ксерокопирование</h1><p class=\"lead\">Поместите документ в сканер и нажмите «Сканировать».</p>" +
    '<div class="scan-top"><button type="button" class="shoot" data-act="copy-scan">Сканировать документ</button><div class="panel">' +
    '<p class="label">Размер страницы</p><div class="seg"><button type="button" data-act="copy-paper" data-value="A4"' + (state.copyPaper === "A4" ? ' class="on"' : "") + '>A4</button><button type="button" data-act="copy-paper" data-value="A5"' + (state.copyPaper === "A5" ? ' class="on"' : "") + ">A5</button></div>" +
    '<p class="label">Цвет</p><div class="seg"><button type="button" data-act="copy-color" data-value="gray"' + (state.copyColor === "gray" ? ' class="on"' : "") + '>Серый</button><button type="button" data-act="copy-color" data-value="bw"' + (state.copyColor === "bw" ? ' class="on"' : "") + ">Ч/Б</button></div></div></div>" +
    '<div class="section-head"><b>Отсканированные документы</b><button type="button" class="merge" data-act="merge">Сформировать PDF</button></div>' +
    "<small>" + state.docs.length + " документа</small>" + docs +
    '<footer class="dock"><div><small>' + state.docs.length + " документа готовы · " + pages + ' страниц всего</small><p class="sum">' + rub(pages * RATE_BW) + '</p><small>Предварительная сумма</small></div>' +
    '<button type="button" class="btn dark" data-act="print-copy"' + (pages ? "" : " disabled") + ">Распечатать</button></footer></div>" + modal;
}

function renderScan() {
  const count = state.scanPages.length;
  const colorName = { color: "цветной", gray: "серый", bw: "ч/б" }[state.scanColor];
  return '<div class="screen"><div class="head"><button type="button" class="back" data-act="back" aria-label="Назад">←</button>' +
    '<span class="usb-pill">USB-накопитель подключён · <em>Готово</em></span></div>' +
    "<h1>Сканирование документов</h1><p class=\"lead\">Поместите документ в сканер и нажмите «Сканировать».</p>" +
    (state.scanSaved ? '<p class="saved">На флешку записан ' + esc(state.scanSaved) + ". Он уже виден в печати.</p>" : "") +
    '<div class="scan-top"><button type="button" class="shoot" data-act="scan-go">Сканировать документ</button><div class="panel">' +
    '<p class="label">Размер страницы</p><div class="seg"><button type="button" data-act="scan-paper" data-value="A4"' + (state.scanPaper === "A4" ? ' class="on"' : "") + '>A4</button><button type="button" data-act="scan-paper" data-value="A5"' + (state.scanPaper === "A5" ? ' class="on"' : "") + ">A5</button></div>" +
    '<p class="label">Цвет</p><div class="seg"><button type="button" data-act="scan-color" data-value="color"' + (state.scanColor === "color" ? ' class="on"' : "") + '>Цветной</button><button type="button" data-act="scan-color" data-value="gray"' + (state.scanColor === "gray" ? ' class="on"' : "") + '>Серый</button><button type="button" data-act="scan-color" data-value="bw"' + (state.scanColor === "bw" ? ' class="on"' : "") + ">Ч/Б</button></div>" +
    '<p class="label">Формат</p><div class="seg"><button type="button" data-act="scan-format" data-value="pdf"' + (state.scanFormat === "pdf" ? ' class="on"' : "") + '>PDF</button><button type="button" data-act="scan-format" data-value="png"' + (state.scanFormat === "png" ? ' class="on"' : "") + ">PNG</button></div>" +
    '<p class="label">Качество</p><div class="seg"><button type="button" data-act="scan-quality" data-value="std"' + (state.scanQuality === "std" ? ' class="on"' : "") + '>Стандарт</button><button type="button" data-act="scan-quality" data-value="high"' + (state.scanQuality === "high" ? ' class="on"' : "") + ">Высокое</button></div></div></div>" +
    '<div class="steps" style="margin-top:12px"><article class="step-card"><b>1. Откройте крышку</b>Аккуратно поднимите крышку сканера.</article>' +
    '<article class="step-card"><b>2. Положите документ</b>Лицевой стороной вниз, верх к дальней кромке.</article>' +
    '<article class="step-card"><b>3. Совместите угол</b>Угол листа к метке ' + state.scanPaper + ".</article></div>" +
    '<p class="note">Части документа за пределами стекла в файл не попадут.</p>' +
    '<footer class="dock"><div><b>' + (count ? count + " стр. · " + state.scanFormat.toUpperCase() + " · " + colorName : "Документы ещё не отсканированы") +
    "</b><small>" + (count ? "Можно сохранить на флешку" : "Нажмите «Сканировать», когда документ готов") + "</small></div>" +
    '<button type="button" class="btn dark" data-act="save-scan"' + (count ? "" : " disabled") + ">Сохранить</button></footer></div>";
}

function renderTemplates() {
  const chosen = state.templates.filter(function (item) { return state.selTpl[item.id]; });
  const pages = chosen.reduce(function (sum, item) { return sum + item.pages; }, 0);
  return '<div class="screen">' + head("Шаблоны") + "<h1>Готовые шаблоны</h1><p class=\"lead\">PDF-формы. Отметьте бланк и перейдите к печати.</p><div class=\"list\">" +
    state.templates.map(function (item) { return fileButton(item, !!state.selTpl[item.id]).replace('data-act="pick"', 'data-act="pick-tpl"'); }).join("") +
    "</div>" + '<footer class="dock"><div><small>Ориентировочная сумма</small><p class="sum">' + rub(pages * RATE_BW) + "</p></div>" +
    '<button type="button" class="btn dark" data-act="next"' + (pages ? "" : " disabled") + ">Печать</button></footer></div>";
}

function renderPrices() {
  return '<div class="screen">' + head("") + "<h1>Цены и примеры</h1>" +
    '<div class="panel"><p class="between"><span>Печать и копия, серый или ч/б</span><b>' + rub(RATE_BW) + "</b></p>" +
    '<p class="between"><span>Цветная печать</span><b>' + rub(RATE_COLOR) + "</b></p>" +
    "<p class=\"between\"><span>Скан на флешку</span><b>0 ₽</b></p></div>" +
    '<div class="panel"><b>Пример с экрана копии</b><p>4 страницы серым = ' + rub(60) + ". Две копии цветного листа = " + rub(80) + ".</p></div></div>";
}

function renderAds() {
  const rows = state.adsItems.map(function (item) {
    return '<div class="ad-row"><span class="thumb"></span><span class="meta"><b>' + esc(item.name) + "</b><small>" + esc(item.size) + "</small></span>" +
      '<button type="button" class="switch' + (item.on ? " on" : "") + '" data-act="ads-item" data-id="' + item.id + '" aria-label="Показ"><i></i></button></div>';
  }).join("");
  return '<div class="admin"><nav class="rail"><button type="button" data-act="home" aria-label="Киоск">' + I.home +
    '</button><button type="button" class="on" data-act="ads" aria-label="Реклама">' + I.ads +
    '</button><button type="button" class="power" data-act="off" aria-label="Выключить">' + I.power + "</button></nav><div class=\"admin-main\">" +
    "<h1>Реклама</h1><p class=\"lead\">Изображения и видео на главном экране после простоя.</p>" +
    '<div class="panel"><div class="between"><span><b>Реклама включена</b><small style="display:block;color:#6f6a63">Если выключено, ролик на главном экране не показывается.</small></span>' +
    '<button type="button" class="switch' + (state.adsOn ? " on" : "") + '" data-act="ads-on" aria-label="Включить рекламу"><i></i></button></div>' +
    '<p class="label">Тип рекламы</p><div class="seg"><button type="button" data-act="ads-type" data-value="image"' + (state.adsType === "image" ? ' class="on"' : "") + '>Изображения</button>' +
    '<button type="button" data-act="ads-type" data-value="video"' + (state.adsType === "video" ? ' class="on"' : "") + ">Видео</button></div>" +
    '<p class="label">Задержка перед показом · <span id="delay-val">' + state.adsDelay + ' сек</span></p><input class="slider" id="delay" type="range" min="5" max="90" value="' + state.adsDelay + '">' +
    '<p class="label">Время показа · <span id="show-val">' + state.adsShow + ' сек</span></p><input class="slider" id="show" type="range" min="3" max="30" value="' + state.adsShow + '"></div>' +
    '<div class="between"><b>Изображения</b><label class="btn dark">Импорт с USB<input id="ad-file" class="hide" type="file" accept="image/*,video/*"></label></div>' +
    rows + "</div></div>";
}

function renderAd() {
  const item = state.adItem;
  let media = '<div class="poster"><p class="step-pill">Реклама</p><h1>' + esc(item ? item.name : "Ролик") + "</h1></div>";
  if (item && item.url && item.video) media = '<video src="' + esc(item.url) + '" autoplay muted loop playsinline></video>';
  else if (item && item.url) media = '<img src="' + esc(item.url) + '" alt="' + esc(item.name) + '">';
  return '<div class="ad-screen">' + media + '<button type="button" class="ad-hit" data-act="home">Коснитесь экрана</button></div>';
}

function renderOff() {
  return '<button type="button" class="screen off" data-act="wake">Коснитесь, чтобы включить</button>';
}

function render() {
  if (state.screen !== "home" && state.screen !== "ad") {
    clearTimeout(adTimer);
    clearTimeout(adClose);
  }
  const screens = {
    home: renderHome,
    files: renderFiles,
    options: renderOptions,
    pay: renderPay,
    work: renderWork,
    done: renderDone,
    fail: renderFail,
    copy: renderCopy,
    scan: renderScan,
    templates: renderTemplates,
    prices: renderPrices,
    ads: renderAds,
    ad: renderAd,
    off: renderOff
  };
  view.innerHTML = (screens[state.screen] || renderHome)();
  nowEl.textContent = "Сейчас: " + (TITLES[state.screen] || state.screen);
  bindExtras();
  if (state.screen === "home") armAd();
}

function bindExtras() {
  const input = document.getElementById("file-in");
  if (input) {
    input.addEventListener("change", async function () {
      const files = Array.from(input.files || []);
      for (let i = 0; i < files.length; i++) await addUpload(files[i]);
      render();
    });
  }
  const adFile = document.getElementById("ad-file");
  if (adFile) {
    adFile.addEventListener("change", function () {
      const file = adFile.files && adFile.files[0];
      if (!file) return;
      const video = file.type.indexOf("video") === 0;
      state.adsItems.push({ id: uid(), name: file.name, size: formatSize(file.size), url: URL.createObjectURL(file), video: video, on: true });
      if (video) state.adsType = "video";
      render();
    });
  }
  const delay = document.getElementById("delay");
  if (delay) delay.addEventListener("input", function () {
    state.adsDelay = Number(delay.value);
    document.getElementById("delay-val").textContent = state.adsDelay + " сек";
  });
  const show = document.getElementById("show");
  if (show) show.addEventListener("input", function () {
    state.adsShow = Number(show.value);
    document.getElementById("show-val").textContent = state.adsShow + " сек";
  });
}

function act(name, el) {
  if (name === "noop") return;
  if (name === "home" || name === "wake") return go("home");
  if (name === "print") { state.mode = "usb"; state.screen = "files"; return render(); }
  if (name === "templates") { state.mode = "tpl"; return go("templates"); }
  if (name === "scan") return go("scan");
  if (name === "copy") return go("copy");
  if (name === "prices") return go("prices");
  if (name === "ads") return go("ads");
  if (name === "off") return go("off");
  if (name === "back") {
    if (state.screen === "options") return go(state.mode === "tpl" ? "templates" : "files");
    if (state.screen === "pay") return go(state.payBack);
    return go("home");
  }
  if (name === "source") return activateSource(el.dataset.source);
  if (name === "pick") {
    state.selected[el.dataset.id] = !state.selected[el.dataset.id];
    return render();
  }
  if (name === "pick-tpl") {
    state.selTpl[el.dataset.id] = !state.selTpl[el.dataset.id];
    return render();
  }
  if (name === "next") {
    state.mode = state.screen === "templates" ? "tpl" : "usb";
    if (!draft().pages) return;
    return go("options");
  }
  if (name === "copies-inc") { state.copies = Math.min(20, state.copies + 1); return render(); }
  if (name === "copies-dec") { state.copies = Math.max(1, state.copies - 1); return render(); }
  if (name === "set-color") { state.color = el.dataset.value; return render(); }
  if (name === "set-duplex") { state.duplex = el.dataset.value === "1"; return render(); }
  if (name === "to-pay") {
    const job = draft();
    if (!job.pages) return;
    state.job = job;
    return beginPay("options");
  }
  if (name === "pay-now") return beginWork();
  if (name === "copy-paper") { state.copyPaper = el.dataset.value; return render(); }
  if (name === "copy-color") { state.copyColor = el.dataset.value; return render(); }
  if (name === "copy-scan") {
    state.copyN += 1;
    state.docs.push({
      id: uid(),
      name: "Copy_" + String(state.copyN).padStart(3, "0") + ".pdf",
      pages: 1,
      size: "1,2 МБ",
      color: state.copyColor,
      paper: state.copyPaper,
      merged: false
    });
    return render();
  }
  if (name === "del") {
    state.docs = state.docs.filter(function (doc) { return doc.id !== el.dataset.id; });
    return render();
  }
  if (name === "preview") {
    state.preview = state.docs.find(function (doc) { return doc.id === el.dataset.id; });
    return render();
  }
  if (name === "close-preview") { state.preview = null; return render(); }
  if (name === "tune") {
    state.tuneId = state.tuneId === el.dataset.id ? null : el.dataset.id;
    return render();
  }
  if (name === "set-doc-paper" || name === "set-doc-color") {
    const doc = state.docs.find(function (item) { return item.id === el.dataset.id; });
    if (doc) doc[name === "set-doc-paper" ? "paper" : "color"] = el.dataset.value;
    return render();
  }
  if (name === "split") {
    const index = state.docs.findIndex(function (doc) { return doc.id === el.dataset.id; });
    if (index < 0) return;
    const doc = state.docs[index];
    const parts = [];
    for (let i = 0; i < doc.pages; i++) {
      parts.push({ id: uid(), name: "Лист_" + (i + 1) + ".pdf", pages: 1, size: "0,6 МБ", color: doc.color, paper: doc.paper, merged: false });
    }
    state.docs.splice(index, 1, ...parts);
    return render();
  }
  if (name === "merge") {
    if (state.docs.length < 2) return;
    const pages = copyPages();
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    state.docs = [{ id: uid(), name: "merged-" + stamp + ".pdf", pages: pages, size: "3,8 МБ", color: "gray", paper: state.copyPaper, merged: true }];
    return render();
  }
  if (name === "print-copy") {
    const pages = copyPages();
    if (!pages) return;
    state.job = { kind: "copy", pages: pages, copies: 1, amount: pages * RATE_BW, impressions: pages, duplex: false, title: "Ксерокопия, " + pages + " стр." };
    return beginPay("copy");
  }
  if (name === "scan-paper") { state.scanPaper = el.dataset.value; return render(); }
  if (name === "scan-color") { state.scanColor = el.dataset.value; return render(); }
  if (name === "scan-format") { state.scanFormat = el.dataset.value; return render(); }
  if (name === "scan-quality") { state.scanQuality = el.dataset.value; return render(); }
  if (name === "scan-go") {
    state.scanPages.push({ paper: state.scanPaper, color: state.scanColor, format: state.scanFormat, quality: state.scanQuality });
    return render();
  }
  if (name === "save-scan") {
    if (!state.scanPages.length) return;
    state.scanN += 1;
    const name = "Scan_" + String(state.scanN).padStart(3, "0") + "." + state.scanFormat;
    state.inbox.usb.unshift({ id: uid(), name: name, size: state.scanFormat === "png" ? "2,4 МБ" : "800 КБ", pages: state.scanPages.length });
    state.scanPages = [];
    state.scanSaved = name;
    return render();
  }
  if (name === "ads-on") { state.adsOn = !state.adsOn; return render(); }
  if (name === "ads-type") { state.adsType = el.dataset.value; return render(); }
  if (name === "ads-item") {
    const item = state.adsItems.find(function (ad) { return ad.id === el.dataset.id; });
    if (item) item.on = !item.on;
    return render();
  }
}

view.addEventListener("click", function (event) {
  const el = event.target.closest("[data-act]");
  if (!el || el.disabled) return;
  act(el.dataset.act, el);
});
document.getElementById("home").addEventListener("click", function () { go("home"); });

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}
render();
