(function () {
  "use strict";

  const config = window.SITE_CONFIG;
  if (!config) return;

  document.getElementById("course-first").textContent = config.courseSchedule.first;
  document.getElementById("course-later").textContent = config.courseSchedule.secondAndThird;
  document.getElementById("briefing-date").textContent = config.briefingDateTime;
  document.getElementById("venue").textContent = config.venue;

  const briefingLink = document.getElementById("briefing-link");
  const courseLink = document.getElementById("course-link");
  const questionLink = document.getElementById("question-link");

  briefingLink.href = config.briefingFormUrl;
  courseLink.href = config.courseFormUrl;
  questionLink.href = config.questionFormUrl;

  document.getElementById("course-note").textContent =
    `説明会に来ていなくても申し込めます。締切：${config.applicationDeadline}`;

  setAvailability(
    briefingLink,
    document.getElementById("briefing-note"),
    config.briefingRegistrationOpen
  );
  setAvailability(
    courseLink,
    document.getElementById("course-note"),
    config.courseApplicationOpen
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
