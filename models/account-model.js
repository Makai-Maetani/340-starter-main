const pool = require("../database/connection");
const bcrypt = require('bcrypt');


async function createAccount(firstName, lastName, email, hashedPassword, accountType = "Client") {
  const query = `
    INSERT INTO account (
      account_firstname, account_lastname, account_email, account_password, account_type
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING account_id
  `;
  const values = [firstName, lastName, email, hashedPassword, accountType];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getAccountByEmail(email) {
  const query = "SELECT * FROM account WHERE account_email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

async function getAccountByCredentials(email, password) {
  try {
    const result = await pool.query(
      "SELECT * FROM account WHERE account_email = $1",
      [email]
    );
    const account = result.rows[0];
    
    if (account) {
      const isValid = await bcrypt.compare(password, account.account_password);
      if (isValid) {
        return account;
      }
    }
    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

async function updateAccountInfo(account_id, firstName, lastName, email) {
  const query = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
  `;
  const values = [firstName, lastName, email, account_id];
  return pool.query(query, values);
}

async function updateAccountPassword(account_id, hashedPassword) {
  const query = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
  `;
  const values = [hashedPassword, account_id];
  return pool.query(query, values);
}

// Add to exports
module.exports = {
  createAccount,
  getAccountByEmail,
  getAccountByCredentials,
  updateAccountInfo,
  updateAccountPassword
};