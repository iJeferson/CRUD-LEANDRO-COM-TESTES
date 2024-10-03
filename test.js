const request = require("supertest");
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const { Produtos } = require("./src/models");

const app = express();

// Configuração do Handlebars
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

// Rota de Inicio para listar todos os produtos
app.get("/", async (req, res) => {
  const produtos = await Produtos.findAll();
  res.render("home", { produtos });
});

// Rota para testar relatorio
app.get("/relatorio", async (req, res) => {
  const produtos = await Produtos.findAll();
  res.render("home", { produtos });
});

// Rota para editar produto
app.post("/editar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, descricao } = req.body;

    // Procurar o produto pelo ID
    const produto = await Produtos.findByPk(id);

    // Se o produto for encontrado, atualize-o
    if (produto) {
      await produto.update({ nome, preco, descricao });
      res.redirect("/");
    } else {
      res.status(404).send("Produto não encontrado");
    }
  } catch (error) {
    res.render("editar", { error: "Ocorreu um erro ao editar o produto." });
  }
});

// Rota para criar produto
app.post("/cadastrar", async (req, res) => {
  try {
    const { nome, preco, descricao } = req.body;
    await Produtos.create({ nome, preco, descricao });
    res.redirect("/");
  } catch (error) {
    res.render("cadastrar", {
      error: "Ocorreu um erro ao cadastrar o produto.",
    });
  }
});

// Rota para deletar produto
app.post("/deletar/:id", async (req, res) => {
  const { id } = req.params;
  const produto = await Produtos.findByPk(id);
  if (produto) {
    await produto.destroy();
    res.redirect("/");
  }
});

describe("Testes Aplicação CRUD Produtos", function () {
  
  it("Deve carregar a página inicial", function (done) {
    request(app).get("/").expect("Content-Type", /html/).expect(200, done);
  });

  it("Deve adicionar um produto e redirecionar para a página inicial", function (done) {
    request(app)
      .post("/cadastrar")
      .send({
        nome: "Teste Produto",
        preco: 10.21,
        descricao: "DESCRIÇÃO TESTE",
      }) // 'preco' sem acento
      .expect("Location", "/")
      .expect(302, done);
  });

  it("Deve editar um produto e redirecionar para a página inicial", function (done) {
    this.timeout(5000);

    Produtos.findOne({
      order: [["id", "DESC"]],
    })
      .then((ultimoProduto) => {
        request(app)
          .post(`/editar/${ultimoProduto.id}`)
          .send({
            nome: "Teste Produto Update",
            preco: 10.23,
            descricao: "DESCRIÇÃO TESTE UPDATE",
          })
          .expect("Location", "/")
          .expect(302, done);
      })
      .catch(done);
  });

  it("Deve deletar um produto e redirecionar para a página inicial", function (done) {
    this.timeout(5000);

    Produtos.findOne({
      order: [["id", "DESC"]],
    })
      .then((ultimoProduto) => {
        request(app)
          .post(`/deletar/${ultimoProduto.id}`)
          .expect("Location", "/")
          .expect(302, done);
      })
      .catch(done);
  });

  it("Deve emitir um Relatorio", function (done) {
    request(app).get("/relatorio").expect("Content-Type", /html/).expect(200, done);
  });

});
