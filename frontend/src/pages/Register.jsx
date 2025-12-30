import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);

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
          <button onClick={verifyAccount}> Verify </button>
        </>
      )}
    </div>
  );
}