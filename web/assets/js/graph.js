/**
 * graph.js - Visualizador del Espacio Latente (Knowledge Graph)
 * Motor Canvas 2D Force-Directed Graph estilo Scientific Atlas / Observatory:
 * - Rejilla de coordenadas y anillos orbitales latentes
 * - Física elástica calibrada sin oscilaciones caóticas
 * - Nodos con halos luminosos, sombras de profundidad y tipografía de precisión
 * - Zoom in/out programático y reseteo suave
 */

export class KnowledgeGraph {
  constructor(containerId, data, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.data = data;
    this.onNodeClick = options.onNodeClick || (() => {});
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.activeCluster = 'all';
    this.hoveredNode = null;
    this.selectedNode = null;
    this.draggedNode = null;

    // Transformaciones de cámara
    this.transform = { x: 0, y: 0, scale: 1 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    this.initNodesAndLinks();
    this.setupResize();
    this.setupEvents();
    this.startSimulation();
  }

  initNodesAndLinks() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;
    this.transform.x = width / 2;
    this.transform.y = height / 2;

    // Atractores espaciales de los tres clusters principales
    this.clusterCenters = {
      central: { x: 0, y: 0 },
      ia_data_science: { x: -width * 0.28, y: -height * 0.16 },
      politicas_direccion: { x: width * 0.28, y: -height * 0.16 },
      tecnopedagogia: { x: 0, y: height * 0.26 }
    };

    // Inicializar posiciones de nodos
    this.nodes = this.data.nodes.map(n => {
      const center = this.clusterCenters[n.cluster] || { x: 0, y: 0 };
      const jitter = 50;
      return {
        ...n,
        x: center.x + (Math.random() - 0.5) * jitter,
        y: center.y + (Math.random() - 0.5) * jitter,
        vx: 0,
        vy: 0,
        radius: n.size || 14
      };
    });

    this.nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    this.links = this.data.links
      .map(l => ({
        source: this.nodeMap.get(l.source),
        target: this.nodeMap.get(l.target),
        relationship: l.relationship,
        value: l.value || 1
      }))
      .filter(l => l.source && l.target);
  }

