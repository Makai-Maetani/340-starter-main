const pool = require('../database/connection')
const { body, validationResult } = require('express-validator')

const classificationController = {}

// Show the add classification form
classificationController.showAddForm = async (req, res) => {
  res.render('classification/addClassification', {
    title: 'Add Classification',
    errors: [],
    data: {}
  })
}

// Handle the add classification form post
classificationController.handleAddForm = [
  body('classification_name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Classification name must be at least 3 characters'),

  async (req, res) => {
    const errors = validationResult(req)
    const data = req.body

    if (!errors.isEmpty()) {
      return res.render('classification/addClassification', {
        title: 'Add Classification',
        errors: errors.array(),
        data
      })
    }

    try {
      const query = `INSERT INTO classification (classification_name) VALUES ($1)`
      const values = [data.classification_name]

      await pool.query(query, values)
      res.redirect('/') // or wherever you want to go after adding classification
    } catch (err) {
      console.error(err)
      res.status(500).send('Database insert failed')
    }
  }
]

module.exports = classificationController
