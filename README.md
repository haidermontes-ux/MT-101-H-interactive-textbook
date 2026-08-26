# MT-101 Interactive Digital Textbook - Modular Version

## Main files

- `index.html`: main textbook file.
- `style.css`: visual design and letter-size page format.
- `script.js`: language toggle, chapter loading, automatic page numbers, and content protection.
- `chapters/`: one HTML file per chapter.

## How to edit a chapter

Open the corresponding file inside the `chapters` folder, for example:

- `chapters/chapter-1.html`
- `chapters/chapter-2.html`

Each chapter should keep this structure:

```html
<section class="page chapter-page" id="chapter-1">
  <h2 data-es="Título en español">Title in English</h2>
  ...
  <div class="page-number"></div>
</section>
```

## Important preview note

Because this version uses `fetch()` to load chapter files, it should be opened from a web server.

Recommended options:

1. Publish the folder using GitHub Pages.
2. Use VS Code with the Live Server extension.
3. Run a local server with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Automatic page numbers

The table of contents uses:

```html
<span class="contents-page-number" data-target="chapter-1"></span>
```

The number is calculated automatically based on the order of the `.page` sections.



💡 Tip
<div class="icon-box tip-box">
  <div class="icon-box-title" data-es="💡 Consejo">💡 Tip</div>
  <p data-es="Recuerde combinar solamente términos semejantes.">
    Remember to combine only like terms.
  </p>
</div>
⚠ Common mistake
<div class="icon-box mistake-box">
  <div class="icon-box-title" data-es="⚠ Error común">⚠ Common Mistake</div>
  <p data-es="No se pueden sumar exponentes cuando las bases son diferentes.">
    You cannot add exponents when the bases are different.
  </p>
</div>
🩺 Health application
<div class="icon-box health-box">
  <div class="icon-box-title" data-es="🩺 Aplicación en salud">🩺 Health Application</div>
  <p data-es="Las ecuaciones lineales pueden representar costos o dosis en procedimientos radiológicos.">
    Linear equations can represent costs or doses in radiological procedures.
  </p>
</div>
🧠 Concept
<div class="icon-box concept-box">
  <div class="icon-box-title" data-es="🧠 Concepto">🧠 Concept</div>
  <p data-es="El valor absoluto representa distancia en la recta numérica.">
    Absolute value represents distance on the number line.
  </p>
</div>
✍ Practice
<div class="icon-box practice-box">
  <div class="icon-box-title" data-es="✍ Práctica">✍ Practice</div>
  <p data-es="Resuelva \(2x+5=17\).">
    Solve \(2x+5=17\).
  </p>
</div>
🎯 Assessment Prep
<div class="icon-box assessment-box">
  <div class="icon-box-title" data-es="🎯 Preparación para evaluación">🎯 Assessment Prep</div>
  <p data-es="Este tipo de pregunta puede aparecer como selección múltiple o cálculo numérico.">
    This type of question may appear as multiple choice or numerical calculation.
  </p>
</div>

