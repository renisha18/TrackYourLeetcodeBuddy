const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const verificationStore = {};

function generateVerificationCode() {
  return "LC-VERIFY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

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


app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.listen(5001, () => console.log("Server running"));