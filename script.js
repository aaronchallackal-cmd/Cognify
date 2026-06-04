const reactionBox = document.getElementById("reactionBox");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const trialStatus = document.getElementById("trialStatus");
const message = document.getElementById("message");

const averageResult = document.getElementById("averageResult");
const fastestResult = document.getElementById("fastestResult");
const slowestResult = document.getElementById("slowestResult");
const interpretationText = document.getElementById("interpretationText");

let trialCount = 0;
let maxTrials = 5;
let reactionTimes = [];
let waiting = false;
let ready = false;
let startTime = 0;
let timeoutId = null;

startButton.addEventListener("click", startTest);
resetButton.addEventListener("click", resetTest);
reactionBox.addEventListener("click", handleBoxClick);

function startTest() {
  resetTest();
  startNextTrial();
}

function startNextTrial() {
  if (trialCount >= maxTrials) {
    showResults();
    return;
  }

  waiting = true;
  ready = false;

  reactionBox.innerHTML = "<span>Wait for green</span><small>Do not click yet</small>";
  reactionBox.className = "reaction-box waiting";
  message.textContent = "";

  const randomDelay = Math.floor(Math.random() * 3000) + 1500;

  timeoutId = setTimeout(() => {
    waiting = false;
    ready = true;
    startTime = Date.now();

    reactionBox.innerHTML = "<span>Click now</span><small>Respond as fast as possible</small>";
    reactionBox.className = "reaction-box ready";
  }, randomDelay);
}

function handleBoxClick() {
  if (waiting) {
    clearTimeout(timeoutId);

    waiting = false;
    ready = false;

    reactionBox.innerHTML = "<span>Too early</span><small>Wait until the box turns green</small>";
    reactionBox.className = "reaction-box false-start";
    message.textContent = "False start. Wait for the green signal.";

    setTimeout(startNextTrial, 1200);
    return;
  }

  if (ready) {
    const endTime = Date.now();
    const reactionTime = endTime - startTime;

    reactionTimes.push(reactionTime);
    trialCount++;

    ready = false;

    reactionBox.innerHTML = `<span>${reactionTime} ms</span><small>Trial recorded</small>`;
    reactionBox.className = "reaction-box";
    message.textContent = "Nice. Get ready for the next trial.";
    trialStatus.textContent = `Trials completed: ${trialCount} / ${maxTrials}`;

    setTimeout(startNextTrial, 1200);
  }
}

function showResults() {
  if (reactionTimes.length === 0) {
    return;
  }

  const total = reactionTimes.reduce((sum, time) => sum + time, 0);
  const average = Math.round(total / reactionTimes.length);
  const fastest = Math.min(...reactionTimes);
  const slowest = Math.max(...reactionTimes);

  averageResult.textContent = `${average} ms`;
  fastestResult.textContent = `${fastest} ms`;
  slowestResult.textContent = `${slowest} ms`;

  reactionBox.innerHTML = "<span>Test complete</span><small>Your results are ready below</small>";
  reactionBox.className = "reaction-box";
  message.textContent = "Your results are shown below.";

  interpretationText.textContent = createInterpretation(average);
}

function createInterpretation(average) {
  if (average < 250) {
    return "Your average reaction time was fast for this browser based task. This may reflect quick visual response speed during this short session, but it should not be interpreted medically.";
  }

  if (average >= 250 && average <= 350) {
    return "Your average reaction time was within a common range for a short browser based visual reaction task. Results can vary depending on focus, fatigue, device speed, and browser performance.";
  }

  if (average > 350 && average <= 500) {
    return "Your average reaction time was slower for this task. This can be influenced by focus, fatigue, distraction, device delay, or the small number of trials.";
  }

  return "Your average reaction time was delayed for this task, but Cognify is not a clinical tool. Results can be affected by device delay, attention, fatigue, testing environment, and input method.";
}

function resetTest() {
  clearTimeout(timeoutId);

  trialCount = 0;
  reactionTimes = [];
  waiting = false;
  ready = false;
  startTime = 0;

  reactionBox.innerHTML = "<span>Ready when you are</span><small>Press start to begin the test</small>";
  reactionBox.className = "reaction-box";

  trialStatus.textContent = `Trials completed: 0 / ${maxTrials}`;
  message.textContent = "";

  averageResult.textContent = "Not completed";
  fastestResult.textContent = "Not completed";
  slowestResult.textContent = "Not completed";

  interpretationText.textContent = "Complete the reaction time test to generate your interpretation.";
}