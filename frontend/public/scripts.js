import { Client, Account, ID, Databases } from "https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm";

// Init Appwrite
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("bruuuhauth");

const account = new Account(client);
const databases = new Databases(client);

// OAuth (Google, GitHub, Discord)
window.loginWith = (provider) => {
  account.createOAuth2Session(provider, "https://bruuuhauth.vercel.app/setup.html");
};

// ------------------------
// Email/Password Login
// ------------------------
const loginBtn = document.querySelector(".login-container .login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const emailOrUsername = document.querySelector("input[placeholder='Username or Email']").value;
    const password = document.querySelector("input[placeholder='Password']").value;
    const twoFactorCode = document.querySelector("input[placeholder='2FA']")?.value;

    try {
      await account.createEmailSession(emailOrUsername, password);

      const challenge = await account.createMfaChallenge();
      
      if (challenge && challenge.$id) {
        if (!twoFactorCode) {
          alert("2FA code required.");
          return;
        }

        await account.updateMfaChallenge(challenge.$id, twoFactorCode);
      }

      alert("Login successful!");
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("Login failed: " + err.message);
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
      alert("Registration successful. Redirecting to login...");
      window.location.href = "login.html";
    } catch (err) {
      alert("Register failed: " + err.message);
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

    // Save to database
    await databases.createDocument("users_db", "users", ID.unique(), {
      userId: user.$id,
      username: username,
      dob: dob,
      age: age
    });

    alert("Setup complete!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Failed to save profile: " + err.message);
  }
}

// Calculates age from DOB
function calculateAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// Export setup for HTML use
window.setupProfile = setupProfile;


// Forgot password flow
window.recoverPassword = async () => {
  const email = document.getElementById("recoveryEmail").value;

  try {
    await account.createRecovery(email, "https://bruuuhauth.vercel.app/reset.html");
    alert("Password reset link sent. Check your inbox.");
  } catch (err) {
    alert("Recovery failed: " + err.message);
  }
};
