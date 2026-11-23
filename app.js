
const SUPABASE_URL = "https://zholpbduhxmxfmwbvblu.supabase.co";
const SUPABASE_KEY = "sb_publishable_88Vl0u57rWdw8q3UGdZ0EQ_HUjAKUEH";

if (!window.supabase) {
  throw new Error("Supabase library not loaded.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// 2. Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let mode = "image";
let uploadedImage = null;
let toastTimer;
let authMode = "signup";

// 3. Toast notifications
function toast(message) {
  const el = $("#toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 3200);
}

// 4. Authentication styles
const authStyle = document.createElement("style");

authStyle.textContent = `
#novaAuth {
  position:fixed;
  inset:0;
  z-index:9999;
  background:#090b12;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  color:white;
  font-family:inherit;
}

#novaAuth.hidden {
  display:none;
}

#novaAuth .auth-card {
  width:100%;
  max-width:420px;
  background:#151a29;
  border:1px solid #303950;
  border-radius:18px;
  padding:25px;
}

#novaAuth h2 {
  margin:0 0 10px;
}

#novaAuth p {
  color:#aab3c8;
  line-height:1.7;
}

#novaAuth input {
  width:100%;
  box-sizing:border-box;
  padding:14px;
  margin:8px 0;
  border-radius:9px;
  border:1px solid #39445e;
  background:#090e1b;
  color:white;
  font-size:15px;
}

#novaAuth button {
  width:100%;
  padding:13px;
  margin-top:12px;
  border:0;
  border-radius:9px;
  cursor:pointer;
  background:#5968ed;
  color:white;
  font-size:16px;
}

#novaAuth button:disabled {
  opacity:.6;
  cursor:not-allowed;
}

#novaAuth .auth-switch {
  background:transparent;
  border:1px solid #5968ed;
}

#novaAuth .auth-message {
  font-size:14px;
  min-height:24px;
  color:#b9c5ff;
}

#novaAccount {
  color:white;
  background:#5968ed;
  border:0;
  border-radius:8px;
  padding:9px 12px;
  margin-right:8px;
  cursor:pointer;
}
`;

document.head.appendChild(authStyle);

// 5. Authentication screen
const authBox = document.createElement("div");

authBox.id = "novaAuth";

authBox.innerHTML = `
  <div class="auth-card">

    <h2 id="authTitle">إنشاء حساب جديد</h2>

    <p id="authDescription">
      انضم إلى NOVA AI STUDIO وابدأ مساحة عملك.
    </p>

    <form id="novaAuthForm">

      <input
        id="authUsername"
        type="text"
        placeholder="اسم المستخدم"
        autocomplete="username"
      >

      <input
        id="authEmail"
        type="email"
        placeholder="البريد الإلكتروني"
        required
        autocomplete="email"
      >

      <input
        id="authPassword"
        type="password"
        placeholder="كلمة المرور"
        required
        minlength="6"
        autocomplete="new-password"
      >

      <button id="authSubmit" type="submit">
        إنشاء الحساب
      </button>

    </form>

    <button
      class="auth-switch"
      id="authSwitch"
      type="button"
    >
      عندك حساب؟ سجّل دخولك
    </button>

    <p class="auth-message" id="authMessage"></p>

  </div>
`;

document.body.appendChild(authBox);

// 6. Account button
const accountButton = document.createElement("button");

accountButton.id = "novaAccount";
accountButton.textContent = "حسابي";

const topActions = $(".top-actions");

if (topActions) {
  topActions.appendChild(accountButton);
}

// 7. Authentication mode
function setAuthMode(nextMode) {

  authMode = nextMode;

  const signup = authMode === "signup";

  $("#authTitle").textContent =
    signup ? "إنشاء حساب جديد" : "تسجيل الدخول";

  $("#authDescription").textContent =
    signup
      ? "أنشئ حسابك في NOVA AI STUDIO."
      : "أدخل بيانات حسابك للمتابعة.";

  $("#authUsername").style.display =
    signup ? "block" : "none";

  $("#authUsername").required = signup;

  $("#authPassword").autocomplete =
    signup ? "new-password" : "current-password";

  $("#authSubmit").textContent =
    signup ? "إنشاء الحساب" : "تسجيل الدخول";

  $("#authSwitch").textContent =
    signup
      ? "عندك حساب؟ سجّل دخولك"
      : "ليس لديك حساب؟ أنشئ حسابًا";

  $("#authMessage").textContent = "";
}

$("#authSwitch").addEventListener("click", () => {

  setAuthMode(
    authMode === "signup" ? "login" : "signup"
  );

});

// 8. Sign up and login
$("#novaAuthForm").addEventListener("submit", async (event) => {

  event.preventDefault();

  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const username = $("#authUsername").value.trim();

  const submitButton = $("#authSubmit");
  const message = $("#authMessage");

  if (authMode === "signup" && !username) {
    message.textContent = "اكتب اسم المستخدم أولاً.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "جاري التنفيذ...";

  message.textContent = "";

  try {

    if (authMode === "signup") {

      const { data, error } =
        await supabaseClient.auth.signUp({

          email,
          password,

          options: {
            data: {
              username: username
            }
          }

        });

      if (error) throw error;

      if (data.session) {

        toast("تم إنشاء الحساب بنجاح.");

        await loadAccount();

      } else {

        message.textContent =
          "تم إنشاء الحساب. افتح بريدك الإلكتروني وأكّد الحساب، ثم سجّل الدخول.";

      }

    } else {

      const { error } =
        await supabaseClient.auth.signInWithPassword({

          email,
          password

        });

      if (error) throw error;

      toast("تم تسجيل الدخول بنجاح.");

      await loadAccount();

    }

  } catch (error) {

    console.error("Authentication error:", error);

    message.textContent =
      error.message || "حدث خطأ. حاول مرة أخرى.";

  } finally {

    submitButton.disabled = false;

    submitButton.textContent =
      authMode === "signup"
        ? "إنشاء الحساب"
        : "تسجيل الدخول";

  }

});

// 9. Load account
async function loadAccount() {

  try {

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) throw error;

    const session = data.session;

    if (!session) {

      authBox.classList.remove("hidden");

      accountButton.textContent = "تسجيل الدخول";

      return;

    }

    authBox.classList.add("hidden");

    accountButton.textContent =
      session.user.email || "حسابي";

    const { data: profile, error: profileError } =
      await supabaseClient
        .from("profiles")
        .select("username, credits")
        .eq("id", session.user.id)
        .maybeSingle();

    if (profileError) {

      console.error(
        "Profile error:",
        profileError.message
      );

      toast("تم الدخول، لكن تعذر تحميل الملف الشخصي.");

      return;

    }

    if (profile) {

      console.log("NOVA profile loaded:", profile);

      toast("أهلاً بك في NOVA AI STUDIO.");

    } else {

      toast("تم الدخول، لكن ملف المستخدم لم يظهر بعد.");

    }

  } catch (error) {

    console.error("Account loading error:", error);

    toast("تعذر تحميل الحساب.");

  }

}

// 10. Logout and account button
accountButton.addEventListener("click", async () => {

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    toast("تعذر التحقق من الحساب.");
    return;
  }

  if (!data.session) {

    authBox.classList.remove("hidden");

    setAuthMode("login");

    return;

  }

  const confirmed =
    window.confirm("هل تريد تسجيل الخروج؟");

  if (!confirmed) return;

  const { error: logoutError } =
    await supabaseClient.auth.signOut();

  if (logoutError) {

    toast("تعذر تسجيل الخروج.");

    return;

  }

  accountButton.textContent = "تسجيل الدخول";

  authBox.classList.remove("hidden");

  setAuthMode("login");

  toast("تم تسجيل الخروج.");

});

// 11. Authentication state listener
supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_IN" && session) {

      authBox.classList.add("hidden");

      accountButton.textContent =
        session.user.email || "حسابي";

    }

    if (event === "SIGNED_OUT") {

      authBox.classList.remove("hidden");

      accountButton.textContent = "تسجيل الدخول";

    }

  }
);

