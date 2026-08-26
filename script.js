// ===== Chapter Data =====
const chapters = [
  { id: "chapter-1", file: "chapter-1.html" },
  // ===== { id: "chapter-2", file: "chapter-2.html" },
  // ===== { id: "chapter-3", file: "chapter-3.html" },
  // ===== { id: "chapter-4", file: "chapter-4.html" },
  // ===== { id: "chapter-5", file: "chapter-5.html" },
  // ===== { id: "chapter-6", file: "chapter-6.html" },
  // ===== { id: "chapter-7", file: "chapter-7.html" },
  // ===== { id: "chapter-8", file: "chapter-8.html" },
  // ===== { id: "chapter-9", file: "chapter-9.html" }
];

// ===== Global State =====
let currentLanguage = "en";

// ===== Utility Functions =====
function getLanguageToggle() {
  return document.getElementById("language-toggle");
}

function getLocalizedAttribute(element, baseName) {
  if (!element) return "";
  return (
    element.getAttribute(`data-${baseName}-${currentLanguage}`) ||
    element.getAttribute(`data-${baseName}-en`) ||
    ""
  );
}

async function typesetMath() {
  if (window.MathJax && typeof MathJax.typesetPromise === "function") {
    try {
      await MathJax.typesetPromise();
    } catch (error) {
      console.warn("MathJax typesetting failed:", error);
    }
  }
}

function normalizeAnswer(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

// ===== Language System =====
function storeOriginalText() {
  document.querySelectorAll("[data-es]").forEach((element) => {
    if (!element.dataset.original) {
      element.dataset.original = element.innerHTML;
    }
  });
}

async function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;

  document.title =
    language === "en"
      ? "MT-101 Interactive Digital Textbook"
      : "Libro Digital Interactivo MT-101";

  document.querySelectorAll("[data-es]").forEach((element) => {
    element.innerHTML = language === "es" ? element.dataset.es : element.dataset.original;
  });

  const toggleButton = getLanguageToggle();
  if (toggleButton) {
    toggleButton.innerHTML = language === "en" ? "Español" : "English";
  }

  toggleInfographics(language);
updatePageNumbers();
updateExerciseLanguage(language);

if (window.MathJax) {
  MathJax.typesetPromise();
}
  await typesetMath();
}

function updateExerciseLanguage(language) {
  document.querySelectorAll(".exercise-block button[data-en][data-es]").forEach(button => {
    button.innerHTML = language === "es" ? button.dataset.es : button.dataset.en;
  });

  document.querySelectorAll(".answer option").forEach(option => {
    if (option.dataset.en && option.dataset.es) {
      option.textContent = language === "es" ? option.dataset.es : option.dataset.en;
    }
  });

  document.querySelectorAll(".dropdown-feedback-row").forEach(row => {
    const select = row.querySelector(".answer");
    const feedback = row.querySelector(".inline-feedback");

    if (!select || !feedback || !feedback.textContent.trim()) return;

    const selectedOption = select.options[select.selectedIndex];

    if (!selectedOption || selectedOption.value === "") {
      feedback.textContent =
        language === "es"
          ? "Seleccione una respuesta."
          : "Select an answer.";
      return;
    }

    const isCorrect = selectedOption.dataset.correct === "true";
    const newFeedback =
      language === "es"
        ? selectedOption.dataset.feedbackEs
        : selectedOption.dataset.feedbackEn;

    feedback.textContent = newFeedback;
    feedback.className = isCorrect
      ? "inline-feedback correct"
      : "inline-feedback incorrect";
  });

document.querySelectorAll(".open-answer").forEach(input => {

  if (input.dataset.placeholderEn && input.dataset.placeholderEs) {

    input.placeholder =
      language === "es"
        ? input.dataset.placeholderEs
        : input.dataset.placeholderEn;
  }
});


document.querySelectorAll(".generate-multi-btn").forEach(button => {
  if (button.dataset.en && button.dataset.es) {
    button.textContent = language === "es" ? button.dataset.es : button.dataset.en;
  }
});

document.querySelectorAll(".multi-label").forEach(label => {
  if (label.dataset.en && label.dataset.es) {
    label.textContent = language === "es" ? label.dataset.es : label.dataset.en;
  }
});

document.querySelectorAll(".multi-feedback-row").forEach(label => {
  if (label.dataset.en && label.dataset.es) {
    label.textContent = language === "es" ? label.dataset.es : label.dataset.en;
  }
});

}


