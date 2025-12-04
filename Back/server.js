import express from "express"
import bcrypt from "bcrypt"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// Conexão com Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// -------------------------
// ROTA DE REGISTRO
// -------------------------
app.post("/register", async (req, res) => {
  try {
    const { name, dob, cpf, email, wallet, password } = req.body

    if (!name || !dob || !cpf || !email || !wallet || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, dob, cpf, email, wallet, password_hash }])

    if (error) return res.status(400).json({ error: error.message })

    return res.json({ message: "Usuário registrado!", user: data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Erro interno." })
  }
})

// -------------------------
// ROTA DE LOGIN
// -------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1)

    if (error) return res.status(400).json({ error: error.message })
    if (!users || users.length === 0) {
      return res.status(400).json({ error: "Email ou senha incorretos." })
    }

    const user = users[0]

    // comparar senha com hash salvo
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(400).json({ error: "Email ou senha incorretos." })
    }

    // remover hash antes de retornar
    delete user.password_hash

    return res.json({ message: "Login OK", user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Erro interno no servidor." })
  }
})

// -------------------------
// INICIAR SERVIDOR
// -------------------------
app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta " + process.env.PORT)
})
