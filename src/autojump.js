// https://*.google.com/sorry*, https://c.pc.qq.com/middlem.html*
{
  const getJumpUrl = () => {
    if (false) {
    } else if (location.href.includes("google.com/sorry")) {
      return new URL(location.href).searchParams.get("continue");
    } else if (location.href.includes("c.pc.qq.com/middlem.html")) {
      return new URL(location.href).searchParams.get("pfurl");
    }
  };

  const autoJump = () => {
    const url = getJumpUrl();
    if (url) location.replace(url);
  };

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "r") {
      e.preventDefault();
      const url = getJumpUrl();
      if (url) location.replace(url);
    }
  });

  autoJump();
}
