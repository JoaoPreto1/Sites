<div align="center">

# Sites

**Sites prontos a usar, com backend completo e sem base de dados**

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-d63aff?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Validação-Zod-3e67b1?style=flat-square&logo=zod&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-f7df1e?style=flat-square&logo=javascript&logoColor=black)

</div>

<br>

Cada site vive na sua própria pasta e já traz login com JWT, rotas, validação e permissões por perfil. Os dados ficam em memória com exemplos, prontos a trocar por uma base de dados real quando for preciso. Cada pasta tem o seu `README.md` com capturas, funcionalidades e como pôr a correr.

## 🗂️ Sites

<table>
  <tr>
    <td width="50%"><a href="mare/"><img src="mare/docs/capa.jpg" alt="Maré" width="100%"></a></td>
    <td>
      <h3><a href="mare/">Maré</a></h3>
      <p>Casas de férias em Lagos, com reservas diretas, calendário de disponibilidade, experiências extra, área do hóspede e painel de gestão.</p>
      <p>✅ <strong>Pronto</strong></p>
    </td>
  </tr>
</table>

### ⏳ Lista de espera

| # | Site | Tipo |
|---|---|---|
| 1 | **Lente Studio** | Portefólio de fotografia com galerias privadas para clientes |

## 🧰 Base comum

| | Tecnologia |
|---|---|
| ⚙️ Servidor | Node.js 22+ e Express 5 |
| 🔐 Autenticação | JWT (access token + refresh token) e `bcryptjs` |
| 🛡️ Segurança | `helmet`, `cors` e `express-rate-limit` |
| ✅ Validação | `zod` |
| 🎨 Frontend | HTML, CSS e JavaScript sem build, servido pelo Express |

## 🚀 Como correr um site

```bash
cd <pasta-do-site>
npm install
cp .env.example .env
npm run dev
```

Depois abrir **<http://localhost:3000>**.
