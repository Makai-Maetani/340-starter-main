const db = require("./database/connection");

async function get2018Vehicles() {
  try {
    const query = `
      SELECT inv_id, inv_make, inv_model, inv_year, inv_price 
      FROM inventory 
      WHERE inv_year = $1
    `;
    const result = await db.query(query, [2018]);

    console.log("✅ Vehicles from 2018:");
    result.rows.forEach((vehicle) => {
      console.log(
        `ID: ${vehicle.inv_id}, ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} - $${vehicle.inv_price}`
      );
    });
  } catch (err) {
    console.error("❌ Error fetching vehicles:", err.message);
  } finally {
    db.end(); // Close connection
  }
}

get2018Vehicles();
