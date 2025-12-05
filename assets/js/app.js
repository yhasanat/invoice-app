/* -----------------------------------------
   app.js – نقطة دخول التطبيق
------------------------------------------*/

function showView(viewId){
  $all(".view").forEach(v => v.classList.remove("active"));
  $("#view-" + viewId).classList.add("active");
  $all(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  if(viewId === "dashboard"){
    refreshDashboard();
  } else if(viewId === "stock"){
    renderStockTable($("#stock-search").value);
  }
}

function initEvents(){

//تحديث البيانات للمخزون
// تحديث أرصدة العملاء
$("#btn-update-balances").addEventListener("click", async () => {
  const res = await apiGet({ action: "updateBalances" });
  alert(res.message || "تم تحديث الأرصدة.");
  await loadCustomers();
  refreshDashboard();
});

// إعادة حساب المخزون
$("#btn-recalc-stock").addEventListener("click", async () => {
  const res = await apiGet({ action: "recalculateStock" });
  alert(res.message || "تم إعادة حساب المخزون.");
  await loadProducts();
  refreshDashboard();
});

// مزامنة كاملة
$("#btn-full-sync").addEventListener("click", async () => {
  // أولاً: مزامنة البيانات المعلقة (فواتير + مخزون)
  const syncRes = await syncAllPendingData();

  // ثانياً: طلب إعادة حساب شامل من السيرفر (أرصدة + مخزون من StockUpdates)
  const res = await apiGet({ action: "fullRecalculate" });

  alert(
    "مزامنة البيانات المعلقة:\n" +
    `- فواتير أرسلت: ${syncRes.invoicesSent} (متبقي: ${syncRes.invoicesRemaining})\n` +
    `- حركات مخزون أرسلت: ${syncRes.stockSent} (متبقي: ${syncRes.stockRemaining})\n\n` +
    (res.message || "تمت إعادة الحساب الشامل من السيرفر.")
  );

  await loadProducts();
  await loadCustomers();
  await loadInvoices();
  refreshDashboard();
});



  // التنقل بين الصفحات
  $all(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      showView(btn.dataset.view);
    });
  });

  // باركود زبون
  $("#retail-barcode").addEventListener("keydown", e => {
    if(e.key === "Enter"){
      const code = e.target.value.trim();
      const qty = Number($("#retail-default-qty").value || 1);
      if(code){
        addItemToCurrentInvoice(code, qty, "retail");
        e.target.value = "";
      }
    }
  });

  // باركود تاجر
  $("#wh-barcode").addEventListener("keydown", e => {
    if(e.key === "Enter"){
      const code = e.target.value.trim();
      const qty = Number($("#wh-default-qty").value || 1);
      if(code){
        addItemToCurrentInvoice(code, qty, "wholesale");
        e.target.value = "";
      }
    }
  });

  // بحث متقدم: زبون
  $("#retail-search").addEventListener("input", e => {
    const text = e.target.value;
    const results = searchProductsAdvanced(text);
    showSuggestions(results, e.target, "retail");
  });

  // بحث متقدم: تاجر
  $("#wh-search").addEventListener("input", e => {
    const text = e.target.value;
    const results = searchProductsAdvanced(text);
    showSuggestions(results, e.target, "wholesale");
  });

  // خصم / دفعة
  $("#retail-discount").addEventListener("input", () => updateInvoiceTotals("retail"));
  $("#retail-paid").addEventListener("input", () => updateInvoiceTotals("retail"));
  $("#wh-discount").addEventListener("input", () => updateInvoiceTotals("wholesale"));
  $("#wh-paid").addEventListener("input", () => updateInvoiceTotals("wholesale"));

  // تغيير الزبون / التاجر
  $("#retail-customer").addEventListener("change", () => updateInvoiceTotals("retail"));
  $("#wh-customer").addEventListener("change", () => updateInvoiceTotals("wholesale"));

  // أزرار الفواتير
  $("#btn-retail-new").addEventListener("click", () => createNewInvoice("retail"));
  $("#btn-wh-new").addEventListener("click", () => createNewInvoice("wholesale"));

  $("#btn-retail-save").addEventListener("click", () => saveCurrentInvoice("retail", false));
  $("#btn-retail-save-payment-only").addEventListener("click", () => saveCurrentInvoice("retail", true));
  $("#btn-wh-save").addEventListener("click", () => saveCurrentInvoice("wholesale", false));
  $("#btn-wh-save-payment-only").addEventListener("click", () => saveCurrentInvoice("wholesale", true));

  $("#btn-retail-print").addEventListener("click", () => printCurrentInvoice("retail"));
  $("#btn-wh-print").addEventListener("click", () => printCurrentInvoice("wholesale"));

  // كشف حساب
  $("#btn-st-run").addEventListener("click", runStatement);

  // المخزون
  $("#btn-stock-save").addEventListener("click", saveStockItem);
  $("#stock-search").addEventListener("input", e => {
    renderStockTable(e.target.value);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllData();
  createNewInvoice("retail");
  initEvents();
 initSync();       // <-- إضافة هذه
  refreshDashboard();
});
