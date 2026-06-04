/*
  Cognify
  Interactive Cognitive Performance Lab

  Modules
  1. Simple Reaction Time
  2. Stroop Attention
  3. Memory Span
  4. Choice Reaction
*/

/* =========================================================
   SHARED HELPERS
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}

function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function setHTML(element, html) {
  if (element) {
    element.innerHTML = html;
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }

  const total = numbers.reduce((sum, number) => sum + number, 0);
  return Math.round(total / numbers.length);
}

function calculateAccuracy(correct, total) {
  if (total === 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

function randomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function randomNumber(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

/* =========================================================
   MODULE 01
   SIMPLE REACTION TIME
========================================================= */

const reactionBox = getElement("reactionBox");
const startReactionButton = getElement("startReactionButton");
const resetReactionButton = getElement("resetReactionButton");
const reactionStatus = getElement("reactionStatus");
const reactionMessage = getElement("reactionMessage");

const reactionAverageResult = getElement("reactionAverageResult");
const reactionFastestResult = getElement("reactionFastestResult");
const reactionSlowestResult = getElement("reactionSlowestResult");
const reactionInterpretation = getElement("reactionInterpretation");

const maximumReactionTrials = 5;

let reactionTrialCount = 0;
let reactionTimes = [];
let reactionWaiting = false;
let reactionReady = false;
let reactionStartTime = 0;
let reactionTimeout = null;

startReactionButton.addEventListener("click", startReactionTest);
resetReactionButton.addEventListener("click", resetReactionTest);
reactionBox.addEventListener("click", handleReactionClick);

function startReactionTest() {
  resetReactionTest();
  startNextReactionTrial();
}

function startNextReactionTrial() {
  if (reactionTrialCount >= maximumReactionTrials) {
    showReactionResults();
    return;
  }

  reactionWaiting = true;
  reactionReady = false;

  setHTML(
    reactionBox,
    "<span>Wait for green</span><small>Do not click yet</small>"
  );

  reactionBox.className = "reaction-box waiting";
  setText(reactionMessage, "");

  const randomDelay = randomNumber(1500, 4500);

  reactionTimeout = setTimeout(() => {
    reactionWaiting = false;
    reactionReady = true;
    reactionStartTime = performance.now();

    setHTML(
      reactionBox,
      "<span>Click now</span><small>Respond as quickly as possible</small>"
    );

    reactionBox.className = "reaction-box ready";
  }, randomDelay);
}

function handleReactionClick() {
  if (reactionWaiting) {
    clearTimeout(reactionTimeout);

    reactionWaiting = false;
    reactionReady = false;

    setHTML(
      reactionBox,
      "<span>Too early</span><small>Wait until the area turns green</small>"
    );

    reactionBox.className = "reaction-box false-start";

    setText(
      reactionMessage,
      "False start. Wait for the green signal before clicking."
    );

    reactionTimeout = setTimeout(startNextReactionTrial, 1200);
    return;
  }

  if (!reactionReady) {
    return;
  }

  const reactionTime = Math.round(performance.now() - reactionStartTime);

  reactionTimes.push(reactionTime);
  reactionTrialCount++;

  reactionReady = false;

  setHTML(
    reactionBox,
    `<span>${reactionTime} ms</span><small>Trial recorded</small>`
  );

  reactionBox.className = "reaction-box";

  setText(reactionMessage, "Nice. Get ready for the next trial.");

  setText(
    reactionStatus,
    `Trials completed: ${reactionTrialCount} / ${maximumReactionTrials}`
  );

  reactionTimeout = setTimeout(startNextReactionTrial, 1200);
}

function showReactionResults() {
  const average = calculateAverage(reactionTimes);
  const fastest = Math.min(...reactionTimes);
  const slowest = Math.max(...reactionTimes);

  setText(reactionAverageResult, `${average} ms`);
  setText(reactionFastestResult, `${fastest} ms`);
  setText(reactionSlowestResult, `${slowest} ms`);

  setHTML(
    reactionBox,
    "<span>Test complete</span><small>Your results are ready below</small>"
  );

  reactionBox.className = "reaction-box";

  setText(reactionMessage, "Reaction time test complete.");

  setText(
    reactionInterpretation,
    createReactionInterpretation(average)
  );
}

function createReactionInterpretation(average) {
  if (average < 250) {
    return "Your average response was fast for this browser based task. Device performance and testing conditions may influence the result.";
  }

  if (average <= 350) {
    return "Your average response was within a common range for a short browser based reaction task.";
  }

  if (average <= 500) {
    return "Your average response was slower during this session. Focus, fatigue, distraction, and device delay can affect performance.";
  }

  return "Your response time was delayed during this session. Cognify is educational and this result should not be interpreted medically.";
}

