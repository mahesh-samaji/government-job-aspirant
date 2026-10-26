
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

if (!email || !password) {
  console.error("Please set TEST_EMAIL and TEST_PASSWORD first.");
  process.exit(1);
}

fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
})
  .then(async (response) => {
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
