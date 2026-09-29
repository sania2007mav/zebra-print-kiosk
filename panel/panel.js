const AS_OF = new Date(2026, 8, 29);

const KIOSKS = [
  {
    id: "ZP-01",
    name: "Колледж, корпус А",
    city: "Костанай",
    since: "2026-03-02",
    status: "ready",
    pulse: "только что",
    base: 14800,
    refill: "26 сентября, 2 000 листов, Айгуль",
    trays: [
      { name: "Лоток 1", have: 1240, cap: 2000 },
      { name: "Лоток 2", have: 480, cap: 500 }
    ],
    toner: [{ name: "Чёрный", pct: 72 }],
    orders: [
      ["12:40", "Печать", "Заявление.pdf", "6 стр.", "900 ₸"],
      ["11:15", "Копия", "Паспорт", "2 стр.", "400 ₸"],
      ["10:02", "Печать", "Курсовая.docx", "28 стр.", "4 200 ₸"]
    ]
  },
  {
    id: "ZP-02",
    name: "Общежитие",
    city: "Костанай",
    since: "2026-03-18",
    status: "paper",
    pulse: "1 мин назад",
    base: 8600,
    refill: "12 сентября, 500 листов, Ерлан",
    trays: [{ name: "Лоток 1", have: 38, cap: 500 }],
    toner: [{ name: "Чёрный", pct: 14 }],
    orders: [
      ["13:05", "Печать", "Реферат.docx", "11 стр.", "1 650 ₸"],
      ["09:48", "Скан", "Справка", "1 стр.", "200 ₸"]
    ]
  },
  {
    id: "ZP-03",
    name: "Университет, холл",
    city: "Костанай",
    since: "2026-05-06",
    status: "printing",
    pulse: "печатает сейчас",
    base: 17200,
    refill: "24 сентября, 2 000 листов, Айгуль",
    trays: [
      { name: "Лоток 1", have: 860, cap: 2000 },
      { name: "Лоток 2", have: 300, cap: 500 }
    ],
    toner: [
      { name: "Чёрный", pct: 54 },
      { name: "Голубой", pct: 61 },
      { name: "Пурпурный", pct: 48 },
      { name: "Жёлтый", pct: 70 }
    ],
    orders: [
      ["14:02", "Печать", "Презентация.pdf", "18 стр.", "3 600 ₸"],
      ["13:22", "Копия", "Диплом", "40 стр.", "6 000 ₸"]
    ]
  },
  {
    id: "ZP-04",
    name: "Торговый центр",
    city: "Костанай",
    since: "2026-06-09",
    status: "offline",
    pulse: "нет пульса 14 мин",
    base: 12100,
    refill: "20 сентября, 1 000 листов, Ерлан",
    trays: [{ name: "Лоток 1", have: 410, cap: 1000 }],
    toner: [{ name: "Чёрный", pct: 41 }],
    orders: [
      ["11:10", "Печать", "Билет.pdf", "1 стр.", "150 ₸"],
      ["10:44", "Копия", "Договор", "4 стр.", "600 ₸"]
    ]
  },
  {
    id: "ZP-05",
    name: "ЦОН, зал ожидания",
    city: "Костанай",
    since: "2026-07-01",
    status: "jam",
    pulse: "замятие в 14:12",
    base: 15400,
    refill: "22 сентября, 1 500 листов, Айгуль",
    trays: [{ name: "Лоток 1", have: 220, cap: 1500 }],
    toner: [{ name: "Чёрный", pct: 8 }],
    orders: [
      ["14:08", "Копия", "Удостоверение", "2 стр.", "не допечатан"],
      ["13:40", "Печать", "Заявление.pdf", "3 стр.", "450 ₸"]
    ]
  },
  {
    id: "ZP-06",
    name: "Колледж",
    city: "Петропавловск",
    since: "2026-08-11",
    status: "ready",
    pulse: "2 мин назад",
    base: 9800,
    refill: "27 сентября, 2 000 листов, Марат",
    trays: [{ name: "Лоток 1", have: 1500, cap: 2000 }],
    toner: [{ name: "Чёрный", pct: 91 }],
    orders: [
      ["12:18", "Печать", "Лаба.docx", "9 стр.", "1 350 ₸"],
      ["08:55", "Скан", "Паспорт", "1 стр.", "200 ₸"]
    ]
  },
  {
    id: "ZP-07",
    name: "Коворкинг",
    city: "Алматы",
    since: "2026-09-02",
    status: "paper",
    pulse: "только что",
    base: 13300,
    refill: "18 сентября, 500 листов, Диана",
    trays: [{ name: "Лоток 1", have: 42, cap: 500 }],
    toner: [{ name: "Чёрный", pct: 33 }],
    orders: [
      ["13:50", "Печать", "Счёт.xlsx", "2 стр.", "300 ₸"],
      ["12:05", "Печать", "Договор.pdf", "7 стр.", "1 050 ₸"]
    ]
  }
];

