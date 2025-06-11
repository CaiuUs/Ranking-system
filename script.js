// --- Variáveis Globais ---
let usuario = null;
const senhaAdmin = "40028922"; // Senha do administrador
const totalCategorias = 13;

const nomesCategorias = [
   "MAIS CANCELAVEL",
   "MAIS CHATO",
   "MAIS FRESCO",
   "PIOR VIDA AMOROSA",
   "MAIS CHANCE DE MORRER EM UM APOCALIPSE ZUMBI",
   "MAIS CHANCE DE SER PRESO",
   "MAIS ESTRESSADO",
   "MAIS SOCIAVEL",
   "MAIS CHANCE DE SUMIR SEM DAR SINAL DE VIDA",
   "MAIS IDIOTA",
   "MAIS NERD",
   "O QUE DA MAIS MIGUE",
   "MAIS MENTIROSO"
];

let nomes = [
   // Nomes e URLs de foto padrão. Podem ser atualizados pelo admin.
   { nome: "Caius", foto: "https://i.pinimg.com/736x/6f/07/59/6f0759934145d03591c2625767febd10.jpg" },
   { nome: "Carlos", foto: "https://i.pinimg.com/736x/92/41/92/924192b2cdbec6802e7fe4229e2e1bd9.jpg" },
   { nome: "Erick", foto: "https://i.pinimg.com/736x/25/4c/7d/254c7d3e4737995ddd5292a3450f70ca.jpg" },
   { nome: "Fabio", foto: "https://i.pinimg.com/736x/97/4a/c2/974ac289ec53afaae46d4a45c94aeb64.jpg" },
   { nome: "João", foto: "https://i.pinimg.com/736x/2b/46/0f/2b460fdf3ac5fada7d10f7c542b9508b.jpg" },
   { nome: "Alexandre", foto: "https://i.pinimg.com/736x/ae/d6/9e/aed69ec2fb9500717039a3a9dd9c195e.jpg" },
   { nome: "Roann", foto: "https://i.pinimg.com/736x/06/a2/93/06a293e84115a3e894ea800e1aba1457.jpg" },
   { nome: "Marquin", foto: "https://i.pinimg.com/736x/c8/05/83/c80583d4410bcd1bd6cce620087b40e0.jpg" },
   { nome: "Hugo", foto: "https://i.pinimg.com/736x/26/8f/14/268f142a8dd75e137488bdca2ade97be.jpg" },
   { nome: "Melissa", foto: "https://i.pinimg.com/736x/20/b6/b0/20b6b051bac36247597614e9c84da361.jpg" },
];

// --- Funções de Inicialização e Autenticação ---

/**
 * Carrega os nomes e fotos dos ranqueados do LocalStorage.
 * Se não houver dados salvos, usa a lista padrão 'nomes'.
 */
function carregarNomesRanqueados() {
   const nomesSalvos = localStorage.getItem('nomesRanqueados');
   if (nomesSalvos) {
      nomes = JSON.parse(nomesSalvos);
   }
}

/**
 * Salva a lista atual de nomes e fotos dos ranqueados no LocalStorage.
 */
function salvarNomesRanqueados() {
   localStorage.setItem('nomesRanqueados', JSON.stringify(nomes));
}

/**
 * Realiza o processo de login do usuário ou administrador.
 */
function login() {
   const nomeInput = document.getElementById("nomeUsuario");
   const senhaInput = document.getElementById("senhaUsuario");
   const nome = nomeInput.value.trim();
   const senha = senhaInput.value;

   if (!nome) {
      alert("Por favor, informe seu nome.");
      return;
   }

   usuario = nome;
   document.getElementById("login-area").style.display = "none";
   document.getElementById("logout-area").style.display = "block";
   document.getElementById("usuarioAtual").textContent = nome;

   carregarNomesRanqueados(); // Carrega nomes e fotos ao logar

   if (nome.toLowerCase() === "admin") {
      if (senha !== senhaAdmin) {
         alert("Senha de administrador incorreta.");
         location.reload(); // Recarrega a página em caso de senha incorreta
         return;
      }
      document.getElementById("admin-interface").style.display = "block";
      carregarTodosRankings();
      gerarInputsNomesCategorias(); // Gera inputs para edição de categorias
      preencherSelectRanqueados(); // Preenche select para edição de imagens
   } else {
      document.getElementById("interface-principal").style.display = "block";
      gerarAbas();
      // Carrega o ranking da primeira aba por padrão para o usuário
      if (totalCategorias > 0) {
         carregarRanking(1);
         atualizarNomesDisponiveis(1); // Atualiza os nomes disponíveis para a primeira aba
      }
   }
}

