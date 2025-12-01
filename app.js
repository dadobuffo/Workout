function showView(viewId) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
}

document.querySelectorAll(".card-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const c = btn.dataset.card;
    document.getElementById("card-title").textContent = "Scheda: " + c;
    showView("view-card");
  });
});

document.getElementById("back-btn").addEventListener("click", () => {
  showView("view-home");
});

// PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
