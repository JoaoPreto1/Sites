<div align="center">

<img src="public/favicon.svg" alt="Bairro" width="72">

# Bairro

**Estúdio de design no Porto, com o site inteiro feito como um ambiente de trabalho antigo: cada página é uma janela que se arrasta, minimiza e maximiza**

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-d63aff?style=flat-square&logo=jsonwebtokens&logoColor=white)
![express-validator](https://img.shields.io/badge/Validação-express--validator-000000?style=flat-square&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![Lighthouse](https://img.shields.io/badge/Lighthouse-99%2B%20·%20100%20·%20100%20·%20100-0cce6b?style=flat-square&logo=lighthouse&logoColor=white)

[Funcionalidades](#-funcionalidades) · [O ambiente de trabalho](#️-o-ambiente-de-trabalho) · [Capturas](#-capturas) · [Tecnologias](#-tecnologias) · [SEO e desempenho](#-seo-e-desempenho) · [Como pôr a correr](#-como-pôr-a-correr) · [API](#-api)

</div>

<br>

![Página inicial do Bairro, com as janelas de boas-vindas, equipa, projeto em destaque e bloco de notas](docs/capa.jpg)

## 🗂️ Sobre o projeto

O Bairro é um **estúdio de design com três pessoas e um gato**, num segundo andar da Rua do Almada, no Porto. Faz marcas, sites, embalagens e cartazes para negócios pequenos.

Em vez de um site com menu em cima, fotografia grande e cartões, o site é um **ambiente de trabalho**. Há ícones de pastas e ficheiros, uma barra de menus com relógio e uma barra de tarefas. Cada página abre como uma janela: o portefólio é um **explorador de ficheiros**, cada projeto abre num **visualizador de imagens**, os preços são uma **folha de cálculo** que faz a conta, o pedido de orçamento é um **bloco de notas**, o manifesto está num **editor de texto** e há um **caixote do lixo** com as ideias más do estúdio.

Os links não recarregam a página: a janela nova abre por cima das outras e fica na barra de tarefas, e o endereço muda para o da página. Cada janela continua a ser uma página normal, desenhada no servidor, com título, descrição e dados estruturados próprios.

Funciona **sem base de dados**: os dados vivem em memória e já trazem 8 projetos, a equipa, vagas por mês, pedidos de orçamento e um trabalho em curso com provas e mensagens. O backend está completo: login com JWT, pedidos de orçamento com estimativa calculada no servidor, provas para o cliente aprovar, mensagens e painel do estúdio.

## ✨ Funcionalidades

<table>
  <tr>
    <th width="33%">Para quem visita</th>
    <th width="33%">Para o cliente</th>
    <th width="33%">Para o estúdio</th>
  </tr>
  <tr valign="top">
    <td>
      • Janelas que se arrastam, minimizam e maximizam<br>
      • Abrir páginas sem recarregar, com barra de tarefas<br>
      • Explorador de projetos com pastas, procura e vista em lista<br>
      • Visualizador com fotografias, propriedades e paleta<br>
      • Equipa e vagas para começar em cada mês<br>
      • Folha de preços que calcula a estimativa<br>
      • Pedido de orçamento no bloco de notas<br>
      • Manifesto, caixote do lixo e cor do fundo à escolha
    </td>
    <td>
      • Criar conta (os pedidos com o mesmo email aparecem logo)<br>
      • Progresso do projeto por fases<br>
      • Aprovar provas ou pedir alterações com comentário<br>
      • Mensagens com a equipa<br>
      • Os meus pedidos de orçamento<br>
      • Faturas<br>
      • Dados e palavra-passe
    </td>
    <td>
      • Pedidos de orçamento com estado e estimativa<br>
      • Passar um pedido a trabalho<br>
      • Mudar a fase de cada trabalho<br>
      • Enviar provas ao cliente e responder a mensagens<br>
      • Publicar e destacar projetos do portefólio<br>
      • Vagas de cada mês
    </td>
  </tr>
</table>

## 🖥️ O ambiente de trabalho

- **Cada página é uma janela.** O servidor desenha a janela principal da página (e, na página inicial, mais três janelas e um post-it). Sem JavaScript o site funciona como qualquer outro: os links abrem páginas.
- **Abrir sem recarregar.** Com JavaScript, um clique num link vai buscar a página ao servidor, tira de lá a janela principal e põe-na em cima das outras, em cascata. O endereço, o título e o botão de voltar atrás funcionam como numa página normal. Se a janela já está aberta, passa para a frente.
- **Gestor de janelas** (`public/js/os/wm.js`): arrastar pela barra de título, duplo clique para maximizar, minimizar para a barra de tarefas, fechar, foco ao clicar. As posições ficam guardadas durante a sessão.
- **Cada janela traz o seu script**: o explorador procura e muda de vista, o visualizador troca de fotografia com as setas, a folha de cálculo faz a conta, o bloco de notas envia o pedido. Os scripts só carregam quando a janela abre.
- **No telemóvel** as janelas empilham-se e não se arrastam, os ícones ficam numa fila no topo e a barra de tarefas continua em baixo.
- **Ícones desenhados em CSS** (pastas, ficheiros, folha de cálculo, lixo), sem imagens.
- **Definições**: a cor e o padrão do fundo mudam e ficam guardados no browser.

## 📸 Capturas

| Várias janelas abertas | Projetos |
|---|---|
| ![Várias janelas abertas](docs/janelas.jpg) | ![Projetos](docs/projetos.jpg) |
| **Um projeto** | **Equipa e vagas** |
| ![Projeto](docs/projeto.jpg) | ![Equipa](docs/equipa.jpg) |
| **Folha de preços** | **Pedir orçamento** |
| ![Preços](docs/precos.jpg) | ![Orçamento](docs/orcamento.jpg) |
| **Manifesto** | **Ideias más** |
| ![Manifesto](docs/manifesto.jpg) | ![Lixo](docs/lixo.jpg) |
| **Entrar** | **Ficheiro não encontrado** |
| ![Entrar](docs/entrar.jpg) | ![Erro](docs/erro.jpg) |
| **O meu projeto** | **Provas** |
| ![Conta](docs/conta.jpg) | ![Provas](docs/provas.jpg) |
| **Mensagens** | **Gestor de tarefas** |
| ![Mensagens](docs/mensagens.jpg) | ![Painel](docs/painel.jpg) |

<details>
<summary><strong>Trabalhos no gestor de tarefas</strong></summary>

![Trabalhos](docs/painel-trabalhos.jpg)

</details>

### 📱 No telemóvel

Todas as páginas são responsivas (testadas de 360 px a 1920 px).

<p align="center">
  <img src="docs/telemovel.jpg" alt="Página inicial no telemóvel" width="240">
  &nbsp;
  <img src="docs/telemovel-projetos.jpg" alt="Projetos no telemóvel" width="240">
</p>

## 🧰 Tecnologias

| | Tecnologia | Para quê |
|---|---|---|
| ⚙️ | **Node.js 22+** e **Express 5** | Servidor, API e páginas desenhadas no servidor |
| 🔐 | **jsonwebtoken** e **bcryptjs** | Login com access token e refresh token, palavras-passe cifradas |
| 🛡️ | **helmet**, **express-rate-limit**, **cors** | Cabeçalhos de segurança, CSP e limite de tentativas e de pedidos de orçamento |
| ✅ | **express-validator** | Validação de todos os pedidos, com mensagens em português |
| 🎨 | **HTML, CSS e JavaScript** | Frontend sem build; a tabela de preços e a estimativa são o mesmo módulo no servidor e no browser |
| 🗜️ | **compression** | Respostas comprimidas com gzip |
| 🔤 | **Pixelify Sans** e **IBM Plex Mono** | Tipografia, servida pelo próprio site (só os caracteres latinos) |

## 📈 SEO e desempenho

Resultados do Lighthouse 12 (telemóvel com rede 4G lenta simulada / computador):

| Página | Desempenho | Acessibilidade | Boas práticas | SEO |
|---|:---:|:---:|:---:|:---:|
| Início | 99 / 100 | 100 | 100 | 100 |
| Projetos | 100 | 100 | 100 | 100 |
| Um projeto | 99 / 100 | 100 | 100 | 100 |
| Equipa | 100 / 100 | 100 | 100 | 100 |
| Preços | 100 / 100 | 100 | 100 | 100 |
| Pedir orçamento | 100 | 100 | 100 | 100 |
| Manifesto | 100 | 100 | 100 | 100 |

**SEO**

- Todas as páginas públicas são desenhadas no servidor, com o `h1` no corpo da janela principal.
- Título, descrição, `canonical`, Open Graph e Twitter Card em cada página; cada projeto usa a primeira fotografia como imagem de partilha. As pastas de cada categoria (`/projetos?categoria=embalagem`) têm título e descrição próprios.
- Dados estruturados (JSON-LD): `ProfessionalService` com morada, horário e equipa, `CreativeWork` para cada projeto, `ItemList` do portefólio, `AboutPage` com as pessoas, `OfferCatalog` com os preços de cada serviço, `FAQPage` e `BreadcrumbList`.
- `/sitemap.xml` gerado a partir dos projetos publicados e `/robots.txt` que deixa de fora a API, a área de cliente, o painel e as definições.
- O endereço público vem de `SITE_URL` no `.env`.

**Desempenho e acessibilidade**

- Todo o CSS num só pedido (as janelas podem abrir em qualquer página), com cache longa em produção.
- Duas fontes pequenas (8 KB e 15 KB) com `preload`, `font-display: optional` e fonte de reserva com as mesmas medidas, para o texto não saltar.
- Fotografias com `srcset`, `sizes` e dimensões; a primeira de cada página é pré-carregada.
- Os scripts de cada janela só carregam quando ela abre.
- Contraste AA, navegação por teclado (botões das janelas, separadores, visualizador com setas), foco visível e `prefers-reduced-motion`.

## 🚀 Como pôr a correr

Precisa do [Node.js](https://nodejs.org) 22 ou mais recente.

```bash
cd bairro
npm install
cp .env.example .env
npm run dev
```

Abrir **<http://localhost:3005>**. O `npm run dev` reinicia o servidor sempre que um ficheiro muda; em produção usar `npm start`.

### Contas de demonstração

Todas com a palavra-passe `bairro123`.

| Email | Perfil | Para ver |
|---|---|---|
| `cliente@bairro.pt` | Cliente | Café Lusco-Fusco: projeto na fase de esboços, duas provas à espera, mensagens e faturas |
| `admin@bairro.pt` | Estúdio | Gestor de tarefas |

> [!NOTE]
> Os dados estão em memória, por isso tudo volta ao estado inicial quando o servidor reinicia.

## 🔌 API

Todas as rotas começam por `/api`. As marcadas com 🔒 precisam do cabeçalho `Authorization: Bearer <accessToken>`.

<details>
<summary><strong>Autenticação</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Criar conta (junta os pedidos feitos com o mesmo email) |
| POST | `/auth/login` | Entrar |
| POST | `/auth/refresh` | Novo access token a partir do cookie de refresh |
| POST | `/auth/logout` | Terminar sessão |
| GET / PATCH | `/auth/me` 🔒 | Ver e editar nome, negócio e telefone |
| PATCH | `/auth/me/password` 🔒 | Mudar a palavra-passe |

</details>

<details>
<summary><strong>Estúdio e orçamentos</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| GET | `/projetos?categoria` | Projetos publicados e contagem por categoria |
| GET | `/projetos/:slug` | Projeto com imagens, texto, paleta e vizinhos |
| GET | `/equipa` | Equipa e vagas dos próximos meses |
| GET | `/servicos` | Serviços, extras e valores aproximados |
| POST | `/orcamento/estimativa` | Estimativa para uma lista de serviços e extras |
| POST | `/pedidos` | Pedido de orçamento (com ou sem sessão, limite por hora) |
| GET | `/pedidos/meus` 🔒 | Os meus pedidos |

</details>

<details>
<summary><strong>Trabalhos</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| GET | `/trabalhos` 🔒 | Os meus trabalhos, com fases, provas, mensagens e faturas |
| GET | `/trabalhos/:id` 🔒 | Um trabalho |
| PATCH | `/trabalhos/:id/provas/:proofId` 🔒 | Aprovar ou pedir alterações (com comentário) |
| POST | `/trabalhos/:id/mensagens` 🔒 | Enviar mensagem |

</details>

<details>
<summary><strong>Painel do estúdio</strong> (só perfil <code>admin</code>)</summary>

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/resumo` 🔒 | Pedidos novos, trabalhos em curso, provas à espera e próxima vaga |
| GET | `/admin/pedidos?estado` 🔒 | Pedidos de orçamento |
| PATCH | `/admin/pedidos/:id` 🔒 | Mudar estado ou nota |
| POST | `/admin/pedidos/:id/trabalho` 🔒 | Passar um pedido a trabalho (o cliente precisa de conta) |
| GET | `/admin/trabalhos` 🔒 | Todos os trabalhos |
| PATCH | `/admin/trabalhos/:id` 🔒 | Mudar a fase |
| POST | `/admin/trabalhos/:id/provas` 🔒 | Enviar uma prova ao cliente |
| GET / PATCH | `/admin/projetos[/:id]` 🔒 | Publicar e destacar projetos |
| GET / PATCH | `/admin/vagas[/:id]` 🔒 | Vagas de cada mês |

</details>
