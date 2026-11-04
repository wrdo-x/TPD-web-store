const bcrypt = require("bcrypt");
const db = require("../db/knex");
const { generateToken } = require("../services/jwtService");

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: "Email уже занят" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [newUser] = await db("users")
      .insert({ email, password_hash, name, role: "user" })
      .returning(["id", "email", "name", "role"]);

    const token = generateToken(newUser);
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db("users").where({ email }).first();

    if (!user)
      return res.status(401).json({ error: "Неверный email или пароль" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ error: "Неверный email или пароль" });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.logout = (req, res) => {
  res.json({ message: "Выход выполнен" });
};
