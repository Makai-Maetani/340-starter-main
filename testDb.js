const db = require("./database/connection");

async function testConnection() {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ Connected to the database!");
    console.log(result.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

testConnection();
