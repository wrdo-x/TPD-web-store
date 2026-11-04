const db = require("../db/knex");

exports.getMe = async (req, res) => {
  try {
    const user = await db("users")
      .where({ id: req.user.id })
      .select("id", "email", "name", "phone", "address", "role")
      .first();

    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const [updated] = await db("users")
      .where({ id: req.user.id })
      .update({ name, phone, address })
      .returning(["id", "email", "name", "phone", "address"]);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