function toggleInfographics(language) {
  document.querySelectorAll(".infographic-en").forEach((element) => {
    element.style.display = language === "en" ? "block" : "none";
  });

  document.querySelectorAll(".infographic-es").forEach((element) => {
    element.style.display = language === "es" ? "block" : "none";
  });
}

function initializeLanguageToggle() {
  const toggleButton = getLanguageToggle();
  if (!toggleButton) return;

  toggleButton.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "en" ? "es" : "en";
    setLanguage(nextLanguage);
  });
}

// ===== Chapter Loading =====
async function fetchChapter(chapter) {
  const possiblePaths = [`chapters/${chapter.file}`, chapter.file];

  for (const path of possiblePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) return response.text();
    } catch (error) {
      // Try the next possible path.
    }
  }

  throw new Error(`Could not load ${chapter.file}`);
}

async function loadChapters() {
  const container = document.getElementById("chapter-container");
  if (!container) return;

  container.innerHTML = '<div class="loading-message">Loading chapters...</div>';

  try {
    const htmlBlocks = [];

    for (const chapter of chapters) {
      htmlBlocks.push(await fetchChapter(chapter));
    }

    container.innerHTML = htmlBlocks.join("\n");

    storeOriginalText();
    await setLanguage(currentLanguage);
    updatePageNumbers();
    initializePracticeExercises();
    initializeNaturalGeneratorExercises();
    initializeSequenceExercises();
    initializeNaturalMultiExercises();
    await typesetMath();
  } catch (error) {
    container.innerHTML = `
      <div class="error-message">
        <strong>Chapter loading error:</strong><br>
        ${error.message}<br><br>
        If you are opening this file directly from your computer, use a local server
        such as VS Code Live Server or publish the folder in GitHub Pages.
      </div>
    `;
  }
}

// ===== Automatic Page Numbers =====
function updatePageNumbers() {
  const pages = Array.from(document.querySelectorAll(".page"));

  pages.forEach((page, index) => {
    const pageNumber = page.querySelector(".page-number");
    if (pageNumber) {
      pageNumber.textContent = index + 1;
    }
  });

  document.querySelectorAll(".contents-page-number").forEach((item) => {
    const targetId = item.dataset.target;
    const targetPage = document.getElementById(targetId);

    if (!targetPage) {
      item.textContent = "";
      return;
    }

    const pageIndex = pages.indexOf(targetPage);
    item.textContent = pageIndex >= 0 ? pageIndex + 1 : "";
  });
}

// ===== Self-Checking Exercises =====
function initializePracticeExercises() {
  initializeDropdownExercises();
  initializeOpenAnswerExercises();
  initializeMultiSelectExercises();
}

function initializeDropdownExercises() {
  document.querySelectorAll(".check-btn").forEach(button => {
  button.addEventListener("click", () => {
    const block = button.closest(".exercise-block");
    const answers = block.querySelectorAll(".answer");

    answers.forEach(select => {
      const selectedOption = select.options[select.selectedIndex];
      const inlineFeedback = select
        .closest(".dropdown-feedback-row")
        .querySelector(".inline-feedback");

      if (!selectedOption || selectedOption.value === "") {
        inlineFeedback.textContent =
          currentLanguage === "es"
            ? "Seleccione una respuesta."
            : "Select an answer.";

        inlineFeedback.className = "inline-feedback warning";
        return;
      }

      const isCorrect = selectedOption.dataset.correct === "true";
      const feedback =
        currentLanguage === "es"
          ? selectedOption.dataset.feedbackEs
          : selectedOption.dataset.feedbackEn;

      inlineFeedback.textContent = feedback;
      inlineFeedback.className = isCorrect
        ? "inline-feedback correct"
        : "inline-feedback incorrect";
    });
  });
});
}

function initializeOpenAnswerExercises() {
  document.querySelectorAll(".check-open-btn").forEach((button) => {
    if (button.dataset.initialized === "true") return;
    button.dataset.initialized = "true";

    button.addEventListener("click", () => {
      const block = button.closest(".exercise-block");
      if (!block) return;

      const input = block.querySelector(".open-answer");
      const feedback = block.querySelector(".feedback");
      if (!input || !feedback) return;

      const correct = normalizeAnswer(button.dataset.correct);
      const user = normalizeAnswer(input.value);
      const isCorrect = user === correct;

      feedback.textContent = isCorrect
        ? getLocalizedAttribute(button, "feedback-correct") ||
          (currentLanguage === "es" ? "✔ Respuesta correcta." : "✔ Correct answer.")
        : getLocalizedAttribute(button, "feedback-wrong") ||
          (currentLanguage === "es" ? "✘ Respuesta incorrecta." : "✘ Incorrect answer.");

      feedback.className = isCorrect ? "feedback correct" : "feedback incorrect";
    });
  });
}



