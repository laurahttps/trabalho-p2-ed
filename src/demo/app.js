/* =============================================================
   Simulador BFS vs. DFS no Labirinto — Tema D
   Segue a mesma lógica do src/algoritmo.py:
   - vizinhos sempre na ordem: cima, baixo, esquerda, direita
   - BFS: FILA (FIFO), marca como visitado ao ENTRAR na fila
   - DFS: PILHA (LIFO), marca como visitado ao SAIR da pilha
   ============================================================= */

// ---------- Cenários pré-configurados ----------
const CENARIOS = {
  comparativo: {
    nome: "Cenário 1: BFS vs. DFS",
    descricao: "O destino está a apenas 2 passos da origem. Rode a BFS e depois a DFS e compare o tamanho do caminho na tabela.",
    mapa: ["S....", ".###.", "E...."],
  },
  semCaminho: {
    nome: "Cenário 2: Sem caminho",
    descricao: "O destino está cercado por paredes. As duas buscas exploram tudo o que conseguem alcançar e terminam sem caminho.",
    mapa: ["S.#", "..#", "##E"],
  },
  piorCaso: {
    nome: "Cenário 3: Pior caso (grade aberta)",
    descricao: "Destino no canto oposto: a BFS precisa visitar praticamente todos os nós antes de chegar. É o custo O(V + E) na prática.",
    mapa: ["S....", ".....", ".....", ".....", "....E"],
  },
  labirinto: {
    nome: "Caso médio: labirinto",
    descricao: "Labirinto com vários caminhos possíveis. Repare como a BFS se espalha em ondas e a DFS segue um corredor até o fim.",
    mapa: [
      "S...#........",
      ".##.#.######.",
      ".#....#....#.",
      ".#.####.##.#.",
      "...#....#E.#.",
      "##.#.####.##.",
      ".....#.......",
      ".###.#.#####.",
      ".......#.....",
    ],
  },
  customizado: {
    nome: "Exemplo customizado",
    descricao: "Desenhe o seu próprio labirinto: escolha a ferramenta acima da grade e clique nas casas.",
    mapa: [
      "..........",
      "..........",
      "..........",
      ".S......E.",
      "..........",
      "..........",
      "..........",
    ],
  },
};

// Ordem dos vizinhos: cima, baixo, esquerda, direita (igual ao Python)
const DIRECOES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// ---------- Estado da aplicação ----------
const estado = {
  cenarioId: "comparativo",
  mapa: [],        // matriz de caracteres do labirinto
  algoritmo: "bfs",
  grafo: null,
  passos: [],      // "fotos" de cada passo da execução
  indice: 0,       // passo que está sendo mostrado
  timer: null,
  resultados: {},  // resultado final de BFS e DFS para a tabela
  aviso: "",
};

// ---------- Utilidades ----------
const el = (id) => document.getElementById(id);
const chave = (l, c) => l + "," + c;
const rotulo = (k) => "(" + k + ")";

function criarDiv(classe, texto) {
  const div = document.createElement("div");
  div.className = classe;
  div.textContent = texto;
  return div;
}

// ---------- Grafo (lista de adjacência) ----------
function criarGrafo(mapa) {
  const adj = new Map();
  let origem = null;
  let destino = null;
  const linhas = mapa.length;
  const colunas = mapa[0].length;

  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const simbolo = mapa[l][c];
      if (simbolo === "#") continue; // parede não vira nó
      const k = chave(l, c);
      if (simbolo === "S") origem = k;
      if (simbolo === "E") destino = k;

      const vizinhos = [];
      for (const [dl, dc] of DIRECOES) {
        const nl = l + dl;
        const nc = c + dc;
        const dentro = nl >= 0 && nl < linhas && nc >= 0 && nc < colunas;
        if (dentro && mapa[nl][nc] !== "#") vizinhos.push(chave(nl, nc));
      }
      adj.set(k, vizinhos);
    }
  }

  let total = 0;
  adj.forEach((v) => (total += v.length));
  return { adj, origem, destino, V: adj.size, E: total / 2 };
}

