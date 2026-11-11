# Sites

Coleção de sites prontos a usar, **sem base de dados**, mas com toda a lógica de backend já preparada (autenticação JWT, rotas, validação, permissões). Basta trocar a camada de dados por uma base de dados real quando for preciso.

Cada site vive na sua própria pasta e tem um `README.md` com o tipo de site, a stack, capturas do design e como o pôr a correr.

## Sites

| Site | Pasta | Estado |
|---|---|---|
| Maré — alojamento local | [`mare/`](mare/) | Pronto |

### Lista de espera

1. **Lente Studio** — portefólio de fotografia com galerias privadas para clientes ([design](ideias/11-estudio-criativo/design.png))

## Estrutura

```
Sites/
├── ideias/                 # Mockups de design das ideias (antes de serem construídas)
├── <nome-do-site>/         # Um site por pasta
│   ├── README.md
│   ├── docs/               # Imagens do design usadas no README
│   ├── public/             # Frontend (HTML, CSS, JS)
│   ├── src/
│   │   ├── config/         # Variáveis de ambiente
│   │   ├── middleware/     # auth (JWT), roles, erros, validação
│   │   ├── routes/         # Endpoints da API
│   │   ├── controllers/    # Lógica de cada rota
│   │   ├── services/       # Regras de negócio
│   │   ├── repositories/   # Acesso a dados (memória → trocar por BD)
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Padrão comum a todos os sites

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express |
| Autenticação | JWT (access token + refresh token), `bcryptjs` para passwords |
| Segurança | `helmet`, `cors`, `express-rate-limit` |
| Validação | `zod` |
| Dados | Repositórios em memória com dados de exemplo (seed) |
| Frontend | HTML, CSS e JavaScript sem build, servido pelo Express |

### Ligar uma base de dados mais tarde

Toda a leitura e escrita passa por `src/repositories/`. Cada repositório expõe os mesmos métodos (`findAll`, `findById`, `create`, `update`, `remove`), por isso basta reescrever esse ficheiro com MongoDB, PostgreSQL, MySQL, etc. sem mexer em rotas, controllers ou frontend.

## Como correr um site

```bash
cd <nome-do-site>
npm install
cp .env.example .env
npm run dev
```

Depois abrir `http://localhost:3000`.
