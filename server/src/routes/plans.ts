import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all plans
router.get('/', (req, res) => {
  try {
    const plans = db.prepare(`
      SELECT * FROM transportation_plans
      ORDER BY created_at DESC
    `).all();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get plan by ID with items
router.get('/:id', (req, res) => {
  try {
    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const items = db.prepare(`
      SELECT pi.*, c.code, c.name, c.address, c.latitude, c.longitude
      FROM plan_items pi
      JOIN customers c ON pi.customer_id = c.id
      WHERE pi.plan_id = ?
      ORDER BY pi.id
    `).all(req.params.id);

    res.json({ ...plan, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// Create plan
router.post('/', (req, res) => {
  try {
    const {
      name,
      plan_date,
      origin_address,
      origin_latitude,
      origin_longitude,
      items
    } = req.body;

    const result = db.prepare(`
      INSERT INTO transportation_plans (
        name, plan_date, origin_address, origin_latitude, origin_longitude
      ) VALUES (?, ?, ?, ?, ?)
    `).run(name, plan_date, origin_address, origin_latitude, origin_longitude);

    const planId = result.lastInsertRowid;

    // Insert plan items
    if (items && items.length > 0) {
      const insertItem = db.prepare(`
        INSERT INTO plan_items (plan_id, customer_id, quantity, weight, volume, delivery_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((items: any[]) => {
        for (const item of items) {
          insertItem.run(
            planId,
            item.customer_id,
            item.quantity,
            item.weight,
            item.volume,
            item.delivery_type || 'delivery'
          );
        }
      });

      insertMany(items);
    }

    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(planId);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// Update plan
router.put('/:id', (req, res) => {
  try {
    const {
      name,
      plan_date,
      origin_address,
      origin_latitude,
      origin_longitude,
      status,
      items
    } = req.body;

    const result = db.prepare(`
      UPDATE transportation_plans SET
        name = ?, plan_date = ?, origin_address = ?,
        origin_latitude = ?, origin_longitude = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, plan_date, origin_address,
      origin_latitude, origin_longitude,
      status,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Update items if provided
    if (items) {
      // Delete existing items
      db.prepare('DELETE FROM plan_items WHERE plan_id = ?').run(req.params.id);

      // Insert new items
      if (items.length > 0) {
        const insertItem = db.prepare(`
          INSERT INTO plan_items (plan_id, customer_id, quantity, weight, volume, delivery_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((items: any[]) => {
          for (const item of items) {
            insertItem.run(
              req.params.id,
              item.customer_id,
              item.quantity,
              item.weight,
              item.volume,
              item.delivery_type || 'delivery'
            );
          }
        });

        insertMany(items);
      }
    }

    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(req.params.id);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Delete plan
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM transportation_plans WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

export default router;