function reconstruirCaminho(veioDe, destino) {
  const caminho = [];
  let atual = destino;
  while (atual != null) {
    caminho.push(atual);
    atual = veioDe.get(atual);
  }
  return caminho.reverse();
}

// ---------- Gera todos os passos da BFS ----------
function gerarPassosBFS(grafo) {
  const { adj, origem, destino } = grafo;
  const passos = [];
  const fila = [origem];
  const visitados = new Set([origem]); // marca ao ENTRAR na fila
  const processados = new Set();       // já saíram da fila
  const veioDe = new Map([[origem, null]]);
  const dist = new Map([[origem, 0]]);
  let nosVisitados = 0;
  let arestas = 0;

  function foto(log, extra = {}) {
    passos.push({
      log,
      tipo: extra.tipo || "normal",
      atual: extra.atual || null,
      novos: extra.novos || [],
      caminho: extra.caminho || null,
      estrutura: [...fila],
      processados: new Set(processados),
      dist: new Map(dist),
      nosVisitados,
      arestas,
    });
  }

  foto(`Início: a origem ${rotulo(origem)} entra na fila e é marcada como visitada.`);

  while (fila.length > 0) {
    const atual = fila.shift(); // tira do INÍCIO (FIFO)
    nosVisitados++;
    processados.add(atual);

    if (atual === destino) {
      const caminho = reconstruirCaminho(veioDe, destino);
      foto(`Tirou ${rotulo(atual)} do início da fila: é o destino! Seguindo o veio_de de trás para frente, o caminho tem ${caminho.length - 1} passos.`,
        { tipo: "sucesso", atual, caminho });
      return passos;
    }

    const novos = [];
    for (const vizinho of adj.get(atual)) {
      arestas++;
      if (!visitados.has(vizinho)) {
        visitados.add(vizinho);
        veioDe.set(vizinho, atual);
        dist.set(vizinho, dist.get(atual) + 1);
        fila.push(vizinho); // entra no FIM da fila
        novos.push(vizinho);
      }
    }

    let texto = `Tirou ${rotulo(atual)} do INÍCIO da fila (distância ${dist.get(atual)}). Verificou ${adj.get(atual).length} vizinho(s). `;
    texto += novos.length > 0
      ? `Entraram no FIM da fila: ${novos.map(rotulo).join(", ")}.`
      : "Nenhum vizinho novo (todos já foram visitados).";
    foto(texto, { atual, novos });
  }

  foto("A fila esvaziou e o destino não foi alcançado: não existe caminho.", { tipo: "falha" });
  return passos;
}

// ---------- Gera todos os passos da DFS ----------
function gerarPassosDFS(grafo) {
  const { adj, origem, destino } = grafo;
  const passos = [];
  const pilha = [origem];
  const processados = new Set(); // marca ao SAIR da pilha
  const veioDe = new Map([[origem, null]]);
  const dist = new Map([[origem, 0]]);
  let nosVisitados = 0;
  let arestas = 0;

  function foto(log, extra = {}) {
    passos.push({
      log,
      tipo: extra.tipo || "normal",
      atual: extra.atual || null,
      novos: extra.novos || [],
      caminho: extra.caminho || null,
      estrutura: [...pilha],
      processados: new Set(processados),
      dist: new Map(dist),
      nosVisitados,
      arestas,
    });
  }

  foto(`Início: a origem ${rotulo(origem)} entra na pilha.`);

  while (pilha.length > 0) {
    const atual = pilha.pop(); // tira do TOPO (LIFO)

    if (processados.has(atual)) {
      foto(`Tirou ${rotulo(atual)} do TOPO da pilha, mas ele já foi visitado antes: ignora e segue.`,
        { tipo: "ignorado", atual });
      continue;
    }

    processados.add(atual);
    nosVisitados++;

    if (atual === destino) {
      const caminho = reconstruirCaminho(veioDe, destino);
      foto(`Tirou ${rotulo(atual)} do topo da pilha: é o destino! Seguindo o veio_de de trás para frente, o caminho tem ${caminho.length - 1} passos.`,
        { tipo: "sucesso", atual, caminho });
      return passos;
    }

    const novos = [];
    for (const vizinho of adj.get(atual)) {
      arestas++;
      if (!processados.has(vizinho)) {
        veioDe.set(vizinho, atual);
        dist.set(vizinho, dist.get(atual) + 1);
        pilha.push(vizinho); // entra no TOPO da pilha
        novos.push(vizinho);
      }
    }

    let texto = `Tirou ${rotulo(atual)} do TOPO da pilha (${dist.get(atual)} passos da origem por este caminho). Verificou ${adj.get(atual).length} vizinho(s). `;
    texto += novos.length > 0
      ? `Empilhou: ${novos.map(rotulo).join(", ")}. O último, ${rotulo(novos[novos.length - 1])}, fica no topo e será o próximo.`
      : "Nenhum vizinho novo: beco sem saída! A DFS volta (backtracking) para o que estiver no topo da pilha.";
    foto(texto, { atual, novos });
  }

  foto("A pilha esvaziou e o destino não foi alcançado: não existe caminho.", { tipo: "falha" });
  return passos;
}