// 12. Start account check
loadAccount();


// =====================================
// Original NOVA AI STUDIO tools
// =====================================

// 13. Change mode
function setMode(next) {

  mode = next;

  $$(".mode-card").forEach(button => {

    button.classList.toggle(
      "selected",
      button.dataset.mode === mode
    );

  });

  $$(".tool-link").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );

  });

  const titles = {

    image: "اكتب وصف الصورة",

    video: "اكتب وصف الفيديو",

    animate: "اكتب وصف الحركة"

  };

  const placeholders = {

    image:
      "مثال: مشهد سينمائي لتنين أسطوري فوق مدينة مستقبلية...",

    video:
      "مثال: لقطة سينمائية لمدينة مستقبلية وقت الغروب...",

    animate:
      "مثال: اجعل الشخصية تتحرك بشكل طبيعي..."

  };

  $("#promptTitle").textContent = titles[mode];

  $("#prompt").placeholder = placeholders[mode];

  $("#uploadArea").classList.toggle(
    "hidden",
    mode !== "animate"
  );

  $("#generateBtn").innerHTML =

    mode === "image"
      ? "✦ تجهيز طلب الصورة <b>←</b>"

      : mode === "video"
        ? "✦ تجهيز طلب الفيديو <b>←</b>"

        : "✦ تجهيز طلب التحريك <b>←</b>";

}