/**
 * Desloga o usuário e recarrega a página.
 */
function logout() {
   usuario = null; // Limpa o usuário logado
   localStorage.removeItem('loggedInUser'); // Se estiver salvando o estado de login
   location.reload();
}

// --- Funções de Administração ---

/**
 * Gera dinamicamente os inputs para edição dos nomes das categorias na interface de administração.
 */
function gerarInputsNomesCategorias() {
   const container = document.getElementById("category-name-inputs");
   container.innerHTML = ""; // Limpa inputs anteriores
   for (let i = 1; i <= totalCategorias; i++) {
      const divGroup = document.createElement("div");
      divGroup.style.marginBottom = "10px";

      const label = document.createElement("label");
      label.textContent = `Nome da Categoria ${i}:`;
      label.setAttribute("for", `inputCategoria${i}`);

      const input = document.createElement("input");
      input.type = "text";
      input.id = `inputCategoria${i}`;
      input.value = nomesCategorias[`categoria${i}`];

      divGroup.appendChild(label);
      divGroup.appendChild(input);
      container.appendChild(divGroup);
   }
}

/**
 * Preenche o dropdown (select) com os nomes dos ranqueados disponíveis para edição de imagem.
 */
function preencherSelectRanqueados() {
   const select = document.getElementById("selectNomeRanqueado");
   select.innerHTML = '<option value="">Selecione um ranqueado</option>';
   nomes.forEach(pessoa => {
      const option = document.createElement("option");
      option.value = pessoa.nome;
      option.textContent = pessoa.nome;
      select.appendChild(option);
   });
   mostrarImagemAtualRanqueado(); // Mostra a imagem do primeiro selecionado ou vazio
}

/**
 * Exibe a imagem atual do ranqueado selecionado no dropdown e preenche o input da URL.
 */
function mostrarImagemAtualRanqueado() {
   const select = document.getElementById("selectNomeRanqueado");
   const nomeSelecionado = select.value;
   const imagemPreview = document.getElementById("imagemAtualRanqueado");
   const novaUrlInput = document.getElementById("novaUrlImagem");

   if (nomeSelecionado) {
      const pessoa = nomes.find(p => p.nome === nomeSelecionado);
      if (pessoa) {
         imagemPreview.src = pessoa.foto;
         imagemPreview.style.display = "block";
         novaUrlInput.value = pessoa.foto; // Preenche com a URL atual
      } else {
         imagemPreview.src = "";
         imagemPreview.style.display = "none";
         novaUrlInput.value = "";
      }
   } else {
      imagemPreview.src = "";
      imagemPreview.style.display = "none";
      novaUrlInput.value = "";
   }
}

/**
 * Salva a nova URL da imagem para o ranqueado selecionado no LocalStorage.
 */
function salvarImagemRanqueado() {
   const select = document.getElementById("selectNomeRanqueado");
   const nomeSelecionado = select.value;
   const novaUrl = document.getElementById("novaUrlImagem").value.trim();

   if (!nomeSelecionado) {
      alert("Por favor, selecione um ranqueado para atualizar a imagem.");
      return;
   }
   if (!novaUrl) {
      alert("Por favor, insira uma URL de imagem válida.");
      return;
   }

   const pessoaIndex = nomes.findIndex(p => p.nome === nomeSelecionado);
   if (pessoaIndex !== -1) {
      nomes[pessoaIndex].foto = novaUrl;
      salvarNomesRanqueados(); // Salva a lista de nomes e fotos atualizada
      alert(`Imagem de ${nomeSelecionado} atualizada com sucesso!`);
      mostrarImagemAtualRanqueado(); // Atualiza a prévia da imagem
      carregarTodosRankings(); // Re-carrega rankings no admin para refletir as novas imagens
      // Se o admin sair e logar como usuário, as fotos serão atualizadas automaticamente
   } else {
      alert("Ranqueado não encontrado.");
   }
}

/**
 * Carrega e exibe todos os rankings de todos os usuários no painel de administração.
 */
