
# Sistema de Gerenciamento de Produtos

Este é um sistema simples de gerenciamento de produtos, desenvolvido com **Node.js**, **Express**, **Handlebars**, **Sequelize** e **PDFKit**. A aplicação permite o cadastro, listagem, edição, deleção de produtos e a geração de relatórios em PDF dos produtos cadastrados.

## Funcionalidades

- **Listagem de Produtos**: Visualize todos os produtos cadastrados.
- **Filtragem por Categoria**: Filtre os produtos por categoria.
- **Cadastro de Produto**: Adicione novos produtos ao sistema.
- **Edição de Produto**: Edite as informações de um produto já existente.
- **Exclusão de Produto**: Remova produtos do sistema.
- **Alteração de Quantidade**: Atualize a quantidade de um produto no estoque.
- **Geração de Relatório em PDF**: Gere um relatório completo de todos os produtos cadastrados, incluindo nome, preço, descrição, quantidade, categoria e datas de criação/alteração.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no lado do servidor.
- **Express**: Framework web para Node.js.
- **Handlebars**: Motor de templates para renderização de views.
- **Sequelize**: ORM para modelagem e consulta de banco de dados.
- **PDFKit**: Biblioteca para gerar arquivos PDF.
- **Body-parser**: Middleware para parsing de requests HTTP.
- **Supertest**: Framework de testes para requisições HTTP.

## Instalação

1. Clone o repositório para sua máquina local:

   ```bash
   git clone https://github.com/iJeferson/NodeJS-CRUD-Testes
   ```

2. Instale as dependências do projeto:

   ```bash
   cd seu-repositorio
   npm install
   ```

3. Configure o banco de dados no arquivo `.env` ou diretamente no arquivo de configuração.

4. Execute as migrações do banco de dados (Sequelize):

   ```bash
   npx sequelize db:migrate
   ```

## Uso

1. Inicie o servidor:

   ```bash
   npm start
   ```

2. Acesse o sistema no navegador:

   ```
   http://localhost:8080
   ```

## Testes

Para rodar os testes automatizados, use o comando:

```bash
npm test
```

## Estrutura do Projeto

- `app.js`: Arquivo principal que contém as rotas e a lógica da aplicação.
- `views/`: Diretório contendo os templates Handlebars para renderização.
- `public/`: Arquivos estáticos como CSS, JS, imagens, etc.
- `src/models/`: Diretório onde ficam os modelos Sequelize.
- `test.js`: Arquivo de testes utilizando Supertest para validar o comportamento das rotas.

## Rotas Principais

- **`GET /`**: Lista os produtos cadastrados com filtro opcional por categoria.
- **`POST /cadastrar`**: Cadastra um novo produto.
- **`POST /editar/:id`**: Edita um produto existente.
- **`POST /deletar/:id`**: Deleta um produto.
- **`POST /alterar-quantidade/:id`**: Altera a quantidade de um produto no estoque.
- **`GET /relatorio`**: Gera um relatório em PDF dos produtos cadastrados.

## Gerando Relatório em PDF

A rota `/relatorio` gera um arquivo PDF com a listagem de todos os produtos cadastrados no sistema, incluindo informações como nome, preço, quantidade e datas de criação/alteração. O arquivo PDF é baixado automaticamente pelo navegador.