import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker"
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:3000/users/register", form);

      alert("Signup successful! Please login.");
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div>
      <h2>Create Account</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input 
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input 
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
          />
        </div>

        <div>
          <label>Password</label>
          <input 
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Role</label>
          <select 
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="jobseeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        <button type="submit">Sign Up</button>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}
