const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const yearElement = document.getElementById("year");
const copyStatus = document.getElementById("copyStatus");
const storageKey = "asuka-site-theme";

const savedTheme = localStorage.getItem(storageKey);
if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
}

themeToggle?.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem(storageKey, next);
});

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const copyButtons = document.querySelectorAll(".copy-btn");
copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const url = button.getAttribute("data-copy-url");
    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      if (copyStatus) {
        copyStatus.textContent = "链接已复制到剪贴板。";
      }
    } catch {
      if (copyStatus) {
        copyStatus.textContent = "复制失败，请手动复制。";
      }
    }
  });
});

const qrImages = document.querySelectorAll(".qr-image");
qrImages.forEach((image) => {
  const url = image.getAttribute("data-qr-url");
  if (!url) {
    return;
  }
  image.setAttribute(
    "src",
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
  );
});
