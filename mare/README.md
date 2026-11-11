<div align="center">

<img src="public/favicon.svg" alt="Maré" width="72">

# Maré

**Casas de férias em Lagos, Algarve — reservas diretas, sem comissões**

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-d63aff?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Validação-Zod-3e67b1?style=flat-square&logo=zod&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-e34f26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-663399?style=flat-square&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-f7df1e?style=flat-square&logo=javascript&logoColor=black)

[Funcionalidades](#-funcionalidades) · [Capturas](#-capturas) · [Tecnologias](#-tecnologias) · [Como pôr a correr](#-como-pôr-a-correr) · [API](#-api)

</div>

<br>

![Página inicial do Maré](docs/inicio.jpg)

## 🌊 Sobre o projeto

O Maré é o site de uma pequena empresa familiar de **alojamento local** com seis casas de férias em Lagos. Os hóspedes pesquisam por datas, veem a disponibilidade em tempo real, reservam com experiências extra (barco, surf, vinhos…) e gerem tudo na sua área pessoal. A proprietária tem um painel para confirmar pedidos, mudar preços e bloquear datas.

Funciona **sem base de dados**: os dados vivem em memória e já vêm com casas, reservas e contas de exemplo, mas todo o backend está pronto — login com JWT, permissões por perfil, validação, preços por época, disponibilidade e regras de cancelamento.

## ✨ Funcionalidades

<table>
  <tr>
    <th width="33%">Para quem visita</th>
    <th width="33%">Para o hóspede</th>
    <th width="33%">Para a proprietária</th>
  </tr>
  <tr valign="top">
    <td>
      • Pesquisa por datas e hóspedes<br>
      • Filtros por vista mar, piscina, famílias<br>
      • Ordenação por preço e avaliação<br>
      • Calendário com preço por noite<br>
      • Galeria em ecrã inteiro<br>
      • Guia da região e experiências<br>
      • Formulário de contacto e newsletter
    </td>
    <td>
      • Criar conta e entrar<br>
      • Reservar com experiências extra<br>
      • Preço total com limpeza e taxa turística<br>
      • Check-in online<br>
      • Juntar experiências depois de reservar<br>
      • Cancelar com regra dos 14 dias<br>
      • Editar dados e palavra-passe
    </td>
    <td>
      • Resumo com ocupação e faturação<br>
      • Confirmar ou recusar pedidos<br>
      • Ver chegadas e check-ins<br>
      • Mudar preço, limpeza e estadia mínima<br>
      • Esconder uma casa do site<br>
      • Bloquear datas para obras<br>
      • Ler mensagens do formulário
    </td>
  </tr>
</table>

## 📸 Capturas

| Alojamentos | Página da casa |
|---|---|
| ![Alojamentos](docs/alojamentos.jpg) | ![Casa](docs/casa.jpg) |
| **Reserva** | **Área do hóspede** |
| ![Reserva](docs/reserva.jpg) | ![Área do hóspede](docs/conta.jpg) |
| **Painel de gestão** | **Experiências** |
| ![Painel de gestão](docs/painel.jpg) | ![Experiências](docs/experiencias.jpg) |
| **A região** | **Contactos** |
| ![A região](docs/regiao.jpg) | ![Contactos](docs/contactos.jpg) |

### 📱 No telemóvel

Todas as páginas são responsivas (testadas de 360 px a 1920 px). A navegação passa para um menu lateral e a página de cada casa ganha uma barra fixa para reservar.

<p align="center">
  <img src="docs/telemovel.jpg" alt="Página inicial no telemóvel" width="260">
  &nbsp;&nbsp;
  <img src="docs/menu-telemovel.jpg" alt="Menu lateral no telemóvel" width="260">
</p>

## 🧰 Tecnologias

| | Tecnologia | Para quê |
|---|---|---|
| ⚙️ | **Node.js 22+** e **Express 5** | Servidor, API e páginas |
| 🔐 | **jsonwebtoken** e **bcryptjs** | Login com access token e refresh token, palavras-passe cifradas |
| 🛡️ | **helmet**, **express-rate-limit**, **cors** | Cabeçalhos de segurança, CSP e limite de tentativas |
| ✅ | **zod** | Validação de todos os pedidos, com mensagens em português |
| 🎨 | **HTML, CSS e JavaScript** | Frontend sem build, com módulos ES e ícones SVG próprios |
| 🔤 | **Instrument Serif** e **Inter** | Tipografia (Google Fonts) |

## 🚀 Como pôr a correr

Precisa do [Node.js](https://nodejs.org) 22 ou mais recente.

```bash
cd mare
npm install
cp .env.example .env
npm run dev
```

Abrir **<http://localhost:3000>**. O `npm run dev` reinicia o servidor sempre que um ficheiro muda; em produção usar `npm start`.

### Contas de demonstração

Todas com a palavra-passe `mare1234` (também aparecem na página de entrar).

| Email | Perfil | Abre em |
|---|---|---|
| `hospede@mare.pt` | Hóspede | A minha conta |
| `dono@mare.pt` | Proprietária | Painel das suas casas |
| `admin@mare.pt` | Administração | Painel de todas as casas |

> [!NOTE]
> Os dados estão em memória, por isso tudo volta ao estado inicial quando o servidor reinicia.

## 🔌 API

Todas as rotas começam por `/api`. As marcadas com 🔒 precisam do cabeçalho `Authorization: Bearer <accessToken>`.

<details>
<summary><strong>Autenticação</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Criar conta (perfil `hospede`) |
| POST | `/auth/login` | Entrar |
| POST | `/auth/refresh` | Novo access token a partir do cookie de refresh |
| POST | `/auth/logout` | Terminar sessão |
| GET / PATCH | `/auth/me` 🔒 | Ver e editar os dados da conta |
| PATCH | `/auth/me/password` 🔒 | Mudar a palavra-passe |

</details>

<details>
<summary><strong>Casas e experiências</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| GET | `/properties?checkIn&checkOut&guests&tag` | Casas com disponibilidade e preço para as datas |
| GET | `/properties/:slug` | Detalhe de uma casa |
| GET | `/properties/:slug/calendar?from&to` | Preço e disponibilidade por noite |
| GET | `/experiences` | Experiências |

</details>

<details>
<summary><strong>Reservas</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| POST | `/bookings/quote` | Calcular o preço de uma estadia |
| POST | `/bookings` 🔒 | Criar reserva |
| GET | `/bookings/mine` 🔒 | Reservas do utilizador |
| GET | `/bookings/:code` 🔒 | Detalhe de uma reserva |
| POST | `/bookings/:code/cancel` 🔒 | Cancelar |
| POST | `/bookings/:code/checkin` 🔒 | Check-in online |
| POST | `/bookings/:code/extras` 🔒 | Juntar uma experiência |

</details>

<details>
<summary><strong>Painel de gestão</strong> (proprietária e admin)</summary>

| Método | Rota | Descrição |
|---|---|---|
| GET | `/owner/overview` 🔒 | Resumo: pedidos, ocupação, faturação e chegadas |
| GET / PATCH | `/owner/bookings[/:code]` 🔒 | Listar e mudar o estado das reservas |
| GET / PATCH | `/owner/properties[/:id]` 🔒 | Preços, limpeza, estadia mínima e visibilidade |
| GET / POST / DELETE | `/owner/blocks[/:id]` 🔒 | Bloquear datas |
| GET / PATCH | `/owner/messages[/:id]` 🔒 | Mensagens do formulário de contacto |

</details>

<details>
<summary><strong>Contacto e newsletter</strong></summary>

| Método | Rota | Descrição |
|---|---|---|
| POST | `/contact` | Enviar mensagem |
| POST | `/newsletter` | Subscrever a newsletter |

</details>

### 🔐 Como funciona o login

- O **access token** dura 15 minutos e vai em cada pedido protegido.
- O **refresh token** dura 7 dias e fica num cookie `httpOnly`, fora do alcance do JavaScript da página.
- Quando o access token expira, o site pede um novo sozinho e repete o pedido sem o utilizador dar por nada.
- Cada refresh gera um token novo e invalida o anterior. Se um token já usado aparecer outra vez, todas as sessões dessa conta são terminadas.

## 📋 Antes de ir para produção

- [ ] Definir `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` longos no `.env` e `NODE_ENV=production` (o servidor recusa arrancar sem eles)
- [ ] Servir com HTTPS — em produção o cookie de refresh só viaja por ligação segura
- [ ] Ligar os pagamentos (Stripe, Easypay ou MB Way) em `src/services/booking.service.js`
- [ ] Enviar emails de confirmação ao hóspede e de aviso à proprietária
- [ ] Trocar as fotografias pelas das casas reais e o número de registo de Alojamento Local no rodapé

## 🙏 Créditos

Fotografias do [Unsplash](https://unsplash.com/license), de uso gratuito.
