(function () {
  "use strict";

  const config = window.SITE_CONFIG;
  if (!config) return;

  document.getElementById("course-first").textContent = config.courseSchedule.first;
  document.getElementById("course-second").textContent = config.courseSchedule.second;
  document.getElementById("briefing-date").textContent = config.briefingDateTime;
  document.getElementById("venue").textContent = config.venue;

  const briefingLink = document.getElementById("briefing-link");
  const questionLink = document.getElementById("question-link");

  briefingLink.href = config.briefingFormUrl;
  questionLink.href = config.questionFormUrl;

  setAvailability(
    briefingLink,
    document.getElementById("briefing-note"),
    config.briefingRegistrationOpen
  );

  function setAvailability(link, note, isOpen) {
    if (isOpen) return;
    link.removeAttribute("href");
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
    note.textContent = "受付は終了しました";
  }
})();
