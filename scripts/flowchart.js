(function(){
    const root = document.querySelector('.flow-wrap');
    if(!root) return;
  
    const svg = root.querySelector('svg');
    if(!svg) return;
  
    const nodes = Array.from(svg.querySelectorAll('.flow-node[data-node]'));
    const edges = Array.from(svg.querySelectorAll('.flow-edge[data-from][data-to]'));
  
    let activeNode = null;
  
    function clearActive(){
      nodes.forEach(n => n.classList.remove('is-active'));
      edges.forEach(e => e.classList.remove('is-active','is-draw'));
      activeNode = null;
    }
  
    function activateNode(nodeId){
      if(!nodeId) return;
  
      // روشن کردن خود node
      nodes.forEach(n => n.classList.toggle('is-active', n.dataset.node === nodeId));
  
      // خاموش کردن همه یال‌ها
      edges.forEach(e => e.classList.remove('is-active','is-draw'));
  
      // ورودی‌ها و خروجی‌های همین node
      const inEdges  = edges.filter(e => e.dataset.to === nodeId);
      const outEdges = edges.filter(e => e.dataset.from === nodeId);
  
      [...inEdges, ...outEdges].forEach(e => {
        // reset برای اجرای دوباره draw
        e.classList.remove('is-draw');
        e.getBoundingClientRect(); // force reflow
        e.classList.add('is-active','is-draw');
      });
  
      activeNode = nodeId;
    }
  
    function getNodeId(target){
      const g = target.closest?.('.flow-node[data-node]');
      return g ? g.dataset.node : null;
    }
  
    // دسکتاپ: hover
    svg.addEventListener('pointermove', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'mouse') return;
      const id = getNodeId(ev.target);
      if(id && id !== activeNode) activateNode(id);
      if(!id && activeNode) clearActive();
    });
  
    // موبایل/کلیک: tap → toggle
    svg.addEventListener('pointerdown', (ev) => {
      const id = getNodeId(ev.target);
      if(!id){ clearActive(); return; }
      if(id === activeNode){ clearActive(); return; }
      activateNode(id);
    });
  
    // کلیک بیرون از فلوچارت → خاموش
    document.addEventListener('pointerdown', (ev) => {
      if(!root.contains(ev.target)) clearActive();
    });
  
    // کیبورد: فوکوس
    nodes.forEach(n => {
      n.addEventListener('focus', () => activateNode(n.dataset.node));
      n.addEventListener('blur', () => clearActive());
    });
  })();
  