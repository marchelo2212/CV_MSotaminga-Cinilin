/**
 * assistant.js - AI Feedback Assistant (Tutor Interactivo de Trayectoria)
 * Consola académica y diálogo reflexivo sobre la investigación de Marcelo Sotaminga.
 */

export class AIAssistant {
  constructor(data, chatContainerId) {
    this.data = data;
    this.knowledgeBase = data.aiKnowledgeBase || [];
    this.publications = data.publications || [];
    this.projects = data.projects || [];
    this.repos = data.githubRepositories || [];
    this.container = document.getElementById(chatContainerId);
    this.initUI();
  }

  initUI() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="academic-console border border-white/[0.08] bg-[#0d1017]/90 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <!-- Barra de Estado / Consola de Investigación -->
        <div class="px-5 py-3.5 border-b border-white/[0.06] bg-[#090b10] flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-white font-medium tracking-tight">AI-ED DIALOGUE CONSOLE</span>
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">SPRINGER 2026 PoC</span>
              </div>
              <p class="text-[11px] text-slate-400 font-serif italic mt-0.5">Asistente basado en feedback formativo para explorar publicaciones y trayectoria</p>
            </div>
          </div>
          
          <button id="clear-chat-btn" class="font-mono text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition flex items-center gap-1.5">
            <i class="fa-solid fa-arrow-rotate-left text-[10px]"></i> Reiniciar
          </button>
        </div>

        <!-- Historial de Diálogo -->
        <div id="chat-messages" class="p-5 space-y-4 max-h-[400px] overflow-y-auto text-xs leading-relaxed font-sans scroll-smooth">
          <!-- Mensaje Inicial de Marcelo -->
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-mono text-[11px] flex-shrink-0 mt-0.5">
              Ψ
            </div>
            <div class="bg-white/[0.03] text-slate-200 p-4 rounded-xl rounded-tl-sm max-w-[90%] border border-white/[0.06] shadow-sm">
              <div class="font-serif text-sm font-semibold text-white mb-1">
                Bienvenido al diálogo interactivo sobre mi investigación
              </div>
              <p class="text-slate-300 leading-relaxed text-[13px]">
                Este espacio funciona como una prueba de concepto en vivo inspirada en mi trabajo sobre 
                <em>asistentes inteligentes para retroalimentación formativa</em>. Puedes indagar con preguntas libres o seleccionar uno de los tópicos metodológicos siguientes:
              </p>
            </div>
          </div>
        </div>

        <!-- Chips de Indagación Socrática -->
        <div class="px-5 py-3 border-t border-white/[0.06] bg-[#090b10]/60">
          <div class="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <span class="text-amber-400">§</span> Consultas rápidas recomendadas:
          </div>
          <div class="flex flex-wrap gap-1.5" id="chat-prompts">
            <button class="prompt-chip font-mono text-[11px] bg-white/[0.03] hover:bg-sky-500/15 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-sky-500/30 transition flex items-center gap-1.5" data-q="¿Qué impacto tuvo Marcelo en políticas de ética de IA en Ecuador?">
              <span>⚖️</span> Ética de IA (MINTEL / UNESCO)
            </button>
            <button class="prompt-chip font-mono text-[11px] bg-white/[0.03] hover:bg-sky-500/15 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-sky-500/30 transition flex items-center gap-1.5" data-q="Explica el proyecto de Ecosistema Neuro-Simbólico de Sabana Centro.">
              <span>🧠</span> Ecosistema Neuro-Simbólico
            </button>
            <button class="prompt-chip font-mono text-[11px] bg-white/[0.03] hover:bg-sky-500/15 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-sky-500/30 transition flex items-center gap-1.5" data-q="¿En qué consiste su investigación doctoral en diagnóstico cognitivo?">
              <span>🔬</span> Tesis Doctoral & Diagnóstico Cognitivo
            </button>
            <button class="prompt-chip font-mono text-[11px] bg-white/[0.03] hover:bg-sky-500/15 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-sky-500/30 transition flex items-center gap-1.5" data-q="¿Cuáles son los repositorios de código abierto y libros digitales que tiene Marcelo en GitHub?">
              <span>💻</span> Repositorios Open-Source & E-Books
            </button>
            <button class="prompt-chip font-mono text-[11px] bg-white/[0.03] hover:bg-sky-500/15 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-sky-500/30 transition flex items-center gap-1.5" data-q="¿Qué es el Digital Garden de Quartz alojado en marchelo2212.github.io?">
              <span>🌱</span> Obsidian Digital Garden (Quartz)
            </button>
            <button class="prompt-chip font-mono text-[11px] bg-white/[0.03] hover:bg-sky-500/15 text-slate-300 hover:text-sky-300 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-sky-500/30 transition flex items-center gap-1.5" data-q="¿Cómo puedo contactar a Marcelo o consultar sus redes y correos institucionales?">
              <span>📬</span> Directorio de Contacto & Redes
            </button>
          </div>
        </div>

