/* -----------------------------------------
   utils.js – دوال مساعدة عامة
------------------------------------------*/

// رابط WebApp الأساسي
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzetSfs5y04p514AVEenPEV10VrgrkbtGnQqztKgLIAQa3OQuVqo89kRHXf3DClSOLZ/exec";

// رقم الفاتورة (Cache محلي)
function getNextInvoiceNumber() {
  const key = "invoice-last-number";
  let last = Number(localStorage.getItem(key) || "0");
  last += 1;
  localStorage.setItem(key, String(last));
  return last;
}

// تنسيق رقم إلى 2 decimal places
function fnum(n) {
  return Number(n || 0).toFixed(2);
}

// تاريخ اليوم بصيغة YYYY-MM-DD
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* -----------------------------------------
   Requests
------------------------------------------*/

// GET من WebApp
async function apiGet(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = WEBAPP_URL + "?" + query;

  const res = await fetch(url);
  return res.json();
}

// POST لجوجل سكربت
async function apiPost(action, data = {}) {
  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action, data })
    });

    return res.json();
  } catch (err) {
    return { status: "error", message: String(err) };
  }
}

/* -----------------------------------------
   Offline Helpers
------------------------------------------*/

function isOnline() {
  return navigator.onLine;
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadJSON error", e);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("saveJSON error", e);
  }
}

/* -----------------------------------------
   DOM Helpers
------------------------------------------*/

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

function create(tag, cls = "") {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
}
