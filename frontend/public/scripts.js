// ✅ FIXED scripts.js
import { Client, Account, ID, Databases } from "https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm";

// Init Appwrite
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("bruuuhauth");

const account = new Account(client);
const databases = new Databases(client);

// ------------------------
// TOAST NOTIFICATION SYSTEM
// ------------------------
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `toast ${type}`;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "14px 20px",
    background: type === "success" ? "#1f9d55" : type === "error" ? "#e53e3e" : "#2d3748",
    color: "white",
    borderRadius: "8px",
    boxShadow: "0 0 12px rgba(0,0,0,0.5)",
    zIndex: 9999,
    fontSize: "14px",
    opacity: 0,
    transition: "opacity 0.4s ease"
  });

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = 1 }, 50);
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

window.showToast = showToast;

// ------------------------
// OAuth (Google, GitHub, Discord)
// ------------------------
window.loginWith = (provider) => {
  account.createOAuth2Session(provider, "https://bruuuhauth.vercel.app/setup.html");
};

// ------------------------
// Email/Password Login (with optional 2FA)
// ------------------------
const loginBtn = document.querySelector(".login-container .login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const emailOrUsername = document.querySelector("input[placeholder='Username or Email']").value;
    const password = document.querySelector("input[placeholder='Password']").value;
    const twoFactorCode = document.querySelector("input[placeholder='2FA']")?.value;

    try {
      await account.createEmailSession(emailOrUsername, password);
      const user = await account.get();

      if (user.mfa?.totp) {
        const challenge = await account.createMfaChallenge();
        if (!twoFactorCode) {
          showToast("2FA code required.", "error");
          return;
        }
        await account.updateMfaChallenge(challenge.$id, twoFactorCode);
      }

      showToast("Login successful!", "success");
      window.location.href = "dashboard.html";
    } catch (err) {
      showToast("Login failed: " + err.message, "error");
    }
  });
}

// ------------------------
// Register New User
// ------------------------
const regBtn = document.querySelector(".register-container .login-btn");
if (regBtn) {
  regBtn.addEventListener("click", async () => {
    const username = document.querySelector("input[placeholder='Username']").value;
    const email = document.querySelector("input[placeholder='Email']").value;
    const password = document.querySelector("input[placeholder='Password']").value;

    try {
      await account.create(ID.unique(), email, password, username);
      showToast("Registration successful. Redirecting to login...", "success");
      window.location.href = "login.html";
    } catch (err) {
      showToast("Register failed: " + err.message, "error");
    }
  });
}

// ------------------------
// Setup Page (username + DOB for OAuth)
// ------------------------
async function setupProfile() {
  try {
    const user = await account.get();

    const username = document.getElementById("username").value;
    const dob = document.getElementById("dob").value;
    const age = calculateAge(new Date(dob));

    // WARNING: Replace with your actual DB and Collection IDs
    const databaseId = "bruuuhauth";
    const collectionId = "bruuuhauth";

    await databases.createDocument(databaseId, collectionId, ID.unique(), {
      userId: user.$id,
      username: username,
      dob: dob,
      age: age
    });

    showToast("Setup complete!", "success");
    window.location.href = "dashboard.html";
  } catch (err) {
    showToast("Failed to save profile: " + err.message, "error");
  }
}
window.setupProfile = setupProfile;

function calculateAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// ------------------------
// Forgot password flow
// ------------------------
window.recoverPassword = async () => {
  const email = document.getElementById("recoveryEmail").value;
  try {
    await account.createRecovery(email, "https://bruuuhauth.vercel.app/reset.html");
    showToast("Password reset link sent. Check your inbox.", "success");
  } catch (err) {
    showToast("Recovery failed: " + err.message, "error");
  }
};
