import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");

  const verifyUsername = async () => {
    try {
      const verifyRes = await axios.post(
        "http://localhost:5001/api/auth/verify-username",
        { username }
      );

      if (verifyRes.data.exists) {
      const codeRes = await axios.post(
        "http://localhost:5001/api/auth/generate-code",
        { username }
      );

      setVerificationCode(codeRes.data.verificationCode);
      setStep(2);
    }
    } catch (err) {
  if (err.response && err.response.data) {
    alert(err.response.data.message);
  } else {
    alert("Backend not reachable or server error. Check backend console.");
  }
}
  };

 const verifyOwnership = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5001/api/auth/verify-bio",
      { username }
    );

    alert(res.data.message);

    if (res.data.verified) {
        console.log("Acc verified!")
      setStep(3);
    }

  } catch (err) {
    if (err.response && err.response.data) {
      alert(err.response.data.message);
    } else {
      alert("Verification failed. Try again.");
    }
  }
};

const setUserPassword = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5001/api/auth/set-password",
      { username, password }
    );

    alert("Account created!");
    localStorage.setItem("token", res.data.token);

  } catch (err) {
    if (err.response && err.response.data) {
      alert(err.response.data.message);
    } else {
      alert("Server error");
    }
  }
};


  return (
    <div>
      {step === 1 && (
        <>
          <h2>Register</h2>
          <input
            placeholder="LeetCode Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={verifyUsername}>Verify</button>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Verification Code</h3>
          <p>Paste this code into your LeetCode bio:</p>
          <strong>{verificationCode}</strong>
          <p>After adding it, click Verify Again</p>
          <button onClick={verifyOwnership}> Verify </button>
        </>
      )}
      {step === 3 && (
  <>
    <h3>Set Password</h3>
    <input
      type="password"
      placeholder="Create password"
      onChange={(e) => setPassword(e.target.value)}
    />
    <button onClick={setUserPassword}>Create Account</button>
  </>
)}
    </div>
  );
}