function resetReactionTest() {
  clearTimeout(reactionTimeout);

  reactionTrialCount = 0;
  reactionTimes = [];
  reactionWaiting = false;
  reactionReady = false;
  reactionStartTime = 0;

  setHTML(
    reactionBox,
    "<span>Ready when you are</span><small>Press start to begin the test</small>"
  );

  reactionBox.className = "reaction-box";

  setText(
    reactionStatus,
    `Trials completed: 0 / ${maximumReactionTrials}`
  );

  setText(reactionMessage, "");

  setText(reactionAverageResult, "Not completed");
  setText(reactionFastestResult, "Not completed");
  setText(reactionSlowestResult, "Not completed");

  setText(
    reactionInterpretation,
    "Complete the reaction time test to generate your interpretation."
  );
}

/* =========================================================
   MODULE 02
   STROOP ATTENTION TEST
========================================================= */

const stroopWord = getElement("stroopWord");
const stroopPrompt = getElement("stroopPrompt");
const startStroopButton = getElement("startStroopButton");
const resetStroopButton = getElement("resetStroopButton");
const stroopStatus = getElement("stroopStatus");
const stroopMessage = getElement("stroopMessage");

const stroopAccuracyResult = getElement("stroopAccuracyResult");
const stroopAverageResult = getElement("stroopAverageResult");
const stroopCorrectResult = getElement("stroopCorrectResult");
const stroopInterpretation = getElement("stroopInterpretation");

const stroopChoices = document.querySelectorAll(".stroop-choice");

const maximumStroopTrials = 10;

const stroopColours = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15"
};

const stroopColourNames = Object.keys(stroopColours);

let stroopTrialCount = 0;
let stroopCorrectAnswers = 0;
let stroopResponseTimes = [];
let stroopCurrentInkColour = "";
let stroopReady = false;
let stroopStartTime = 0;
let stroopTimeout = null;

startStroopButton.addEventListener("click", startStroopTest);
resetStroopButton.addEventListener("click", resetStroopTest);

stroopChoices.forEach((button) => {
  button.addEventListener("click", handleStroopChoice);
});

function startStroopTest() {
  resetStroopTest();
  startNextStroopTrial();
}

function startNextStroopTrial() {
  if (stroopTrialCount >= maximumStroopTrials) {
    showStroopResults();
    return;
  }

  const displayedWord = randomItem(stroopColourNames);
  let inkColour = randomItem(stroopColourNames);

  if (Math.random() < 0.8) {
    while (inkColour === displayedWord) {
      inkColour = randomItem(stroopColourNames);
    }
  }

  stroopCurrentInkColour = inkColour;

  setText(stroopWord, displayedWord.toUpperCase());
  stroopWord.style.color = stroopColours[inkColour];

  setText(
    stroopPrompt,
    "Choose the text colour, not the written word"
  );

  setText(stroopMessage, "");

  stroopReady = true;
  setStroopButtonsEnabled(true);

  stroopStartTime = performance.now();
}

function handleStroopChoice(event) {
  if (!stroopReady) {
    return;
  }

  stroopReady = false;
  setStroopButtonsEnabled(false);

  const selectedColour = event.currentTarget.dataset.colour;
  const responseTime = Math.round(performance.now() - stroopStartTime);
  const correct = selectedColour === stroopCurrentInkColour;

  stroopResponseTimes.push(responseTime);
  stroopTrialCount++;

  if (correct) {
    stroopCorrectAnswers++;

    setText(
      stroopMessage,
      `Correct. Response time: ${responseTime} ms`
    );
  } else {
    setText(
      stroopMessage,
      `Incorrect. The correct colour was ${stroopCurrentInkColour}.`
    );
  }

  setText(
    stroopStatus,
    `Trials completed: ${stroopTrialCount} / ${maximumStroopTrials}`
  );

  stroopTimeout = setTimeout(startNextStroopTrial, 900);
}

function showStroopResults() {
  setStroopButtonsEnabled(false);

  const accuracy = calculateAccuracy(
    stroopCorrectAnswers,
    maximumStroopTrials
  );

  const averageResponseTime = calculateAverage(stroopResponseTimes);

  setText(stroopWord, "COMPLETE");
  stroopWord.style.color = "#22c55e";

  setText(
    stroopPrompt,
    "Your Stroop test results are ready below"
  );

  setText(stroopMessage, "Stroop attention test complete.");

  setText(stroopAccuracyResult, `${accuracy}%`);
  setText(stroopAverageResult, `${averageResponseTime} ms`);

  setText(
    stroopCorrectResult,
    `${stroopCorrectAnswers} / ${maximumStroopTrials}`
  );

  setText(
    stroopInterpretation,
    createStroopInterpretation(accuracy, averageResponseTime)
  );
}