function carregarTodosRankings() {
   const div = document.getElementById("todosRankings");
   div.innerHTML = "";

   const chaves = Object.keys(localStorage).filter(k => k.includes("_ranking"));
   const agrupadoPorUsuario = {};

   // Agrupa os rankings por usuário
   chaves.forEach(chave => {
      const [user, num] = chave.split("_ranking");
      const rankingKey = `ranking${num}`; // e.g., "ranking1", "ranking2"
      if (!agrupadoPorUsuario[user]) agrupadoPorUsuario[user] = {};
      agrupadoPorUsuario[user][rankingKey] = JSON.parse(localStorage.getItem(chave));
   });

   // Itera sobre cada usuário e seus rankings
   for (const user in agrupadoPorUsuario) {
      const userData = agrupadoPorUsuario[user];
      const userContainer = document.createElement("div");
      userContainer.className = "user-ranking-block"; // Adiciona uma classe para styling

      userContainer.innerHTML = `
                  <h3>Usuário: ${user} 
                        <button class="remover-ranking-btn" onclick="removerRankingUsuario('${user}')">Remover Todos Rankings</button>
                  </h3>
               `;

      for (const rankingKey in userData) {
         const categoriaIndex = parseInt(rankingKey.replace('ranking', ''));
         const nomeCategoria = nomesCategorias[`categoria${categoriaIndex}`] || `Ranking ${categoriaIndex}`;
         let listaHTML = "";
         userData[rankingKey].forEach((nome, i) => {
            const pessoa = nomes.find(p => p.nome === nome);
            const foto = pessoa ? `<img src="${pessoa.foto}" alt="${nome}" class="foto-perfil" style="width:30px;height:30px; border-color: transparent;">` : "";
            listaHTML += `<li class="pos-${i + 1}" style="font-size: 0.9em; padding: 8px;">${i + 1}º - ${foto} ${nome}</li>`;
         });
         userContainer.innerHTML += `
                        <div style="margin-top: 15px; border: 1px dashed #eee; padding: 10px; border-radius: 6px;">
                           <strong>${nomeCategoria}:</strong>
                           <ul style="margin-top: 5px;">${listaHTML}</ul>
                        </div>
                  `;
      }
      div.appendChild(userContainer);
   }

   mostrarRankingGlobal(); // Atualiza o ranking global também
}

/**
 * Remove todos os rankings de um usuário específico do LocalStorage.
 * @param {string} usuario - O nome do usuário cujos rankings serão removidos.
 */
function removerRankingUsuario(usuarioRemover) {
   if (confirm(`Tem certeza que deseja remover TODOS os rankings do usuário "${usuarioRemover}"? Esta ação é irreversível.`)) {
      const chaves = Object.keys(localStorage).filter(k => k.startsWith(`${usuarioRemover}_ranking`));
      chaves.forEach(chave => {
         localStorage.removeItem(chave);
      });
      alert(`Rankings de "${usuarioRemover}" removidos com sucesso!`);
      carregarTodosRankings(); // Atualiza a exibição após a remoção
   }
}

// --- Funções da Interface do Usuário (Rankings) ---

/**
 * Gera as abas de categoria dinamicamente com base nos nomes salvos.
 */
function gerarAbas() {
   const abasContainer = document.getElementById("abas");
   const conteudoAbasContainer = document.getElementById("conteudoAbas");
   abasContainer.innerHTML = "";
   conteudoAbasContainer.innerHTML = "";

   for (let i = 1; i <= totalCategorias; i++) {
      // Botão da Aba
      const btn = document.createElement("button");
      btn.textContent = nomesCategorias[i-1]; // Usa o nome do array
      btn.onclick = () => mudarAba(i);
      abasContainer.appendChild(btn);

      // Conteúdo da Aba
      const div = document.createElement("div");
      div.id = `ranking${i}`;
      div.className = "tab-content";
      if (i === 1) { // Ativa a primeira aba por padrão
         div.classList.add("active");
      }
      div.innerHTML = `
                  <h2>${nomesCategorias[i-1]}</h2>
                  <div class="nomes-disponiveis" id="nomesDisponiveis${i}"></div>
                  <ul id="lista${i}"></ul>
                  <button onclick="salvarRanking(${i})">Salvar Ranking</button>
               `;
      conteudoAbasContainer.appendChild(div);
   }
}
/**
 * Altera a aba visível e atualiza a lista de nomes disponíveis para a nova aba.
 * @param {number} n - O número da categoria a ser exibida.
 */