        <!-- Entrada de Texto -->
        <form id="chat-form" class="p-3 bg-[#07090d] border-t border-white/[0.06] flex gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3.5 top-2.5 font-mono text-slate-500 text-xs">></span>
            <input 
              type="text" 
              id="chat-input"
              placeholder="Formula una pregunta metodológica sobre la trayectoria o publicaciones..." 
              class="w-full bg-[#10141d] text-slate-200 placeholder-slate-500 font-sans text-xs pl-8 pr-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <button 
            type="submit" 
            class="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-sky-600/20"
          >
            <span>Consultar</span>
            <i class="fa-solid fa-arrow-turn-down text-[10px] -rotate-90"></i>
          </button>
        </form>
      </div>
    `;

    this.messagesContainer = this.container.querySelector('#chat-messages');
    this.form = this.container.querySelector('#chat-form');
    this.input = this.container.querySelector('#chat-input');

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.input.value.trim();
      if (!query) return;
      this.handleUserQuery(query);
      this.input.value = '';
    });

    this.container.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-q');
        this.handleUserQuery(query);
      });
    });

    const clearBtn = this.container.querySelector('#clear-chat-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.initUI();
      });
    }
  }

  handleUserQuery(query) {
    this.appendMessage('user', query);
    const typingId = this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator(typingId);
      const response = this.computeAnswer(query);
      this.appendMessage('assistant', response);
    }, 400);
  }

  computeAnswer(query) {
    const qLower = query.toLowerCase();

    // 1. Base curada
    for (const item of this.knowledgeBase) {
      const matchWord = item.triggerWords.some(w => qLower.includes(w.toLowerCase()));
      if (matchWord) {
        return item.answer;
      }
    }

    // 2. Coincidencia en Publicaciones
    const matchedPubs = this.publications.filter(p => 
      p.title.toLowerCase().includes(qLower) || 
      (p.abstract && p.abstract.toLowerCase().includes(qLower)) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(qLower)))
    );

    if (matchedPubs.length > 0) {
      const topPub = matchedPubs[0];
      return `<div class="space-y-2">
        <p>Referencia bibliográfica indexada localizada:</p>
        <blockquote class="border-l-2 border-sky-400 pl-3 italic font-serif text-[13px] text-white my-1">
          "${topPub.title}"
        </blockquote>
        <div class="text-[11px] text-slate-400 font-mono">
          Autores: ${topPub.authors.join(', ')} (${topPub.year}) · <em>${topPub.venue || topPub.publisher}</em>
        </div>
        ${topPub.doi ? `<div class="pt-1"><a href="${topPub.url}" target="_blank" class="inline-flex items-center gap-1 text-sky-400 underline font-mono text-[11px]">Enlace DOI oficial: ${topPub.doi} <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a></div>` : ''}
      </div>`;
    }

    // 3. Coincidencia en Repositorios
    const matchedRepo = this.repos.filter(r =>
      r.name.toLowerCase().includes(qLower) ||
      r.title.toLowerCase().includes(qLower) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(qLower)))
    );

    if (matchedRepo.length > 0) {
      const r = matchedRepo[0];
      return `<div class="space-y-1.5">
        <p>En el catálogo abierto de GitHub de Marcelo:</p>
        <div class="font-bold text-white text-[13px]">${r.title}</div>
        <p class="text-slate-300 text-[12px]">${r.description}</p>
        <div class="pt-1"><a href="${r.url}" target="_blank" class="text-sky-400 font-mono underline inline-flex items-center gap-1">Ver repositorio en GitHub: marchelo2212/${r.name} <i class="fa-brands fa-github"></i></a></div>
      </div>`;
    }

    // 4. Coincidencia en Proyectos
    const matchedProjects = this.projects.filter(p => 
      p.title.toLowerCase().includes(qLower) || 
      p.organization.toLowerCase().includes(qLower) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(qLower)))
    );

    if (matchedProjects.length > 0) {
      const topProj = matchedProjects[0];
      return `<div class="space-y-1.5">
        <p>Iniciativa documentada en su trayectoria:</p>
        <div class="font-bold text-white text-[13px]">${topProj.title} (${topProj.year})</div>
        <div class="text-slate-400 text-[11px]">Organización / Convenio: <strong>${topProj.organization}</strong></div>
      </div>`;
    }

    return `<div class="space-y-1.5">
      <p>Marcelo Sotaminga es <strong>Arquitecto Tecnopedagógico e Investigador en IA Educativa</strong>, Jefe de Producción Virtual en <em>Unisabana e-learning</em> y Doctorando en Ingeniería.</p>
      <p class="text-slate-400 text-[12px]">Su trabajo investigativo conecta <strong>modelos de Deep Learning y diagnóstico cognitivo</strong>, <strong>gobernanza ética de la IA (UNESCO/MINTEL)</strong> y <strong>ecosistemas abiertos de aprendizaje</strong>. Puedes seleccionar los temas sugeridos para profundizar.</p>
    </div>`;
  }

  showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex items-start gap-3';
    div.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-mono text-[11px] flex-shrink-0">
        Ψ
      </div>
      <div class="bg-white/[0.03] p-3 rounded-xl rounded-tl-sm flex gap-1.5 items-center border border-white/[0.04]">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-150"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-300"></span>
      </div>
    `;
    this.messagesContainer.appendChild(div);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  appendMessage(sender, text) {
    const isUser = sender === 'user';
    const div = document.createElement('div');
    div.className = `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
    
    div.innerHTML = `
      <div class="w-7 h-7 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'} flex items-center justify-center flex-shrink-0 font-mono text-[11px]">
        ${isUser ? '>' : 'Ψ'}
      </div>
      <div class="${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/[0.03] text-slate-200 border border-white/[0.06] rounded-tl-sm'} p-3.5 rounded-xl max-w-[88%] leading-relaxed shadow-sm text-[13px]">
        ${text}
      </div>
    `;

    this.messagesContainer.appendChild(div);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
