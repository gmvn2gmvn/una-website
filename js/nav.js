/* Una Skujina — primary navigation behaviour.
   Implements the "Expanding top navigation" handoff: desktop hover /
   keyboard-focus sub-menus with a scroll-triggered background, and a
   mobile tap-to-expand overlay. Vanilla JS, no dependencies. Replaces
   the old Webflow navscrollbgallpages / navstatecontrollerv7 scripts. */
(function () {
  "use strict";

  var nav = document.querySelector(".usk-nav");
  if (!nav) return;

  var burger = nav.querySelector(".usk-nav-burger");
  var menu   = nav.querySelector(".usk-nav-menu");
  var sheet  = nav.querySelector(".usk-nav-sheet");
  var items  = Array.prototype.slice.call(nav.querySelectorAll(".usk-nav-item"));
  var groups = items.filter(function (li) { return li.classList.contains("has-sub"); });
  var mq     = window.matchMedia("(max-width: 767px)");
  var openGroup = null;

  function isMobile() { return mq.matches; }

  /* ---------- scroll-triggered background ---------- */
  function syncScrolled() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    nav.classList.toggle("is-scrolled", y > 40);
  }
  syncScrolled();
  window.addEventListener("scroll", syncScrolled, { passive: true });

  /* ---------- desktop: hover / focus sub-menus ---------- */
  function openDesktop(group) {
    if (openGroup === group) return;
    closeDesktop();
    openGroup = group;
    group.classList.add("is-open");
    nav.classList.add("is-active");
    var sub = group.querySelector(".usk-nav-sub");
    if (sheet && sub) nav.style.setProperty("--usk-sheet-h", (sub.scrollHeight + 36) + "px");
  }
  function closeDesktop() {
    if (openGroup) openGroup.classList.remove("is-open");
    openGroup = null;
    nav.classList.remove("is-active");
    nav.style.removeProperty("--usk-sheet-h");
  }
  function enterItem(li) {
    if (isMobile()) return;
    if (li.classList.contains("has-sub")) openDesktop(li);
    else closeDesktop();
  }

  items.forEach(function (li) {
    li.addEventListener("mouseenter", function () { enterItem(li); });
    li.addEventListener("focusin", function () { enterItem(li); });
  });
  nav.addEventListener("mouseleave", function () { if (!isMobile()) closeDesktop(); });
  nav.addEventListener("focusout", function (e) {
    if (!isMobile() && !nav.contains(e.relatedTarget)) closeDesktop();
  });

  /* ---------- mobile: overlay + accordion ---------- */
  function setToggle(group, on) {
    var btn = group.querySelector(".usk-nav-caret");
    if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
  }
  function expand(group) {
    groups.forEach(function (g) {
      var on = g === group;
      g.classList.toggle("is-expanded", on);
      setToggle(g, on);
    });
  }
  function collapseAll() {
    groups.forEach(function (g) { g.classList.remove("is-expanded"); setToggle(g, false); });
  }
  function openMenu() {
    nav.classList.add("is-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("usk-nav-lock");
    if (groups[0]) expand(groups[0]);          /* Paintings pre-expanded */
  }
  function closeMenu() {
    nav.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("usk-nav-lock");
    collapseAll();
  }

  if (burger) {
    burger.addEventListener("click", function (e) {
      e.preventDefault();
      if (nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }

  groups.forEach(function (group) {
    var btn = group.querySelector(".usk-nav-caret");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (group.classList.contains("is-expanded")) {
        group.classList.remove("is-expanded");
        setToggle(group, false);
      } else {
        expand(group);
      }
    });
  });

  /* close the mobile overlay once a real destination link is tapped */
  if (menu) {
    menu.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (a && a.getAttribute("href").charAt(0) !== "#") closeMenu();
    });
  }

  /* ---------- housekeeping ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.keyCode === 27) { closeDesktop(); closeMenu(); }
  });
  function onViewportChange() { closeDesktop(); closeMenu(); }
  if (mq.addEventListener) mq.addEventListener("change", onViewportChange);
  else if (mq.addListener) mq.addListener(onViewportChange);
})();