  setupResize() {
    const resize = () => {
      const rect = this.container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
  }

  setupEvents() {
    const getPos = e => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left - this.transform.x) / this.transform.scale,
        y: (e.clientY - rect.top - this.transform.y) / this.transform.scale
      };
    };

    const findNodeAt = pos => {
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const n = this.nodes[i];
        if (this.activeCluster !== 'all' && n.cluster !== this.activeCluster && n.cluster !== 'central') {
          continue;
        }
        const dx = n.x - pos.x;
        const dy = n.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 6) {
          return n;
        }
      }
      return null;
    };

    this.canvas.addEventListener('mousedown', e => {
      const pos = getPos(e);
      const node = findNodeAt(pos);
      if (node) {
        this.draggedNode = node;
        this.selectedNode = node;
        this.onNodeClick(node);
      } else {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };
      }
    });

    window.addEventListener('mousemove', e => {
      if (this.draggedNode) {
        const pos = getPos(e);
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else if (this.isPanning) {
        this.transform.x = e.clientX - this.panStart.x;
        this.transform.y = e.clientY - this.panStart.y;
      } else {
        const pos = getPos(e);
        this.hoveredNode = findNodeAt(pos);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'crosshair';
      }
    });

    window.addEventListener('mouseup', () => {
      this.draggedNode = null;
      this.isPanning = false;
    });

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newScale = Math.min(Math.max(this.transform.scale * zoomFactor, 0.45), 2.8);
      
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      this.transform.x = mx - (mx - this.transform.x) * (newScale / this.transform.scale);
      this.transform.y = my - (my - this.transform.y) * (newScale / this.transform.scale);
      this.transform.scale = newScale;
    }, { passive: false });
  }

  zoomBy(factor) {
    const newScale = Math.min(Math.max(this.transform.scale * factor, 0.45), 2.8);
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.transform.x = cx - (cx - this.transform.x) * (newScale / this.transform.scale);
    this.transform.y = cy - (cy - this.transform.y) * (newScale / this.transform.scale);
    this.transform.scale = newScale;
  }

  setCluster(clusterId) {
    this.activeCluster = clusterId;
  }

  resetView() {
    this.transform.x = this.width / 2;
    this.transform.y = this.height / 2;
    this.transform.scale = 1;
    this.activeCluster = 'all';
    this.selectedNode = null;
    this.hoveredNode = null;
  }

  startSimulation() {
    const step = () => {
      this.tick();
      this.render();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  tick() {
    const kRepulsion = 1500;
    const kSpring = 0.045;
    const damping = 0.86;

    // 1. Repulsión entre nodos
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 280) {
          const force = kRepulsion / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 2. Tensión en enlaces (resortes)
    for (const link of this.links) {
      const n1 = link.source;
      const n2 = link.target;
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 90 / (link.value || 1);
      const force = (dist - targetDist) * kSpring;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      n1.vx += fx;
      n1.vy += fy;
      n2.vx += fx;
      n2.vy += fy;
    }

    // 3. Gravedad hacia centro de cluster
    for (const n of this.nodes) {
      const center = this.clusterCenters[n.cluster] || { x: 0, y: 0 };
      n.vx += (center.x - n.x) * 0.018;
      n.vy += (center.y - n.y) * 0.018;

      if (n !== this.draggedNode) {
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
      }
    }
  }

  getClusterColor(clusterId) {
    switch (clusterId) {
      case 'ia_data_science': return '#38bdf8'; // Sky Blue
      case 'politicas_direccion': return '#c084fc'; // Purple Violet
      case 'tecnopedagogia': return '#34d399'; // Emerald Mint
      case 'central': return '#f59e0b'; // Amber
      default: return '#94a3b8';
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);

    // --- REJILLA CIENTÍFICA & ANILLOS ORBITALES LATENTES ---
    ctx.save();
    // Ejes cartesianos sutiles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(-900, 0); ctx.lineTo(900, 0);
    ctx.moveTo(0, -700); ctx.lineTo(0, 700);
    ctx.stroke();

    // Anillos concéntricos de proximidad epistemológica
    ctx.setLineDash([2, 8]);
    [120, 240, 380, 520].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Marcador de radio orbital
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.fillText(`r=${r}px`, r + 4, 3);
    });
    ctx.restore();

    // --- DIBUJAR ENLACES CON TENSION VISUAL ---
    for (const link of this.links) {
      const isConnected = this.hoveredNode && 
        (link.source === this.hoveredNode || link.target === this.hoveredNode);
      
      const isDimmed = this.activeCluster !== 'all' && 
        link.source.cluster !== this.activeCluster && 
        link.target.cluster !== this.activeCluster &&
        link.source.cluster !== 'central' && link.target.cluster !== 'central';

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      
      if (isConnected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
      } else if (isDimmed) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.6;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // --- DIBUJAR NODOS ---
    for (const n of this.nodes) {
      const isHovered = this.hoveredNode === n;
      const isSelected = this.selectedNode === n;
      const isConnected = this.hoveredNode && this.links.some(
        l => (l.source === n && l.target === this.hoveredNode) ||
             (l.target === n && l.source === this.hoveredNode)
      );

      const isDimmed = this.activeCluster !== 'all' && 
        n.cluster !== this.activeCluster && 
        n.cluster !== 'central';

      const color = this.getClusterColor(n.cluster);

      // Halo sutil
      if (isHovered || isSelected || n.type === 'root') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = color + '22';
        ctx.fill();
      }

      // Círculo principal del nodo
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? '#1e222d' : (n.type === 'root' ? '#d97706' : color);
      ctx.fill();

      // Borde del nodo
      ctx.strokeStyle = isSelected ? '#ffffff' : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.35)');
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.stroke();

      // Punto central
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Tipografía y Etiquetas
      const showLabel = n.type === 'root' || n.type === 'cluster_root' || n.type === 'pillar' || isHovered || isSelected || isConnected;
      if (showLabel && !isDimmed) {
        const isBold = n.type === 'root' || n.type === 'cluster_root';
        ctx.font = `${isBold ? '600 11px' : '500 10px'} "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isSelected ? '#ffffff' : (isHovered ? '#f8fafc' : '#cbd5e1');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.label, n.x, n.y + n.radius + 5);
      }
    }

    // --- TOOLTIP EN HOVER ---
    if (this.hoveredNode) {
      const n = this.hoveredNode;
      const text = n.info || n.label;
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(text).width;
      const boxW = Math.min(textWidth + 20, 280);
      const boxH = 28;
      const boxX = n.x - boxW / 2;
      const boxY = n.y - n.radius - boxH - 8;

      ctx.save();
      ctx.fillStyle = '#0f131a';
      ctx.strokeStyle = this.getClusterColor(n.cluster);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, n.x, boxY + boxH / 2);
      ctx.restore();
    }

    ctx.restore();
  }
}
