// Workout data - you can easily modify or extend this
const workoutData = {
  workoutA: {
    title: "Workout A",
    focus: "Chest & Triceps",
    exercises: [
      {
        name: "Bench Press",
        muscle: "Chest",
        sets: 4,
        reps: "8-10",
        weight: 60,
        unit: "kg",
      },
      {
        name: "Incline Dumbbell Press",
        muscle: "Upper Chest",
        sets: 3,
        reps: "10-12",
        weight: 22,
        unit: "kg",
      },
      {
        name: "Cable Flyes",
        muscle: "Chest",
        sets: 3,
        reps: "12-15",
        weight: 15,
        unit: "kg",
      },
      {
        name: "Triceps Pushdown",
        muscle: "Triceps",
        sets: 3,
        reps: "12-15",
        weight: 20,
        unit: "kg",
      },
      {
        name: "Overhead Triceps Extension",
        muscle: "Triceps",
        sets: 3,
        reps: "10-12",
        weight: 15,
        unit: "kg",
      },
    ],
  },
  workoutB: {
    title: "Workout B",
    focus: "Back & Biceps",
    exercises: [
      {
        name: "Pull-ups",
        muscle: "Back",
        sets: 4,
        reps: "8-10",
        weight: 0,
        unit: "bodyweight",
      },
      {
        name: "Bent Over Rows",
        muscle: "Back",
        sets: 3,
        reps: "10-12",
        weight: 50,
        unit: "kg",
      },
      {
        name: "Lat Pulldown",
        muscle: "Back",
        sets: 3,
        reps: "10-12",
        weight: 40,
        unit: "kg",
      },
      {
        name: "Barbell Curl",
        muscle: "Biceps",
        sets: 3,
        reps: "10-12",
        weight: 25,
        unit: "kg",
      },
      {
        name: "Hammer Curl",
        muscle: "Biceps",
        sets: 3,
        reps: "12-15",
        weight: 12,
        unit: "kg",
      },
    ],
  },
  workoutC: {
    title: "Workout C",
    focus: "Legs & Shoulders",
    exercises: [
      {
        name: "Squats",
        muscle: "Legs",
        sets: 4,
        reps: "8-10",
        weight: 80,
        unit: "kg",
      },
      {
        name: "Leg Press",
        muscle: "Legs",
        sets: 3,
        reps: "10-12",
        weight: 100,
        unit: "kg",
      },
      {
        name: "Leg Curl",
        muscle: "Hamstrings",
        sets: 3,
        reps: "12-15",
        weight: 30,
        unit: "kg",
      },
      {
        name: "Shoulder Press",
        muscle: "Shoulders",
        sets: 3,
        reps: "10-12",
        weight: 30,
        unit: "kg",
      },
      {
        name: "Lateral Raises",
        muscle: "Shoulders",
        sets: 3,
        reps: "12-15",
        weight: 10,
        unit: "kg",
      },
      {
        name: "Calf Raises",
        muscle: "Calves",
        sets: 4,
        reps: "15-20",
        weight: 50,
        unit: "kg",
      },
    ],
  },
};

// DOM elements
const workoutSelector = document.querySelector(".workout-selector");
const workoutDetails = document.getElementById("workoutDetails");
const workoutTitle = document.getElementById("workoutTitle");
const workoutFocus = document.getElementById("workoutFocus");
const exercisesContainer = document.getElementById("exercisesContainer");
const backButton = document.getElementById("backButton");
const totalExercises = document.getElementById("totalExercises");
const totalSets = document.getElementById("totalSets");
const completeWorkoutBtn = document.getElementById("completeWorkout");
const currentDate = document.getElementById("currentDate");
const currentYear = document.getElementById("currentYear");

// Template for exercise cards
const exerciseTemplate = document.getElementById("exerciseTemplate");

// Initialize the app
function initApp() {
  // Set current date
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  currentDate.textContent = today.toLocaleDateString("en-US", options);

  // Set current year in footer
  currentYear.textContent = today.getFullYear();

  // Add event listeners to workout buttons
  document
    .getElementById("workoutA")
    .addEventListener("click", () => showWorkout("workoutA"));
  document
    .getElementById("workoutB")
    .addEventListener("click", () => showWorkout("workoutB"));
  document
    .getElementById("workoutC")
    .addEventListener("click", () => showWorkout("workoutC"));

  // Add event listener to back button
  backButton.addEventListener("click", hideWorkout);

  // Add event listener to complete workout button
  completeWorkoutBtn.addEventListener("click", completeWorkout);

  // Check if app is installed as PWA
  if (window.matchMedia("(display-mode: standalone)").matches) {
    console.log("App is running as PWA");
  }
}

// Show workout details
function showWorkout(workoutId) {
  const workout = workoutData[workoutId];

  if (!workout) return;

  // Update workout header
  workoutTitle.textContent = workout.title;
  workoutFocus.textContent = `Focus: ${workout.focus}`;

  // Clear previous exercises
  exercisesContainer.innerHTML = "";

  // Generate exercise cards
  let totalSetsCount = 0;

  workout.exercises.forEach((exercise, index) => {
    const exerciseCard = createExerciseCard(exercise, index);
    exercisesContainer.appendChild(exerciseCard);
    totalSetsCount += exercise.sets;
  });

  // Update summary
  totalExercises.textContent = workout.exercises.length;
  totalSets.textContent = totalSetsCount;

  // Show workout details and hide selector
  workoutSelector.classList.add("hidden");
  workoutDetails.classList.remove("hidden");

  // Scroll to top
  window.scrollTo(0, 0);
}

