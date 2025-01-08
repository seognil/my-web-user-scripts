// TODO check logic if needed // Seognil LC 2025/01/06
{
  domObserverAll("*", (node) => {
    const style = getComputedStyle(node);
    ["filter", "-webkit-filter", "-moz-filter", "-ms-filter", "-o-filter"].some((prop) => {
      if (style[prop]?.match(/grayscale\(.*?\)/gi)) {
        console.debug("[reverse grayscale]", node);
        node.style.setProperty(prop, style[prop].replace(/grayscale\(.*?\)/gi, "grayscale(0)"), "important");
      }
    });
  });
}
