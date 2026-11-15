/**
 * IT 3203 Project Milestone #2: HTTP Self-Assessment Quiz
 * Handles 10-minute countdown timer, elapsed time tracking,
 * answer validation across multiple input types, color-coded results,
 * and full quiz reset functionality.
 */

// ==========================================
// 1. QUIZ CONFIGURATION & ANSWER KEY
// ==========================================
const QUIZ_DURATION_SECONDS = 600; // 10 minutes (600 seconds)
const PASS_THRESHOLD_PERCENT = 70; // 70% (7/10) required to pass

// Answer key mapped to the 10 questions in quiz.html
const answerKey = [
  {
    id: "q1",
    type: "text",
    acceptedAnswers: ["tim berners-lee", "tim berners lee"],
    displayAnswer: "Tim Berners-Lee"
  },
  {
    id: "q2",
    type: "text",
    acceptedAnswers: ["cookies", "cookie"],
    displayAnswer: "Cookies"
  },
  {
    id: "q3",
    type: "radio",
    correct: "4xx",
    displayAnswer: "4xx (Client Error)"
  },
  {
    id: "q4",
    type: "radio",
    correct: "hol",
    displayAnswer: "Head-of-Line Blocking"
  },
  {
    id: "q5",
    type: "radio",
    correct: "quic",
    displayAnswer: "QUIC"
  },
  {
    id: "q6",
    type: "radio",
    correct: "1.0",
    displayAnswer: "HTTP/1.0 (1996)"
  },
  {
    id: "q7",
    type: "radio",
    correct: "frames",
    displayAnswer: "It chops requests and responses into tiny binary frames and interleaves them."
  },
  {
    id: "q8",
    type: "checkbox",
    correct: ["html", "urls", "http"],
    displayAnswer: "HTML, URLs, and HTTP"
  },
  {
    id: "q9",
    type: "checkbox",
    correct: ["client", "server", "status"],
    displayAnswer: "Client submits requests, Server listens/responds, and Every response includes a numeric status code."
  },
  {
    id: "q10",
    type: "select",
    correct: "tls",
    displayAnswer: "Transport Layer Security (TLS)"
  }
  
];

// ==========================================
// 2. STATE & DOM REFERENCES
// ==========================================
let timeRemaining = QUIZ_DURATION_SECONDS;
let timerInterval = null;
let quizSubmitted = false;

const quizForm = document.getElementById("http-quiz-form");
const timerBox = document.getElementById("timer-box");
const timeDisplay = document.getElementById("time-display");
const resultsContainer = document.getElementById("results-container");
const passFailBadge = document.getElementById("pass-fail-badge");
const totalScoreSpan = document.getElementById("total-score");
const timeSpentSpan = document.getElementById("time-spent");
const questionBreakdown = document.getElementById("question-breakdown");
const submitBtn = document.getElementById("submit-btn");
const resetBtn = document.getElementById("reset-btn");

// ==========================================
// 3. TIMER MANAGEMENT
// ==========================================

// Formats total seconds into MM:SS string
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Starts or restarts the 10-minute countdown
function startTimer() {
  clearInterval(timerInterval);
  timeDisplay.textContent = formatTime(timeRemaining);
  timerBox.classList.remove("timer-warning");

  timerInterval = setInterval(() => {
    timeRemaining--;
    timeDisplay.textContent = formatTime(timeRemaining);

    // Highlight timer in red when under 1 minute remains
    if (timeRemaining <= 60) {
      timerBox.classList.add("timer-warning");
    }

    // Automatically grade quiz when timer hits 00:00
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("Time has expired! Your quiz will now be submitted automatically.");
      gradeQuiz();
    }
  }, 1000);
}

// ==========================================
// 4. GRADING & RESULTS RENDERING
// ==========================================
// Evaluate each question against the answer key
  answerKey.forEach((item, index) => {
    let isCorrect = false;
    let userResponse = "No answer provided";

    if (item.type === "text") {
      const rawText = document.getElementById(item.id).value.trim();
      userResponse = rawText !== "" ? rawText : "No answer provided";
      isCorrect = item.acceptedAnswers.includes(rawText.toLowerCase());
    } 
    else if (item.type === "radio") {
      const selectedRadio = document.querySelector(`input[name="${item.id}"]:checked`);
      if (selectedRadio) {
        userResponse = selectedRadio.parentElement.textContent.trim();
        isCorrect = selectedRadio.value === item.correct;
      }
    } 
    else if (item.type === "checkbox") {
      const selectedElements = Array.from(document.querySelectorAll(`input[name="${item.id}"]:checked`));
      const selectedValues = selectedElements.map(checkbox => checkbox.value);
      
      if (selectedElements.length > 0) {
        userResponse = selectedElements.map(checkbox => checkbox.parentElement.textContent.trim()).join("; ");
      }
      // User must select every correct box and zero incorrect boxes
      isCorrect = selectedValues.length === item.correct.length &&
                  item.correct.every(val => selectedValues.includes(val));
    } 
    else if (item.type === "select") {
      const selectEl = document.getElementById(item.id);
      if (selectEl.value !== "") {
        userResponse = selectEl.options[selectEl.selectedIndex].text;
      }
      isCorrect = selectEl.value === item.correct;
    }

    if (isCorrect) {
      score++;
    }

    // Create color-coded breakdown card for this question
    const resultCard = document.createElement("div");
    resultCard.className = `breakdown-item ${isCorrect ? "item-correct" : "item-incorrect"}`;
    resultCard.innerHTML = `
      <strong>Question ${index + 1}:</strong> ${isCorrect ? "Correct (1/1 pt)" : "Incorrect (0/1 pt)"}<br>
      <span><strong>Your Answer:</strong> ${userResponse}</span><br>
      <span><strong>Correct Answer:</strong> ${item.displayAnswer}</span>
    `;
    questionBreakdown.appendChild(resultCard);
  });

// ==========================================
// 5. RESET / RETAKE HANDLER
// ==========================================
function resetQuiz() {
  clearInterval(timerInterval);
  quizForm.reset();

  // Reset state flags and UI elements
  quizSubmitted = false;
  submitBtn.disabled = false;
  timeRemaining = QUIZ_DURATION_SECONDS;
  resultsContainer.classList.add("hidden");
  questionBreakdown.innerHTML = "";

  // Restart the 10-minute timer
  startTimer();
}

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
quizForm.addEventListener("submit", gradeQuiz);
resetBtn.addEventListener("click", resetQuiz);

// Automatically start the 10-minute countdown when the page finishes loading
window.addEventListener("DOMContentLoaded", startTimer);