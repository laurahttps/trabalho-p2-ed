# Trabalho P2 — Estrutura de Dados

## 🎥 Vídeo explicativo: [ASSISTIR AQUI] https://youtu.be/VyAuVUoL91w

| | |
|---|---|
| **Aluna** | Laura Muniz de Castro |
| **RA** | 2840482521035 |
| **Tema** | **D — Grafos: Travessias — Busca em Largura (BFS) vs. Busca em Profundidade (DFS)** |
| **Disciplina** | Estrutura de Dados — ADS — Fatec Ribeirão Preto (2026.2) |
| **Professor** | Eduardo Cruz Araujo |

---

## 📁 Estrutura do projeto

```
trabalho-p2-ed/
├── README.md
└── src/
    ├── algoritmo.py        # BFS e DFS em Python + 3 cenários de teste
    └── demo/
        ├── index.html      # Interface do simulador
        ├── styles.css      # Estilos e animações
        └── app.js          # Lógica da simulação passo a passo
```

**Como executar:**
- **Python:** dentro da pasta `src`, rode `python algoritmo.py`.
- **Simulador:** abra o arquivo `src/demo/index.html` direto no navegador (não precisa instalar nada).

---

## 📚 Resumo teórico

### O problema
BFS e DFS são algoritmos para **percorrer um grafo** e encontrar um caminho entre uma **origem** e um **destino**.

Neste trabalho, o grafo é um **labirinto em grade**:
- cada casa livre é um **nó (vértice)**, identificado por `(linha, coluna)`;
- casas vizinhas (cima, baixo, esquerda, direita) são ligadas por **arestas**;
- paredes (`#`) não viram nós;
- o grafo é guardado como **lista de adjacência**: um dicionário em que cada nó aponta para a lista dos seus vizinhos.

### BFS — Busca em Largura (usa FILA)
A BFS usa uma **fila (FIFO)**: o primeiro que entra é o primeiro que sai, como numa fila de banco.

1. A origem entra na fila.
2. Enquanto a fila não estiver vazia, tira o **primeiro** da fila.
3. Se ele for o destino, o caminho é reconstruído e a busca termina.
4. Se não for, os vizinhos que ainda não foram visitados são marcados, anotados no `veio_de` (quem chamou quem) e colocados no **fim** da fila.

Como a fila atende primeiro quem está mais perto da origem, a BFS explora o grafo **em camadas de distância** (primeiro tudo a 1 passo, depois tudo a 2 passos...). Por isso, **em grafos sem peso, ela sempre encontra o menor caminho**.

### DFS — Busca em Profundidade (usa PILHA)
A DFS usa uma **pilha (LIFO)**: o último que entra é o primeiro que sai, como uma pilha de pratos.

O funcionamento é quase igual ao da BFS, mas, como ela sempre pega o **último** nó empilhado, ela **mergulha** em um caminho até o fim antes de voltar (*backtracking*). Ela encontra **um** caminho, mas **não necessariamente o menor**.

### Reconstrução do caminho
Durante a busca, cada nó guarda em `veio_de` quem o chamou. No final, o caminho é montado seguindo essas anotações **de trás para frente**, do destino até a origem.

### Onde são usados no mundo real
- **BFS:** encontrar rotas com o menor número de paradas, "amigos de amigos" em redes sociais, personagens de jogos andando em mapas de grade, robôs que navegam a web (*web crawlers*).
- **DFS:** resolver e gerar labirintos, detectar ciclos, organizar a ordem de instalação de dependências de programas, percorrer pastas e subpastas no computador.

---

## ⏱️ Complexidade assintótica

V = número de nós (vértices) | E = número de arestas

| Caso | Tempo (BFS e DFS) | Espaço auxiliar (BFS e DFS) | Quando acontece |
|---|---|---|---|
| **Melhor caso** | O(1) | O(1) | O destino é a própria origem: é encontrado na primeira retirada da fila/pilha. |
| **Caso médio** | O(V + E) | O(V) | O destino é encontrado depois de explorar uma parte do grafo. |
| **Pior caso** | O(V + E) | O(V) | O destino está o mais longe possível ou **não existe caminho**. |

**Por que o pior caso é O(V + E)?**
Quando o destino está muito longe (ou não pode ser alcançado), o algoritmo precisa **visitar todos os nós** (cada um entra e sai da fila/pilha no máximo uma vez → V) e **olhar a lista de vizinhos de cada um** (cada aresta é verificada dos dois lados → 2E). Somando, o custo é proporcional a **V + E**.

