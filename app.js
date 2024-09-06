const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const { Produtos } = require('./src/models');

const app = express();

// Configuração do Handlebars
app.engine('handlebars', engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('./public'));

// Rota de Inicio para listar todos os produtos
app.get('/', async (req, res) => {
        const produtos = await Produtos.findAll();
        res.render('home', { produtos });
});

// Rota para editar produto
app.post('/editar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, descricao } = req.body;

        // Procurar o produto pelo ID
        const produto = await Produtos.findByPk(id);

        // Se o produto for encontrado, atualize-o
        if (produto) {
            await produto.update({ nome, preco, descricao });
            res.redirect('/');
        } else {
            res.status(404).send('Produto não encontrado');
        }
    } catch (error) {
        res.render('editar', { error: 'Ocorreu um erro ao editar o produto.' });
    }
});

// Rota para criar produto
app.post('/cadastrar', async (req, res) => {
    try {
        const { nome, preco, descricao } = req.body;
        await Produtos.create({ nome, preco, descricao });
        res.redirect('/');
    } catch (error) {
        res.render('cadastrar', { error: 'Ocorreu um erro ao cadastrar o produto.' });
    }
});

// Rota para deletar produto
app.post('/deletar/:id', async (req, res) => {
    const { id } = req.params;
    const produto = await Produtos.findByPk(id);
    if (produto) {
      await produto.destroy();
      res.redirect('/');
    }
  });

app.listen(3000, () => {
    console.log('Servidor HTTP rodando em: http://localhost:3000');
});