function initializeMultiSelectExercises() {
  document.querySelectorAll(".check-multi-btn").forEach((button) => {
    if (button.dataset.initialized === "true") return;
    button.dataset.initialized = "true";

    button.addEventListener("click", () => {
      const block = button.closest(".exercise-block");
      if (!block) return;

      const rows = block.querySelectorAll(".multi-feedback-row");

      // NUEVO FORMATO: feedback al lado de cada checkbox
      if (rows.length > 0) {
        rows.forEach((row) => {
          const checkbox = row.querySelector(".multi-answer");
          const inlineFeedback = row.querySelector(".inline-feedback");

          if (!checkbox || !inlineFeedback) return;

          const shouldBeChecked = checkbox.dataset.correct === "true";
          const isChecked = checkbox.checked;

          if (isChecked === shouldBeChecked) {
            inlineFeedback.textContent =
              getCurrentLanguage() === "es"
                ? checkbox.dataset.feedbackEs
                : checkbox.dataset.feedbackEn;

            inlineFeedback.className = "inline-feedback correct";
          } else {
            if (shouldBeChecked) {
              inlineFeedback.textContent =
                getCurrentLanguage() === "es"
                  ? "✘ Esta opción debía seleccionarse."
                  : "✘ This option should be selected.";
            } else {
              inlineFeedback.textContent =
                getCurrentLanguage() === "es"
                  ? checkbox.dataset.feedbackEs
                  : checkbox.dataset.feedbackEn;
            }

            inlineFeedback.className = "inline-feedback incorrect";
          }
        });

        const generalFeedback = block.querySelector(".feedback");
        if (generalFeedback) {
          generalFeedback.innerHTML = "";
          generalFeedback.className = "feedback";
        }

        return;
      }

      // FORMATO ANTERIOR: feedback general abajo
      const checkboxes = block.querySelectorAll(".multi-answer");
      const feedback = block.querySelector(".feedback");
      if (!feedback) return;

      const messages = [];
      let allCorrect = true;

      checkboxes.forEach((checkbox) => {
        const shouldBeChecked = checkbox.dataset.correct === "true";

        if (checkbox.checked !== shouldBeChecked) {
          allCorrect = false;
          const message =
            getLocalizedAttribute(checkbox, "feedback") ||
            (getCurrentLanguage() === "es"
              ? "✘ Revisa esta opción."
              : "✘ Review this option.");

          messages.push(message);
        }
      });

      if (allCorrect) {
        messages.push(
          getCurrentLanguage() === "es"
            ? "✔ ¡Correcto!"
            : "✔ Correct!"
        );
      }

      feedback.innerHTML = messages.join("<br>");
      feedback.className = allCorrect
        ? "feedback correct"
        : "feedback incorrect";
    });
  });
}




// ===== Initialize =====
document.addEventListener("DOMContentLoaded", async () => {
  storeOriginalText();
  initializeLanguageToggle();
  updatePageNumbers();
  await loadChapters();
  
});













function isNaturalNumber(value) {
  return Number.isInteger(value) && value >= 1;
}

function generateNaturalExerciseValues() {
  const values = [];

  const naturalValues = [1, 2, 3, 4, 5, 7, 9, 12, 15, 20, 25, 30];
  const integerValues = [-10, -8, -5, -3, -1, 0];
  const decimalValues = [0.5, 1.2, 2.75, -1.5, -3.25, 4.6];

  function addRandomFrom(list) {
    const available = list.filter(value => !values.includes(value));
    const value = available[Math.floor(Math.random() * available.length)];
    values.push(value);
  }

  // Asegura variedad: 2 naturales, 1 entero no natural, 1 decimal
  addRandomFrom(naturalValues);
  addRandomFrom(naturalValues);
  addRandomFrom(integerValues);
  addRandomFrom(decimalValues);

  return values.sort(() => Math.random() - 0.5);
}

