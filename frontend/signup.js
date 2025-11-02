document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  function showSlide(n) {
    slides.forEach((s, i) => s.classList.toggle("active", i === n));
  }

  document.querySelectorAll(".next-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
    })
  );

  document.querySelectorAll(".prev-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    })
  );

  // Active toggle buttons
  document.querySelectorAll(".option-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    })
  );
  document.querySelectorAll(".gender-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gender-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    })
  );

  // Handle form submit
  const signupForm = document.getElementById("signupForm");
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const relation = document.querySelector(".option-btn.active")?.dataset.value || "";
    const gender = document.querySelector(".gender-btn.active")?.dataset.value || "";
    const [firstName, lastName, dob] = slides[1].querySelectorAll("input");
    const religion = slides[2].querySelector("select").value;
    const [community, livingIn] = slides[2].querySelectorAll("input");
    const email = slides[3].querySelector('input[type="email"]').value.trim();
    const phone = slides[3].querySelector('input[type="tel"]').value.trim();
    const password = slides[3].querySelector("#password").value;
    const confirmPassword = slides[3].querySelector("#confirmPassword").value;
    const profileImage = document.getElementById("profileImage").files[0];

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const formData = new FormData();
    formData.append("relation", relation);
    formData.append("gender", gender);
    formData.append("firstName", firstName.value.trim());
    formData.append("lastName", lastName.value.trim());
    formData.append("dob", dob.value);
    formData.append("religion", religion);
    formData.append("community", community.value.trim());
    formData.append("livingIn", livingIn.value.trim());
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("image", profileImage);


    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        body: formData,
      });
    
      const data = await res.json();
    
      console.log("Response status:", res.status);
      console.log("Response data:", data);
    
      if (res.ok) {
        alert("✅ Registered successfully!");
        window.location.href = "main.html";
      } else {
        alert("❌ " + (data.message || "Registration failed"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Could not connect to server. Make sure backend is running.");
    }
    
  });
});
