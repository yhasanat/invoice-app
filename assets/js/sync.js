/* -----------------------------------------
   sync.js – مزامنة الأوفلاين مع السيرفر
------------------------------------------*/

const SYNC_KEYS = {
  invoices: "pending-invoices",
  stock: "pending-stock-updates"
};

/* ------------- إدارة قائمة الانتظار ------------- */

function getPendingInvoices() {
  return loadJSON(SYNC_KEYS.invoices, []);
}

function setPendingInvoices(list) {
  saveJSON(SYNC_KEYS.invoices, list);
}

function getPendingStockUpdates() {
  return loadJSON(SYNC_KEYS.stock, []);
}

function setPendingStockUpdates(list) {
  saveJSON(SYNC_KEYS.stock, list);
}

/* تخزين فاتورة في قائمة الانتظار */
function queueInvoiceForSync(invoice) {
  const list = getPendingInvoices();
  // منع تكرار نفس رقم الفاتورة أكثر من مرة
  if (!list.some(inv => String(inv.id) === String(invoice.id))) {
    list.push(invoice);
    setPendingInvoices(list);
  }
  console.log("فاتورة أضيفت لقائمة الأوفلاين:", invoice.id);
}

/* تخزين حركة مخزون في قائمة الانتظار */
function queueStockUpdateForSync(update) {
  const list = getPendingStockUpdates();
  list.push(update);
  setPendingStockUpdates(list);
  console.log("حركة مخزون أضيفت لقائمة الأوفلاين:", update);
}

/* ------------- إرسال البيانات المعلقة ------------- */

async function syncPendingInvoices() {
  let list = getPendingInvoices();
  if (!list.length || !isOnline()) {
    return { sent: 0, remaining: list.length };
  }

  let sent = 0;
  const remaining = [];

  for (const inv of list) {
    try {
      const res = await saveInvoiceToDB(inv);
      if (res.status === "success") {
        sent++;
        // أيضاً نضيفها لـ DataStore.invoices إذا لم تكن موجودة
        if (!DataStore.invoices.some(i => String(i.id) === String(inv.id))) {
          DataStore.invoices.push(inv);
        }
      } else {
        remaining.push(inv); // فشل – أبقها في القائمة
      }
    } catch (e) {
      console.error("sync invoice error", e);
      remaining.push(inv);
    }
  }

  setPendingInvoices(remaining);
  return { sent, remaining: remaining.length };
}

async function syncPendingStockUpdates() {
  let list = getPendingStockUpdates();
  if (!list.length || !isOnline()) {
    return { sent: 0, remaining: list.length };
  }

  let sent = 0;
  const remaining = [];

  for (const upd of list) {
    try {
      const res = await saveProductToDB(upd);
      if (res.status === "success") {
        sent++;
      } else {
        remaining.push(upd);
      }
    } catch (e) {
      console.error("sync stock error", e);
      remaining.push(upd);
    }
  }

  setPendingStockUpdates(remaining);
  return { sent, remaining: remaining.length };
}

/* مزامنة كاملة للبيانات المعلقة فقط (بدون Full Recalculate) */
async function syncAllPendingData() {
  const invRes = await syncPendingInvoices();
  const stRes  = await syncPendingStockUpdates();
  console.log("Sync done. Invoices:", invRes, "Stock:", stRes);
  return {
    invoicesSent: invRes.sent,
    invoicesRemaining: invRes.remaining,
    stockSent: stRes.sent,
    stockRemaining: stRes.remaining
  };
}

/* ------------- تهيئة نظام الأوفلاين ------------- */

function initSync() {
  // عند فتح النظام، إن كان أونلاين نحاول مزامنة ما هو معلّق
  if (isOnline()) {
    syncAllPendingData();
  }

  // عند رجوع الاتصال بالإنترنت
  window.addEventListener("online", () => {
    console.log("Online again – start sync");
    syncAllPendingData();
  });
}
