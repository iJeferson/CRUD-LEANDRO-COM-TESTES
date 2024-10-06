const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const { Produtos } = require('./src/models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument();

const app = express();

// Configuração do Handlebars
app.engine('handlebars', engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        ifCond: (v1, v2, options) => {
          if (v1 === v2) {
            return options.fn(this);
          }
          return options.inverse(this);
        }
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
    const { categoriaFiltro } = req.query;
    let where = {};
  
    // Se uma categoria foi selecionada, filtra os produtos
    if (categoriaFiltro && categoriaFiltro !== '') {
      where = { categoria: categoriaFiltro };
    }
  
    // Busca todas as categorias e produtos filtrados
    const categorias = await Produtos.findAll({
      attributes: ['categoria'],
      group: ['categoria']
    });
  
    const produtos = await Produtos.findAll({ where });
  
    res.render('home', {
        produtos,
        categorias: categorias.map(cat => cat.categoria),
        categoriaSelecionada: categoriaFiltro
      });
  });

// Rota para editar produto
app.post('/editar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, preco, descricao, quantidade, categoria } = req.body;

        // Procurar o produto pelo ID
        const produto = await Produtos.findByPk(id);

        // Se o produto for encontrado, atualize-o
        if (produto) {
            await produto.update({ nome, preco, descricao, quantidade, categoria });
            res.redirect('/');
        } else {
            res.status(404).send('Produto não encontrado');
        }
    } catch (error) {
        res.render('editar', { error: 'Ocorreu um erro ao editar o produto.' });
    }
});

app.post('/alterar-quantidade/:id', async (req, res) => {
    const produtoId = req.params.id;
    const alteracao = req.body.alteracao;
  
    try {
      // Encontra o produto no banco de dados
      const produto = await Produtos.findByPk(produtoId);
      if (!produto) {
        return res.json({ sucesso: false });
      }
  
      // Atualiza a quantidade do produto
      produto.quantidade += parseInt(alteracao);
      await produto.save();
  
      res.json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao atualizar a quantidade:', error);
      res.json({ sucesso: false });
    }
  });
  

// Rota para criar produto
app.post('/cadastrar', async (req, res) => {
    try {
        const { nome, preco, descricao, quantidade, categoria } = req.body;
        await Produtos.create({ nome, preco, descricao, quantidade, categoria });
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

app.get('/relatorio', async (req, res) => {
  try {
      const produtos = await Produtos.findAll();

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
      const filePath = `./public/relatorio-produtos-${Date.now()}.pdf`;
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Título
      doc.fontSize(20).text('Relatório de Produtos Cadastrados', { align: 'center' });
      doc.moveDown(2);

      // Configurações da tabela
      const tableTop = 150;
      let position = tableTop;
      const itemPadding = 5;
      const columnWidths = {
        nome: 100,
        preco: 60,
        descricao: 200,
        quantidade: 60,
        categoria: 100,
        createdAt: 100,
        updatedAt: 100
      };

      // Função para verificar e criar uma nova página se necessário
      function checkNewPage(pos) {
        if (pos > doc.page.height - 50) {
          doc.addPage();
          return 50; // Posição inicial na nova página
        }
        return pos;
      }

      // Cabeçalhos da tabela
      doc.fontSize(12).text('Nome', 50, position);
      doc.text('Preço', 150, position);
      doc.text('Descrição', 210, position);
      doc.text('Quantidade', 410, position);
      doc.text('Categoria', 470, position);
      doc.text('Criado em', 570, position);
      doc.text('Alterado em', 670, position);
      position += 20;

      // Linha de separação entre cabeçalhos e produtos
      doc.moveTo(40, position - 5)
        .lineTo(800, position - 5) // Ajustado para paisagem
        .stroke();

      // Adiciona os produtos na tabela
      produtos.forEach(produto => {
          position = checkNewPage(position + 20); // Verifica se precisa de nova página antes de adicionar mais uma linha
          doc.text(produto.nome, 50, position, { width: columnWidths.nome });
          doc.text(`R$ ${produto.preco.toFixed(2)}`, 150, position, { width: columnWidths.preco });
          doc.text(produto.descricao, 210, position, { width: columnWidths.descricao });
          doc.text(produto.quantidade, 410, position, { width: columnWidths.quantidade });
          doc.text(produto.categoria, 470, position, { width: columnWidths.categoria });
          doc.text(new Date(produto.createdAt).toLocaleDateString(), 570, position, { width: columnWidths.createdAt });
          doc.text(new Date(produto.updatedAt).toLocaleDateString(), 670, position, { width: columnWidths.updatedAt });

          // Linha de separação
          doc.moveTo(40, position + 15)
            .lineTo(800, position + 15) // Ajustado para paisagem
            .stroke();

          position += 20; // Move a posição para a próxima linha de produto
      });

      // Finaliza o PDF
      doc.end();

      // Quando o arquivo estiver pronto, responde com ele
      stream.on('finish', () => {
          res.download(filePath, 'relatorio-produtos.pdf', (err) => {
              if (err) {
                  console.error('Erro ao enviar o PDF:', err);
                  res.status(500).send('Erro ao gerar o PDF');
              } else {
                  // Deleta o arquivo após o download
                  fs.unlinkSync(filePath);
              }
          });
      });
  } catch (error) {
      console.error('Erro ao gerar o relatório:', error);
      res.status(500).send('Erro ao gerar o relatório');
  }
});

app.listen(8080, () => {
    console.log('Servidor HTTP rodando em: http://localhost:8080');
});