// ---------- Desenho na tela ----------
function montarGrade() {
  const grade = el("grade");
  const linhas = estado.mapa.length;
  const colunas = estado.mapa[0].length;
  grade.style.gridTemplateColumns = `24px repeat(${colunas}, 40px)`;
  grade.innerHTML = "";

  grade.appendChild(criarDiv("indice", "")); // canto vazio
  for (let c = 0; c < colunas; c++) grade.appendChild(criarDiv("indice", c));

  for (let l = 0; l < linhas; l++) {
    grade.appendChild(criarDiv("indice", l));
    for (let c = 0; c < colunas; c++) {
      const div = criarDiv("celula", "");
      div.dataset.l = l;
      div.dataset.c = c;
      div.title = `(${l},${c})`;
      div.addEventListener("click", () => editarCelula(l, c));
      grade.appendChild(div);
    }
  }
}

function desenharCelulas(passo) {
  const naEstrutura = new Set(passo ? passo.estrutura : []);
  const novos = new Set(passo ? passo.novos : []);
  const caminho = passo && passo.caminho ? passo.caminho : [];
  const posicaoNoCaminho = new Map(caminho.map((k, i) => [k, i]));

  document.querySelectorAll("#grade .celula").forEach((div) => {
    const l = Number(div.dataset.l);
    const c = Number(div.dataset.c);
    const k = chave(l, c);
    const simbolo = estado.mapa[l][c];
    const classes = ["celula"];
    let texto = "";
    div.style.animationDelay = "";

    if (simbolo === "#") {
      classes.push("parede");
    } else {
      if (passo) {
        if (posicaoNoCaminho.has(k)) {
          classes.push("caminho");
          div.style.animationDelay = posicaoNoCaminho.get(k) * 60 + "ms";
        } else if (k === passo.atual) classes.push("atual");
        else if (novos.has(k)) classes.push("novo");
        else if (passo.processados.has(k)) classes.push("visitado");
        else if (naEstrutura.has(k)) classes.push("fronteira");

        if (passo.dist.has(k)) texto = passo.dist.get(k);
      }
      if (simbolo === "S") { classes.push("origem"); texto = "S"; }
      if (simbolo === "E") { classes.push("destino"); texto = "E"; }
    }

    div.className = classes.join(" ");
    div.textContent = texto;
  });
}

