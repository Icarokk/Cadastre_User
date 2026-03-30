const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// Permite conexão com seu front
app.use(cors());

// Permite receber JSON
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "src")));

// "Banco de dados" em memória
let clientes = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});


// ================= BANCO =================

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3308,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "Cadastro_usuarios"
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err);
  } else {
    console.log("Conectado ao MySQL 🚀");
  }
});

/* ================= ROTAS ================= */

// TESTE
app.get("/", (req, res) => {
  res.json({ mensagem: "API com MySQL funcionando 🚀" });
});

// CADASTRAR USUÁRIO
app.post("/usuarios", (req, res) => {
  const {
    nome,
    sobrenome,
    data_nascimento,
    sexo,
    endereco,
    numero,
    bairro,
    cidade,
    uf,
    cep,
    cpf
  } = req.body;

  // Validação básica
  if (!nome || !cpf) {
    return res.status(400).json({
      mensagem: "Nome e CPF são obrigatórios"
    });
  }

  const sql = `
    INSERT INTO usuarios
    (nome, sobrenome, data_nascimento, sexo, endereco, numero, bairro, cidade, uf, cep, cpf)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome,
    sobrenome,
    data_nascimento,
    sexo,
    endereco,
    numero,
    bairro,
    cidade,
    uf,
    cep,
    cpf
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          mensagem: "CPF já cadastrado"
        });
      }

      return res.status(500).json({
        mensagem: "Erro ao cadastrar usuário"
      });
    }

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!"
    });
  });
});

// LISTAR USUÁRIOS
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) {
      return res.status(500).json({
        mensagem: "Erro ao buscar usuários"
      });
    }

    res.json(result);
  });
});

// DELETAR USUÁRIO
app.delete("/usuarios/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM usuarios WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({
        mensagem: "Erro ao deletar"
      });
    }

    res.json({ mensagem: "Usuário removido com sucesso" });
  });
});


/* ================= SERVIDOR ================= */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});