// https://link.juejin.cn/, https://link.zhihu.com/
{
  const replacer = () => {
    const url = new URL(location.href).searchParams.get("target");
    if (url) location.replace(url);
  };

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
      e.preventDefault();
      replacer();
    }
  });

  replacer();
}
