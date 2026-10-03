/**
 * main.js - Orquestador general del Research Lab & CV Interactivo
 */

import { KnowledgeGraph } from './graph.js';
import { AIAssistant } from './assistant.js';

let cvData = null;
let graphInstance = null;
let assistantInstance = null;

// Cargar data.json
async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Error al cargar data.json');
    cvData = await res.json();
    initApp();
  } catch (err) {
    console.error('Error cargando datos:', err);
  }
}

function initApp() {
  renderMetrics();
  initKnowledgeGraph();
  initAssistant();
  renderTimeline('leadership');
  renderPublications('all', '');
  renderProjects('projects');
  renderEducation();
  setupEventListeners();
}

// 1. Renderizar Métricas
function renderMetrics() {
  const container = document.getElementById('metrics-grid');
  if (!container || !cvData.metrics) return;

  container.innerHTML = cvData.metrics.map(m => `
    <div class="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition group">
      <div class="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 group-hover:from-sky-300 group-hover:to-indigo-300 transition">
        ${m.value}
      </div>
      <div class="text-xs font-bold text-white mt-1">${m.label}</div>
      <div class="text-[11px] text-slate-400">${m.subtext}</div>
    </div>
  `).join('');
}

// 2. Inicializar Knowledge Graph
function initKnowledgeGraph() {
  if (!cvData.knowledgeGraph) return;

  graphInstance = new KnowledgeGraph('knowledge-graph-container', cvData.knowledgeGraph, {
    onNodeClick: (node) => {
      showNodeDetail(node);
    }
  });

  // Filtros de cluster
  const clusterBtns = document.querySelectorAll('.cluster-btn');
  clusterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clusterBtns.forEach(b => {
        b.classList.remove('bg-slate-700', 'text-white', 'font-bold');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-slate-700', 'text-white', 'font-bold');
      btn.classList.remove('text-slate-400');

      const cluster = btn.getAttribute('data-cluster');
      graphInstance.setCluster(cluster);
    });
  });

  const resetBtn = document.getElementById('reset-graph-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      graphInstance.resetView();
      clusterBtns.forEach(b => {
        if (b.getAttribute('data-cluster') === 'all') {
          b.classList.add('bg-slate-700', 'text-white');
        } else {
          b.classList.remove('bg-slate-700', 'text-white');
        }
      });
    });
  }

  // Cerrar panel de detalle
  const closeDetailBtn = document.getElementById('close-detail-btn');
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
      document.getElementById('node-detail-panel').classList.add('hidden');
    });
  }
}

function showNodeDetail(node) {
  const panel = document.getElementById('node-detail-panel');
  if (!panel) return;

  const titleEl = document.getElementById('detail-node-title');
  const clusterEl = document.getElementById('detail-node-cluster');
  const descEl = document.getElementById('detail-node-desc');
  const linksEl = document.getElementById('detail-node-links');

  titleEl.textContent = node.label;
  descEl.textContent = node.info || 'Nodo del espacio latente de investigación y trayectoria.';

  // Estilo según cluster
  let clusterName = 'Dimensión General';
  let badgeClass = 'bg-slate-800 text-slate-300';
  if (node.cluster === 'ia_data_science') {
    clusterName = 'IA & Data Science';
    badgeClass = 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
  } else if (node.cluster === 'politicas_direccion') {
    clusterName = 'Políticas & Dirección';
    badgeClass = 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  } else if (node.cluster === 'tecnopedagogia') {
    clusterName = 'Tecnopedagogía & Aprendizaje';
    badgeClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  }

  clusterEl.textContent = clusterName;
  clusterEl.className = `text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeClass}`;

  // Buscar relaciones de este nodo en proyectos y papers
  const relatedProjects = cvData.projects.filter(p => 
    p.title.toLowerCase().includes(node.label.toLowerCase()) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(node.label.toLowerCase())))
  );

  linksEl.innerHTML = '';
  if (relatedProjects.length > 0) {
    linksEl.innerHTML += `<div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Iniciativas relacionadas:</div>`;
    relatedProjects.slice(0, 3).forEach(rp => {
      linksEl.innerHTML += `
        <div class="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] mt-1">
          <div class="font-semibold text-white">${rp.title}</div>
          <div class="text-[10px] text-slate-400">${rp.organization} (${rp.year})</div>
        </div>
      `;
    });
  }

  panel.classList.remove('hidden');
}

