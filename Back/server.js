import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------
// SUPABASE
// ---------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ---------------------------
// ROTAS DE USUÁRIO
// ---------------------------
app.post("/register", async (req, res) => {
  try {
    const { name, dob, cpf, email, wallet, password } = req.body;
    if (!name || !dob || !cpf || !email || !wallet || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from("users").insert([
      { name, dob, cpf, email, wallet, password_hash }
    ]);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ message: "Usuário registrado!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) return res.status(400).json({ error: error.message });
    if (!data.length) return res.status(400).json({ error: "Email ou senha incorretos." });

    const user = data[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Email ou senha incorretos." });

    delete user.password_hash;
    res.json({ message: "Login OK", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

// ---------------------------
// POKEMONS
// ---------------------------
app.get("/pokemons", async (req, res) => {
  const { data, error } = await supabase
    .from("pokemons")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------------------------
// SIMULAÇÃO DE UPLOAD PARA NFT.STORAGE / IPFS
// ---------------------------
app.post("/ipfs/upload", async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({ error: "name, description e image são obrigatórios." });
    }

    // Aqui você poderia integrar NFT.Storage de verdade
    // Mas por enquanto vamos simular retornando um CID fixo
    const fakeCID = "QmFakeCID1234567890"; // substitua depois por real CID
    console.log("🔗 Metadata recebido para upload:", { name, description, image });

    res.json({ cid: fakeCID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar metadata para IPFS." });
  }
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(process.env.PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${process.env.PORT}`);
});
