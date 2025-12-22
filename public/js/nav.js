document.addEventListener("DOMContentLoaded", function () {
  var burgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
  burgers.forEach(function (el) {
    el.addEventListener("click", function () {
      var target = el.dataset.target;
      var menu = document.getElementById(target);
      el.classList.toggle("is-active");
      if (menu) menu.classList.toggle("is-active");
    });
  });
});