const STATUS = {
  ready: ["Готов", ""],
  printing: ["Печатает", ""],
  paper: ["Мало бумаги", "mid"],
  jam: ["Замятие", "bad"],
  offline: ["Нет связи", "mute"],
  toner: ["Мало тонера", "bad"]
};

const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

const state = { view: "all", range: "30", id: "ZP-05" };

function sheets(k) {
  return k.trays.reduce(function (sum, tray) { return sum + tray.have; }, 0);
}
function capacity(k) {
  return k.trays.reduce(function (sum, tray) { return sum + tray.cap; }, 0);
}
function tonerMin(k) {
  return Math.min.apply(null, k.toner.map(function (t) { return t.pct; }));
}
function needsAttention(k) {
  return k.status === "jam" || k.status === "offline" || k.status === "paper" || k.status === "toner" || tonerMin(k) < 15 || sheets(k) < 50;
}
function dayKey(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}
function unit(id, key) {
  let hash = 2166136261;
  const text = id + key;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}
function take(kiosk, date) {
  const since = new Date(kiosk.since + "T00:00:00");
  if (date < since) return 0;
  const key = dayKey(date);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  let value = kiosk.base * (0.72 + unit(kiosk.id, key) * 0.56);
  if (weekend) value *= 0.4;
  if (kiosk.id === "ZP-03" && (date.getMonth() === 4 || date.getMonth() === 8)) value *= 1.35;
  if (kiosk.status === "offline" && key === dayKey(AS_OF)) value *= 0.35;
  if (kiosk.status === "jam" && key === dayKey(AS_OF)) value *= 0.55;
  return Math.round(value / 50) * 50;
}

const DAYS = [];
for (let offset = 179; offset >= 0; offset--) {
  const date = new Date(AS_OF);
  date.setDate(AS_OF.getDate() - offset);
  const byId = {};
  KIOSKS.forEach(function (kiosk) { byId[kiosk.id] = take(kiosk, date); });
  DAYS.push({ date: date, key: dayKey(date), byId: byId });
}

function money(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₸";
}
function sumIds(row, ids) {
  return ids.reduce(function (sum, id) { return sum + (row.byId[id] || 0); }, 0);
}
function visibleKiosks() {
  return KIOSKS.filter(function (kiosk) {
    if (state.view === "offline") return kiosk.status === "offline";
    if (state.view === "attention") return needsAttention(kiosk);
    return true;
  });
}
function selected() {
  return KIOSKS.find(function (kiosk) { return kiosk.id === state.id; }) || null;
}
function scopeIds() {
  return visibleKiosks().map(function (kiosk) { return kiosk.id; });
}
function levelClass(pct) {
  if (pct < 15) return "bad";
  if (pct < 25) return "mid";
  return "";
}
function paperClass(have, cap) {
  const pct = have / cap;
  if (have < 50 || pct < 0.08) return "bad";
  if (have < 80 || pct < 0.2) return "mid";
  return "";
}

function points() {
  const ids = scopeIds();
  if (state.range === "6m") {
    const buckets = [];
    DAYS.forEach(function (day) {
      const label = day.date.getFullYear() + "-" + day.date.getMonth();
      let bucket = buckets[buckets.length - 1];
      if (!bucket || bucket.label !== label) {
        bucket = { label: label, name: MONTHS[day.date.getMonth()], value: 0 };
        buckets.push(bucket);
      }
      bucket.value += sumIds(day, ids);
    });
    return buckets.slice(-6);
  }
  const count = Number(state.range);
  return DAYS.slice(-count).map(function (day) {
    return {
      name: String(day.date.getDate()),
      title: day.date.getDate() + " " + MONTHS[day.date.getMonth()],
      value: sumIds(day, ids)
    };
  });
}

