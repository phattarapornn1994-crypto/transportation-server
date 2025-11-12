import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all vehicles
router.get('/', (req, res) => {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC').all();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID
router.get('/:id', (req, res) => {
  try {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Create vehicle
router.post('/', (req, res) => {
  try {
    const {
      license_plate,
      vehicle_type,
      capacity_weight,
      capacity_volume,
      ownership_type,
      cost_per_km,
      status
    } = req.body;

    const result = db.prepare(`
      INSERT INTO vehicles (
        license_plate, vehicle_type, capacity_weight, capacity_volume,
        ownership_type, cost_per_km, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      license_plate, vehicle_type, capacity_weight, capacity_volume,
      ownership_type, cost_per_km, status || 'available'
    );

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(vehicle);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'License plate already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create vehicle' });
    }
  }
});

// Update vehicle
router.put('/:id', (req, res) => {
  try {
    const {
      license_plate,
      vehicle_type,
      capacity_weight,
      capacity_volume,
      ownership_type,
      cost_per_km,
      status
    } = req.body;

    const result = db.prepare(`
      UPDATE vehicles SET
        license_plate = ?, vehicle_type = ?, capacity_weight = ?, capacity_volume = ?,
        ownership_type = ?, cost_per_km = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      license_plate, vehicle_type, capacity_weight, capacity_volume,
      ownership_type, cost_per_km, status,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    res.json(vehicle);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'License plate already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  }
});

// Delete vehicle
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Get available vehicles
router.get('/available/list', (req, res) => {
  try {
    const vehicles = db.prepare(`
      SELECT * FROM vehicles
      WHERE status = 'available'
      ORDER BY vehicle_type, capacity_weight DESC
    `).all();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available vehicles' });
  }
});

export default router;

