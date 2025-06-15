const pool = require("../database")

async function getClassifications() {
  const result = await pool.query("SELECT classification_id, classification_name FROM classification ORDER BY classification_name")
  return result.rows
}

async function getInventoryByClassificationId(classification_id) {
  const result = await pool.query(
    `SELECT * FROM inventory i
     JOIN classification c ON i.classification_id = c.classification_id
     WHERE i.classification_id = $1`,
    [classification_id]
  )
  return result.rows
}

async function getInventoryByClassificationName(classification_name) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory i
       JOIN classification c ON i.classification_id = c.classification_id
       WHERE LOWER(c.classification_name) = LOWER($1)`,
      [classification_name]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationName error:", error)
    throw error
  }
}

async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return result.rows
  } catch (error) {
    console.error("getVehicleById error:", error)
    throw error
  }
}

async function getInventory() {
  try {
    const result = await pool.query(
      `SELECT * FROM inventory i
       JOIN classification c ON i.classification_id = c.classification_id
       ORDER BY i.inv_make`
    )
    return result.rows
  } catch (error) {
    console.error("getInventory error:", error)
    throw error
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByClassificationName,
   getVehicleById,
     getInventory
}
