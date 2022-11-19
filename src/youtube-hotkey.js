{
  // * ---------------------------------------------------------------- focus

  const focus = () => {
    setTimeout(function () {
      document.querySelector("video").focus();
      document.documentElement.scrollTop = 0;
    }, 0);
  };

  document.addEventListener("DOMContentLoaded", () => {
    focus();
  });

  document.addEventListener("keydown", (e) => {
    if (window.scrollY > 300) return;
    if (document.activeElement instanceof HTMLInputElement) return;
    if (e.key == "g" || e.key == "t" || e.key == "Shift") {
      console.log("youtube focus");
      focus();
    }
  });

  // * ---------------------------------------------------------------- hotkey

  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) return;

    const setVideo = (fn) => {
      const videos = document.querySelectorAll("video");
      videos.forEach(fn);
    };

    if (false) return;
    else if (e.key === "Backspace") setVideo((video) => (video.currentTime = 0));
    else if (e.key === "[" || e.key === "PageUp") togglePlaylist(e, -1);
    else if (e.key === "]" || e.key === "PageDown") togglePlaylist(e, 1);
  });

  // * ---------------- playlist control

  const togglePlaylist = (e, direction) => {
    e.preventDefault();

    if (direction === -1) {
      document.querySelector(".ytp-prev-button")?.click();
    } else if (direction === 1) {
      document.querySelector(".ytp-next-button")?.click();
    }
  };
}