// Create exercise card from template and data
function createExerciseCard(exercise, index) {
  // Clone the template
  const card = exerciseTemplate.content.cloneNode(true);

  // Get elements from the cloned template
  const exerciseCard = card.querySelector(".exercise-card");
  const exerciseName = card.querySelector(".exercise-name");
  const exerciseMuscle = card.querySelector(".exercise-muscle");
  const setValueElements = card.querySelectorAll(".set-value");
  const weightValue = card.querySelector(".weight-value");
  const weightUnit = card.querySelector(".weight-unit");
  const decreaseBtn = card.querySelector(".decrease");
  const increaseBtn = card.querySelector(".increase");
  const checkBtn = card.querySelector(".check-btn");
  const setsTracker = card.querySelector(".sets-tracker");

  // Set exercise data
  exerciseName.textContent = exercise.name;
  exerciseMuscle.textContent = exercise.muscle;

  // Set sets, reps and weight
  setValueElements[0].textContent = exercise.sets;
  setValueElements[1].textContent = exercise.reps;
  setValueElements[2].textContent = `${exercise.weight} ${exercise.unit}`;

  // Set current weight
  weightValue.textContent = exercise.weight;
  weightUnit.textContent = exercise.unit;

  // Create set tracker circles
  setsTracker.innerHTML = "";
  for (let i = 0; i < exercise.sets; i++) {
    const setCircle = document.createElement("div");
    setCircle.classList.add("set-circle");
    setCircle.dataset.setIndex = i;
    setsTracker.appendChild(setCircle);
  }

  // Add event listeners for weight adjustment
  decreaseBtn.addEventListener("click", () => {
    let currentWeight = parseInt(weightValue.textContent);
    if (currentWeight > 0) {
      currentWeight -= exercise.unit === "kg" ? 2.5 : 5;
      if (currentWeight < 0) currentWeight = 0;
      weightValue.textContent = currentWeight;
      setValueElements[2].textContent = `${currentWeight} ${exercise.unit}`;

      // Save to localStorage
      saveWeightToStorage(exercise.name, currentWeight);
    }
  });

  increaseBtn.addEventListener("click", () => {
    let currentWeight = parseInt(weightValue.textContent);
    currentWeight += exercise.unit === "kg" ? 2.5 : 5;
    weightValue.textContent = currentWeight;
    setValueElements[2].textContent = `${currentWeight} ${exercise.unit}`;

    // Save to localStorage
    saveWeightToStorage(exercise.name, currentWeight);
  });

  // Add event listener for completing sets
  checkBtn.addEventListener("click", function () {
    const setCircles = setsTracker.querySelectorAll(".set-circle");
    let allCompleted = true;

    // Check if all sets are completed
    setCircles.forEach((circle) => {
      if (!circle.classList.contains("completed")) {
        allCompleted = false;
      }
    });

    if (allCompleted) {
      // Reset all sets
      setCircles.forEach((circle) => {
        circle.classList.remove("completed");
      });
      checkBtn.textContent = "✓";
      checkBtn.style.backgroundColor = "#2ecc71";
    } else {
      // Mark next uncompleted set
      for (let i = 0; i < setCircles.length; i++) {
        if (!setCircles[i].classList.contains("completed")) {
          setCircles[i].classList.add("completed");
          break;
        }
      }

      // Check if now all sets are completed
      const nowAllCompleted = Array.from(setCircles).every((circle) =>
        circle.classList.contains("completed")
      );

      if (nowAllCompleted) {
        checkBtn.textContent = "Reset";
        checkBtn.style.backgroundColor = "#e74c3c";
      }
    }
  });

  // Load saved weight from localStorage
  const savedWeight = loadWeightFromStorage(exercise.name);
  if (savedWeight !== null) {
    weightValue.textContent = savedWeight;
    setValueElements[2].textContent = `${savedWeight} ${exercise.unit}`;
  }

  return exerciseCard;
}

// Hide workout details and show selector
function hideWorkout() {
  workoutDetails.classList.add("hidden");
  workoutSelector.classList.remove("hidden");
}

// Complete workout function
function completeWorkout() {
  alert("Great job! Workout completed. Keep up the good work!");

  // Reset all set trackers
  const checkButtons = document.querySelectorAll(".check-btn");
  checkButtons.forEach((btn) => {
    btn.textContent = "✓";
    btn.style.backgroundColor = "#2ecc71";
  });

  const setCircles = document.querySelectorAll(".set-circle");
  setCircles.forEach((circle) => {
    circle.classList.remove("completed");
  });

  // Go back to workout selector
  hideWorkout();
}

// Save weight to localStorage
function saveWeightToStorage(exerciseName, weight) {
  const weights = JSON.parse(localStorage.getItem("gymWeights") || "{}");
  weights[exerciseName] = weight;
  localStorage.setItem("gymWeights", JSON.stringify(weights));
}

// Load weight from localStorage
function loadWeightFromStorage(exerciseName) {
  const weights = JSON.parse(localStorage.getItem("gymWeights") || "{}");
  return weights[exerciseName] !== undefined ? weights[exerciseName] : null;
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Add PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}
