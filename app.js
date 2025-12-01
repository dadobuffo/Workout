// -------------------------
// REGISTER SERVICE WORKER
// -------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) =>
        console.error("Service Worker registration failed:", err)
      );
  });
}
function log(msg) {
  console.log(msg);
  const logDiv = document.getElementById("log");
  if (logDiv) logDiv.innerHTML += msg + "<br>";
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => log("Service Worker registered"))
    .catch((err) => log("SW registration failed: " + err));
}

// -------------------------
// DEFAULT WORKOUT DATA
// -------------------------
const defaultWorkouts = {
  A: [
    { id: "ex1", name: "Pressonator", sets: 3, reps: 10, weight: 20 },
    { id: "ex2", name: "Chest Fly Turbo", sets: 3, reps: 12, weight: 10 },
  ],
  B: [
    { id: "ex3", name: "Back Crusher", sets: 4, reps: 8, weight: 25 },
    { id: "ex4", name: "Row Machine X", sets: 3, reps: 10, weight: 20 },
  ],
  C: [
    { id: "ex5", name: "Leg Storm", sets: 4, reps: 10, weight: 30 },
    { id: "ex6", name: "Quad Blaster", sets: 3, reps: 12, weight: 15 },
  ],
};

// -------------------------
// LOAD WORKOUTS FROM LOCALSTORAGE
// -------------------------
function loadWorkouts() {
  const data = localStorage.getItem("workouts");
  if (data) return JSON.parse(data);

  // First time: save default workouts
  localStorage.setItem("workouts", JSON.stringify(defaultWorkouts));
  return defaultWorkouts;
}

let workouts = loadWorkouts();
let currentCard = "";

// -------------------------
// SPA VIEW MANAGEMENT
// -------------------------
function showView(viewId) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
}

// -------------------------
// EVENT LISTENERS FOR CARD BUTTONS
// -------------------------
document.querySelectorAll(".card-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentCard = btn.dataset.card;
    document.getElementById("card-title").textContent =
      "Workout " + currentCard;
    renderExercises();
    showView("view-card");
  });
});

// Back button
document.getElementById("back-btn").addEventListener("click", () => {
  showView("view-home");
});

// -------------------------
// RENDER EXERCISES
// -------------------------
function renderExercises() {
  const list = document.getElementById("exercise-list");
  list.innerHTML = "";

  workouts[currentCard].forEach((ex) => {
    const div = document.createElement("div");
    div.className = "exercise";
    div.innerHTML = `
            <strong>${ex.name}</strong><br>
            Sets: <input type="number" data-id="${ex.id}" data-field="sets" value="${ex.sets}">
            Reps: <input type="number" data-id="${ex.id}" data-field="reps" value="${ex.reps}">
            Kg: <input type="number" data-id="${ex.id}" data-field="weight" value="${ex.weight}">
        `;
    list.appendChild(div);
  });

  // Add change event to inputs
  document.querySelectorAll("#exercise-list input").forEach((input) => {
    input.addEventListener("change", () => {
      const ex = workouts[currentCard].find((x) => x.id === input.dataset.id);
      ex[input.dataset.field] = Number(input.value);
      localStorage.setItem("workouts", JSON.stringify(workouts));
    });
  });
}
