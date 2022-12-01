const addGlobalStyle = (content) => {
  const head = document.head;
  if (!head) return;

  const node = document.createElement("style");
  node.type = "text/css";
  node.innerHTML = content;
  head.appendChild(node);
};
