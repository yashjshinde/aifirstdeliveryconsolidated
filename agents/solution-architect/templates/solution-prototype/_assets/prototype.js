/*
 * prototype.js -- interactive behaviours for the solution prototype.
 * Required behaviours per constitution/03-prototype-generation-rules.md:
 *   - Tab switching within record forms
 *   - Section collapse/expand
 *   - Persona switcher (in top nav) -> navigate to the persona's landing
 *   - Module switcher (in sidebar) -> navigate to the module hub
 *   - Journey stepper (Previous / Next)
 *   - Scroll-to-top button
 *   - Dirty-state tracking on form fields -> enables Save button
 */

(function () {
  'use strict';

  // ----- Tab switching -----
  document.querySelectorAll('.tab-bar').forEach(function (bar) {
    bar.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      bar.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.getAttribute('data-target');
      if (target) {
        document.querySelectorAll('.tab-pane').forEach(function (p) { p.hidden = (p.id !== target); });
      }
    });
  });

  // ----- Section collapse / expand -----
  document.querySelectorAll('.form-section-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var body = header.nextElementSibling;
      if (body && body.classList.contains('form-section-body')) {
        body.hidden = !body.hidden;
        header.setAttribute('aria-expanded', String(!body.hidden));
      }
    });
  });

  // ----- Persona switcher (navigate on change) -----
  var personaSwitcher = document.getElementById('personaSwitcher');
  if (personaSwitcher) {
    personaSwitcher.addEventListener('change', function (e) {
      var slug = e.target.value;
      if (!slug) return;
      // Resolve path relative to current depth (every page except index.html is one level deep)
      var depth = window.location.pathname.split('/').filter(Boolean).length;
      var prefix = depth >= 2 ? '../' : '';
      window.location.href = prefix + 'personas/' + slug + '.html';
    });
  }

  // ----- Journey stepper (Prev / Next) -----
  var prev = document.getElementById('journeyPrev');
  var next = document.getElementById('journeyNext');
  var steps = document.querySelectorAll('.journey-stepper .step');
  if (steps.length > 0) {
    var current = 0;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].classList.contains('active')) { current = i; break; }
    }
    function setStep(i) {
      if (i < 0 || i >= steps.length) return;
      steps[current].classList.remove('active');
      steps[i].classList.add('active');
      current = i;
      if (prev) prev.disabled = (current === 0);
      if (next) next.disabled = (current === steps.length - 1);
    }
    if (prev) prev.addEventListener('click', function () { setStep(current - 1); });
    if (next) next.addEventListener('click', function () { setStep(current + 1); });
  }

  // ----- Scroll-to-top -----
  var scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top';
  scrollBtn.textContent = '^';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(scrollBtn);
  window.addEventListener('scroll', function () {
    if (window.scrollY > 200) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  // ----- Dirty tracking on form fields -> enables Save button -----
  var saveBtn = document.querySelector('.command-bar .cmd-btn[data-action="save"]');
  if (saveBtn) {
    saveBtn.disabled = true;
    document.querySelectorAll('.form-row input, .form-row select, .form-row textarea').forEach(function (input) {
      input.addEventListener('change', function () {
        saveBtn.disabled = false;
      });
      input.addEventListener('input', function () {
        saveBtn.disabled = false;
      });
    });
    saveBtn.addEventListener('click', function () {
      // Flash a toast for 2s
      var toast = document.createElement('div');
      toast.textContent = 'Saved';
      toast.style.cssText = 'position:fixed;bottom:80px;right:24px;background:var(--status-active);color:white;padding:8px 16px;border-radius:4px;box-shadow:var(--shadow-md);z-index:2000;';
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 2000);
      saveBtn.disabled = true;
    });
  }
})();
