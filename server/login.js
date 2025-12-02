const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// =============================
// CONEXÃO COM POSTGRESQL
// =============================
const db = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '1234@6789',
  database: 'OniniServer',
});

// Teste inicial de conexão
db.connect()
  .then(() => console.log('🟢 Conectado ao PostgreSQL!'))
  .catch((err) => console.error('🔴 ERRO ao conectar ao PostgreSQL:', err));

// =============================
// CADASTRO
// =============================
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    // Verificar email duplicado
    const check = await db.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado!' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())',
      [name, email, hashed]
    );

    res.json({ message: 'Conta criada com sucesso!' });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// =============================
// LOGIN
// =============================
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Informe email e senha.' });

    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado!' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Senha incorreta!' });
    }

    res.json({
      message: 'Login OK!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// =============================
// SERVIDOR
// =============================
app.listen(3000, () =>
  console.log('🔥 Servidor rodando em http://localhost:3000')
);