function createStroopInterpretation(accuracy, averageResponseTime) {
  if (accuracy >= 90 && averageResponseTime < 1200) {
    return "You completed the task with high accuracy and relatively quick responses during this session.";
  }

  if (accuracy >= 90) {
    return "You completed the task with high accuracy. Your response time may reflect a careful response style.";
  }

  if (accuracy >= 75) {
    return "You completed the task with moderate accuracy. Some responses may have been affected by interference between the written word and its colour.";
  }

  return "This task appeared challenging during this session. Accuracy can be affected by distraction, speed, or difficulty ignoring the written word.";
}

function resetStroopTest() {
  clearTimeout(stroopTimeout);

  stroopTrialCount = 0;
  stroopCorrectAnswers = 0;
  stroopResponseTimes = [];
  stroopCurrentInkColour = "";
  stroopReady = false;
  stroopStartTime = 0;

  setText(stroopWord, "Ready");
  stroopWord.style.color = "#eaf2ff";

  setText(stroopPrompt, "Press start to begin the test");

  setText(
    stroopStatus,
    `Trials completed: 0 / ${maximumStroopTrials}`
  );

  setText(stroopMessage, "");

  setText(stroopAccuracyResult, "Not completed");
  setText(stroopAverageResult, "Not completed");
  setText(stroopCorrectResult, "Not completed");

  setText(
    stroopInterpretation,
    "Complete the Stroop test to generate your interpretation."
  );

  setStroopButtonsEnabled(false);
}

function setStroopButtonsEnabled(enabled) {
  stroopChoices.forEach((button) => {
    button.disabled = !enabled;
  });
}

/* =========================================================
   MODULE 03
   MEMORY SPAN TEST
========================================================= */

const memoryDisplay = getElement("memoryDisplay");
const memoryInput = getElement("memoryInput");
const startMemoryButton = getElement("startMemoryButton");
const submitMemoryButton = getElement("submitMemoryButton");
const resetMemoryButton = getElement("resetMemoryButton");
const memoryStatus = getElement("memoryStatus");
const memoryMessage = getElement("memoryMessage");

const memorySpanResult = getElement("memorySpanResult");
const memoryCorrectResult = getElement("memoryCorrectResult");
const memoryAccuracyResult = getElement("memoryAccuracyResult");
const memoryInterpretation = getElement("memoryInterpretation");

const maximumMemoryTrials = 6;

let memoryTrialCount = 0;
let memoryCorrectAnswers = 0;
let memoryCurrentSpan = 3;
let memoryHighestSpan = 0;
let memoryCurrentSequence = "";
let memoryReadyForAnswer = false;
let memoryTimeout = null;

startMemoryButton.addEventListener("click", startMemoryTest);
submitMemoryButton.addEventListener("click", submitMemoryAnswer);
resetMemoryButton.addEventListener("click", resetMemoryTest);

memoryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitMemoryAnswer();
  }
});

function startMemoryTest() {
  resetMemoryTest();
  startNextMemoryTrial();
}

function startNextMemoryTrial() {
  if (memoryTrialCount >= maximumMemoryTrials) {
    showMemoryResults();
    return;
  }

  memoryReadyForAnswer = false;
  memoryCurrentSequence = createMemorySequence(memoryCurrentSpan);

  setText(memoryDisplay, memoryCurrentSequence);
  setText(memoryMessage, "Remember the sequence.");

  memoryInput.value = "";
  memoryInput.disabled = true;
  submitMemoryButton.disabled = true;

  const displayDuration = 1000 + memoryCurrentSpan * 300;

  memoryTimeout = setTimeout(() => {
    setText(memoryDisplay, "Enter the sequence");

    setText(
      memoryMessage,
      "Type the numbers in the same order."
    );

    memoryReadyForAnswer = true;
    memoryInput.disabled = false;
    submitMemoryButton.disabled = false;
    memoryInput.focus();
  }, displayDuration);
}