function renderKpis() {
  const online = KIOSKS.filter(function (kiosk) { return kiosk.status !== "offline"; }).length;
  const paper = KIOSKS.reduce(function (sum, kiosk) { return sum + sheets(kiosk); }, 0);
  const attention = KIOSKS.filter(needsAttention).length;
  const today = DAYS[DAYS.length - 1];
  const month = DAYS.filter(function (day) {
    return day.date.getMonth() === AS_OF.getMonth() && day.date.getFullYear() === AS_OF.getFullYear();
  });
  const monthSum = month.reduce(function (sum, day) {
    return sum + sumIds(day, KIOSKS.map(function (kiosk) { return kiosk.id; }));
  }, 0);
  const todaySum = sumIds(today, KIOSKS.map(function (kiosk) { return kiosk.id; }));
  document.getElementById("kpis").innerHTML = [
    [online + " / " + KIOSKS.length, "аппаратов на связи"],
    [new Intl.NumberFormat("ru-RU").format(paper), "листов во всех лотках"],
    [String(attention), "требуют внимания", "warn"],
    [money(todaySum), "выручка сегодня · месяц " + money(monthSum)]
  ].map(function (item) {
    return '<article class="kpi ' + (item[2] || "") + '"><b>' + item[0] + '</b><span>' + item[1] + '</span></article>';
  }).join("");
  document.getElementById("head-note").textContent = online + " на связи. " + attention + " просят бумагу, тонер или выезд. Цифры выдуманы для демонстрации.";
}

function renderChart() {
  const data = points();
  const titles = { all: "Выручка сети", attention: "Выручка аппаратов, которым нужно внимание", offline: "Выручка аппаратов без связи" };
  document.getElementById("chart-title").textContent = titles[state.view];
  const total = data.reduce(function (sum, item) { return sum + item.value; }, 0);
  document.getElementById("chart-sub").textContent = "За выбранный период " + money(total);
  const width = 640;
  const height = 220;
  const pad = { l: 52, r: 8, t: 12, b: 28 };
  const max = Math.max.apply(null, data.map(function (item) { return item.value; }).concat([1]));
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const gap = 4;
  const barW = Math.max(2, (innerW - gap * data.length) / data.length);
  let ticks = "";
  for (let step = 0; step < 3; step++) {
    const value = Math.round(max * (1 - step / 2) / 1000) * 1000;
    const y = pad.t + innerH * (step / 2);
    ticks += '<text x="0" y="' + (y + 4) + '" fill="#5e584f" font-size="11">' + new Intl.NumberFormat("ru-RU").format(value) + '</text>';
    ticks += '<line x1="' + pad.l + '" y1="' + y + '" x2="' + (width - pad.r) + '" y2="' + y + '" stroke="#ddd4c6"/>';
  }
  const bars = data.map(function (item, index) {
    const h = Math.max(1, (item.value / max) * innerH);
    const x = pad.l + index * (barW + gap);
    const y = pad.t + innerH - h;
    const label = index % (data.length > 16 ? 5 : data.length > 8 ? 2 : 1) === 0 ? item.name : "";
    return '<g><rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" fill="#1d4a38" data-tip="' + (item.title || item.name) + " · " + money(item.value) + '"></rect>' +
      (label ? '<text x="' + (x + barW / 2) + '" y="' + (height - 8) + '" text-anchor="middle" fill="#5e584f" font-size="11">' + label + '</text>' : "") +
      '</g>';
  }).join("");
  document.getElementById("chart").innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img">' + ticks + bars + '</svg>';
  const tip = document.getElementById("tip") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "tip", className: "tip" }));
  tip.hidden = true;
  document.querySelectorAll("#chart rect").forEach(function (rect) {
    rect.addEventListener("mousemove", function (event) {
      tip.hidden = false;
      tip.textContent = rect.getAttribute("data-tip");
      tip.style.left = event.clientX + "px";
      tip.style.top = event.clientY + "px";
    });
    rect.addEventListener("mouseleave", function () { tip.hidden = true; });
  });
}

function meter(have, cap) {
  const pct = Math.round((have / cap) * 100);
  return '<div class="meter"><i><em class="' + paperClass(have, cap) + '" style="width:' + pct + '%"></em></i><small>' +
    new Intl.NumberFormat("ru-RU").format(have) + " / " + new Intl.NumberFormat("ru-RU").format(cap) + '</small></div>';
}
function tonerMeter(kiosk) {
  const pct = tonerMin(kiosk);
  const label = kiosk.toner.length > 1 ? "от " + pct + "%" : pct + "%";
  return '<div class="meter"><i><em class="' + levelClass(pct) + '" style="width:' + pct + '%"></em></i><small>' + label + '</small></div>';
}

