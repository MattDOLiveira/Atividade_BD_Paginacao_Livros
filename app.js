const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const url = 'mongodb://localhost:27017';
const dbName = 'biblioteca';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('livros');

    const paginaAtual = parseInt(req.query.pagina) || 1;
    const busca = req.query.busca || '';
    const autor = req.query.autor || '';
    const ano = parseInt(req.query.ano) || '';

    const query = {};
    if (busca) query.titulo = { $regex: busca, $options: 'i' };
    if (autor) query.autor = { $regex: autor, $options: 'i' };
    if (ano) query.ano = ano;

    const totalLivros = await collection.countDocuments(query);
    const livrosPorPagina = 10;
    const totalPaginas = Math.ceil(totalLivros / livrosPorPagina);

    const livros = await collection.find(query)
      .skip((paginaAtual - 1) * livrosPorPagina)
      .limit(livrosPorPagina)
      .toArray();

    res.render('index', { livros, paginaAtual, totalPaginas });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
