const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const app = express();
app.use(cors());
app.use(express.json());
const JWT_SECRET = "supersecret";

const verificationStore = {};
const {Pool} = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "LeetcodeStreak",
    password: "klrahulreni1801",
    port: 5432,
});

module.exports = pool;

function generateVerificationCode() {
  return "LC-VERIFY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const verifyAccount = async () => {
  alert("Bio verification coming next!");
};

// routes BELOW
app.post("/api/auth/verify-username", async (req, res) => {
  const { username } = req.body;
  if(!username){
    return res.status(400).json({message: "Enter the username"});
  }

  try{
const response = await axios.get(
      `https://alfa-leetcode-api.onrender.com/${username}`
    );
    // If username exists, API returns data with username
    if (response.data && response.data.username) {
        console.log(username);
      return res.json({
        exists: true,
        message: "LeetCode user exists"
      });
    } else {
      return res.status(404).json({
        exists: false,
        message: "LeetCode user not found"
      });
    }
    
  }catch(error){
return res.status(404).json({
      exists: false,
      message: "LeetCode user not found"
    });
  }

});

app.post("/api/auth/generate-code", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  const code = generateVerificationCode();

  verificationStore[username] = {
    code,
    createdAt: Date.now()
  };

  return res.json({
    message: "Verification code generated",
    verificationCode: code
  });
});

app.post("/api/auth/verify-bio", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  const storedData = verificationStore[username];

  if (!storedData) {
    return res.status(400).json({ message: "No verification code found. Generate again." });
  }

  try {
    const response = await axios.get(
      `https://alfa-leetcode-api.onrender.com/${username}`
    );

    const bio = response.data?.about || response.data?.profile?.about || "";

    if (bio.includes(storedData.code)) {
      return res.json({
        verified: true,
        message: "LeetCode account verified successfully"
      });
    } else {
      return res.status(400).json({
        verified: false,
        message: "Verification code not found in bio"
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Error verifying LeetCode bio"
    });
  }
});

app.post("/api/auth/set-password", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Ensure user was verified
  if (!verificationStore[username]) {
    return res.status(403).json({ message: "User not verified" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username`,
      [username, hashedPassword]
    );

    // Optional: cleanup verification store
    delete verificationStore[username];

    const token = jwt.sign(
      { userId: result.rows[0].id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Account created successfully",
      token
    });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.listen(5001, () => console.log("Server running"));