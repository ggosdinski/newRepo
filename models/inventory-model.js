// inventory-model.js

const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
    throw error;
  }
}

/* ***************************
 *  Get vehicle details by inventory ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error: " + error);
    throw error;
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name) 
       VALUES ($1) RETURNING *`,
      [classification_name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error: " + error);
    throw error;
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(item) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = item;

  try {
    const query = `
      INSERT INTO public.inventory
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id`;
    
    const values = [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0].inv_id; // Return the inserted inv_id
  } catch (error) {
    console.error("Error adding inventory:", error);
    throw error;
  }
}

/* ***************************
 *  Get inventory details by inventory ID
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryById error: " + error);
    throw error;
  }
}


async function updateInventory(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) {
  try {
    const sql = `UPDATE inventory SET
      inv_make = $1,
      inv_model = $2,
      inv_description = $3,
      inv_image = $4,
      inv_thumbnail = $5,
      inv_price = $6,
      inv_year = $7,
      inv_miles = $8,
      inv_color = $9,
      classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;
    const data = await pool.query(sql, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount; // Retorna el número de filas afectadas por la eliminación
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    throw error; // Re-lanzar el error para que pueda ser manejado por el controlador
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  getInventoryById,
  updateInventory,
  deleteInventoryItem
};