function updateNaturalExercise(block) {
  const values = generateNaturalExerciseValues();
  const rows = block.querySelectorAll(".dropdown-feedback-row");
  const exerciseText = block.querySelector(".exercise-text");

  const valuesText = values.join(", ");

  exerciseText.dataset.en =
    `Determine whether the following numbers belong to the set of natural numbers: ${valuesText}.`;

  exerciseText.dataset.es =
    `Determine si los siguientes números pertenecen al conjunto de números naturales: ${valuesText}.`;

  exerciseText.textContent =
    currentLanguage === "es"
      ? exerciseText.dataset.es
      : exerciseText.dataset.en;

  rows.forEach((row, index) => {
    const value = values[index];
    const label = row.querySelector(".generated-number-label");
    const select = row.querySelector(".answer");
    const feedback = row.querySelector(".inline-feedback");

    label.textContent = `${value}:`;

    select.value = "";
    feedback.textContent = "";
    feedback.className = "inline-feedback";

    const yesOption = select.querySelector('option[value="Yes"]');
    const noOption = select.querySelector('option[value="No"]');

    const isNatural = isNaturalNumber(value);

    yesOption.dataset.correct = isNatural ? "true" : "false";
    noOption.dataset.correct = isNatural ? "false" : "true";

    yesOption.dataset.feedbackEn = isNatural
      ? `✔ Correct! ${value} is a natural number.`
      : `✘ Incorrect! ${value} is not a natural number.`;

    yesOption.dataset.feedbackEs = isNatural
      ? `✔ ¡Correcto! ${value} es un número natural.`
      : `✘ ¡Incorrecto! ${value} no es un número natural.`;

    noOption.dataset.feedbackEn = isNatural
      ? `✘ Incorrect! ${value} is a natural number.`
      : `✔ Correct! ${value} is not a natural number.`;

    noOption.dataset.feedbackEs = isNatural
      ? `✘ ¡Incorrecto! ${value} es un número natural.`
      : `✔ ¡Correcto! ${value} no es un número natural.`;
  });

  updateExerciseLanguage(currentLanguage);
}


function initializeNaturalGeneratorExercises() {
  document.querySelectorAll(".natural-generator-exercise").forEach(block => {
    updateNaturalExercise(block);

    const generateButton = block.querySelector(".generate-natural-btn");

    if (generateButton && !generateButton.dataset.listenerAdded) {
      generateButton.addEventListener("click", () => {
        updateNaturalExercise(block);
      });

      generateButton.dataset.listenerAdded = "true";
    }
  });
}


function generateSequenceExercise(block) {

  const exerciseText = block.querySelector(".exercise-text");
  const input = block.querySelector(".open-answer");
  const feedback = block.querySelector(".feedback");
  const checkButton = block.querySelector(".check-open-btn");

  const exerciseTypes = [

    {
      type: "natural",

      questionEn:
        "Write the first ten natural numbers.",

      questionEs:
        "Escriba los primeros diez números naturales.",

      answer:
        "1,2,3,4,5,6,7,8,9,10",

      feedbackCorrectEn:
        "✔ Correct sequence!",

      feedbackCorrectEs:
        "✔ ¡Secuencia correcta!",

      feedbackWrongEn:
        "✘ Incorrect. Expected: 1–10.",

      feedbackWrongEs:
        "✘ Incorrecto. Se esperaba: 1–10."
    },

    {
      type: "even",

      questionEn:
        "Write the first ten even natural numbers.",

      questionEs:
        "Escriba los primeros diez números naturales pares.",

      answer:
        "2,4,6,8,10,12,14,16,18,20",

      feedbackCorrectEn:
        "✔ Correct even sequence!",

      feedbackCorrectEs:
        "✔ ¡Secuencia par correcta!",

      feedbackWrongEn:
        "✘ Incorrect. Expected even natural numbers.",

      feedbackWrongEs:
        "✘ Incorrecto. Se esperaban números naturales pares."
    },

    {
      type: "odd",

      questionEn:
        "Write the first ten odd natural numbers.",

      questionEs:
        "Escriba los primeros diez números naturales impares.",

      answer:
        "1,3,5,7,9,11,13,15,17,19",

      feedbackCorrectEn:
        "✔ Correct odd sequence!",

      feedbackCorrectEs:
        "✔ ¡Secuencia impar correcta!",

      feedbackWrongEn:
        "✘ Incorrect. Expected odd natural numbers.",

      feedbackWrongEs:
        "✘ Incorrecto. Se esperaban números naturales impares."
    }

  ];

  const selected =
    exerciseTypes[
      Math.floor(Math.random() * exerciseTypes.length)
    ];

  exerciseText.dataset.en = selected.questionEn;
  exerciseText.dataset.es = selected.questionEs;

  exerciseText.textContent =
    currentLanguage === "es"
      ? selected.questionEs
      : selected.questionEn;

  checkButton.dataset.correct = selected.answer;

  checkButton.dataset.feedbackCorrectEn =
    selected.feedbackCorrectEn;

  checkButton.dataset.feedbackCorrectEs =
    selected.feedbackCorrectEs;

  checkButton.dataset.feedbackWrongEn =
    selected.feedbackWrongEn;

  checkButton.dataset.feedbackWrongEs =
    selected.feedbackWrongEs;

  input.value = "";

  feedback.innerHTML = "";

  updateExerciseLanguage(currentLanguage);
}

