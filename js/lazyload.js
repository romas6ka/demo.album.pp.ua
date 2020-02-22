function BackgroundNode({ node, loadedClassName }) {
  let src = node.getAttribute("data-background-image-url");
  let show = onComplete => {
    requestAnimationFrame(() => {
      node.style.backgroundImage = `url(${src})`;
      node.classList.add(loadedClassName);
      onComplete();
    });
  };

  return {
    node,
    load: onComplete => {
      let img = new Image();
      img.onload = show(onComplete);
      img.src = src;
    }
  };
}

let defaultOptions = {
  selector: "[data-background-image-url]",
  loadedClassName: "loaded"
};

function BackgroundLazyLoader({ selector, loadedClassName } = defaultOptions) {
  let nodes = [].slice
    .apply(document.querySelectorAll(selector))
    .map(node => new BackgroundNode({ node, loadedClassName }));

  let callback = (entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) {
        return;
      }

      let obj = nodes.find(it => it.node.isSameNode(target));

      if (obj) {
        obj.load(() => {
          observer.unobserve(target);
          nodes = nodes.filter(n => !n.node.isSameNode(target));
          if (!nodes.length) {
            observer.disconnect();
          }
        });
      }
    });
  };

  let observer = new IntersectionObserver(callback);
  nodes.forEach(node => observer.observe(node.node));
}

BackgroundLazyLoader();
