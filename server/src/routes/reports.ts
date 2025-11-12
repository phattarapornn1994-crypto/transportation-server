import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import db from '../database.js';
import { writeFileSync, createWriteStream } from 'fs';
import { join } from 'path';

const router = express.Router();

// Generate transportation plan summary report (PDF)
router.get('/plan-summary/:planId/pdf', (req, res) => {
  try {
    const planId = req.params.planId;
    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const routes = db.prepare(`
      SELECT r.*, v.license_plate, v.vehicle_type
      FROM routes r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.plan_id = ?
      ORDER BY r.route_sequence
    `).all(planId);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=plan-${planId}-summary.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('รายงานสรุปแผนการขนส่ง', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`ชื่อแผน: ${plan.name}`);
    doc.text(`วันที่: ${plan.plan_date}`);
    doc.text(`จุดเริ่มต้น: ${plan.origin_address}`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('สรุปภาพรวม', { underline: true });
    doc.fontSize(12);
    doc.text(`จำนวนรถ: ${plan.total_vehicles || 0} คัน`);
    doc.text(`ระยะทางรวม: ${plan.total_distance || 0} กม.`);
    doc.text(`ต้นทุนรวม: ${plan.total_cost || 0} บาท`);
    doc.moveDown();

    // Routes
    doc.fontSize(14).text('รายละเอียดเส้นทาง', { underline: true });
    doc.moveDown();

    routes.forEach((route: any, index: number) => {
      doc.fontSize(12).text(`เส้นทางที่ ${route.route_sequence}: ${route.license_plate} (${route.vehicle_type})`);
      doc.fontSize(10);
      doc.text(`  ระยะทาง: ${route.total_distance} กม.`);
      doc.text(`  ต้นทุน: ${route.total_cost} บาท`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// Generate driver work order (PDF)
router.get('/driver-order/:routeId/pdf', (req, res) => {
  try {
    const routeId = req.params.routeId;
    const route = db.prepare(`
      SELECT r.*, v.license_plate, v.vehicle_type, p.name as plan_name, p.plan_date, p.origin_address
      FROM routes r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN transportation_plans p ON r.plan_id = p.id
      WHERE r.id = ?
    `).get(routeId);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const stops = db.prepare(`
      SELECT rs.*, c.code, c.name, c.phone
      FROM route_stops rs
      LEFT JOIN customers c ON rs.customer_id = c.id
      WHERE rs.route_id = ?
      ORDER BY rs.stop_sequence
    `).all(routeId);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=driver-order-${routeId}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('คำสั่งงานสำหรับคนขับ', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`แผนการขนส่ง: ${route.plan_name}`);
    doc.text(`วันที่: ${route.plan_date}`);
    doc.text(`ทะเบียนรถ: ${route.license_plate}`);
    doc.text(`ประเภทรถ: ${route.vehicle_type}`);
    doc.moveDown();

    doc.fontSize(14).text('เส้นทางการเดินทาง', { underline: true });
    doc.moveDown();

    stops.forEach((stop: any, index: number) => {
      doc.fontSize(12).text(`${index + 1}. ${stop.stop_type === 'origin' ? 'จุดเริ่มต้น' : stop.name || stop.address}`);
      if (stop.address) doc.fontSize(10).text(`   ที่อยู่: ${stop.address}`);
      if (stop.phone) doc.fontSize(10).text(`   โทร: ${stop.phone}`);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(12);
    doc.text(`ระยะทางรวม: ${route.total_distance} กม.`);
    doc.text(`หมายเหตุ: กรุณาติดต่อลูกค้าก่อนถึงจุดหมาย`);

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate driver order' });
  }
});

// Generate cost report (Excel)
router.get('/cost-report/:planId/excel', async (req, res) => {
  try {
    const planId = req.params.planId;
    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const routes = db.prepare(`
      SELECT r.*, v.license_plate, v.vehicle_type, v.cost_per_km
      FROM routes r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.plan_id = ?
      ORDER BY r.route_sequence
    `).all(planId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('รายงานต้นทุนการขนส่ง');

    // Header
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'รายงานต้นทุนการขนส่ง';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A2').value = 'ชื่อแผน:';
    worksheet.getCell('B2').value = plan.name;
    worksheet.getCell('A3').value = 'วันที่:';
    worksheet.getCell('B3').value = plan.plan_date;

    // Table headers
    const headers = ['ลำดับ', 'ทะเบียนรถ', 'ประเภทรถ', 'ระยะทาง (กม.)', 'ต้นทุนต่อกม.', 'ต้นทุนรวม (บาท)'];
    worksheet.addRow(headers);
    const headerRow = worksheet.getRow(5);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Data rows
    routes.forEach((route: any, index: number) => {
      worksheet.addRow([
        index + 1,
        route.license_plate,
        route.vehicle_type,
        route.total_distance,
        route.cost_per_km,
        route.total_cost
      ]);
    });

    // Summary row
    const summaryRow = worksheet.addRow([
      'รวม',
      '',
      '',
      plan.total_distance,
      '',
      plan.total_cost
    ]);
    summaryRow.font = { bold: true };

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=cost-report-${planId}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

// Export raw data (CSV/Excel)
router.get('/export/:planId/:format', async (req, res) => {
  try {
    const { planId, format } = req.params;
    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const items = db.prepare(`
      SELECT pi.*, c.code, c.name, c.address, c.phone
      FROM plan_items pi
      JOIN customers c ON pi.customer_id = c.id
      WHERE pi.plan_id = ?
    `).all(planId);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=plan-${planId}.csv`);
      
      const headers = ['รหัสลูกค้า', 'ชื่อลูกค้า', 'ที่อยู่', 'ปริมาณ', 'น้ำหนัก', 'ปริมาตร', 'ประเภท'];
      res.write(headers.join(',') + '\n');
      
      items.forEach((item: any) => {
        res.write([
          item.code,
          item.name,
          `"${item.address || ''}"`,
          item.quantity,
          item.weight,
          item.volume,
          item.delivery_type
        ].join(',') + '\n');
      });
      
      res.end();
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('ข้อมูลแผนการขนส่ง');

      worksheet.addRow(['รหัสลูกค้า', 'ชื่อลูกค้า', 'ที่อยู่', 'ปริมาณ', 'น้ำหนัก', 'ปริมาตร', 'ประเภท']);
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };

      items.forEach((item: any) => {
        worksheet.addRow([
          item.code,
          item.name,
          item.address,
          item.quantity,
          item.weight,
          item.volume,
          item.delivery_type
        ]);
      });

      worksheet.columns.forEach((column) => {
        column.width = 15;
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=plan-${planId}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ error: 'Invalid format. Use csv or excel' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Generate performance analysis report (Excel/PDF)
router.get('/performance/:planId/:format', async (req, res) => {
  try {
    const { planId, format } = req.params;
    const plan = db.prepare('SELECT * FROM transportation_plans WHERE id = ?').get(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const routes = db.prepare(`
      SELECT r.*, v.license_plate, v.vehicle_type, v.cost_per_km,
             COUNT(rs.id) as stop_count
      FROM routes r
      JOIN vehicles v ON r.vehicle_id = v.id
      LEFT JOIN route_stops rs ON r.id = rs.route_id AND rs.stop_type != 'origin'
      WHERE r.plan_id = ?
      GROUP BY r.id
      ORDER BY r.route_sequence
    `).all(planId);

    const items = db.prepare(`
      SELECT pi.*, c.code, c.name
      FROM plan_items pi
      JOIN customers c ON pi.customer_id = c.id
      WHERE pi.plan_id = ?
    `).all(planId);

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalVolume = items.reduce((sum, item) => sum + (item.volume || 0), 0);

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('รายงานการวิเคราะห์ประสิทธิภาพ');

      // Header
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = 'รายงานการวิเคราะห์ประสิทธิภาพการขนส่ง';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.getCell('A2').value = 'ชื่อแผน:';
      worksheet.getCell('B2').value = plan.name;
      worksheet.getCell('A3').value = 'วันที่:';
      worksheet.getCell('B3').value = plan.plan_date;

      // Summary section
      worksheet.addRow([]);
      worksheet.addRow(['สรุปภาพรวม']);
      const summaryHeader = worksheet.getRow(5);
      summaryHeader.font = { bold: true, size: 12 };
      
      worksheet.addRow(['จำนวนรถ', plan.total_vehicles || 0, 'คัน']);
      worksheet.addRow(['ระยะทางรวม', plan.total_distance || 0, 'กม.']);
      worksheet.addRow(['ต้นทุนรวม', plan.total_cost || 0, 'บาท']);
      worksheet.addRow(['จำนวนลูกค้า', items.length, 'ราย']);
      worksheet.addRow(['ปริมาณรวม', totalQuantity, 'หน่วย']);
      worksheet.addRow(['น้ำหนักรวม', totalWeight, 'กก.']);
      worksheet.addRow(['ปริมาตรรวม', totalVolume, 'ลบ.ม.']);
      worksheet.addRow(['ต้นทุนเฉลี่ยต่อกม.', plan.total_distance > 0 ? (plan.total_cost / plan.total_distance).toFixed(2) : 0, 'บาท/กม.']);

      // Route analysis
      worksheet.addRow([]);
      worksheet.addRow(['การวิเคราะห์เส้นทาง']);
      const routeHeaderRow = worksheet.addRow(['ลำดับ', 'ทะเบียนรถ', 'ประเภทรถ', 'จำนวนจุด', 'ระยะทาง (กม.)', 'ต้นทุน (บาท)', 'ประสิทธิภาพ']);
      routeHeaderRow.font = { bold: true };
      routeHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      routes.forEach((route: any, index: number) => {
        const efficiency = route.total_distance > 0 
          ? ((route.stop_count || 0) / route.total_distance).toFixed(2)
          : 0;
        
        worksheet.addRow([
          index + 1,
          route.license_plate,
          route.vehicle_type,
          route.stop_count || 0,
          route.total_distance,
          route.total_cost,
          `${efficiency} จุด/กม.`
        ]);
      });

      // KPIs
      worksheet.addRow([]);
      worksheet.addRow(['ตัวชี้วัดประสิทธิภาพ (KPIs)']);
      const kpiHeader = worksheet.getRow(worksheet.rowCount);
      kpiHeader.font = { bold: true, size: 12 };

      const avgDistancePerVehicle = routes.length > 0 
        ? routes.reduce((sum, r: any) => sum + (r.total_distance || 0), 0) / routes.length 
        : 0;
      const avgCostPerVehicle = routes.length > 0
        ? routes.reduce((sum, r: any) => sum + (r.total_cost || 0), 0) / routes.length
        : 0;
      const avgStopsPerRoute = routes.length > 0
        ? routes.reduce((sum, r: any) => sum + (r.stop_count || 0), 0) / routes.length
        : 0;

      worksheet.addRow(['ระยะทางเฉลี่ยต่อรถ', avgDistancePerVehicle.toFixed(2), 'กม.']);
      worksheet.addRow(['ต้นทุนเฉลี่ยต่อรถ', avgCostPerVehicle.toFixed(2), 'บาท']);
      worksheet.addRow(['จำนวนจุดเฉลี่ยต่อเส้นทาง', avgStopsPerRoute.toFixed(1), 'จุด']);

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=performance-${planId}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=performance-${planId}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(18).text('รายงานการวิเคราะห์ประสิทธิภาพการขนส่ง', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`ชื่อแผน: ${plan.name}`);
      doc.text(`วันที่: ${plan.plan_date}`);
      doc.moveDown();

      // Summary
      doc.fontSize(14).text('สรุปภาพรวม', { underline: true });
      doc.fontSize(12);
      doc.text(`จำนวนรถ: ${plan.total_vehicles || 0} คัน`);
      doc.text(`ระยะทางรวม: ${plan.total_distance || 0} กม.`);
      doc.text(`ต้นทุนรวม: ${plan.total_cost || 0} บาท`);
      doc.text(`จำนวนลูกค้า: ${items.length} ราย`);
      doc.text(`ปริมาณรวม: ${totalQuantity} หน่วย`);
      doc.text(`น้ำหนักรวม: ${totalWeight} กก.`);
      doc.text(`ปริมาตรรวม: ${totalVolume} ลบ.ม.`);
      doc.text(`ต้นทุนเฉลี่ยต่อกม.: ${plan.total_distance > 0 ? (plan.total_cost / plan.total_distance).toFixed(2) : 0} บาท/กม.`);
      doc.moveDown();

      // Route analysis
      doc.fontSize(14).text('การวิเคราะห์เส้นทาง', { underline: true });
      doc.moveDown();
      doc.fontSize(12);

      routes.forEach((route: any, index: number) => {
        const efficiency = route.total_distance > 0 
          ? ((route.stop_count || 0) / route.total_distance).toFixed(2)
          : 0;
        
        doc.text(`เส้นทางที่ ${index + 1}: ${route.license_plate} (${route.vehicle_type})`);
        doc.fontSize(10);
        doc.text(`  จำนวนจุด: ${route.stop_count || 0} จุด`);
        doc.text(`  ระยะทาง: ${route.total_distance} กม.`);
        doc.text(`  ต้นทุน: ${route.total_cost} บาท`);
        doc.text(`  ประสิทธิภาพ: ${efficiency} จุด/กม.`);
        doc.moveDown(0.5);
        doc.fontSize(12);
      });

      // KPIs
      doc.moveDown();
      doc.fontSize(14).text('ตัวชี้วัดประสิทธิภาพ (KPIs)', { underline: true });
      doc.fontSize(12);

      const avgDistancePerVehicle = routes.length > 0 
        ? routes.reduce((sum, r: any) => sum + (r.total_distance || 0), 0) / routes.length 
        : 0;
      const avgCostPerVehicle = routes.length > 0
        ? routes.reduce((sum, r: any) => sum + (r.total_cost || 0), 0) / routes.length
        : 0;
      const avgStopsPerRoute = routes.length > 0
        ? routes.reduce((sum, r: any) => sum + (r.stop_count || 0), 0) / routes.length
        : 0;

      doc.text(`ระยะทางเฉลี่ยต่อรถ: ${avgDistancePerVehicle.toFixed(2)} กม.`);
      doc.text(`ต้นทุนเฉลี่ยต่อรถ: ${avgCostPerVehicle.toFixed(2)} บาท`);
      doc.text(`จำนวนจุดเฉลี่ยต่อเส้นทาง: ${avgStopsPerRoute.toFixed(1)} จุด`);

      doc.end();
    } else {
      res.status(400).json({ error: 'Invalid format. Use excel or pdf' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

// Get report history
router.get('/history', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, p.name as plan_name
      FROM reports r
      LEFT JOIN transportation_plans p ON r.plan_id = p.id
      ORDER BY r.created_at DESC
      LIMIT 50
    `).all();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
});

export default router;