function desenharEstrutura(passo) {
  const bfs = estado.algoritmo === "bfs";
  el("titulo-estrutura").textContent = bfs ? "Fila (FIFO)" : "Pilha (LIFO)";
  el("dica-estrutura").textContent = bfs
    ? "Entra no fim e sai pelo início. O primeiro da lista é o próximo a sair."
    : "Entra no topo e sai pelo topo. O item de cima é o próximo a sair.";

  const caixa = el("estrutura");
  caixa.className = "estrutura " + (bfs ? "fila" : "pilha");
  caixa.innerHTML = "";

  const itens = passo ? [...passo.estrutura] : [];
  if (itens.length === 0) {
    caixa.appendChild(criarDiv("vazio", bfs ? "Fila vazia" : "Pilha vazia"));
    return;
  }

  const ordem = bfs ? itens : itens.reverse(); // na pilha, o topo aparece em cima
  ordem.forEach((k, i) => {
    const item = criarDiv("item", rotulo(k));
    if (i === 0) {
      item.classList.add("proximo");
      item.textContent += bfs ? " ← início" : " ← topo";
    }
    caixa.appendChild(item);
  });
}

function desenharMetricas(passo) {
  const bfs = estado.algoritmo === "bfs";
  const total = estado.passos.length;
  el("m-passo").textContent = total ? `${estado.indice + 1} / ${total}` : "—";
  el("m-atual").textContent = passo && passo.atual ? rotulo(passo.atual) : "—";
  el("m-tamanho-rotulo").textContent = bfs ? "Tamanho da fila" : "Tamanho da pilha";
  el("m-tamanho").textContent = passo ? passo.estrutura.length : 0;
  el("m-visitados").textContent = passo ? passo.nosVisitados : 0;
  el("m-arestas").textContent = passo ? passo.arestas : 0;
  el("m-grafo").textContent = estado.grafo ? `${estado.grafo.V} / ${estado.grafo.E}` : "—";

  let textoCaminho = "Ainda procurando…";
  if (!passo) textoCaminho = "—";
  else if (passo.caminho) textoCaminho = `${passo.caminho.length - 1} passos`;
  else if (passo.tipo === "falha") textoCaminho = "Não existe caminho";
  el("m-caminho").textContent = textoCaminho;
}

function desenharLog() {
  const lista = el("log");
  lista.innerHTML = "";

  if (estado.passos.length === 0) {
    const li = document.createElement("li");
    li.textContent = estado.aviso;
    li.className = "falha";
    lista.appendChild(li);
    return;
  }

  // O passo mais recente aparece em cima
  for (let i = estado.indice; i >= 0; i--) {
    const passo = estado.passos[i];
    const li = document.createElement("li");
    const numero = document.createElement("b");
    numero.textContent = `Passo ${i + 1}. `;
    li.appendChild(numero);
    li.appendChild(document.createTextNode(passo.log));
    if (i === estado.indice) li.classList.add("log-atual");
    if (passo.tipo !== "normal") li.classList.add(passo.tipo);
    lista.appendChild(li);
  }
}

function desenharResultados() {
  for (const alg of ["bfs", "dfs"]) {
    const r = estado.resultados[alg];
    el(`r-${alg}-caminho`).textContent = r ? (r.caminho === null ? "sem caminho" : `${r.caminho} passos`) : "—";
    el(`r-${alg}-visitados`).textContent = r ? r.visitados : "—";
    el(`r-${alg}-arestas`).textContent = r ? r.arestas : "—";
  }
}

function atualizarBotoes() {
  const semPassos = estado.passos.length === 0;
  const noFim = semPassos || estado.indice >= estado.passos.length - 1;
  const rodando = estado.timer !== null;

  el("btn-play").disabled = noFim || rodando;
  el("btn-step").disabled = noFim || rodando;
  el("btn-pause").disabled = !rodando;
  el("btn-reset").disabled = semPassos;

  el("btn-bfs").classList.toggle("ativo", estado.algoritmo === "bfs");
  el("btn-dfs").classList.toggle("ativo", estado.algoritmo === "dfs");
  document.querySelectorAll("[data-cenario]").forEach((b) =>
    b.classList.toggle("ativo", b.dataset.cenario === estado.cenarioId));
}

