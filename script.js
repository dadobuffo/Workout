const workoutData = {};

const workoutSelector = document.querySelector(".workout-selector");
const workoutDetails = document.getElementById("workoutDetails");
const workoutTitle = document.getElementById("workoutTitle");
const workoutFocus = document.getElementById("workoutFocus");
const exercisesContainer = document.getElementById("exercisesContainer");
const backButton = document.getElementById("backButton");
const exerciseTemplate = document.getElementById("exerciseTemplate");
const addExerciseBtn = document.getElementById("addExerciseBtn");

let currentWorkout = null;
let isWorkoutView = false;

// ─── INIT ────────────────────────────────────────────────────────────────────

async function initApp() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("sw.js");
    } catch (e) {}
  }

  try {
    const response = await fetch("workout-data.json");
    const data = await response.json();
    Object.assign(workoutData, data);
  } catch (e) {
    console.error("Errore caricamento dati:", e);
  }

  setupEventListeners();
  handleInitialLoad();
}

function setupEventListeners() {
  document.getElementById("workoutA").addEventListener("click", () => showWorkout("workoutA"));
  document.getElementById("workoutB").addEventListener("click", () => showWorkout("workoutB"));
  document.getElementById("workoutC").addEventListener("click", () => showWorkout("workoutC"));

  backButton.addEventListener("click", () => history.back());
  window.addEventListener("popstate", handlePopState);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement.classList.contains("input-field")) {
      document.activeElement.blur();
    }
  });

  addExerciseBtn.addEventListener("click", openAddModal);
  document.getElementById("modalClose").addEventListener("click", closeAddModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeAddModal);
  document.getElementById("saveNewExercise").addEventListener("click", addNewExercise);
}

function handlePopState() {
  if (isWorkoutView) hideWorkout();
}

function handleInitialLoad() {
  const hash = window.location.hash.substring(1);
  if (hash && workoutData[hash]) {
    showWorkout(hash);
  } else {
    history.replaceState({ view: "home" }, "", "#home");
  }
}

// ─── EXERCISE LIST STORAGE ───────────────────────────────────────────────────

function getExerciseList(workoutId) {
  const stored = localStorage.getItem("exerciseList_" + workoutId);
  if (stored) return JSON.parse(stored);

  // First run: build from JSON, applying any previously saved sets/reps/weight
  const workout = workoutData[workoutId];
  if (!workout) return [];

  const legacyData = JSON.parse(localStorage.getItem("workoutData") || "{}");

  return workout.exercises.map(function(ex) {
    const saved = legacyData[ex.name];
    return {
      name: ex.name,
      muscle: ex.muscle,
      sets: (saved && saved.sets) ? saved.sets : ex.sets,
      reps: (saved && saved.reps) ? saved.reps : ex.reps,
      weight: (saved && saved.weight) ? saved.weight : ex.weight,
    };
  });
}

// Read all cards from the DOM and persist them
function syncAndSave() {
  if (!currentWorkout) return;
  const cards = exercisesContainer.querySelectorAll(".exercise-card");
  const list = Array.from(cards).map(function(card) {
    return {
      name: card.querySelector(".exercise-name").textContent,
      muscle: card.querySelector(".exercise-muscle").textContent,
      sets: card.querySelector(".sets-input").value,
      reps: card.querySelector(".reps-input").value,
      weight: card.querySelector(".weight-input").value,
    };
  });
  localStorage.setItem("exerciseList_" + currentWorkout, JSON.stringify(list));
}

// ─── WORKOUT DISPLAY ─────────────────────────────────────────────────────────

function showWorkout(workoutId) {
  const workout = workoutData[workoutId];
  if (!workout) return;

  currentWorkout = workoutId;
  isWorkoutView = true;

  const colors = {
    workoutA: "rgb(255, 234, 53)",
    workoutB: "rgb(176, 185, 252)",
    workoutC: "rgb(245, 132, 124)",
  };
  document.documentElement.style.setProperty("--workout-color", colors[workoutId] || colors.workoutA);

  workoutTitle.textContent = workout.title;
  workoutFocus.textContent = workout.focus;

  exercisesContainer.innerHTML = "";
  const exercises = getExerciseList(workoutId);
  exercises.forEach(function(ex) {
    exercisesContainer.appendChild(createExerciseCard(ex));
  });

  workoutSelector.classList.add("hidden");
  workoutDetails.classList.remove("hidden");
  addExerciseBtn.classList.remove("hidden");

  history.pushState({ workout: workoutId, view: "workout" }, "", "#" + workoutId);
  window.scrollTo(0, 0);
}

function hideWorkout() {
  isWorkoutView = false;
  currentWorkout = null;

  workoutDetails.classList.add("hidden");
  workoutSelector.classList.remove("hidden");
  addExerciseBtn.classList.add("hidden");
}

// ─── EXERCISE CARD ───────────────────────────────────────────────────────────

