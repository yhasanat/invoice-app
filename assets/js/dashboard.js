/* -----------------------------------------
   dashboard.js – لوحة التحكم
------------------------------------------*/

function refreshDashboard(){
  const today = todayISO();
  let todaySales = 0;
  let invoicesCount = DataStore.invoices.length;
  let customersCount = new Set(DataStore.customers.map(c => c.name)).size;
  let lowStockCount = DataStore.products.filter(p => Number(p.stock || 0) < 5).length;

  DataStore.invoices.forEach(inv => {
    if(inv.dateISO === today){
      todaySales += Number(inv.total || 0);
    }
  });

  $("#db-today-sales").textContent = fnum(todaySales);
  $("#db-invoices-count").textContent = invoicesCount;
  $("#db-customers-count").textContent = customersCount;
  $("#db-low-stock").textContent = lowStockCount;
}