function render() {
  const passo = estado.passos[estado.indice] || null;
  desenharCelulas(passo);
  desenharEstrutura(passo);
  desenharMetricas(passo);
  desenharLog();
  desenharResultados();
  atualizarBotoes();
}

// ---------- Ações ----------
function preparar() {
  pausar();
  estado.grafo = criarGrafo(estado.mapa);
  estado.indice = 0;

  if (!estado.grafo.origem || !estado.grafo.destino) {
    estado.passos = [];
    estado.aviso = "Coloque uma origem (S) e um destino (E) no labirinto para começar.";
  } else {
    estado.aviso = "";
    estado.passos = estado.algoritmo === "bfs"
      ? gerarPassosBFS(estado.grafo)
      : gerarPassosDFS(estado.grafo);
  }
  render();
}

function registrarResultado() {
  const ultimo = estado.passos[estado.passos.length - 1];
  estado.resultados[estado.algoritmo] = {
    caminho: ultimo.caminho ? ultimo.caminho.length - 1 : null,
    visitados: ultimo.nosVisitados,
    arestas: ultimo.arestas,
  };
}

function proximoPasso() {
  if (estado.indice >= estado.passos.length - 1) return;
  estado.indice++;
  if (estado.indice === estado.passos.length - 1) {
    registrarResultado();
    pausar();
  }
  render();
}

function atraso() {
  return 1600 - Number(el("velocidade").value); // mais à direita = mais rápido
}

function executar() {
  if (estado.timer !== null) return;
  if (estado.indice >= estado.passos.length - 1) return;
  estado.timer = setInterval(proximoPasso, atraso());
  atualizarBotoes();
}

function pausar() {
  if (estado.timer !== null) {
    clearInterval(estado.timer);
    estado.timer = null;
  }
}

function reiniciar() {
  pausar();
  estado.indice = 0;
  render();
}

function trocarAlgoritmo(alg) {
  estado.algoritmo = alg;
  preparar();
}

function carregarCenario(id) {
  const cenario = CENARIOS[id];
  estado.cenarioId = id;
  estado.mapa = cenario.mapa.map((linha) => linha.split(""));
  estado.resultados = {};
  el("titulo-cenario").textContent = cenario.nome;
  el("descricao-cenario").textContent = cenario.descricao;
  montarGrade();
  preparar();
}

function editarCelula(l, c) {
  const ferramenta = document.querySelector('input[name="ferramenta"]:checked').value;
  const atual = estado.mapa[l][c];

  if (ferramenta === "#") {
    if (atual === "S" || atual === "E") return; // não apaga origem/destino
    estado.mapa[l][c] = atual === "#" ? "." : "#";
  } else {
    // só pode existir um S e um E: remove o antigo antes
    for (const linha of estado.mapa) {
      for (let j = 0; j < linha.length; j++) {
        if (linha[j] === ferramenta) linha[j] = ".";
      }
    }
    estado.mapa[l][c] = ferramenta;
  }

  if (estado.cenarioId !== "customizado") {
    el("titulo-cenario").textContent = CENARIOS[estado.cenarioId].nome + " (editado)";
  }
  estado.resultados = {};
  preparar();
}

// ---------- Eventos ----------
el("btn-bfs").addEventListener("click", () => trocarAlgoritmo("bfs"));
el("btn-dfs").addEventListener("click", () => trocarAlgoritmo("dfs"));
el("btn-play").addEventListener("click", executar);
el("btn-step").addEventListener("click", proximoPasso);
el("btn-pause").addEventListener("click", () => { pausar(); atualizarBotoes(); });
el("btn-reset").addEventListener("click", reiniciar);

el("velocidade").addEventListener("input", () => {
  if (estado.timer !== null) { pausar(); executar(); } // aplica a nova velocidade
});

document.querySelectorAll("[data-cenario]").forEach((botao) =>
  botao.addEventListener("click", () => carregarCenario(botao.dataset.cenario)));

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" && estado.timer === null) proximoPasso();
});

// ---------- Início ----------
carregarCenario("comparativo");