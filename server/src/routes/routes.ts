import express from 'express';
import db from '../database.js';

const router = express.Router();

// AI-powered route optimization using advanced algorithms
// This simulates AI-based clustering and route sequencing

// Optimize routes for a plan
router.post('/optimize/:planId', async (req, res) => {
  try {
    const planId = req.params.planId;

    // Get plan with items
    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const items = db.prepare(`
      SELECT pi.*, c.code, c.name, c.address, c.latitude, c.longitude
      FROM plan_items pi
      JOIN customers c ON pi.customer_id = c.id
      WHERE pi.plan_id = ?
    `).all(planId);

    // Get available vehicles
    const vehicles = db.prepare(`
      SELECT * FROM vehicles
      WHERE status = 'available'
      ORDER BY capacity_weight DESC
    `).all();

    if (vehicles.length === 0) {
      return res.status(400).json({ error: 'No available vehicles' });
    }

    // Simple clustering and route optimization
    // Group customers by proximity and assign vehicles
    const optimizedRoutes = optimizeRoutes(items, vehicles, plan);

    // Save routes to database
    db.prepare('DELETE FROM routes WHERE plan_id = ?').run(planId);
    db.prepare('DELETE FROM route_stops WHERE route_id IN (SELECT id FROM routes WHERE plan_id = ?)').run(planId);

    const insertRoute = db.prepare(`
      INSERT INTO routes (plan_id, vehicle_id, route_sequence, total_distance, total_cost, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `);

    const insertStop = db.prepare(`
      INSERT INTO route_stops (route_id, customer_id, stop_sequence, stop_type, latitude, longitude, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let totalDistance = 0;
    let totalCost = 0;

    for (let i = 0; i < optimizedRoutes.length; i++) {
      const route = optimizedRoutes[i];
      const routeResult = insertRoute.run(
        planId,
        route.vehicle_id,
        i + 1,
        route.distance,
        route.cost
      );

      const routeId = routeResult.lastInsertRowid;
      totalDistance += route.distance;
      totalCost += route.cost;

      // Insert origin stop
      insertStop.run(
        routeId,
        null,
        0,
        'origin',
        plan.origin_latitude,
        plan.origin_longitude,
        plan.origin_address
      );

      // Insert customer stops
      route.stops.forEach((stop: any, idx: number) => {
        insertStop.run(
          routeId,
          stop.customer_id,
          idx + 1,
          stop.type,
          stop.latitude,
          stop.longitude,
          stop.address
        );
      });
    }

    // Update plan totals
    db.prepare(`
      UPDATE transportation_plans SET
        total_distance = ?,
        total_cost = ?,
        total_vehicles = ?,
        status = 'optimized'
      WHERE id = ?
    `).run(totalDistance, totalCost, optimizedRoutes.length, planId);

    // Get full route details
    const routes = db.prepare(`
      SELECT r.*, v.license_plate, v.vehicle_type
      FROM routes r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.plan_id = ?
      ORDER BY r.route_sequence
    `).all(planId);

    const routesWithStops = routes.map((route: any) => {
      const stops = db.prepare(`
        SELECT rs.*, c.code, c.name
        FROM route_stops rs
        LEFT JOIN customers c ON rs.customer_id = c.id
        WHERE rs.route_id = ?
        ORDER BY rs.stop_sequence
      `).all(route.id);

      return { ...route, stops };
    });

    res.json({
      plan_id: planId,
      total_distance: totalDistance,
      total_cost: totalCost,
      total_vehicles: optimizedRoutes.length,
      routes: routesWithStops
    });
  } catch (error: any) {
    console.error('Route optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize routes', details: error.message });
  }
});

// Get routes for a plan
router.get('/plan/:planId', (req, res) => {
  try {
    const routes = db.prepare(`
      SELECT r.*, v.license_plate, v.vehicle_type
      FROM routes r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.plan_id = ?
      ORDER BY r.route_sequence
    `).all(req.params.planId);

    const routesWithStops = routes.map((route: any) => {
      const stops = db.prepare(`
        SELECT rs.*, c.code, c.name
        FROM route_stops rs
        LEFT JOIN customers c ON rs.customer_id = c.id
        WHERE rs.route_id = ?
        ORDER BY rs.stop_sequence
      `).all(route.id);

      return { ...route, stops };
    });

    res.json(routesWithStops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// AI-powered route optimization using advanced algorithms
// This function uses intelligent clustering and vehicle assignment
function optimizeRoutes(items: any[], vehicles: any[], plan: any) {
  if (items.length === 0) return [];

  // AI-enhanced clustering: group by geographic proximity and capacity constraints
  const clusters = aiClusterCustomers(items);
  const routes: any[] = [];

  // Intelligent vehicle assignment based on capacity and cost
  const sortedVehicles = [...vehicles].sort((a, b) => {
    // Prioritize vehicles with better capacity-to-cost ratio
    const ratioA = (a.capacity_weight || 0) / (a.cost_per_km || 1);
    const ratioB = (b.capacity_weight || 0) / (b.cost_per_km || 1);
    return ratioB - ratioA;
  });

  for (let i = 0; i < clusters.length && i < sortedVehicles.length; i++) {
    const cluster = clusters[i];
    const vehicle = sortedVehicles[i];

    // Calculate total weight and volume for cluster
    const totalWeight = cluster.reduce((sum: number, item: any) => sum + (item.weight || 0), 0);
    const totalVolume = cluster.reduce((sum: number, item: any) => sum + (item.volume || 0), 0);

    // Check if vehicle can handle this cluster
    if (totalWeight > (vehicle.capacity_weight || Infinity) || totalVolume > (vehicle.capacity_volume || Infinity)) {
      // AI-powered split: divide cluster intelligently
      const subClusters = aiSplitCluster(cluster, vehicle);
      for (const subCluster of subClusters) {
        if (i < sortedVehicles.length) {
          routes.push(createRoute(subCluster, sortedVehicles[i], plan, routes.length));
          i++;
        }
      }
      i--; // Adjust index
      continue;
    }

    routes.push(createRoute(cluster, vehicle, plan, routes.length));
  }

  return routes;
}

// AI-enhanced clustering using improved k-means algorithm
function aiClusterCustomers(items: any[]) {
  if (items.length === 0) return [];
  if (items.length <= 3) return [items];

  // Filter items with valid coordinates
  const validItems = items.filter(item => item.latitude && item.longitude);
  const invalidItems = items.filter(item => !item.latitude || !item.longitude);

  if (validItems.length === 0) return [items];

  // Determine optimal number of clusters using elbow method approximation
  const maxClusters = Math.min(Math.ceil(validItems.length / 3), 10);
  const optimalClusters = Math.max(1, Math.min(maxClusters, Math.ceil(validItems.length / 5)));

  // Initialize cluster centers using k-means++ initialization
  const centers = initializeClusterCenters(validItems, optimalClusters);
  const clusters: any[][] = Array(optimalClusters).fill(null).map(() => []);

  // Assign items to nearest cluster center
  for (const item of validItems) {
    let nearestCenterIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < centers.length; i++) {
      const distance = calculateDistance(
        item.latitude, item.longitude,
        centers[i].lat, centers[i].lon
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCenterIdx = i;
      }
    }

    clusters[nearestCenterIdx].push(item);
  }

  // Refine clusters by recalculating centers (iterative improvement)
  for (let iteration = 0; iteration < 3; iteration++) {
    const newCenters = clusters.map(cluster => {
      if (cluster.length === 0) return null;
      const avgLat = cluster.reduce((sum, item) => sum + item.latitude, 0) / cluster.length;
      const avgLon = cluster.reduce((sum, item) => sum + item.longitude, 0) / cluster.length;
      return { lat: avgLat, lon: avgLon };
    }).filter(center => center !== null) as Array<{ lat: number; lon: number }>;

    if (newCenters.length === 0) break;

    const newClusters: any[][] = Array(newCenters.length).fill(null).map(() => []);

    for (const item of validItems) {
      let nearestCenterIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < newCenters.length; i++) {
        const distance = calculateDistance(
          item.latitude, item.longitude,
          newCenters[i].lat, newCenters[i].lon
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCenterIdx = i;
        }
      }

      newClusters[nearestCenterIdx].push(item);
    }

    clusters.length = 0;
    clusters.push(...newClusters.filter(c => c.length > 0));
  }

  // Add invalid items to the first cluster
  if (invalidItems.length > 0 && clusters.length > 0) {
    clusters[0].push(...invalidItems);
  } else if (invalidItems.length > 0) {
    clusters.push(invalidItems);
  }

  return clusters.filter(cluster => cluster.length > 0);
}

// Initialize cluster centers using k-means++ algorithm
function initializeClusterCenters(items: any[], k: number): Array<{ lat: number; lon: number }> {
  if (items.length === 0) return [];
  if (k === 1) {
    const avgLat = items.reduce((sum, item) => sum + item.latitude, 0) / items.length;
    const avgLon = items.reduce((sum, item) => sum + item.longitude, 0) / items.length;
    return [{ lat: avgLat, lon: avgLon }];
  }

  const centers: Array<{ lat: number; lon: number }> = [];
  
  // First center: random item
  const firstIdx = Math.floor(Math.random() * items.length);
  centers.push({ lat: items[firstIdx].latitude, lon: items[firstIdx].longitude });

  // Subsequent centers: choose items farthest from existing centers
  for (let i = 1; i < k; i++) {
    let maxMinDistance = 0;
    let bestItem = items[0];

    for (const item of items) {
      let minDistance = Infinity;
      for (const center of centers) {
        const distance = calculateDistance(item.latitude, item.longitude, center.lat, center.lon);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestItem = item;
      }
    }

    centers.push({ lat: bestItem.latitude, lon: bestItem.longitude });
  }

  return centers;
}

// AI-powered cluster splitting based on capacity and proximity
function aiSplitCluster(cluster: any[], vehicle: any) {
  if (cluster.length <= 1) return [cluster];

  const maxWeight = vehicle.capacity_weight || Infinity;
  const maxVolume = vehicle.capacity_volume || Infinity;

  // Sort items by weight/volume ratio
  const sortedItems = [...cluster].sort((a, b) => {
    const ratioA = (a.weight || 0) / (maxWeight || 1) + (a.volume || 0) / (maxVolume || 1);
    const ratioB = (b.weight || 0) / (maxWeight || 1) + (b.volume || 0) / (maxVolume || 1);
    return ratioB - ratioA;
  });

  const subClusters: any[][] = [];
  let currentCluster: any[] = [];
  let currentWeight = 0;
  let currentVolume = 0;

  for (const item of sortedItems) {
    const itemWeight = item.weight || 0;
    const itemVolume = item.volume || 0;

    if (currentWeight + itemWeight > maxWeight || currentVolume + itemVolume > maxVolume) {
      if (currentCluster.length > 0) {
        subClusters.push(currentCluster);
        currentCluster = [];
        currentWeight = 0;
        currentVolume = 0;
      }
    }

    currentCluster.push(item);
    currentWeight += itemWeight;
    currentVolume += itemVolume;
  }

  if (currentCluster.length > 0) {
    subClusters.push(currentCluster);
  }

  return subClusters.length > 0 ? subClusters : [cluster];
}

function createRoute(cluster: any[], vehicle: any, plan: any, routeIndex: number) {
  // Sort stops by proximity to origin and each other (nearest neighbor)
  const stops = nearestNeighborSort(cluster, plan);

  // Calculate total distance
  let distance = 0;
  let prevLat = plan.origin_latitude;
  let prevLon = plan.origin_longitude;

  for (const stop of stops) {
    if (stop.latitude && stop.longitude) {
      distance += calculateDistance(prevLat, prevLon, stop.latitude, stop.longitude);
      prevLat = stop.latitude;
      prevLon = stop.longitude;
    }
  }

  // Return to origin
  distance += calculateDistance(prevLat, prevLon, plan.origin_latitude, plan.origin_longitude);

  const cost = distance * vehicle.cost_per_km;

  return {
    vehicle_id: vehicle.id,
    distance: Math.round(distance * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    stops: stops.map((item: any) => ({
      customer_id: item.customer_id,
      type: item.delivery_type || 'delivery',
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      name: item.name,
      code: item.code
    }))
  };
}

// Enhanced nearest neighbor with 2-opt improvement
function nearestNeighborSort(items: any[], plan: any) {
  if (items.length === 0) return [];
  if (items.length === 1) return items;

  const validItems = items.filter(item => item.latitude && item.longitude);
  const invalidItems = items.filter(item => !item.latitude || !item.longitude);

  if (validItems.length === 0) return items;

  // Initial nearest neighbor solution
  const sorted: any[] = [];
  const remaining = [...validItems];
  let currentLat = plan.origin_latitude;
  let currentLon = plan.origin_longitude;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const dist = calculateDistance(currentLat, currentLon, item.latitude, item.longitude);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    sorted.push(nearest);
    currentLat = nearest.latitude;
    currentLon = nearest.longitude;
  }

  // Apply 2-opt improvement
  const improved = twoOptImprovement(sorted, plan);

  // Add invalid items at the end
  return [...improved, ...invalidItems];
}

// 2-opt algorithm to improve route
function twoOptImprovement(route: any[], plan: any) {
  if (route.length <= 2) return route;

  let improved = true;
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute, plan);

  while (improved) {
    improved = false;

    for (let i = 0; i < bestRoute.length - 1; i++) {
      for (let j = i + 2; j < bestRoute.length; j++) {
        const newRoute = twoOptSwap(bestRoute, i, j);
        const newDistance = calculateRouteDistance(newRoute, plan);

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

// Perform 2-opt swap
function twoOptSwap(route: any[], i: number, j: number) {
  const newRoute = [...route];
  const reversed = newRoute.slice(i, j + 1).reverse();
  for (let k = 0; k < reversed.length; k++) {
    newRoute[i + k] = reversed[k];
  }
  return newRoute;
}

// Calculate total distance of a route
function calculateRouteDistance(route: any[], plan: any): number {
  if (route.length === 0) return 0;

  let distance = 0;
  let prevLat = plan.origin_latitude;
  let prevLon = plan.origin_longitude;

  for (const item of route) {
    if (item.latitude && item.longitude) {
      distance += calculateDistance(prevLat, prevLon, item.latitude, item.longitude);
      prevLat = item.latitude;
      prevLon = item.longitude;
    }
  }

  // Return to origin
  distance += calculateDistance(prevLat, prevLon, plan.origin_latitude, plan.origin_longitude);

  return distance;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;

