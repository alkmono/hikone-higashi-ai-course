(function () {
  "use strict";

  const config = window.SITE_CONFIG;
  const categoryOrder = ["講座の内容", "参加・申し込み", "持ち物・準備", "その他"];
  const sampleRows = [
    { 公開: "TRUE", カテゴリ: "講座の内容", 質問: "AIを使ったことがなくても参加できますか？", 回答: "はい、参加できます。\n初めての人にもわかるところから進めます。", 回答日: todayString(0) },
    { 公開: "TRUE", カテゴリ: "参加・申し込み", 質問: "説明会に参加できなくても申し込めますか？", 回答: "はい。説明会への参加にかかわらず、講座へ申し込めます。", 回答日: todayString(2) },
    { 公開: "TRUE", カテゴリ: "持ち物・準備", 質問: "パソコンを持参する必要はありますか？", 回答: "必要な持ち物は、参加者へあらためてお知らせします。", 回答日: todayString(5) }
  ];

  const status = document.getElementById("qa-status");
  const list = document.getElementById("qa-list");
  const search = document.getElementById("qa-search");
  const lastUpdated = document.getElementById("last-updated");
  const questionLink = document.getElementById("qa-question-link");
  questionLink.href = config.questionFormUrl;

  let rows = [];

  init();

  async function init() {
    try {
      if (isPlaceholderUrl(config.qaCsvUrl)) {
        rows = normalizeRows(sampleRows);
      } else {
        const separator = config.qaCsvUrl.includes("?") ? "&" : "?";
        const response = await fetch(`${config.qaCsvUrl}${separator}_=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        rows = normalizeRows(parseCsv(await response.text()));
      }
      updateLastUpdated(rows);
      render(rows);
    } catch (error) {
      console.error("Q&Aの読み込みに失敗しました", error);
      status.textContent = "読み込みに失敗しました。時間をおいて再度開いてください";
    }
  }

  search.addEventListener("input", function () {
    const keyword = search.value.trim().toLocaleLowerCase("ja");
    const filtered = keyword
      ? rows.filter((row) => `${row.question}\n${row.answer}`.toLocaleLowerCase("ja").includes(keyword))
      : rows;
    render(filtered, Boolean(keyword));
  });

  function normalizeRows(rawRows) {
    return rawRows
      .filter((row) => String(row["公開"] || row["公開（チェックボックス）"] || "").trim().toUpperCase() === "TRUE")
      .map((row) => {
        const rawCategory = String(row["カテゴリ"] || "").trim();
        return {
          category: categoryOrder.includes(rawCategory) ? rawCategory : "その他",
          question: String(row["質問"] || "").trim(),
          answer: String(row["回答"] || "").trim(),
          dateText: String(row["回答日"] || "").trim(),
          date: parseDate(row["回答日"])
        };
      })
      .filter((row) => row.question && row.answer)
      .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
  }

  function render(items, isSearch) {
    list.replaceChildren();
    status.hidden = true;
    list.hidden = false;

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "status-message empty-message";
      empty.textContent = isSearch
        ? "該当する質問はまだありません"
        : "まだ回答済みの質問はありません。気になることがあれば気軽に質問してください";
      list.appendChild(empty);
      return;
    }

    categoryOrder.forEach((category) => {
      const categoryItems = items.filter((item) => item.category === category);
      if (!categoryItems.length) return;

      const section = document.createElement("section");
      section.className = "qa-category";
      const heading = document.createElement("h2");
      heading.textContent = category;
      section.appendChild(heading);

      categoryItems.forEach((item, index) => section.appendChild(createAccordion(item, category, index)));
      list.appendChild(section);
    });
  }

  function createAccordion(item, category, index) {
    const article = document.createElement("article");
    article.className = "qa-item";

    const button = document.createElement("button");
    button.className = "qa-question";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    const safeId = `answer-${categoryOrder.indexOf(category)}-${index}-${Math.random().toString(36).slice(2, 7)}`;
    button.setAttribute("aria-controls", safeId);

    const qMark = document.createElement("span");
    qMark.className = "qa-mark";
    qMark.textContent = "Q.";
    const questionText = document.createElement("span");
    questionText.className = "question-text";
    questionText.textContent = item.question;
    button.append(qMark, questionText);

    if (isNew(item.date)) {
      const badge = document.createElement("span");
      badge.className = "new-badge";
      badge.textContent = "NEW";
      button.appendChild(badge);
    }

    const icon = document.createElement("span");
    icon.className = "accordion-icon";
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    const panel = document.createElement("div");
    panel.className = "qa-answer";
    panel.id = safeId;
    panel.hidden = true;
    const aMark = document.createElement("span");
    aMark.className = "qa-mark answer-mark";
    aMark.textContent = "A.";
    const answerText = document.createElement("p");
    answerText.textContent = item.answer;
    panel.append(aMark, answerText);

    button.addEventListener("click", function () {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });

    article.append(button, panel);
    return article;
  }

  // RFC 4180形式（カンマ・改行・ダブルクォートを含むセル）を扱うCSVパーサー
  function parseCsv(text) {
    const records = [];
    let record = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        record.push(field);
        field = "";
      } else if (char === "\n") {
        record.push(field.replace(/\r$/, ""));
        records.push(record);
        record = [];
        field = "";
      } else {
        field += char;
      }
    }
    if (field || record.length) {
      record.push(field.replace(/\r$/, ""));
      records.push(record);
    }

    if (!records.length) return [];
    const headers = records.shift().map((header, index) => index === 0 ? header.replace(/^\uFEFF/, "").trim() : header.trim());
    return records.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
  }

  function parseDate(value) {
    if (!value) return null;
    const text = String(value).trim();
    let date = new Date(text);
    if (!Number.isNaN(date.getTime())) return startOfDay(date);
    const match = text.match(/(\d{4})[年\/.\-](\d{1,2})[月\/.\-](\d{1,2})/);
    if (!match) return null;
    date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function updateLastUpdated(items) {
    const newest = items.find((item) => item.date);
    if (!newest) return;
    lastUpdated.textContent = `最終更新日：${newest.date.getFullYear()}年${newest.date.getMonth() + 1}月${newest.date.getDate()}日`;
    lastUpdated.hidden = false;
  }

  function isNew(date) {
    if (!date) return false;
    const elapsed = startOfDay(new Date()).getTime() - date.getTime();
    return elapsed >= 0 && elapsed <= 3 * 24 * 60 * 60 * 1000;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function todayString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function isPlaceholderUrl(url) {
    return !url || /EXAMPLE|YOUR_|ここに/i.test(url);
  }
})();
