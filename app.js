
const SUPABASE_URL = "https://zholpbduhxmxfmwbvblu.supabase.co";
const SUPABASE_KEY = "sb_publishable_88Vl0u57rWdw8q3UGdZ0EQ_HUjAKUEH";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("NOVA Supabase client:", !!supabaseClient);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let mode = "image";
let uploadedImage = null;
let toastTimer;

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

function setMode(next) {
  mode = next;
  $$(".mode-card").forEach(b =>
    b.classList.toggle("selected", b.dataset.mode === mode)
  );
  $$(".tool-link").forEach(b =>
    b.classList.toggle("active", b.dataset.mode === mode)
  );

  const titles = {
    image: "اكتب وصف الصورة",
    video: "اكتب وصف الفيديو",
    animate: "اكتب وصف الحركة"
  };

  const placeholders = {
    image: "مثال: مشهد سينمائي لتنين أسطوري فوق مدينة مستقبلية، إضاءة درامية، تفاصيل فائقة...",
    video: "مثال: لقطة سينمائية لمدينة مستقبلية وقت الغروب، حركة كاميرا بطيئة...",
    animate: "مثال: اجعل الشخصية تتحرك بشكل طبيعي مع حركة كاميرا سينمائية..."
  };

  $("#promptTitle").textContent = titles[mode];
  $("#prompt").placeholder = placeholders[mode];
  $("#uploadArea").classList.toggle("hidden", mode !== "animate");

  $("#generateBtn").innerHTML =
    mode === "image" ? "✦ تجهيز طلب الصورة <b>←</b>" :
    mode === "video" ? "✦ تجهيز طلب الفيديو <b>←</b>" :
    "✦ تجهيز طلب التحريك <b>←</b>";
}

$$(".mode-card").forEach(b =>
  b.addEventListener("click", () => setMode(b.dataset.mode))
);

$$(".tool-link").forEach(b =>
  b.addEventListener("click", () => {
    setMode(b.dataset.mode);
    showPage("create");
  })
);

$("#prompt").addEventListener("input", () =>
  $("#charCount").textContent = `${$("#prompt").value.length} / 1200`
);

$("#clearPrompt").addEventListener("click", () => {
  $("#prompt").value = "";
  $("#charCount").textContent = "0 / 1200";
});

$("#uploadBtn").addEventListener("click", () =>
  $("#imageUpload").click()
);

$("#imageUpload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("اختار ملف صورة صالح.");
    return;
  }

  uploadedImage = URL.createObjectURL(file);
  $("#preview").src = uploadedImage;
  $("#previewWrap").classList.remove("hidden");
  $("#uploadBtn").classList.add("hidden");
});

$("#removeImage").addEventListener("click", () => {
  if (uploadedImage) URL.revokeObjectURL(uploadedImage);
  uploadedImage = null;
  $("#imageUpload").value = "";
  $("#previewWrap").classList.add("hidden");
  $("#uploadBtn").classList.remove("hidden");
});

$("#generateBtn").addEventListener("click", () => {
  const prompt = $("#prompt").value.trim();

  if (!prompt) {
    toast("اكتب وصف فكرتك الأول.");
    return;
  }

  if (mode === "animate" && !uploadedImage) {
    toast("ارفع صورة عشان نقدر نجهز طلب التحريك.");
    return;
  }

  toast("تم تجهيز بيانات الطلب محليًا. التوليد الحقيقي يحتاج محرك ذكاء اصطناعي.");
});

function showPage(page) {
  $("#createPage").classList.toggle("hidden", page !== "create");
  $("#libraryPage").classList.toggle("hidden", page !== "library");

  $$(".nav-item[data-page]").forEach(b =>
    b.classList.toggle("active", b.dataset.page === page)
  );

  $("#crumbTitle").textContent =
    page === "create" ? "إنشاء جديد" : "مكتبتي";

  $("#sidebar").classList.remove("open");
}

$$(".nav-item[data-page]").forEach(b =>
  b.addEventListener("click", () => showPage(b.dataset.page))
);

$("#backToCreate").addEventListener("click", () =>
  showPage("create")
);

$("#menuBtn").addEventListener("click", () =>
  $("#sidebar").classList.toggle("open")
);

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
                                 }
