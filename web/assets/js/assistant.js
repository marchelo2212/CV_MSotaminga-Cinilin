/**
 * assistant.js - AI Feedback Assistant (Tutor Interactivo de Trayectoria)
 * Motor inteligente en cliente para consultas sobre investigación, proyectos y publicaciones.
 */

export class AIAssistant {
  constructor(data, chatContainerId) {
    this.data = data;
    this.knowledgeBase = data.aiKnowledgeBase || [];
    this.publications = data.publications || [];
    this.projects = data.projects || [];
    this.container = document.getElementById(chatContainerId);
    this.initUI();
  }

  initUI() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="chat-card bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <!-- Header del Asistente -->
        <div class="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-white flex items-center gap-2">
                AI Research & Trajectory Assistant
                <span class="text-[10px] font-normal px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">Demo Viva</span>
              </h4>
              <p class="text-xs text-slate-400">Inspirado en Springer 2026: Formative Feedback Assistant</p>
            </div>
          </div>
          <button id="clear-chat-btn" class="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition">
            Reiniciar
          </button>
        </div>

        <!-- Historial de Mensajes -->
        <div id="chat-messages" class="p-4 space-y-4 max-h-[380px] overflow-y-auto text-sm scroll-smooth">
          <!-- Mensaje de Bienvenida -->
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center flex-shrink-0 text-xs border border-sky-500/30">
              AI
            </div>
            <div class="bg-slate-800/80 text-slate-200 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] border border-slate-700/60 leading-relaxed">
              ¡Hola! Soy el asistente inteligente de la trayectoria de <strong>Marcelo Sotaminga</strong>. Puedes preguntarme sobre su <strong>investigación doctoral</strong>, su labor en <strong>MINTEL/UNESCO</strong>, sus publicaciones en <strong>Springer</strong> o su rol como <strong>Jefe de Producción Virtual en La Sabana</strong>.
            </div>
          </div>
        </div>

        <!-- Prompts Rápidos (Chips) -->
        <div class="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
          <div class="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Prompts rápidos sugeridos:
          </div>
          <div class="flex flex-wrap gap-1.5" id="chat-prompts">
            <button class="prompt-chip text-xs bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-sky-700/50 transition" data-q="¿Qué impacto tuvo Marcelo en políticas de ética de IA en Ecuador?">
              ⚖️ Ética de IA en MINTEL & UNESCO
            </button>
            <button class="prompt-chip text-xs bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-sky-700/50 transition" data-q="Explica el proyecto de Ecosistema Neuro-Simbólico de Sabana Centro.">
              🧠 Ecosistema Neuro-Simbólico
            </button>
            <button class="prompt-chip text-xs bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-sky-700/50 transition" data-q="¿En qué consiste su investigación doctoral en diagnóstico cognitivo?">
              🔬 Tesis Doctoral en La Sabana
            </button>
            <button class="prompt-chip text-xs bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-sky-700/50 transition" data-q="Muéstrame sus publicaciones sobre gamificación y escape rooms.">
              🎮 Gamificación & Escape Rooms
            </button>
            <button class="prompt-chip text-xs bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-sky-700/50 transition" data-q="¿Cuál es su rol como Jefe de Producción Virtual en Unisabana?">
              🏢 Producción Virtual Unisabana
            </button>
          </div>
        </div>

        <!-- Input de Chat -->
        <form id="chat-form" class="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
          <input 
            type="text" 
            id="chat-input"
            placeholder="Pregunta sobre proyectos, investigación, docencia..." 
            class="flex-1 bg-slate-900 text-slate-200 placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <button 
            type="submit" 
            class="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center transition shadow-lg shadow-sky-500/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
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
        this.messagesContainer.innerHTML = '';
        this.initUI();
      });
    }
  }

  handleUserQuery(query) {
    this.appendMessage('user', query);
    
    // Indicador de "escribiendo..."
    const typingId = this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator(typingId);
      const response = this.computeAnswer(query);
      this.appendMessage('assistant', response);
    }, 450);
  }

  computeAnswer(query) {
    const qLower = query.toLowerCase();

    // 1. Buscar coincidencia en base de conocimiento curada
    for (const item of this.knowledgeBase) {
      const matchWord = item.triggerWords.some(w => qLower.includes(w.toLowerCase()));
      if (matchWord) {
        return item.answer;
      }
    }

    // 2. Buscar en Publicaciones
    const matchedPubs = this.publications.filter(p => 
      p.title.toLowerCase().includes(qLower) || 
      (p.abstract && p.abstract.toLowerCase().includes(qLower)) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(qLower)))
    );

    if (matchedPubs.length > 0) {
      const topPub = matchedPubs[0];
      return `Encontré la siguiente publicación relevante de Marcelo: 
      <br/><br/>
      <strong>"${topPub.title}"</strong> (${topPub.year}). Publicado en <em>${topPub.venue || topPub.publisher}</em>.
      ${topPub.doi ? `<br/><a href="${topPub.url}" target="_blank" class="text-sky-400 underline font-medium mt-1 inline-block">Ver publicación (DOI: ${topPub.doi})</a>` : ''}
      <br/><span class="text-xs text-slate-400 mt-2 block">${topPub.abstract ? topPub.abstract.substring(0, 180) + '...' : ''}</span>`;
    }

    // 3. Buscar en Proyectos
    const matchedProjects = this.projects.filter(p => 
      p.title.toLowerCase().includes(qLower) || 
      p.organization.toLowerCase().includes(qLower) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(qLower)))
    );

    if (matchedProjects.length > 0) {
      const topProj = matchedProjects[0];
      return `Sobre este tema, Marcelo lideró/participó en: 
      <br/><br/>
      <strong>${topProj.title}</strong> (${topProj.year}) en <strong>${topProj.organization}</strong>.
      ${topProj.tags ? `<br/><span class="text-xs text-slate-400">Áreas: ${topProj.tags.join(', ')}</span>` : ''}`;
    }

    // 4. Respuesta general sintetizada
    return `Marcelo Sotaminga es <strong>Arquitecto Tecnopedagógico e Investigador en IA Educativa</strong>, actualmente <em>Jefe de Producción Virtual en la Universidad de La Sabana</em> y <em>Doctorando en Ingeniería</em>. 
    <br/><br/>
    Su trayectoria articula <strong>modelos de Deep Learning y diagnóstico cognitivo</strong>, <strong>gobernanza y ética de la IA (MINTEL/UNESCO)</strong>, y <strong>ecosistemas de aprendizaje virtual a gran escala</strong>. Puedes probar con los botones de temas sugeridos o descargar su CV formal en PDF.`;
  }

  showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex items-start gap-3';
    div.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center flex-shrink-0 text-xs border border-sky-500/30">
        AI
      </div>
      <div class="bg-slate-800/60 p-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
        <span class="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
        <span class="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-150"></span>
        <span class="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-300"></span>
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
      <div class="w-7 h-7 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-sky-600/30 text-sky-400 border border-sky-500/30'} flex items-center justify-center flex-shrink-0 text-xs">
        ${isUser ? 'Tú' : 'AI'}
      </div>
      <div class="${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'} p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-sm">
        ${text}
      </div>
    `;

    this.messagesContainer.appendChild(div);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
