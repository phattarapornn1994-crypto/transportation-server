import express from 'express';
import { dbAll, dbGet, dbRun, dbExec } from '../utils/db-helpers.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await dbAll('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await dbGet('SELECT * FROM customers WHERE id = ?', req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      address,
      latitude,
      longitude,
      phone,
      email,
      customer_type,
      working_hours_start,
      working_hours_end,
      special_constraints
    } = req.body;

    const result = await dbRun(`
      INSERT INTO customers (
        code, name, address, latitude, longitude, phone, email,
        customer_type, working_hours_start, working_hours_end, special_constraints
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code, name, address, latitude, longitude, phone, email,
      customer_type, working_hours_start, working_hours_end, special_constraints
    ]);

    const customer = await dbGet('SELECT * FROM customers WHERE id = ?', result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('unique')) {
      res.status(400).json({ error: 'Customer code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const {
      code,
      name,
      address,
      latitude,
      longitude,
      phone,
      email,
      customer_type,
      working_hours_start,
      working_hours_end,
      special_constraints
    } = req.body;

    const result = await dbRun(`
      UPDATE customers SET
        code = ?, name = ?, address = ?, latitude = ?, longitude = ?,
        phone = ?, email = ?, customer_type = ?,
        working_hours_start = ?, working_hours_end = ?, special_constraints = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      code, name, address, latitude, longitude, phone, email,
      customer_type, working_hours_start, working_hours_end, special_constraints,
      req.params.id
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = await dbGet('SELECT * FROM customers WHERE id = ?', req.params.id);
    res.json(customer);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('unique')) {
      res.status(400).json({ error: 'Customer code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update customer' });
    }
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM customers WHERE id = ?', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const customers = await dbAll(`
      SELECT * FROM customers
      WHERE code LIKE ? OR name LIKE ? OR address LIKE ?
      ORDER BY name
    `, [query, query, query]);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search customers' });
  }
});

export default router;