function submitMemoryAnswer() {
  if (!memoryReadyForAnswer) {
    return;
  }

  const answer = memoryInput.value.replace(/\s/g, "");

  if (!answer) {
    setText(memoryMessage, "Enter the sequence before submitting.");
    return;
  }

  memoryReadyForAnswer = false;
  memoryTrialCount++;

  memoryInput.disabled = true;
  submitMemoryButton.disabled = true;

  if (answer === memoryCurrentSequence) {
    memoryCorrectAnswers++;
    memoryHighestSpan = Math.max(memoryHighestSpan, memoryCurrentSpan);

    setText(
      memoryMessage,
      `Correct. The sequence length was ${memoryCurrentSpan}.`
    );

    memoryCurrentSpan++;
  } else {
    setText(
      memoryMessage,
      `Incorrect. The correct sequence was ${memoryCurrentSequence}.`
    );
  }

  setText(
    memoryStatus,
    `Rounds completed: ${memoryTrialCount} / ${maximumMemoryTrials}`
  );

  memoryTimeout = setTimeout(startNextMemoryTrial, 1400);
}

function showMemoryResults() {
  const accuracy = calculateAccuracy(
    memoryCorrectAnswers,
    maximumMemoryTrials
  );

  setText(memoryDisplay, "Test complete");

  setText(
    memoryMessage,
    "Your memory span results are ready below."
  );

  setText(memorySpanResult, `${memoryHighestSpan} digits`);

  setText(
    memoryCorrectResult,
    `${memoryCorrectAnswers} / ${maximumMemoryTrials}`
  );

  setText(memoryAccuracyResult, `${accuracy}%`);

  setText(
    memoryInterpretation,
    createMemoryInterpretation(memoryHighestSpan, accuracy)
  );
}

function createMemoryInterpretation(highestSpan, accuracy) {
  if (highestSpan >= 7 && accuracy >= 80) {
    return "You recalled longer sequences with high accuracy during this short working memory task.";
  }

  if (highestSpan >= 5) {
    return "You demonstrated moderate sequence recall during this session. Performance can vary with focus and strategy.";
  }

  return "The memory task appeared challenging during this session. Distraction, fatigue, and unfamiliarity with the task can affect recall.";
}

function resetMemoryTest() {
  clearTimeout(memoryTimeout);

  memoryTrialCount = 0;
  memoryCorrectAnswers = 0;
  memoryCurrentSpan = 3;
  memoryHighestSpan = 0;
  memoryCurrentSequence = "";
  memoryReadyForAnswer = false;

  setText(memoryDisplay, "Ready");

  setText(
    memoryStatus,
    `Rounds completed: 0 / ${maximumMemoryTrials}`
  );

  setText(memoryMessage, "");

  memoryInput.value = "";
  memoryInput.disabled = true;
  submitMemoryButton.disabled = true;

  setText(memorySpanResult, "Not completed");
  setText(memoryCorrectResult, "Not completed");
  setText(memoryAccuracyResult, "Not completed");

  setText(
    memoryInterpretation,
    "Complete the memory test to generate your interpretation."
  );
}

function createMemorySequence(length) {
  let sequence = "";

  for (let index = 0; index < length; index++) {
    sequence += randomNumber(0, 9);
  }

  return sequence;
}

/* =========================================================
   MODULE 04
   CHOICE REACTION TEST
========================================================= */

const choiceStimulus = getElement("choiceStimulus");
const choiceStimulusText = choiceStimulus.querySelector("span");
const choicePrompt = getElement("choicePrompt");
const startChoiceButton = getElement("startChoiceButton");
const resetChoiceButton = getElement("resetChoiceButton");
const choiceStatus = getElement("choiceStatus");
const choiceMessage = getElement("choiceMessage");

const choiceAverageResult = getElement("choiceAverageResult");
const choiceAccuracyResult = getElement("choiceAccuracyResult");
const choiceCorrectResult = getElement("choiceCorrectResult");
const choiceInterpretation = getElement("choiceInterpretation");

const choiceOptions = document.querySelectorAll(".choice-option");

const maximumChoiceTrials = 10;

const choiceColours = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15"
};

const choiceColourNames = Object.keys(choiceColours);

let choiceTrialCount = 0;
let choiceCorrectAnswers = 0;
let choiceResponseTimes = [];
let currentChoice = "";
let choiceReady = false;
let choiceStartTime = 0;
let choiceTimeout = null;

startChoiceButton.addEventListener("click", startChoiceTest);
resetChoiceButton.addEventListener("click", resetChoiceTest);

choiceOptions.forEach((button) => {
  button.addEventListener("click", handleChoiceSelection);
});

function startChoiceTest() {
  resetChoiceTest();
  prepareNextChoiceTrial();
}

