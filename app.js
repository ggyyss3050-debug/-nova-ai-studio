
const generateResult = document.createElement("div");
generateResult.id = "novaGeneratedResult";

generateResult.style.cssText = `
  margin-top:20px;
  padding:12px;
  border-radius:14px;
  background:#151a29;
  color:white;
  text-align:center;
`;

$("#generateBtn").insertAdjacentElement(
  "afterend",
  generateResult
);

$("#generateBtn").addEventListener("click", async () => {

  const prompt = $("#prompt").value.trim();

  if (!prompt) {
    toast("اكتب وصف الصورة الأول.");
    return;
  }

  if (mode !== "image") {
    toast("توليد الصور متاح حاليًا. الفيديو والتحريك قريبًا.");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {
    authBox.classList.remove("hidden");
    setAuthMode("login");
    toast("سجّل الدخول أولاً.");
    return;
  }

  const button = $("#generateBtn");
  const oldText = button.innerHTML;

  button.disabled = true;
  button.textContent = "جاري إنشاء الصورة...";

  generateResult.textContent =
    "جاري تجهيز صورتك بالذكاء الاصطناعي...";

  try {

    const response = await fetch(
      "https://weathered-mountain-bc13nova-ai-engine.01225880565a.workers.dev/",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${data.session.access_token}`
        },

        body: JSON.stringify({
          prompt: prompt
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "فشل إنشاء الصورة."
      );
    }

    if (!result.success || !result.image) {
      throw new Error("لم تصل الصورة من المحرك.");
    }

    generateResult.innerHTML = "";

    const image = document.createElement("img");

    image.src = result.image;
    image.alt = "NOVA AI generated image";

    image.style.cssText = `
      display:block;
      width:100%;
      max-width:700px;
      height:auto;
      margin:0 auto;
      border-radius:12px;
    `;

    const download = document.createElement("a");

    download.href = result.image;
    download.download = "nova-ai-image.jpg";
    download.textContent = "تحميل الصورة";

    download.style.cssText = `
      display:inline-block;
      margin-top:15px;
      padding:12px 22px;
      background:#5968ed;
      color:white;
      text-decoration:none;
      border-radius:9px;
    `;

    generateResult.appendChild(image);
    generateResult.appendChild(download);

    toast("تم إنشاء الصورة بنجاح!");

    generateResult.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } catch (error) {

    console.error("NOVA generation error:", error);

    generateResult.textContent =
      error.message || "حدث خطأ أثناء إنشاء الصورة.";

    toast("تعذر إنشاء الصورة. راجع رسالة الخطأ.");

  } finally {

    button.disabled = false;
    button.innerHTML = oldText;

  }

});