**Espaço auxiliar:** a fila/pilha, o conjunto de visitados e o dicionário `veio_de` guardam no máximo um registro por nó → O(V).
*Observação:* na DFS iterativa, um nó pode entrar mais de uma vez na pilha (por isso existe a verificação `if atual in visitados: continue`). No pior caso, a pilha pode ter até E itens. Mas em um labirinto em grade cada casa tem no máximo 4 vizinhos (E ≤ 2V), então o espaço continua sendo O(V).

### Comparação BFS × DFS

| | BFS | DFS |
|---|---|---|
| Estrutura usada | Fila (FIFO) | Pilha (LIFO) |
| Forma de explorar | Em camadas (largura) | Mergulha num caminho (profundidade) |
| Garante o menor caminho (sem peso)? | ✅ Sim | ❌ Não |
| Tempo | O(V + E) | O(V + E) |

### Resultados dos testes (`algoritmo.py`)

| Cenário | BFS | DFS |
|---|---|---|
| **1. BFS vs. DFS** (destino a 2 passos) | Caminho de **2 passos**, 4 nós visitados, 6 arestas verificadas | Caminho de **10 passos**, 11 nós visitados, 20 arestas verificadas |
| **2. Sem caminho** (caso de borda) | Nenhum caminho, 4 nós visitados, 8 arestas verificadas | Nenhum caminho, 4 nós visitados, 8 arestas verificadas |
| **3. Pior caso** (grade aberta 5×5, V = 25, E = 40) | Caminho de **8 passos**, 25 nós visitados, 78 arestas verificadas | Caminho de **24 passos**, 25 nós visitados, 78 arestas verificadas |

No pior caso, os dois algoritmos visitaram **todos os 25 nós**, comprovando o custo O(V + E). Mesmo assim, a BFS encontrou o caminho mínimo (8 passos), enquanto a DFS encontrou um caminho de 24 passos.

---

## 🤖 Diário de Engenharia com IA

### Ferramenta utilizada
**Claude** (Anthropic), modelo **Claude Opus 5.5**, usado pelo chat do claude.ai.

### 3 principais prompts

**1. Para entender os temas e escolher um:**
> "Preciso criar um projeto do zero, quero fazer em Python (até pra aprender) e preciso de ajuda pra escolher os temas. Como eu realmente quero aprender, queria entender o que cada tema (dos 5 temas) que o professor colocou significa. Tenha em mente que sou iniciante em Python."

**2. Para gerar o código e o simulador:**
> "Agora manda todos os códigos, de py, html, css e js."
(depois de escolher o Tema D com o labirinto e definir a estrutura de pastas pedida pelo professor)

**3. Para aprender o passo a passo da BFS:**
> "Não entendi nada desse BFS explicando cada passo. Vou tentar explicar o que entendi: o S é a origem e o E o destino, que está a 2 passos. O próximo passo adiciona dois 1 mais próximos de S, ou seja, o S chama esses dois..."

Com esse prompt, a IA corrigiu a minha explicação e me mostrou que a cor **laranja** no simulador é o nó sendo atendido (saindo da fila), a **amarela** é quem acabou de entrar, e que cada número é "o número de quem chamou + 1".

### Erros, limitações e ajustes manuais

1. **Explicação imprecisa da IA:** ao explicar como o caminho é reconstruído, a IA disse que uma das casas "não entra no caminho porque ninguém veio dela", o que me fez entender que ela nem tinha sido chamada para a fila. Eu questionei ("se ela não foi chamada, como entrou na fila?") e a IA reconheceu que tinha se expressado mal. Ela então explicou a diferença entre a **ordem de atendimento** (S → B → A → E) e o **caminho final** (S → B → E), que é montado seguindo "quem chamou quem" no `veio_de`.

2. **Explicação técnica demais para iniciante:** a primeira explicação do passo a passo usava só coordenadas como `(1,0)` e `(0,1)` e ficou difícil de acompanhar. Pedi uma explicação mais simples, e a IA passou a usar analogias (fila de banco para a BFS, pilha de pratos para a DFS) e nomes simples para as casas.

3. **Ajuste manual no projeto:** na primeira vez que abri o simulador, a página apareceu sem nenhuma formatação, porque o arquivo `styles.css` não tinha sido salvo corretamente no VS Code. Precisei conferir o arquivo, salvar e recarregar a página com Ctrl+F5.