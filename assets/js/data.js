/* -------------------------------------------------
   data.js – إدارة البيانات (Google Sheets + Cache)
---------------------------------------------------*/

const DataStore = {
  products: [],
  customers: [],
  invoices: []
};

// أصناف افتراضية (في حال فشل الاتصال بقاعدة البيانات)
const FALLBACK_PRODUCTS = [
  { barcode:"11001000111", name:"جاكيت", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"20001000111", name:"بنطلون", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"11001000411", name:"فروة رجالي", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"20001000121", name:"بنطلون 511 مبطن", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"20001000131", name:"بنطلون 511 بدون تبطين", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"30003000111", name:"بجامة ولادي", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"30001000111", name:"بجامة رجالي", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"11001000211", name:"بلوزة جولف", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"11001000221", name:"بلوزة هودي", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"50001000111", name:"قشاط", priceRetail:0, priceWholesale:0, stock:0 },
  { barcode:"11001000311", name:"جاكيت فايبر SuperTex", priceRetail:0, priceWholesale:0, stock:0 }
];

/* -------------------------
   تحميل الأصناف
--------------------------*/
async function loadProducts() {
  try {
    const res = await apiGet({ action: "getProducts" });

    if (res.status === "success" && Array.isArray(res.data)) {
      DataStore.products = res.data;
    } else {
      console.warn("لم يتم تحميل الأصناف من WebApp – استخدام بيانات افتراضية");
      DataStore.products = FALLBACK_PRODUCTS.slice();
    }
  } catch (err) {
    console.error("Error loading products:", err);
    DataStore.products = FALLBACK_PRODUCTS.slice();
  }
}

/* -------------------------
   تحميل العملاء (أسماء فقط)
--------------------------*/
async function loadCustomers() {
  try {
    const res = await apiGet({ action: "getCustomers" });

    if (res.status === "success" && Array.isArray(res.data)) {
      DataStore.customers = res.data;
    } else {
      console.warn("فشل تحميل العملاء – سيتم إنشاء الأسماء من الفواتير لاحقاً");
      DataStore.customers = [
        { name:"زبون نقدي" },
        { name:"تاجر" },
        { name:"شركة" }
      ];
    }
  } catch (err) {
    console.error("Error loading customers:", err);
    DataStore.customers = [
      { name:"زبون نقدي" },
      { name:"تاجر" },
      { name:"شركة" }
    ];
  }
  updateCustomersDatalist();
}

/* -------------------------
   تحميل الفواتير
--------------------------*/
async function loadInvoices() {
  try {
    const res = await apiGet({ action: "getInvoices" });

    if (res.status === "success" && Array.isArray(res.data)) {
      DataStore.invoices = res.data;
    } else {
      console.warn("لم يتم تحميل الفواتير – بدء بدون بيانات سابقة");
      DataStore.invoices = [];
    }
  } catch (err) {
    console.error("Error loading invoices:", err);
    DataStore.invoices = [];
  }
}

/* -------------------------
   حفظ فاتورة جديدة إلى WebApp
--------------------------*/
async function saveInvoiceToDB(invoice) {
  try {
    const res = await apiPost("saveInvoice", invoice);
    return res;
  } catch (err) {
    console.error("Error saving invoice:", err);
    return { status:"error", message:String(err) };
  }
}

/* -------------------------
   حفظ / تحديث صنف
--------------------------*/
async function saveProductToDB(product) {
  try {
    const res = await apiPost("saveProduct", product);
    return res;
  } catch (err) {
    console.error("Error saving product:", err);
    return { status:"error", message:String(err) };
  }
}

/* -------------------------
   تحديث قائمة العملاء في datalist
--------------------------*/
function updateCustomersDatalist() {
  const dl = $("#customers-list");
  if (!dl) return;
  dl.innerHTML = "";

  const names = new Set(DataStore.customers.map(c => c.name));

  names.forEach(name => {
    const opt = create("option");
    opt.value = name;
    dl.appendChild(opt);
  });
}

/* -------------------------
   تحميل أولي
--------------------------*/
async function loadAllData() {
  await loadProducts();
  await loadCustomers();
  await loadInvoices();
}