function prepareNextChoiceTrial() {
  if (choiceTrialCount >= maximumChoiceTrials) {
    showChoiceResults();
    return;
  }

  choiceReady = false;
  setChoiceButtonsEnabled(false);

  setText(choiceStimulusText, "Wait");

  choiceStimulus.style.background = "rgba(255, 255, 255, 0.08)";
  choiceStimulus.style.color = "#ffffff";

  setText(choicePrompt, "Wait for the coloured signal.");
  setText(choiceMessage, "");

  const randomDelay = randomNumber(800, 2000);

  choiceTimeout = setTimeout(showChoiceStimulus, randomDelay);
}

function showChoiceStimulus() {
  currentChoice = randomItem(choiceColourNames);

  choiceStimulus.style.background = choiceColours[currentChoice];

  if (currentChoice === "yellow" || currentChoice === "green") {
    choiceStimulus.style.color = "#07111f";
  } else {
    choiceStimulus.style.color = "#ffffff";
  }

  setText(choiceStimulusText, "Select");

  setText(choicePrompt, "Choose the matching colour.");

  choiceReady = true;
  setChoiceButtonsEnabled(true);
  choiceStartTime = performance.now();
}

function handleChoiceSelection(event) {
  if (!choiceReady) {
    return;
  }

  choiceReady = false;
  setChoiceButtonsEnabled(false);

  const selectedChoice = event.currentTarget.dataset.choice;
  const responseTime = Math.round(performance.now() - choiceStartTime);
  const correct = selectedChoice === currentChoice;

  choiceResponseTimes.push(responseTime);
  choiceTrialCount++;

  if (correct) {
    choiceCorrectAnswers++;

    setText(
      choiceMessage,
      `Correct. Decision time: ${responseTime} ms`
    );
  } else {
    setText(
      choiceMessage,
      `Incorrect. The correct answer was ${currentChoice}.`
    );
  }

  setText(
    choiceStatus,
    `Trials completed: ${choiceTrialCount} / ${maximumChoiceTrials}`
  );

  choiceTimeout = setTimeout(prepareNextChoiceTrial, 900);
}

function showChoiceResults() {
  const accuracy = calculateAccuracy(
    choiceCorrectAnswers,
    maximumChoiceTrials
  );

  const averageResponse = calculateAverage(choiceResponseTimes);

  setText(choiceStimulusText, "Done");

  choiceStimulus.style.background = "#22c55e";
  choiceStimulus.style.color = "#07111f";

  setText(
    choicePrompt,
    "Your choice reaction results are ready below."
  );

  setText(choiceMessage, "Choice reaction test complete.");

  setText(choiceAverageResult, `${averageResponse} ms`);
  setText(choiceAccuracyResult, `${accuracy}%`);

  setText(
    choiceCorrectResult,
    `${choiceCorrectAnswers} / ${maximumChoiceTrials}`
  );

  setText(
    choiceInterpretation,
    createChoiceInterpretation(accuracy, averageResponse)
  );
}

function createChoiceInterpretation(accuracy, averageResponse) {
  if (accuracy >= 90 && averageResponse < 800) {
    return "You responded quickly and accurately during this short decision response task.";
  }

  if (accuracy >= 90) {
    return "You completed the task with high accuracy. Your response speed may reflect a careful decision style.";
  }

  if (accuracy >= 75) {
    return "You completed the task with moderate accuracy. Decision speed and accuracy may have competed during some trials.";
  }

  return "This task appeared challenging during this session. Performance can be affected by distraction, speed, and unfamiliarity with the task.";
}

function resetChoiceTest() {
  clearTimeout(choiceTimeout);

  choiceTrialCount = 0;
  choiceCorrectAnswers = 0;
  choiceResponseTimes = [];
  currentChoice = "";
  choiceReady = false;
  choiceStartTime = 0;

  setText(choiceStimulusText, "Ready");

  choiceStimulus.style.background = "rgba(255, 255, 255, 0.08)";
  choiceStimulus.style.color = "#ffffff";

  setText(choicePrompt, "Press start to begin the test");

  setText(
    choiceStatus,
    `Trials completed: 0 / ${maximumChoiceTrials}`
  );

  setText(choiceMessage, "");

  setText(choiceAverageResult, "Not completed");
  setText(choiceAccuracyResult, "Not completed");
  setText(choiceCorrectResult, "Not completed");

  setText(
    choiceInterpretation,
    "Complete the choice reaction test to generate your interpretation."
  );

  setChoiceButtonsEnabled(false);
}

function setChoiceButtonsEnabled(enabled) {
  choiceOptions.forEach((button) => {
    button.disabled = !enabled;
  });
}

/* =========================================================
   INITIAL PAGE SETUP
========================================================= */

resetReactionTest();
resetStroopTest();
resetMemoryTest();
resetChoiceTest();