function renderTable() {
  const list = visibleKiosks();
  document.getElementById("rows").innerHTML = list.map(function (kiosk) {
    const status = STATUS[kiosk.status];
    const today = DAYS[DAYS.length - 1].byId[kiosk.id];
    return '<tr class="pick' + (kiosk.id === state.id ? " is-on" : "") + '" data-id="' + kiosk.id + '">' +
      '<td><div class="name">' + kiosk.name + '</div><div class="where">' + kiosk.id + " · " + kiosk.city + '</div><span class="pill ' + status[1] + '">' + status[0] + '</span></td>' +
      '<td>' + meter(sheets(kiosk), capacity(kiosk)) + '</td>' +
      '<td>' + tonerMeter(kiosk) + '</td>' +
      '<td class="num">' + money(today) + '</td></tr>';
  }).join("") || '<tr><td colspan="4">В этом фильтре аппаратов нет.</td></tr>';
  document.querySelectorAll("#rows tr.pick").forEach(function (row) {
    row.addEventListener("click", function () {
      state.id = row.getAttribute("data-id");
      render();
    });
  });
}

function renderDetail() {
  const kiosk = selected();
  const host = document.getElementById("detail");
  if (!kiosk) {
    host.innerHTML = "<p>Выберите аппарат в списке.</p>";
    return;
  }
  const status = STATUS[kiosk.status];
  const monthSum = DAYS.filter(function (day) {
    return day.date.getMonth() === AS_OF.getMonth();
  }).reduce(function (sum, day) { return sum + day.byId[kiosk.id]; }, 0);
  const trays = kiosk.trays.map(function (tray) {
    const pct = Math.round((tray.have / tray.cap) * 100);
    return '<div class="line"><div class="wide"><div>' + tray.name + '</div><i><em class="' + paperClass(tray.have, tray.cap) + '" style="width:' + pct + '%"></em></i></div><b>' +
      new Intl.NumberFormat("ru-RU").format(tray.have) + '</b></div>';
  }).join("");
  const toner = kiosk.toner.map(function (item) {
    return '<div class="line"><div class="wide"><div>' + item.name + '</div><i><em class="' + levelClass(item.pct) + '" style="width:' + item.pct + '%"></em></i></div><b>' + item.pct + '%</b></div>';
  }).join("");
  const orders = kiosk.orders.map(function (order) {
    return '<div class="line order"><span>' + order[0] + " · " + order[1] + '</span><b>' + order[4] + '</b></div><div class="where">' + order[2] + " · " + order[3] + '</div>';
  }).join("");
  host.innerHTML =
    '<span class="pill ' + status[1] + '">' + status[0] + '</span>' +
    '<h3>' + kiosk.name + '</h3>' +
    '<p class="sub">' + kiosk.id + " · " + kiosk.city + " · " + kiosk.pulse + '</p>' +
    '<div class="line"><span>Выручка за сентябрь</span><b>' + money(monthSum) + '</b></div>' +
    '<div class="block"><h4>Лотки</h4>' + trays + '</div>' +
    '<div class="block"><h4>Тонер</h4>' + toner + '</div>' +
    '<div class="block"><h4>Последняя заправка</h4><p>' + kiosk.refill + '</p></div>' +
    '<div class="block"><h4>Последние заказы</h4>' + orders + '</div>';
}

function render() {
  document.querySelectorAll(".nav-btn").forEach(function (button) {
    button.classList.toggle("is-on", button.getAttribute("data-view") === state.view);
  });
  document.querySelectorAll("#range button").forEach(function (button) {
    button.classList.toggle("is-on", button.getAttribute("data-range") === state.range);
  });
  renderKpis();
  renderChart();
  renderTable();
  renderDetail();
}

document.querySelectorAll(".nav-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    state.view = button.getAttribute("data-view");
    const list = visibleKiosks();
    if (!list.some(function (kiosk) { return kiosk.id === state.id; }) && list[0]) state.id = list[0].id;
    render();
  });
});
document.querySelectorAll("#range button").forEach(function (button) {
  button.addEventListener("click", function () {
    state.range = button.getAttribute("data-range");
    render();
  });
});

render();
