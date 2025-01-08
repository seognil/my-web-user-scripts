// * ---------------------------------------------------------------- volumnUp

/** 声音太轻了，音量放大 */
domObserverOnce("audio", (audio) => {
  // @ts-ignore
  mediaControl.setVolumnRatio(audio, 4);
});

// * ---------------------------------------------------------------- media control

{
  const getAudio = () => document.getElementsByTagName("audio").item(0);

  document.addEventListener("keydown", (e) => {
    // * skip inputing
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) return;

    const mc = mediaControl;
    const audio = getAudio();
    if (!audio) return;

    if (false) "";
    // * ---------------- play time
    else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "Backspace") mc.setPlaybackJumpToPercent(audio, 0);
    else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "q") || e.key === "ArrowLeft") mc.setPlaybackJumpBySec(audio, -1);
    else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "e") || e.key === "ArrowRight") mc.setPlaybackJumpBySec(audio, +1);
    else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.code === "Space") e.preventDefault(), mc.togglePlay(audio);
    // * ---------------- play speed
    else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "z") mc.setPlaybackSpeedBy(audio, -0.15, [0.25, 4]);
    else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "x") mc.setPlaybackSpeedBy(audio, +0.15, [0.25, 4]);
    else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "v") mc.togglePlaybackSpeed(audio);
  });
}
