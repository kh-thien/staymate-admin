/**
 * Test script để kiểm tra reports system
 * Chạy trong browser console hoặc test file
 */

import { reportService } from "./src/features/reports/services/reportService";

// Test 1: Kiểm tra financial summary
export async function testFinancialReport(propertyId) {
  console.log("🔍 Test Financial Report...");
  try {
    const data = await reportService.getFinancialSummary(
      propertyId,
      "MONTHLY",
      12
    );
    console.log("✅ Financial Summary:", data);
    return data;
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 2: Kiểm tra occupancy summary
export async function testOccupancyReport(propertyId) {
  console.log("🔍 Test Occupancy Report...");
  try {
    const data = await reportService.getOccupancySummary(propertyId, 30);
    console.log("✅ Occupancy Summary:", data);
    return data;
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 3: Kiểm tra maintenance summary
export async function testMaintenanceReport(propertyId) {
  console.log("🔍 Test Maintenance Report...");
  try {
    const data = await reportService.getMaintenanceSummary(propertyId, 12);
    console.log("✅ Maintenance Summary:", data);
    return data;
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 4: Generate reports (trigger database functions)
export async function testGenerateReports(propertyId) {
  console.log("🔍 Test Generate Reports...");

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  try {
    // Financial
    console.log("Generating Financial Report...");
    await reportService.generateFinancialReport(
      propertyId,
      firstDay.toISOString().split("T")[0],
      lastDay.toISOString().split("T")[0],
      "MONTHLY"
    );
    console.log("✅ Financial Report Generated");

    // Occupancy
    console.log("Generating Occupancy Report...");
    await reportService.generateOccupancyReport(
      propertyId,
      today.toISOString().split("T")[0]
    );
    console.log("✅ Occupancy Report Generated");

    // Maintenance
    console.log("Generating Maintenance Report...");
    await reportService.generateMaintenanceReport(
      propertyId,
      firstDay.toISOString().split("T")[0],
      lastDay.toISOString().split("T")[0]
    );
    console.log("✅ Maintenance Report Generated");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Test 5: Dashboard Overview
export async function testDashboardOverview(propertyId) {
  console.log("🔍 Test Dashboard Overview...");
  try {
    const data = await reportService.getDashboardOverview(propertyId);
    console.log("✅ Dashboard Overview:", data);
    return data;
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * HƯỚNG DẪN SỬ DỤNG:
 *
 * 1. Mở browser console (F12)
 * 2. Import test file
 * 3. Gọi các hàm test:
 *
 *    import { testFinancialReport } from './test-reports'
 *    testFinancialReport('your-property-id')
 *
 * 4. Hoặc chạy tất cả:
 *
 *    Promise.all([
 *      testFinancialReport(propertyId),
 *      testOccupancyReport(propertyId),
 *      testMaintenanceReport(propertyId),
 *      testDashboardOverview(propertyId)
 *    ])
 */
