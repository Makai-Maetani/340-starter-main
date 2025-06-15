const { Pool } = require("pg")
require("dotenv").config()

const isDev = process.env.NODE_ENV === "development"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isDev ? false : { rejectUnauthorized: false }, // for Render or Heroku
})

if (isDev) {
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("query error", { text, error })
        throw error
      }
    }
  }
} else {
  module.exports = pool
}