function mudarAba(n) {
   document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
   });
   document.getElementById(`ranking${n}`).classList.add('active');
   atualizarNomesDisponiveis(n);
   carregarRanking(n); // Garante que o ranking da aba selecionada seja carregado
}

/**
 * Atualiza a lista de nomes que ainda podem ser adicionados a um ranking específico.
 * @param {number} num - O número da categoria (ranking) a ser atualizado.
 */
function atualizarNomesDisponiveis(num) {
   const lista = document.getElementById(`lista${num}`);
   const nomesDiv = document.getElementById(`nomesDisponiveis${num}`);
   nomesDiv.innerHTML = "";

   const nomesJaAdicionados = Array.from(lista.children).map(li =>
      li.querySelector(".nome-container span").textContent
   );

   nomes.filter(pessoa => !nomesJaAdicionados.includes(pessoa.nome)).forEach(pessoa => {
      const nomeItem = document.createElement("div");
      nomeItem.className = "nome-item";
      nomeItem.innerHTML = `
                  <img src="${pessoa.foto}" alt="${pessoa.nome}" class="foto-perfil">
                  <span>${pessoa.nome}</span>
               `;
      nomeItem.onclick = () => adicionarNome(num, pessoa);
      nomesDiv.appendChild(nomeItem);
   });
}

/**
 * Adiciona um nome à lista de ranking de uma categoria específica.
 * @param {number} num - O número da categoria (ranking) onde o nome será adicionado.
 * @param {object} pessoa - O objeto da pessoa (nome e foto) a ser adicionada.
 */
function adicionarNome(num, pessoa) {
   const lista = document.getElementById(`lista${num}`);
   // Verifica se o nome já está na lista
   const nomesAtuais = Array.from(lista.children).map(li => li.querySelector(".nome-container span").textContent);
   if (nomesAtuais.includes(pessoa.nome)) {
      alert(`${pessoa.nome} já foi adicionado(a) a este ranking!`);
      return;
   }

   const li = document.createElement("li");
   li.innerHTML = `
               <span class="posicao">?</span>
               <div class="nome-container">
                  <img src="${pessoa.foto}" alt="${pessoa.nome}" class="foto-perfil">
                  <span>${pessoa.nome}</span>
               </div>
               <button class="remover-btn" onclick="removerNome(${num}, this)">Remover</button>
            `;
   lista.appendChild(li);
   atualizarPosicoes(num);
   atualizarNomesDisponiveis(num);
}

/**
 * Remove um nome da lista de ranking de uma categoria específica.
 * @param {number} num - O número da categoria (ranking) de onde o nome será removido.
 * @param {HTMLElement} btn - O botão de remoção clicado (para encontrar o elemento pai 'li').
 */
function removerNome(num, btn) {
   const li = btn.parentElement;
   li.remove();
   atualizarPosicoes(num);
   atualizarNomesDisponiveis(num);
}

/**
 * Atualiza as posições e as classes de estilo para cada item na lista de ranking.
 * @param {number} num - O número da categoria (ranking) a ser atualizado.
 */
function atualizarPosicoes(num) {
   const itens = document.getElementById(`lista${num}`).children;
   Array.from(itens).forEach((li, idx) => {
      const posicaoSpan = li.querySelector(".posicao");
      posicaoSpan.textContent = `${idx + 1}º`;

      // Remove classes de posição anteriores e adiciona a nova
      li.className = ""; // Limpa todas as classes
      li.classList.add(`pos-${idx + 1}`); // Adiciona a classe de cor baseada na posição
   });
}

/**
 * Salva o ranking atual de uma categoria específica no LocalStorage para o usuário logado.
 * @param {number} num - O número da categoria (ranking) a ser salvo.
 */
function salvarRanking(num) {
   const lista = document.getElementById(`lista${num}`);
   const nomesDoRanking = Array.from(lista.children).map(li =>
      li.querySelector(".nome-container span").textContent
   );
   localStorage.setItem(`${usuario}_ranking${num}`, JSON.stringify(nomesDoRanking));
   alert(`Ranking "${nomesCategorias[`categoria${num}`]}" salvo com sucesso!`);
}

/**
 * Carrega o ranking salvo de uma categoria específica do LocalStorage para o usuário logado.
 * @param {number} num - O número da categoria (ranking) a ser carregado.
 */
