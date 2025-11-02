// login.js - connect login.html to backend API

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
  
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const email = loginForm.querySelector('input[type="email"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value;
  
        if (!email || !password) {
          alert("Please fill in both email and password!");
          return;
        }
  
        try {
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
  
          const data = await res.json();
  
          if (res.ok) {
            alert("🎉 Login successful!");
            console.log("User:", data);
            localStorage.setItem("userToken", data.token); // optional
            window.location.href = "home.html"; // redirect to your homepage
          } else {
            alert("❌ " + (data.message || "Invalid credentials"));
          }
        } catch (error) {
          console.error("Error:", error);
          alert("⚠️ Could not connect to server. Please try again later.");
        }
      });
    }
  });
  