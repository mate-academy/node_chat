import { useState } from "react";
import "./AuthPage.scss";

function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "/api/register" : "/api/login";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("chat_user", JSON.stringify(data));
        onLoginSuccess(data);
      } else {
        alert(data.error || "Authorization error");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isRegister ? "Create an account" : "Log in to chat"}</h2>
        <form className="form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                className="form-element"
                placeholder="Name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                className="form-element"
                type="tel"
                placeholder="Phone number"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </>
          )}
          <input
            className="form-element"
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            className="form-element"
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button className="button" type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>
        <p onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? (
            <>
              Already have an account? <b>Log in</b>
            </>
          ) : (
            <>
              No account? <b>Register</b>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
