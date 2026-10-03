/**
 * graph.js - Visualizador del Espacio Latente (Knowledge Graph)
 * Motor Canvas 2D Force-Directed Graph nativo de alto rendimiento:
 * - Fuerza de repulsión (Coulomb)
 * - Fuerza elástica de resortes (Hooke)
 * - Fuerza de gravedad centrípeta hacia los clusters
 * - Detección de colisiones
 * - Soporte para arrastrar (drag), zoom y paneo
 * - Tooltip interactivo y resaltado de conexiones
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

    // Transformaciones de cámara (zoom y pan)
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
    const height = this.container.clientHeight || 500;
    this.transform.x = width / 2;
    this.transform.y = height / 2;

    // Cluster Centers (atractores espaciales)
    this.clusterCenters = {
      central: { x: 0, y: 0 },
      ia_data_science: { x: -width * 0.28, y: -height * 0.18 },
      politicas_direccion: { x: width * 0.28, y: -height * 0.18 },
      tecnopedagogia: { x: 0, y: height * 0.28 }
    };

    // Inicializar posiciones de nodos
    this.nodes = this.data.nodes.map(n => {
      const center = this.clusterCenters[n.cluster] || { x: 0, y: 0 };
      const jitter = 70;
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
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) {
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
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
      }
    });

    window.addEventListener('mouseup', () => {
      this.draggedNode = null;
      this.isPanning = false;
    });

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(this.transform.scale * zoomFactor, 0.4), 3.0);
      
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      this.transform.x = mx - (mx - this.transform.x) * (newScale / this.transform.scale);
      this.transform.y = my - (my - this.transform.y) * (newScale / this.transform.scale);
      this.transform.scale = newScale;
    }, { passive: false });
  }

  setCluster(clusterId) {
    this.activeCluster = clusterId;
  }

  resetView() {
    this.transform.x = this.width / 2;
    this.transform.y = this.height / 2;
    this.transform.scale = 1;
    this.activeCluster = 'all';
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
    const kRepulsion = 1400;
    const kSpring = 0.04;
    const damping = 0.88;

    // 1. Repulsión entre nodos
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 260) {
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
      const targetDist = 95 / (link.value || 1);
      const force = (dist - targetDist) * kSpring;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      n1.vx += fx;
      n1.vy += fy;
      n2.vx -= fx;
      n2.vy -= fy;
    }

    // 3. Gravedad hacia su centro de cluster
    for (const n of this.nodes) {
      const center = this.clusterCenters[n.cluster] || { x: 0, y: 0 };
      n.vx += (center.x - n.x) * 0.015;
      n.vy += (center.y - n.y) * 0.015;

      // Actualizar posición salvo si se arrastra
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
      case 'ia_data_science': return '#0ea5e9'; // Cyan
      case 'politicas_direccion': return '#a855f7'; // Purple
      case 'tecnopedagogia': return '#10b981'; // Emerald
      case 'central': return '#f59e0b'; // Amber Gold
      default: return '#64748b';
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);

    // Dibujar enlaces
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
        ctx.lineWidth = 2.4;
      } else if (isDimmed) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 0.8;
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1.2;
      }
      ctx.stroke();
    }

    // Dibujar nodos
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

      // Resplandor para nodo central o seleccionado/hover
      if (isHovered || isSelected || n.type === 'root') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = color + '44';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? '#334155' : color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : (isHovered ? '#f8fafc' : 'rgba(255, 255, 255, 0.4)');
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      // Etiquetas
      const showLabel = n.type === 'root' || n.type === 'cluster_root' || n.type === 'pillar' || isHovered || isSelected || isConnected;
      if (showLabel && !isDimmed) {
        ctx.font = `${n.type === 'root' ? 'bold 13px' : (n.type === 'cluster_root' ? 'bold 11px' : '10px')} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.label, n.x, n.y + n.radius + 4);
      }
    }

    // Tooltip sobre nodo en hover
    if (this.hoveredNode) {
      const n = this.hoveredNode;
      const text = n.info || n.label;
      ctx.font = '11px sans-serif';
      const textWidth = ctx.measureText(text).width;
      const boxW = textWidth + 16;
      const boxH = 24;
      const boxX = n.x - boxW / 2;
      const boxY = n.y - n.radius - boxH - 6;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = this.getClusterColor(n.cluster);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, n.x, boxY + boxH / 2);
    }

    ctx.restore();
  }
}
