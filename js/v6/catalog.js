(() => {
  const V6 = window.V6 = window.V6 || { data: { services: [], inquiries: [], requests: [], ledger: [], team: [] }, errors: {}, filters: {} };
  const E = window.EVX;
  const owner = () => !!user?.isOwner?.();
  const price = value => value === null || value === undefined || value === "" ? "" : new Intl.NumberFormat("ar-OM", { maximumFractionDigits: 3 }).format(Number(value) || 0) + " ر.ع";

  function priceLabel(row) {
    const prices = [];
    if (row.price_sedan !== null && row.price_sedan !== undefined && row.price_sedan !== "") prices.push("صالون: " + price(row.price_sedan));
    if (row.price_4wd !== null && row.price_4wd !== undefined && row.price_4wd !== "") prices.push("فورويل: " + price(row.price_4wd));
    if (row.price_flat !== null && row.price_flat !== undefined && row.price_flat !== "") prices.push(price(row.price_flat));
    if (row.price_note) prices.push(row.price_note);
    return prices.join(" · ") || "—";
  }

  function renderCatalog() {
    if (!owner()) return E.page({ title: "كتالوج الخدمات", section: "الإدارة", content: E.empty(E.t("ownerOnly")) });
    const q = (V6.filters.catalogSearch || "").trim().toLocaleLowerCase("ar"), brand = V6.filters.catalogBrand || "all";
    const list = V6.data.services.filter(row => (brand === "all" || row.brand === brand) && (!q || (row.name_ar + " " + row.name_en + " " + row.domain).toLocaleLowerCase("ar").includes(q))).sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const rows = list.map(row => '<tr><td>' + E.esc(row.id) + '</td><td>' + E.esc(row.name_ar) + '</td><td>' + E.esc(row.domain || "—") + '</td><td>' + (row.brand === "reve" ? "REVE" : row.brand === "cc142" ? "CC142" : "EVOXHUB") + '</td><td>' + E.esc(priceLabel(row)) + '</td><td>' + (row.needs_verification ? E.tag("يتطلب تحقق", "warn") : E.tag("نشط معلوماتيًا", "ok")) + '</td><td>' + E.tag(row.active ? "مفعّلة" : "موقوفة", row.active ? "ok" : "bad") + '</td><td><button class="b sm" data-v6-action="catalog-edit" data-id="' + E.esc(row.id) + '">تعديل</button><button class="b sm" data-v6-action="catalog-toggle" data-id="' + E.esc(row.id) + '">' + (row.active ? "إيقاف" : "تفعيل") + '</button></td></tr>').join("");
    return E.page({
      title: "كتالوج الخدمات", section: "إدارة البيانات",
      subtitle: V6.data.services.length + " خدمة مسجلة. الأسعار الظاهرة تخص CC142 حسب فئة السيارة.",
      actions: '<button class="b pri" data-v6-action="catalog-new">+ خدمة جديدة</button><input type="search" data-v6-action="catalog-search" placeholder="ابحث عن خدمة" value="' + E.esc(V6.filters.catalogSearch || "") + '">',
      content: '<div class="v6-note">أسعار CC142 بالريال العُماني: صالون وفورويل حسب القائمة المرسلة. سنفرة بودي السيارة +20 ر.ع، وإضافة الزجاج الأمامي للعازل الحراري +10 ر.ع. أوقف الخدمة بدل حذفها للمحافظة على السجلات.</div><div class="v6-filter"><select data-v6-action="catalog-brand"><option value="all" ' + (!V6.filters.catalogBrand || V6.filters.catalogBrand === "all" ? "selected" : "") + '>كل الأقسام</option><option value="evx" ' + (V6.filters.catalogBrand === "evx" ? "selected" : "") + '>EVOXHUB</option><option value="reve" ' + (V6.filters.catalogBrand === "reve" ? "selected" : "") + '>REVE</option><option value="cc142" ' + (V6.filters.catalogBrand === "cc142" ? "selected" : "") + '>CC142</option></select></div>' + (rows ? '<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>المعرف</th><th>اسم الخدمة</th><th>المجال</th><th>القسم</th><th>الأسعار والإضافات</th><th>التحقق</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : E.empty("لا توجد خدمات مطابقة."))
    });
  }

  function form(row = {}) {
    if (!owner()) return E.toast("إدارة الكتالوج للمالك فقط.", true);
    const html = '<div class="v6-form-grid">' +
      '<label>القسم<select name="brand"><option value="evx" ' + (row.brand === "evx" ? "selected" : "") + '>EVOXHUB</option><option value="reve" ' + (row.brand === "reve" ? "selected" : "") + '>REVE</option><option value="cc142" ' + (row.brand === "cc142" ? "selected" : "") + '>CC142</option></select></label>' +
      '<label>المجال<input name="domain" value="' + E.esc(row.domain || "") + '" required></label>' +
      '<label>اسم الخدمة بالعربية<input name="name_ar" value="' + E.esc(row.name_ar || "") + '" required></label>' +
      '<label>الاسم الإنجليزي<input name="name_en" value="' + E.esc(row.name_en || "") + '"></label>' +
      '<label>الجهة الرسمية (إن وجدت)<input name="authority" value="' + E.esc(row.authority || "") + '"></label>' +
      '<label>الترتيب<input type="number" name="sort" value="' + (Number(row.sort) || V6.data.services.length + 1) + '" min="1"></label>' +
      '<label>السعر — صالون (ر.ع)<input name="price_sedan" type="number" min="0" step="0.001" value="' + E.esc(row.price_sedan ?? "") + '"></label>' +
      '<label>السعر — فورويل (ر.ع)<input name="price_4wd" type="number" min="0" step="0.001" value="' + E.esc(row.price_4wd ?? "") + '"></label>' +
      '<label>السعر الثابت (ر.ع)<input name="price_flat" type="number" min="0" step="0.001" value="' + E.esc(row.price_flat ?? "") + '"></label>' +
      '<label class="full">ملاحظة السعر أو الإضافة<input name="price_note" value="' + E.esc(row.price_note || "") + '" placeholder="مثال: سنفرة بودي السيارة +20 ر.ع"></label>' +
      '<label><input type="checkbox" name="needs_verification" ' + (row.needs_verification !== false ? "checked" : "") + '> المعلومات تحتاج تحققًا</label>' +
      '<label><input type="checkbox" name="active" ' + (row.active !== false ? "checked" : "") + '> الخدمة مفعّلة</label></div>' +
      '<div class="v6-warning">اترك حقول السعر فارغة للخدمات التي لا تملك سعرًا معتمدًا. أسعار CC142 تعرض للعميل حسب الفئة ولا تعني تأكيد الطلب أو بدء العمل.</div>';
    E.dialog(row.id ? "تعديل الخدمة" : "إضافة خدمة", html, async fd => {
      const value = Object.fromEntries(fd.entries()), brand = value.brand;
      const amount = key => !value[key] || value[key].trim() === "" ? null : Number(value[key]);
      const record = {
        ...row, id: row.id || brand + "-" + E.id().slice(0, 8), brand,
        domain: value.domain.trim(), name_ar: value.name_ar.trim(), name_en: value.name_en.trim(),
        authority: value.authority.trim() || null, sort: Number(value.sort) || 999,
        price_sedan: amount("price_sedan"), price_4wd: amount("price_4wd"), price_flat: amount("price_flat"), price_note: (value.price_note || "").trim(),
        needs_verification: fd.has("needs_verification"), active: fd.has("active"), default_docs: row.default_docs || [], updated_by: uid
      };
      await E.api.services.save(record);
      await log("service_v6", (row.id ? "تعديل" : "إضافة") + ": " + record.name_ar);
      await V6.refresh();
      render();
    });
  }

  E.registerPage("x_catalog", renderCatalog);
  E.onAction("catalog-new", () => form());
  E.onAction("catalog-edit", (_, button) => { const row = V6.data.services.find(item => item.id === button.dataset.id); if (row) form(row); });
  E.onAction("catalog-toggle", async (_, button) => {
    const row = V6.data.services.find(item => item.id === button.dataset.id);
    if (!row) return;
    try {
      await E.api.services.save({ ...row, active: !row.active, updated_by: uid });
      await log("service_v6", (row.active ? "إيقاف" : "تفعيل") + ": " + row.name_ar);
      await V6.refresh(); render();
    } catch (error) { E.toast(error.message, true); }
  });
  E.onAction("catalog-brand", (_, select) => { V6.filters.catalogBrand = select.value; render(); });
  E.onAction("catalog-search", (_, input) => {
    V6.filters.catalogSearch = input.value;
    const cursor = input.selectionStart;
    render();
    const next = document.querySelector('[data-v6-action="catalog-search"]');
    next?.focus(); next?.setSelectionRange(cursor, cursor);
  });
})();