// 3. Inicializar Asistente de IA
function initAssistant() {
  assistantInstance = new AIAssistant(cvData, 'ai-chat-root');
}

// 4. Renderizar Timeline (Liderazgo vs Docencia)
function renderTimeline(mode) {
  const container = document.getElementById('timeline-content');
  if (!container) return;

  if (mode === 'leadership') {
    const list = cvData.workExperience || [];
    container.innerHTML = list.map(item => `
      <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <div>
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">${item.period}</span>
            <h3 class="text-base font-bold text-white">${item.organization}</h3>
            ${item.unit ? `<span class="text-xs text-slate-400">${item.unit}</span>` : ''}
          </div>
          <span class="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 self-start sm:self-auto">
            ${item.role}
          </span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed mt-2">
          ${item.description}
        </p>
      </div>
    `).join('');
  } else {
    const list = cvData.teachingExperience || [];
    container.innerHTML = list.map(item => `
      <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <div>
            <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">${item.period}</span>
            <h3 class="text-base font-bold text-white">${item.institution}</h3>
          </div>
          <span class="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 self-start sm:self-auto">
            ${item.role}
          </span>
        </div>
        ${item.subjects ? `
          <div class="mt-2 mb-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span class="font-bold text-sky-400">Asignaturas:</span>
            <span class="text-slate-200">${item.subjects}</span>
          </div>
        ` : ''}
        <p class="text-xs text-slate-300 leading-relaxed">
          ${item.description}
        </p>
      </div>
    `).join('');
  }
}

