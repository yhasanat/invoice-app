/* -----------------------------------------
   print.js – الطباعة الحرارية
------------------------------------------*/

function buildReceiptHTML(invoice){
  const isRetail = invoice.type === "retail";
  const nameLabel = isRetail ? "الزبون" : "التاجر";
  let rowsHTML = "";
  let totalBefore = 0;

  (invoice.items || []).forEach((line, idx) => {
    const value = line.qty * line.price;
    totalBefore += value;
    rowsHTML += `
      <tr>
        <td>${idx+1}</td>
        <td>${line.name}</td>
        <td>${line.qty}</td>
        <td>${fnum(line.price)}</td>
        <td>${fnum(value)}</td>
      </tr>
    `;
  });

  if(!rowsHTML){
    rowsHTML = `<tr><td colspan="5">سند قبض بدون أصناف</td></tr>`;
  }

  const html = `
    <div class="receipt-header">
      <div class="logo">اسم المتجر / الشعار</div>
      <div>عنوان / هاتف مختصر</div>
    </div>
    <div class="receipt-line"></div>
    <div style="font-size:10px;">
      رقم الفاتورة: ${invoice.id}<br>
      التاريخ: ${invoice.dateISO}<br>
      ${nameLabel}: ${invoice.name || (isRetail ? "زبون نقدي" : "تاجر نقدي")}
    </div>
    <div class="receipt-line"></div>
    <table class="receipt-table">
      <thead>
        <tr>
          <th>#</th>
          <th>الصنف</th>
          <th>الكمية</th>
          <th>السعر</th>
          <th>القيمة</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
    <div class="receipt-line"></div>
    <div style="font-size:10px;">
      إجمالي قبل الخصم: ${fnum(totalBefore)}<br>
      الخصم: ${fnum(invoice.discount || 0)}<br>
      <strong>الصافي: ${fnum(invoice.total || 0)}</strong><br>
      المدفوع: ${fnum(invoice.paid || 0)}<br>
      <strong>الباقي: ${fnum((invoice.total || 0) - (invoice.paid || 0))}</strong>
    </div>
    <div class="receipt-line"></div>
    <div class="receipt-footer">
      Thank You For Purchasing<br>
      تم دفع المبلغ الموضح أعلاه إن وجد
    </div>
  `;
  return html;
}

function printCurrentInvoice(type){
  const invoice = AppState.currentInvoice;
  if(!invoice){
    alert("لا توجد فاتورة حالية.");
    return;
  }
  const html = buildReceiptHTML(invoice);
  $("#receipt-content").innerHTML = html;
  window.print();
}
