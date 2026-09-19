// Prevent pinch-zoom and double-tap-zoom on iOS installed PWAs.
// The viewport meta already sets user-scalable=no, but Safari sometimes
// still honors the built-in pinch gesture. These listeners kill both.
(function () {
  var stop = function (e) { e.preventDefault(); };
  document.addEventListener('gesturestart', stop, { passive: false });
  document.addEventListener('gesturechange', stop, { passive: false });
  document.addEventListener('gestureend', stop, { passive: false });

  var lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 350) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  // Kill accidental double-click zoom in desktop Safari too
  document.addEventListener('dblclick', stop, { passive: false });
})();