// 14. Mode buttons
$$(".mode-card").forEach(button => {

  button.addEventListener("click", () => {

    setMode(button.dataset.mode);

  });

});

$$(".tool-link").forEach(button => {

  button.addEventListener("click", () => {

    setMode(button.dataset.mode);

    showPage("create");

  });

});

// 15. Prompt counter
$("#prompt").addEventListener("input", () => {

  $("#charCount").textContent =
    `${$("#prompt").value.length} / 1200`;

});

// 16. Clear prompt
$("#clearPrompt").addEventListener("click", () => {

  $("#prompt").value = "";

  $("#charCount").textContent = "0 / 1200";

});

// 17. Upload image
$("#uploadBtn").addEventListener("click", () => {

  $("#imageUpload").click();

});

$("#imageUpload").addEventListener("change", event => {

  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {

    toast("اختار ملف صورة صالح.");

    return;

  }

  if (uploadedImage) {
    URL.revokeObjectURL(uploadedImage);
  }

  uploadedImage = URL.createObjectURL(file);

  $("#preview").src = uploadedImage;

  $("#previewWrap").classList.remove("hidden");

  $("#uploadBtn").classList.add("hidden");

});

// 18. Remove image
$("#removeImage").addEventListener("click", () => {

  if (uploadedImage) {

    URL.revokeObjectURL(uploadedImage);

  }

  uploadedImage = null;

  $("#imageUpload").value = "";

  $("#previewWrap").classList.add("hidden");

  $("#uploadBtn").classList.remove("hidden");

});

// 19. Generate request
$("#generateBtn").addEventListener("click", () => {

  const prompt = $("#prompt").value.trim();

  if (!prompt) {

    toast("اكتب وصف فكرتك الأول.");

    return;

  }

  if (mode === "animate" && !uploadedImage) {

    toast("ارفع صورة عشان نجهز طلب التحريك.");

    return;

  }

  toast(
    "التوليد الحقيقي يحتاج محرك ذكاء اصطناعي."
  );

});

// 20. Page navigation
function showPage(page) {

  $("#createPage").classList.toggle(
    "hidden",
    page !== "create"
  );

  $("#libraryPage").classList.toggle(
    "hidden",
    page !== "library"
  );

  $$(".nav-item[data-page]").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === page
    );

  });

  $("#crumbTitle").textContent =
    page === "create"
      ? "إنشاء جديد"
      : "مكتبتي";

  $("#sidebar").classList.remove("open");

}

// 21. Navigation buttons
$$(".nav-item[data-page]").forEach(button => {

  button.addEventListener("click", () => {

    showPage(button.dataset.page);

  });

});

$("#backToCreate").addEventListener("click", () => {

  showPage("create");

});

// 22. Mobile menu
$("#menuBtn").addEventListener("click", () => {

  $("#sidebar").classList.toggle("open");

});

// 23. Service worker
if (
  "serviceWorker" in navigator &&
  location.protocol.startsWith("http")
) {

  navigator.serviceWorker
    .register("./sw.js")
    .catch(error => {

      console.error(
        "Service Worker error:",
        error
      );

    });

}
