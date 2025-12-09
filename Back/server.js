import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------
// BANCO DE DADOS LOCAL (SQLite)
// ---------------------------
const db = new Database("database.db");

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    wallet TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pokemons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    Img_URL TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_nfts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pokemon_name TEXT NOT NULL,
    token_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Popular tabela pokemons
const pokemonCount = db.prepare("SELECT COUNT(*) as count FROM pokemons").get();
if (pokemonCount.count === 0) {
  const insertPokemon = db.prepare(
    "INSERT INTO pokemons (name, Img_URL) VALUES (?, ?)"
  );
  const pokemons = [
    { name: "Bulbasaur", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" },
    { name: "Charmander", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" },
    { name: "Squirtle", url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" }
  ];

  const insertMany = db.transaction((pokemons) => {
    for (const p of pokemons) insertPokemon.run(p.name, p.url);
  });

  insertMany(pokemons);
  console.log("✅ Pokémons inseridos!");
}

// ---------------------------
// REGISTER
// ---------------------------
app.post("/register", async (req, res) => {
  try {
    const { name, dob, cpf, email, wallet, password } = req.body;

    if (!name || !dob || !cpf || !email || !wallet || !password)
      return res.status(400).json({ error: "Preencha todos os campos." });

    const password_hash = await bcrypt.hash(password, 10);

    try {
      db.prepare(`
        INSERT INTO users (name, dob, cpf, email, wallet, password_hash)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, dob, cpf, email, wallet, password_hash);

      res.json({ message: "Usuário registrado!" });
    } catch (err) {
      if (err.message.includes("UNIQUE"))
        return res.status(400).json({ error: "CPF ou Email já cadastrado." });
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

// ---------------------------
// LOGIN + RETORNAR NFTs
// ---------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(400).json({ error: "Email ou senha incorretos." });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Email ou senha incorretos." });

    delete user.password_hash;

    const nfts = db.prepare(`
      SELECT id, pokemon_name, token_id, image_url, created_at
      FROM user_nfts
      WHERE user_id = ?
    `).all(user.id);

    res.json({ message: "Login OK", user, nfts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

// ---------------------------
// SALVAR NFT MINTADO
// ---------------------------
app.post("/save-nft", (req, res) => {
  try {
    const { userId, pokemonName, tokenId, imageUrl } = req.body;

    if (!userId || !pokemonName || !tokenId || !imageUrl)
      return res.status(400).json({ error: "Dados incompletos." });

    db.prepare(`
      INSERT INTO user_nfts (user_id, pokemon_name, token_id, image_url)
      VALUES (?, ?, ?, ?)
    `).run(userId, pokemonName, tokenId, imageUrl);

    res.json({ message: "NFT registrado!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar NFT." });
  }
});

// ---------------------------
// PEGAR NFTs DO USUÁRIO
// ---------------------------
app.get("/user/:id/nfts", (req, res) => {
  try {
    const nfts = db.prepare(
      "SELECT * FROM user_nfts WHERE user_id = ?"
    ).all(req.params.id);

    res.json(nfts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar NFTs." });
  }
});

// ---------------------------
// LISTAR POKEMONS
// ---------------------------
app.get("/pokemons", (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM pokemons").all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pokémons." });
  }
});

// ---------------------------
// START
// ---------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
