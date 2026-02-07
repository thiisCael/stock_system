# 📦 Sistema de Controle de Estoque

> Sistema completo de gestão de estoque com controle de entradas, saídas, lotes e validade. Desenvolvido seguindo princípios de **Clean Architecture** com foco em segurança e integridade de dados.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Segurança](#-segurança-e-integridade)
- [Contribuição](#-como-contribuir)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Sistema de Controle de Estoque** é uma solução robusta para gerenciamento de inventário, oferecendo controle detalhado sobre movimentações de produtos, rastreamento por lote e monitoramento de validade. A aplicação foi desenvolvida pensando em escalabilidade, manutenibilidade e segurança de dados.

### Principais Diferenciais

- ✅ **Transações Atômicas** - Garantia de consistência através de transactions ACID
- ✅ **Validações Robustas** - Prevenção de estoque negativo e dados inconsistentes
- ✅ **Interface Moderna** - Design responsivo com dark mode automático
- ✅ **Arquitetura Limpa** - Separação clara de responsabilidades (MVC + Services)
- ✅ **Auto-Migration** - Criação automática de tabelas na primeira execução

---

## 🚀 Funcionalidades

### Gestão de Produtos
- 📝 Cadastro completo com SKU, lote e data de validade
- 🔍 Busca e filtragem avançada de produtos
- 📊 Visualização de estoque atual em tempo real

### Movimentações
- ➕ **Entradas**: Registro de compras e recebimentos
- ➖ **Saídas**: Controle de vendas e baixas com validação de saldo
- 🔒 **Validação Inteligente**: Sistema impede operações que gerariam estoque negativo
- 📅 Rastreabilidade por data e responsável

### Relatórios e Consultas
- 📈 Relatórios dinâmicos com múltiplos filtros
- 🔎 Filtros por: Data, Responsável, Produto, Tipo de Movimentação
- 📊 Histórico completo de movimentações
- 💾 Exportação de dados (planejado)

---

## 🛠️ Tecnologias

### Backend

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.x | Framework web minimalista |
| **PostgreSQL** | 14+ | Banco de dados relacional |
| **pg** | 8.x | Driver nativo PostgreSQL |
| **dotenv** | 16.x | Gerenciamento de variáveis de ambiente |

### Frontend

| Tecnologia | Descrição |
|-----------|-----------|
| **HTML5** | Estrutura semântica |
| **JavaScript (ES6+)** | Lógica e interatividade |
| **TailwindCSS** | Framework CSS utility-first |
| **ES Modules** | Organização modular do código |

---

## 📂 Arquitetura

O projeto segue o padrão **MVC** (Model-View-Controller) com camada adicional de **Services** para regras de negócio:

```
stock-system/
│
├── src/
│   ├── config/
│   │   └── db.js          # Configuração e pool de conexões PostgreSQL
│   │
│   ├── models/
│   │   ├── inventoryModel.js      # Queries de produtos
│   │        
│   │
│   ├── services/
│   │   ├── inventoryService.js    # Regras de negócio de produtos
│   │      
│   │
│   ├── controllers/
│   │   ├── inventoryController.js # Endpoints de produtos
│   │   
│   │
│   └── app.js                   # Configuração do servidor Express
│
├── public/
│   ├── index.html               # Interface principal
│   │
│   └── js/
│       ├── services/
│       │   ├── api.js           # Comunicação com backend (fetch)
│       │  
│       │
│       ├── ui/
│       │   ├── dom.js     # Renderização de produtos
│       │       
│       │
│       ├── utils/
│       │   └── format.js    # Utilitários (datas, moedas, etc.)
│       │
│       └── app.js               # Inicialização e event listeners
│
├── .env.example                 # Template de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

### Fluxo de Dados

```
Cliente (Browser)
    ↓
Frontend (public/js)
    ↓
API REST (Express)
    ↓
Controller (validação básica)
    ↓
Service (regras de negócio)
    ↓
Model (acesso a dados)
    ↓
PostgreSQL (persistência)
```

---

## ⚙️ Instalação

### Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior
- [Git](https://git-scm.com/)

### Passo a Passo

#### 1️⃣ Clone o repositório

```bash
git clone https://github.com/thiiscael/stock-system.git
cd stock-management
```

#### 2️⃣ Instale as dependências

```bash
npm install
```

#### 3️⃣ Configure o banco de dados

**Opção A: Usando terminal PostgreSQL**

```bash
# Entre no PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE estoque_db;

# Saia do PostgreSQL
\q
```

**Opção B: Usando interface gráfica**

- Abra o **pgAdmin** ou **DBeaver**
- Crie um novo banco de dados chamado `estoque_db`

> ⚠️ **Nota**: Não é necessário criar tabelas manualmente. O sistema possui **auto-migration** que criará as tabelas `produtos` e `movimentacoes` automaticamente na primeira execução.

#### 4️⃣ Configure as variáveis de ambiente

Copie o arquivo de exemplo e edite com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estoque_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações do Servidor
PORT=3000
NODE_ENV=development
```

#### 5️⃣ Inicie o servidor

```bash
npm start
```

Se tudo estiver correto, você verá:

```
✓ Banco de dados conectado e tabelas verificadas
✓ Servidor rodando na porta 3000
```

#### 6️⃣ Acesse a aplicação

Abra seu navegador e acesse:

```
http://localhost:3000
```

---

## 💻 Uso

### Cadastrando um Produto

1. Acesse a seção **"Cadastro de Produtos"**
2. Preencha os campos:
   - Nome do produto
   - SKU (identificador único)
   - Lote
   - Data de validade
   - Quantidade inicial
3. Clique em **"Cadastrar"**

### Registrando Movimentações

**Entrada (Compra/Recebimento):**
1. Selecione o produto
2. Escolha o tipo: **Entrada**
3. Informe a quantidade
4. Adicione o responsável
5. Confirme a operação

**Saída (Venda/Baixa):**
1. Selecione o produto
2. Escolha o tipo: **Saída**
3. Informe a quantidade (o sistema validará se há saldo)
4. Adicione o responsável
5. Confirme a operação

> ✅ O sistema **não permitirá** saídas que resultem em estoque negativo!

### Consultando Relatórios

Utilize os filtros disponíveis:
- 📅 **Por Data**: Selecione um período específico
- 👤 **Por Responsável**: Filtre movimentações de um usuário
- 📦 **Por Produto**: Visualize o histórico de um item específico

---

## 🛡️ Segurança e Integridade

O sistema implementa múltiplas camadas de proteção para garantir a consistência dos dados:

### 1. Transações Atômicas (ACID)

Todas as movimentações utilizam transações do PostgreSQL:

```javascript
// Exemplo simplificado
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // Operações no banco
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

**Benefícios:**
- ✅ Rollback automático em caso de erro
- ✅ Garantia de consistência entre operações
- ✅ Proteção contra falhas parciais

### 2. Validação de Estoque Negativo

Antes de qualquer saída, o sistema verifica:

```javascript
const saldoAtual = await calcularSaldo(produtoId);
if (saldoAtual - quantidadeSaida < 0) {
  throw new Error('Saldo insuficiente');
}
```

### 3. Sanitização de Dados

Todos os dados são validados e normalizados:

- Tipos de movimentação: `"entrada"`, `"ENTRADA"`, `"compra"` → `ENTRADA`
- Números: Conversão para inteiros/decimais
- Strings: Trim e validação de caracteres

### 4. Prepared Statements

Proteção contra SQL Injection:

```javascript
const result = await client.query(
  'SELECT * FROM produtos WHERE id = $1',
  [produtoId]
);
```

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Siga os passos abaixo:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade X'
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. Abra um **Pull Request**

### Padrões de Commit

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

<div align="center">

**Desenvolvido com 💻 e ☕ por Cael**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/seu-perfil)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/seu-usuario)

</div>

---

## 🗺️ Roadmap

Próximas funcionalidades planejadas:

- [ ] Sistema de login com autenticação e permissões 
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações de produtos próximos ao vencimento 
- [ ] Dashboard com gráficos e métricas
- [ ] API RESTful documentada (Swagger)
- [ ] Testes automatizados (Jest)
- [ ] Containerização com Docker

---

<div align="center">

**Se este projeto foi útil, considere dar uma ⭐!**

</div> 