function carregarRanking(num) {
   const lista = document.getElementById(`lista${num}`);
   lista.innerHTML = ""; // Limpa a lista atual
   const data = localStorage.getItem(`${usuario}_ranking${num}`);
   if (data) {
      const rankingSalvo = JSON.parse(data);
      rankingSalvo.forEach(nomeSalvo => {
         const pessoa = nomes.find(p => p.nome === nomeSalvo); // Busca a foto correta
         if (pessoa) {
            const li = document.createElement("li");
            li.innerHTML = `
                           <span class="posicao">?</span>
                           <div class="nome-container">
                              <img src="${pessoa.foto}" alt="${pessoa.nome}" class="foto-perfil">
                              <span>${pessoa.nome}</span>
                           </div>
                           <button class="remover-btn" onclick="removerNome(${num}, this)">Remover</button>
                        `;
            lista.appendChild(li);
         }
      });
      atualizarPosicoes(num);
   }
   atualizarNomesDisponiveis(num);
}

/**
 * Calcula e exibe o Ranking Global, que agrega votos e posições de todos os usuários
 * para cada categoria.
 */
function mostrarRankingGlobal() {
   const divGlobal = document.getElementById("rankGlobalConteudo");
   divGlobal.innerHTML = "";

   // Estrutura para armazenar os dados de cada ranking por nome
   const dadosPorRanking = {};
   for (let i = 1; i <= totalCategorias; i++) {
      dadosPorRanking[`ranking${i}`] = {};
   }

   // Pega todas as chaves de ranking do localStorage
   const chavesRanking = Object.keys(localStorage).filter(k => k.includes("_ranking"));

   // Agrega os dados de todos os rankings de todos os usuários
   for (const chave of chavesRanking) {
      const [user, num] = chave.split("_ranking");
      const rankingKey = `ranking${num}`;
      const lista = JSON.parse(localStorage.getItem(chave));

      lista.forEach((nome, idx) => {
         if (!dadosPorRanking[rankingKey][nome]) {
            dadosPorRanking[rankingKey][nome] = { votos: 0, somaPosicoes: 0 };
         }
         dadosPorRanking[rankingKey][nome].votos += 1;
         dadosPorRanking[rankingKey][nome].somaPosicoes += (idx + 1); // Soma 1 para a posição baseada em 1
      });
   }

   // Gera o HTML para cada ranking global
   for (const rankingKey in dadosPorRanking) {
      const listaOrdenada = Object.entries(dadosPorRanking[rankingKey])
         .map(([nome, { votos, somaPosicoes }]) => ({
            nome,
            votos,
            media: (somaPosicoes / votos).toFixed(2), // Média das posições
            pessoa: nomes.find(p => p.nome === nome) // Busca a foto correta
         }))
         .sort((a, b) => {
            // Critério de ordenação: primeiro pela média de posição (menor é melhor),
            // depois pelo número de votos (maior é melhor em caso de empate na média).
            if (a.media !== b.media) {
               return a.media - b.media;
            }
            return b.votos - a.votos;
         });

      let htmlListaGlobal = "";
      if (listaOrdenada.length > 0) {
         listaOrdenada.forEach((item, i) => {
            const foto = item.pessoa ? `<img src="${item.pessoa.foto}" alt="${item.nome}" class="foto-perfil" style="width:30px;height:30px; border-color: transparent;">` : "";
            htmlListaGlobal += `<li class="pos-${i + 1}" style="font-size: 1em; padding: 10px;">
                                                <strong>${i + 1}º</strong> - ${foto} ${item.nome} 
                                                (Votos: ${item.votos}, Média Posição: ${item.media})
                                          </li>`;
         });
      } else {
         htmlListaGlobal = '<li>Nenhum voto registrado para esta categoria ainda.</li>';
      }

      const categoriaIndex = parseInt(rankingKey.replace('ranking', ''));
      const nomeCategoria = nomesCategorias[categoriaIndex-1] || `Ranking ${categoriaIndex}`;
      divGlobal.innerHTML += `
                  <div style="margin-bottom: 25px;">
                        <h3>${nomeCategoria}</h3>
                        <ul style="max-width: 600px; margin: 10px auto;">${htmlListaGlobal}</ul>
                  </div>
               `;
   }
}