import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {

  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      login(res.data.user, res.data.token);

      alert("Logged in successfully!");

      window.location.href = "/";   // redirect
    } 
    catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <label>Email</label>
        <input 
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input 
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