// 5. Renderizar Publicaciones (Búsqueda + Cluster + Copiar BibTeX)
function renderPublications(clusterFilter = 'all', searchQuery = '') {
  const container = document.getElementById('publications-grid');
  if (!container || !cvData.publications) return;

  let filtered = cvData.publications;
  if (clusterFilter !== 'all') {
    filtered = filtered.filter(p => p.cluster === clusterFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.authors.some(a => a.toLowerCase().includes(q)) ||
      (p.venue && p.venue.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-2 p-8 text-center text-slate-400 text-xs">No se encontraron publicaciones con esos criterios.</div>`;
    return;
  }

  container.innerHTML = filtered.map(pub => {
    const isSpringer = pub.publisher && pub.publisher.includes('Springer');
    const badgeColor = pub.cluster === 'ia_data_science' ? 'text-sky-400 border-sky-500/20 bg-sky-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';

    return `
      <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}">
              ${pub.year} · ${pub.type}
            </span>
            ${isSpringer ? `<span class="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Springer Nature</span>` : ''}
          </div>
          
          <h4 class="text-sm font-bold text-white group-hover:text-sky-400 transition leading-snug">
            ${pub.title}
          </h4>

          <div class="text-xs text-slate-400 mt-2">
            <strong>Autores:</strong> ${pub.authors.join(', ')}
          </div>

          <div class="text-xs text-slate-400 mt-1">
            <strong>Publicado en:</strong> <em class="text-slate-300">${pub.venue || pub.publisher}</em>
          </div>

          ${pub.abstract ? `
            <details class="mt-3 text-xs text-slate-300">
              <summary class="cursor-pointer text-sky-400 hover:text-sky-300 font-medium">Ver Resumen (Abstract)</summary>
              <p class="mt-2 text-slate-400 text-[11px] leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                ${pub.abstract}
              </p>
            </details>
          ` : ''}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          ${pub.url ? `
            <a href="${pub.url}" target="_blank" class="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1">
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              ${pub.doi ? `DOI: ${pub.doi}` : 'Ver en revista'}
            </a>
          ` : `<span></span>`}

          <button class="copy-bib-btn text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition flex items-center gap-1 text-[11px]" data-bib="${encodeURIComponent(pub.bibtex)}">
            <i class="fa-solid fa-copy"></i>
            <span>BibTeX</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Eventos para copiar BibTeX
  container.querySelectorAll('.copy-bib-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bibText = decodeURIComponent(btn.getAttribute('data-bib'));
      navigator.clipboard.writeText(bibText).then(() => {
        const span = btn.querySelector('span');
        const oldText = span.textContent;
        span.textContent = '¡Copiado!';
        btn.classList.add('text-emerald-400');
        setTimeout(() => {
          span.textContent = oldText;
          btn.classList.remove('text-emerald-400');
        }, 1800);
      });
    });
  });
}

// 6. Renderizar Proyectos, Repositorios GitHub y Recursos Digitales
function renderProjects(mode) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  if (mode === 'projects') {
    const list = cvData.projects || [];
    container.innerHTML = list.map(p => `
      <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ${p.year}
            </span>
            ${p.badge ? `<span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">${p.badge}</span>` : ''}
          </div>

          <h4 class="text-sm font-bold text-white leading-snug">
            ${p.title}
          </h4>

          <div class="text-xs text-slate-400 mt-1">
            <strong>Entidad:</strong> ${p.organization}
          </div>

          ${p.tags && p.tags.length > 0 ? `
            <div class="flex flex-wrap gap-1 mt-3">
              ${p.tags.map(t => `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        ${p.links && p.links.length > 0 ? `
          <div class="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
            ${p.links.map(l => `
              <a href="${l.url}" target="_blank" class="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1">
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> ${l.label}
              </a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  } else if (mode === 'repos') {
    const list = cvData.githubRepositories || [];
    container.innerHTML = list.map(repo => `
      <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              ${repo.badge || 'Open Source'}
            </span>
            <span class="text-[10px] font-medium text-slate-400 flex items-center gap-1">
              <i class="fa-brands fa-github"></i> marchelo2212
            </span>
          </div>

          <h4 class="text-sm font-bold text-white group-hover:text-sky-400 transition leading-snug">
            ${repo.title}
          </h4>

          <div class="text-xs font-mono text-slate-400 mt-1">
            repo: <span class="text-slate-300">${repo.name}</span>
          </div>

          <p class="text-xs text-slate-300 mt-2 leading-relaxed">
            ${repo.description}
          </p>

          ${repo.tags && repo.tags.length > 0 ? `
            <div class="flex flex-wrap gap-1 mt-3">
              ${repo.tags.map(t => `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <a href="${repo.url}" target="_blank" class="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5">
            <i class="fa-brands fa-github text-sm"></i> Ver Repositorio
          </a>
          <span class="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">${repo.category}</span>
        </div>
      </div>
    `).join('');
  } else {
    const list = cvData.digitalResources || [];
    container.innerHTML = list.map(r => `
      <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ${r.category}
            </span>
            <span class="text-[10px] font-medium text-slate-400">${r.role}</span>
          </div>

          <h4 class="text-sm font-bold text-white leading-snug">
            ${r.title}
          </h4>

          <div class="text-xs text-slate-400 mt-1 font-medium">
            ${r.institution}
          </div>

          <p class="text-xs text-slate-300 mt-2 leading-relaxed">
            ${r.description}
          </p>

          ${r.tags && r.tags.length > 0 ? `
            <div class="flex flex-wrap gap-1 mt-3">
              ${r.tags.map(t => `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        ${r.links && r.links.length > 0 ? `
          <div class="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-3 text-xs">
            ${r.links.map(l => `
              <a href="${l.url}" target="_blank" class="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                <i class="fa-solid fa-link text-[10px]"></i> ${l.label}
              </a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
}

// 7. Renderizar Educación Universitaria
function renderEducation() {
  const container = document.getElementById('education-list');
  if (!container || !cvData.education) return;

  container.innerHTML = cvData.education.map(e => `
    <div class="p-3.5 rounded-xl glass-card border border-slate-800 flex items-start justify-between gap-2">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400">${e.year}</span>
        <h4 class="text-xs font-bold text-white">${e.degree}</h4>
        <div class="text-xs text-slate-400">${e.institution}</div>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full ${e.status === 'En curso' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium' : 'bg-slate-800 text-slate-400'}">
        ${e.status}
      </span>
    </div>
  `).join('');
}

// 8. Event Listeners
function setupEventListeners() {
  // Tabs de Timeline
  const leadBtn = document.getElementById('tab-leadership-btn');
  const teachBtn = document.getElementById('tab-teaching-btn');

  if (leadBtn && teachBtn) {
    leadBtn.addEventListener('click', () => {
      leadBtn.className = 'px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium transition shadow-md';
      teachBtn.className = 'px-4 py-2 rounded-lg text-slate-400 hover:text-white transition';
      renderTimeline('leadership');
    });

    teachBtn.addEventListener('click', () => {
      teachBtn.className = 'px-4 py-2 rounded-lg bg-sky-500 text-white font-medium transition shadow-md';
      leadBtn.className = 'px-4 py-2 rounded-lg text-slate-400 hover:text-white transition';
      renderTimeline('teaching');
    });
  }

  // Tabs de Proyectos vs Repositorios vs Recursos Digitales
  const showProjBtn = document.getElementById('show-projects-btn');
  const showReposBtn = document.getElementById('show-repos-btn');
  const showResBtn = document.getElementById('show-resources-btn');

  const activeTabClass = 'px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-medium transition shadow-md';
  const inactiveTabClass = 'px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 transition';

  if (showProjBtn && showReposBtn && showResBtn) {
    showProjBtn.addEventListener('click', () => {
      showProjBtn.className = activeTabClass;
      showReposBtn.className = inactiveTabClass;
      showResBtn.className = inactiveTabClass;
      renderProjects('projects');
    });

    showReposBtn.addEventListener('click', () => {
      showReposBtn.className = 'px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-medium transition shadow-md';
      showProjBtn.className = inactiveTabClass;
      showResBtn.className = inactiveTabClass;
      renderProjects('repos');
    });

    showResBtn.addEventListener('click', () => {
      showResBtn.className = 'px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium transition shadow-md';
      showProjBtn.className = inactiveTabClass;
      showReposBtn.className = inactiveTabClass;
      renderProjects('resources');
    });
  }

  // Filtros de Publicaciones
  const pubSearch = document.getElementById('pub-search-input');
  const pubCluster = document.getElementById('pub-cluster-filter');

  const onPubFilterChange = () => {
    const query = pubSearch ? pubSearch.value : '';
    const cluster = pubCluster ? pubCluster.value : 'all';
    renderPublications(cluster, query);
  };

  if (pubSearch) pubSearch.addEventListener('input', onPubFilterChange);
  if (pubCluster) pubCluster.addEventListener('change', onPubFilterChange);

  // Switcher de Vista Dual (Research Lab vs CV Clásico)
  const interactiveBtn = document.getElementById('view-interactive-btn');
  const classicBtn = document.getElementById('view-classic-btn');

  if (interactiveBtn && classicBtn) {
    interactiveBtn.addEventListener('click', () => {
      interactiveBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-medium shadow-md transition';
      classicBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
      const el = document.getElementById('research-lab');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });

    classicBtn.addEventListener('click', () => {
      classicBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-medium shadow-md transition';
      interactiveBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
      const el = document.getElementById('timeline-sec');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// Iniciar al cargar el DOM
document.addEventListener('DOMContentLoaded', loadData);
