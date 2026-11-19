"""
Tema D — Grafos: Busca em Largura (BFS) vs. Busca em Profundidade (DFS)

O labirinto é transformado em um grafo:
  - cada casa livre é um NÓ, identificado por (linha, coluna);
  - casas vizinhas (cima, baixo, esquerda, direita) são ligadas por ARESTAS;
  - o grafo é guardado como LISTA DE ADJACÊNCIA (dicionário: nó -> lista de vizinhos).

Símbolos do labirinto:  S = origem | E = destino | # = parede | . = livre

BFS usa uma FILA (FIFO) e garante o menor caminho em grafos sem peso.
DFS usa uma PILHA (LIFO) e acha um caminho, mas não necessariamente o menor.
Complexidade das duas: tempo O(V + E), espaço O(V).
"""

from collections import deque  

Celula = tuple[int, int]  

class Grafo:

    def __init__(self) -> None:

        self.adj: dict[Celula, list[Celula]] = {}
        self.nos_visitados: int = 0        
        self.arestas_verificadas: int = 0  

    def num_vertices(self) -> int:

        return len(self.adj)

    def num_arestas(self) -> int:

        total = 0
        for vizinhos in self.adj.values():
            total += len(vizinhos)
        return total // 2

    def _zerar_contadores(self) -> None:

        self.nos_visitados = 0
        self.arestas_verificadas = 0

    def _reconstruir_caminho(self, veio_de: dict[Celula, Celula | None],
                             destino: Celula) -> list[Celula]:
        caminho = []
        atual = destino
        while atual is not None:
            caminho.append(atual)
            atual = veio_de[atual]
        caminho.reverse()
        return caminho

    def bfs(self, origem: Celula, destino: Celula,
            mostrar_passos: bool = False) -> list[Celula]:
        self._zerar_contadores()
        fila = deque([origem])
        visitados = {origem}               
        veio_de: dict[Celula, Celula | None] = {origem: None}

        while len(fila) > 0:
            if mostrar_passos:
                print(f"  Fila: {list(fila)} -> tira {fila[0]}")
            atual = fila.popleft()         
            self.nos_visitados += 1

            if atual == destino:
                return self._reconstruir_caminho(veio_de, destino)

            for vizinho in self.adj[atual]:
                self.arestas_verificadas += 1
                if vizinho not in visitados:
                    visitados.add(vizinho)
                    veio_de[vizinho] = atual
                    fila.append(vizinho)   

        return []  

    def dfs(self, origem: Celula, destino: Celula,
            mostrar_passos: bool = False) -> list[Celula]:

        self._zerar_contadores()
        pilha = [origem]
        visitados: set[Celula] = set()     
        veio_de: dict[Celula, Celula | None] = {origem: None}

        while len(pilha) > 0:
            if mostrar_passos:
                print(f"  Pilha: {pilha} -> tira {pilha[-1]}")
            atual = pilha.pop()            

            if atual in visitados:         
                continue                   

            visitados.add(atual)
            self.nos_visitados += 1

            if atual == destino:
                return self._reconstruir_caminho(veio_de, destino)

            for vizinho in self.adj[atual]:
                self.arestas_verificadas += 1
                if vizinho not in visitados:
                    veio_de[vizinho] = atual
                    pilha.append(vizinho)  

        return []  


def criar_grafo_do_labirinto(labirinto: list[str]) -> tuple[Grafo, Celula, Celula]:

    grafo = Grafo()
    origem: Celula = (0, 0)
    destino: Celula = (0, 0)
    linhas = len(labirinto)
    colunas = len(labirinto[0])
    direcoes = [(-1, 0), (1, 0), (0, -1), (0, 1)]  

    for lin in range(linhas):
        for col in range(colunas):
            simbolo = labirinto[lin][col]
            if simbolo == "#":
                continue                   
            if simbolo == "S":
                origem = (lin, col)
            if simbolo == "E":
                destino = (lin, col)

            grafo.adj[(lin, col)] = []
            for d_lin, d_col in direcoes:
                n_lin = lin + d_lin
                n_col = col + d_col
                dentro = 0 <= n_lin < linhas and 0 <= n_col < colunas
                if dentro and labirinto[n_lin][n_col] != "#":
                    grafo.adj[(lin, col)].append((n_lin, n_col))

    return grafo, origem, destino


def desenhar(labirinto: list[str], caminho: list[Celula]) -> None:
    for lin in range(len(labirinto)):
        texto = ""
        for col in range(len(labirinto[lin])):
            simbolo = labirinto[lin][col]
            if (lin, col) in caminho and simbolo == ".":
                simbolo = "*"
            texto += simbolo + " "
        print("  " + texto)


def mostrar_resultado(nome: str, labirinto: list[str],
                      caminho: list[Celula], grafo: Grafo) -> None:
    print(f"--- {nome} ---")
    desenhar(labirinto, caminho)
    if len(caminho) == 0:
        print("  Nenhum caminho encontrado!")
    else:
        print(f"  Caminho com {len(caminho) - 1} passos")
    print(f"  Nós visitados: {grafo.nos_visitados} | "
          f"Arestas verificadas: {grafo.arestas_verificadas}\n")


def rodar_cenario(titulo: str, labirinto: list[str],
                  mostrar_passos: bool = False) -> None:

    print(f"===== {titulo} =====")
    grafo, origem, destino = criar_grafo_do_labirinto(labirinto)
    print(f"V = {grafo.num_vertices()} nós | E = {grafo.num_arestas()} arestas\n")

    caminho = grafo.bfs(origem, destino, mostrar_passos)
    mostrar_resultado("BFS (fila)", labirinto, caminho, grafo)

    caminho = grafo.dfs(origem, destino, mostrar_passos)
    mostrar_resultado("DFS (pilha)", labirinto, caminho, grafo)


if __name__ == "__main__":

    rodar_cenario("Cenário 1: BFS vs. DFS", [
        "S....",
        ".###.",
        "E....",
    ], mostrar_passos=True)


    rodar_cenario("Cenário 2: Sem caminho", [
        "S.#",
        "..#",
        "##E",
    ])

    rodar_cenario("Cenário 3: Pior caso (grade aberta)", [
        "S....",
        ".....",
        ".....",
        ".....",
        "....E",
    ])