function createExerciseCard(exercise) {
  const card = exerciseTemplate.content.cloneNode(true).querySelector(".exercise-card");

  card.querySelector(".exercise-name").textContent = exercise.name;
  card.querySelector(".exercise-muscle").textContent = exercise.muscle;
  card.querySelector(".sets-input").value = exercise.sets;
  card.querySelector(".reps-input").value = exercise.reps;
  card.querySelector(".weight-input").value = exercise.weight;

  card.querySelectorAll(".input-field").forEach(function(input) {
    input.addEventListener("focus", function(e) { e.target.select(); });
    input.addEventListener("blur", syncAndSave);
    input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        syncAndSave();
        e.target.blur();
      }
    });
  });

  const deleteBtn = card.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", function() {
    handleDeleteTap(deleteBtn, card);
  });

  card.querySelector(".drag-handle").addEventListener("touchstart", function(e) {
    onDragStart(e, card);
  }, { passive: false });

  return card;
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

function handleDeleteTap(btn, card) {
  if (btn.dataset.confirm === "true") {
    card.remove();
    syncAndSave();
  } else {
    btn.dataset.confirm = "true";
    btn.classList.add("delete-confirm");
    btn.textContent = "✓";
    setTimeout(function() {
      if (btn.dataset.confirm === "true") {
        btn.dataset.confirm = "false";
        btn.classList.remove("delete-confirm");
        btn.textContent = "×";
      }
    }, 2000);
  }
}

// ─── ADD EXERCISE MODAL ──────────────────────────────────────────────────────

function openAddModal() {
  const modal = document.getElementById("addExerciseModal");
  modal.classList.remove("hidden");
  requestAnimationFrame(function() {
    modal.classList.add("modal-visible");
    document.getElementById("newExName").focus();
  });
}

function closeAddModal() {
  const modal = document.getElementById("addExerciseModal");
  modal.classList.remove("modal-visible");
  setTimeout(function() {
    modal.classList.add("hidden");
    clearModalForm();
  }, 280);
}

function clearModalForm() {
  ["newExName", "newExMuscle", "newExSets", "newExReps", "newExWeight"].forEach(function(id) {
    const el = document.getElementById(id);
    el.value = "";
    el.classList.remove("error");
  });
}

function addNewExercise() {
  const nameInput = document.getElementById("newExName");
  const muscleInput = document.getElementById("newExMuscle");

  let valid = true;
  [nameInput, muscleInput].forEach(function(input) {
    input.classList.remove("error");
    if (!input.value.trim()) {
      input.classList.add("error");
      valid = false;
    }
  });
  if (!valid) return;

  const exercise = {
    name: nameInput.value.trim(),
    muscle: muscleInput.value.trim(),
    sets: document.getElementById("newExSets").value.trim() || "3",
    reps: document.getElementById("newExReps").value.trim() || "10",
    weight: document.getElementById("newExWeight").value.trim() || "0kg",
  };

  const card = createExerciseCard(exercise);
  exercisesContainer.appendChild(card);
  syncAndSave();
  closeAddModal();

  setTimeout(function() {
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 300);
}

// ─── TOUCH DRAG & DROP ───────────────────────────────────────────────────────

let dragState = null;

function onDragStart(e, card) {
  e.preventDefault();

  const touch = e.touches[0];
  const rect = card.getBoundingClientRect();

  const ghost = card.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.style.width = rect.width + "px";
  ghost.style.height = rect.height + "px";
  ghost.style.left = rect.left + "px";
  ghost.style.top = rect.top + "px";
  document.body.appendChild(ghost);

  card.classList.add("drag-source");

  dragState = {
    card: card,
    ghost: ghost,
    offsetY: touch.clientY - rect.top,
  };

  document.addEventListener("touchmove", onDragMove, { passive: false });
  document.addEventListener("touchend", onDragEnd);
  document.addEventListener("touchcancel", onDragEnd);
}

function onDragMove(e) {
  if (!dragState) return;
  e.preventDefault();

  const y = e.touches[0].clientY;
  dragState.ghost.style.top = (y - dragState.offsetY) + "px";

  const siblings = Array.from(
    exercisesContainer.querySelectorAll(".exercise-card:not(.drag-source)")
  );
  let insertBefore = null;

  for (let i = 0; i < siblings.length; i++) {
    const r = siblings[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) {
      insertBefore = siblings[i];
      break;
    }
  }

  if (insertBefore) {
    exercisesContainer.insertBefore(dragState.card, insertBefore);
  } else {
    exercisesContainer.appendChild(dragState.card);
  }
}

function onDragEnd() {
  if (!dragState) return;

  dragState.ghost.remove();
  dragState.card.classList.remove("drag-source");

  syncAndSave();

  document.removeEventListener("touchmove", onDragMove);
  document.removeEventListener("touchend", onDragEnd);
  document.removeEventListener("touchcancel", onDragEnd);

  dragState = null;
}

// ─── PWA INSTALL ─────────────────────────────────────────────────────────────

let deferredPrompt;
const installButton = document.getElementById("installButton");

window.addEventListener("beforeinstallprompt", function(e) {
  e.preventDefault();
  deferredPrompt = e;
  installButton.classList.remove("hidden");
  installButton.addEventListener("click", installApp);
});

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function(result) {
    if (result.outcome === "accepted") installButton.classList.add("hidden");
    deferredPrompt = null;
  });
}

document.addEventListener("DOMContentLoaded", initApp);
