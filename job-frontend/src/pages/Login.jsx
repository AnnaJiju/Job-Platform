import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", res.data);
      
      login(res.data.user, res.data.access_token);

      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        if (res.data.user.role === "recruiter") {
          navigate("/recruiter");
        } else if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 100);
    } 
    catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      const errorMsg = err.response?.data?.message || err.message || "Invalid email or password";
      setError(errorMsg);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={styles.logo}>
            <path d="M8 32L20 8L32 32H8Z" fill="#3B82F6" opacity="0.3"/>
            <path d="M14 24L20 14L26 24H14Z" fill="#3B82F6"/>
          </svg>
          <span style={styles.logoText}>StepUp</span>
        </div>

        {/* Heading */}
        <h1 style={styles.heading}>Welcome Back</h1>
        <p style={styles.subheading}>Log in to your StepUp account</p>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={styles.errorIcon}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <input 
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={styles.forgotPasswordContainer}>
            <Link to="/forgot-password" style={styles.forgotPasswordLink}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" style={styles.submitButton}>
            Log In
          </button>
        </form>

        {/* Sign Up Link */}
        <p style={styles.signupText}>
          Don't have an account? <Link to="/signup" style={styles.signupLink}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  logo: {
    marginRight: '8px',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subheading: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '32px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    color: '#dc2626',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    flexShrink: 0,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    color: '#1f2937',
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordContainer: {
    textAlign: 'right',
    marginBottom: '24px',
  },
  forgotPasswordLink: {
    fontSize: '14px',
    color: '#3B82F6',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '24px',
  },
  signupText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
  },
  signupLink: {
    color: '#3B82F6',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
