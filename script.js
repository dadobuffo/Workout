const workoutData = {};

const workoutSelector = document.querySelector(".workout-selector");
const workoutDetails = document.getElementById("workoutDetails");
const workoutTitle = document.getElementById("workoutTitle");
const workoutFocus = document.getElementById("workoutFocus");
const exercisesContainer = document.getElementById("exercisesContainer");
const backButton = document.getElementById("backButton");
const exerciseTemplate = document.getElementById("exerciseTemplate");

let currentWorkout = null;
let isWorkoutView = false;

async function initApp() {
  try {
    const response = await fetch("workout-data.json");
    const data = await response.json();
    Object.assign(workoutData, data);

    setupEventListeners();
    handleInitialLoad();
  } catch (error) {
    console.error("Errore nel caricamento dei dati:", error);
    setupEventListeners();
    handleInitialLoad();
  }
}

function setupEventListeners() {
  document
    .getElementById("workoutA")
    .addEventListener("click", () => showWorkout("workoutA"));
  document
    .getElementById("workoutB")
    .addEventListener("click", () => showWorkout("workoutB"));
  document
    .getElementById("workoutC")
    .addEventListener("click", () => showWorkout("workoutC"));

  backButton.addEventListener("click", hideWorkout);

  window.addEventListener("popstate", handlePopState);

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      document.activeElement.classList.contains("input-field")
    ) {
      document.activeElement.blur();
    }
  });
}

function handlePopState(event) {
  if (isWorkoutView) {
    hideWorkout();
  }
}

function handleInitialLoad() {
  const hash = window.location.hash.substring(1);

  if (hash && workoutData[hash]) {
    showWorkout(hash);
  } else {
    history.replaceState({ view: "home" }, "", "#home");
  }
}

function showWorkout(workoutId) {
  const workout = workoutData[workoutId];

  if (!workout) return;

  currentWorkout = workoutId;
  isWorkoutView = true;

  let workoutColor;
  switch (workoutId) {
    case "workoutA":
      workoutColor = "rgb(255, 234, 53)";
      break;
    case "workoutB":
      workoutColor = "rgb(176, 185, 252)";
      break;
    case "workoutC":
      workoutColor = "rgb(245, 132, 124)";
      break;
    default:
      workoutColor = "rgb(255, 234, 53)";
  }

  document.documentElement.style.setProperty("--workout-color", workoutColor);

  workoutTitle.textContent = workout.title;
  workoutFocus.textContent = `${workout.focus}`;

  exercisesContainer.innerHTML = "";

  workout.exercises.forEach((exercise, index) => {
    const exerciseCard = createExerciseCard(exercise, index);
    exercisesContainer.appendChild(exerciseCard);
  });

  workoutSelector.classList.add("hidden");
  workoutDetails.classList.remove("hidden");

  history.pushState(
    { workout: workoutId, view: "workout" },
    "",
    `#${workoutId}`
  );

  window.scrollTo(0, 0);
}

function createExerciseCard(exercise, index) {
  const card = exerciseTemplate.content.cloneNode(true);

  const exerciseCard = card.querySelector(".exercise-card");
  const exerciseName = card.querySelector(".exercise-name");
  const exerciseMuscle = card.querySelector(".exercise-muscle");
  const setsInput = card.querySelector(".sets-input");
  const repsInput = card.querySelector(".reps-input");
  const weightInput = card.querySelector(".weight-input");

  exerciseName.textContent = exercise.name;
  exerciseMuscle.textContent = exercise.muscle;

  const savedData = loadExerciseData(exercise.name);

  if (savedData) {
    setsInput.value = savedData.sets || exercise.sets;
    repsInput.value = savedData.reps || exercise.reps;
    weightInput.value = savedData.weight || exercise.weight;
  } else {
    setsInput.value = exercise.sets;
    repsInput.value = exercise.reps;
    weightInput.value = exercise.weight;
  }

  setsInput.addEventListener("focus", (e) => e.target.select());
  repsInput.addEventListener("focus", (e) => e.target.select());
  weightInput.addEventListener("focus", (e) => e.target.select());

  setsInput.addEventListener("blur", () => saveExerciseData(exercise.name));
  repsInput.addEventListener("blur", () => saveExerciseData(exercise.name));
  weightInput.addEventListener("blur", () => saveExerciseData(exercise.name));

  setsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveExerciseData(exercise.name);
      e.target.blur();
    }
  });

  repsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveExerciseData(exercise.name);
      e.target.blur();
    }
  });

  weightInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveExerciseData(exercise.name);
      e.target.blur();
    }
  });

  return exerciseCard;
}

function saveExerciseData(exerciseName) {
  const exerciseCards = document.querySelectorAll(".exercise-card");

  exerciseCards.forEach((card) => {
    const nameElement = card.querySelector(".exercise-name");
    if (nameElement.textContent === exerciseName) {
      const setsInput = card.querySelector(".sets-input");
      const repsInput = card.querySelector(".reps-input");
      const weightInput = card.querySelector(".weight-input");

      const exerciseData = JSON.parse(
        localStorage.getItem("workoutData") || "{}"
      );

      exerciseData[exerciseName] = {
        sets: setsInput.value,
        reps: repsInput.value,
        weight: weightInput.value,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("workoutData", JSON.stringify(exerciseData));
    }
  });
}

function loadExerciseData(exerciseName) {
  const exerciseData = JSON.parse(localStorage.getItem("workoutData") || "{}");
  return exerciseData[exerciseName] || null;
}

function hideWorkout() {
  isWorkoutView = false;
  currentWorkout = null;

  workoutDetails.classList.add("hidden");
  workoutSelector.classList.remove("hidden");

  history.pushState({ view: "home" }, "", "#home");
}

document.addEventListener("DOMContentLoaded", initApp);