function initializeSequenceExercises() {

  document
    .querySelectorAll(".dynamic-sequence-exercise")
    .forEach(block => {

      generateSequenceExercise(block);

      const generateButton =
        block.querySelector(".generate-sequence-btn");

      if (
        generateButton &&
        !generateButton.dataset.listenerAdded
      ) {

        generateButton.addEventListener("click", () => {
          generateSequenceExercise(block);
        });

        generateButton.dataset.listenerAdded = "true";
      }
    });
}


function generateNaturalMultiOptions() {
  const options = [
    {
      en: "Number of patients",
      es: "Número de pacientes",
      correct: true,
      feedbackEn: "✔ Correct! Number of patients is a count.",
      feedbackEs: "✔ ¡Correcto! El número de pacientes es un conteo."
    },
    {
      en: "Number of X-ray images",
      es: "Número de radiografías",
      correct: true,
      feedbackEn: "✔ Correct! The number of images is a count.",
      feedbackEs: "✔ ¡Correcto! El número de imágenes es un conteo."
    },
    {
      en: "Number of appointments",
      es: "Número de citas",
      correct: true,
      feedbackEn: "✔ Correct! Appointments can be counted.",
      feedbackEs: "✔ ¡Correcto! Las citas pueden contarse."
    },
    {
      en: "Body temperature",
      es: "Temperatura corporal",
      correct: false,
      feedbackEn: "✘ Body temperature is usually measured with decimals.",
      feedbackEs: "✘ La temperatura corporal usualmente se mide con decimales."
    },
    {
      en: "Body weight",
      es: "Peso corporal",
      correct: false,
      feedbackEn: "✘ Body weight can include decimals, so it is not modeled only by natural numbers.",
      feedbackEs: "✘ El peso corporal puede incluir decimales, por eso no se modela solo con números naturales."
    },
    {
      en: "Patient height",
      es: "Estatura del paciente",
      correct: false,
      feedbackEn: "✘ Height is a measurement and may include decimals.",
      feedbackEs: "✘ La estatura es una medida y puede incluir decimales."
    },
    {
      en: "Blood pressure reading",
      es: "Lectura de presión arterial",
      correct: false,
      feedbackEn: "✘ Blood pressure is a measurement, not a simple count.",
      feedbackEs: "✘ La presión arterial es una medida, no un conteo simple."
    }
  ];

  const correctOptions = options.filter(option => option.correct);
  const incorrectOptions = options.filter(option => !option.correct);

  const selected = [
    correctOptions[Math.floor(Math.random() * correctOptions.length)],
    incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)],
    incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]
  ];

  return selected.sort(() => Math.random() - 0.5);
}

function updateNaturalMultiExercise(block) {
  const rows = block.querySelectorAll(".multi-feedback-row");
  const options = generateNaturalMultiOptions();

  rows.forEach((row, index) => {
    const option = options[index];
    const checkbox = row.querySelector(".multi-answer");
    const label = row.querySelector(".multi-label");
    const feedback = row.querySelector(".inline-feedback");

    checkbox.checked = false;
    checkbox.dataset.correct = option.correct ? "true" : "false";
    checkbox.dataset.feedbackEn = option.feedbackEn;
    checkbox.dataset.feedbackEs = option.feedbackEs;

    label.dataset.en = option.en;
    label.dataset.es = option.es;
    label.textContent = getCurrentLanguage() === "es" ? option.es : option.en;

    feedback.textContent = "";
    feedback.className = "inline-feedback";
  });

  const generalFeedback = block.querySelector(".feedback");
  if (generalFeedback) {
    generalFeedback.textContent = "";
    generalFeedback.className = "feedback";
  }

  updateExerciseLanguage(currentLanguage);
}

function initializeNaturalMultiExercises() {
  document.querySelectorAll(".natural-multi-generator-exercise").forEach(block => {
    updateNaturalMultiExercise(block);

    const generateButton = block.querySelector(".generate-multi-btn");

    if (generateButton && !generateButton.dataset.listenerAdded) {
      generateButton.addEventListener("click", () => {
        updateNaturalMultiExercise(block);
      });

      generateButton.dataset.listenerAdded = "true";
    }
  });
}





















function getCurrentLanguage() {
  return document.documentElement.lang === "es" ? "es" : "en";
}

