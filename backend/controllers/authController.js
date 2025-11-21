// backend/controllers/authController.js

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = createAuthToken({
    email: user.email,
    role: user.role,     // <--- IMPORTANT
  });

  return res.json({
    message: "Login successful",
    token,
    role: user.role,     // <--- RETURN ROLE
  });
};
