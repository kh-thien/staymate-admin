/**
 * Helper function to format date as YYYY-MM-DD in local timezone
 */
export const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Calculate date ranges for different period types
 * @param {string} periodType - WEEKLY, MONTHLY, QUARTERLY, YEARLY
 * @param {number} limit - Number of periods to calculate
 * @param {Object} options - Optional: { baseYear, baseMonth, baseQuarter }
 */
export const calculatePeriods = (periodType, limit = 12, options = {}) => {
  const today = new Date();
  const { baseYear, baseMonth, baseQuarter } = options;
  
  // Determine base date from options or use today
  let baseDate = today;
  if (baseYear !== undefined) {
    if (baseMonth !== undefined) {
      // Specific month selected
      baseDate = new Date(baseYear, baseMonth - 1, 1);
    } else if (baseQuarter !== undefined) {
      // Specific quarter selected
      const quarterStartMonth = (baseQuarter - 1) * 3;
      baseDate = new Date(baseYear, quarterStartMonth, 1);
    } else {
      // Only year selected
      baseDate = new Date(baseYear, 0, 1);
    }
  }
  
  const periods = [];
  
  for (let i = 0; i < limit; i++) {
    let startDate, endDate;
    
    switch (periodType) {
      case "WEEKLY":
        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() - (baseDate.getDay() + i * 7));
        endDate = new Date(weekStart);
        endDate.setDate(weekStart.getDate() + 6);
        startDate = formatDateLocal(weekStart);
        endDate = formatDateLocal(endDate);
        break;
      case "MONTHLY":
        if (baseYear !== undefined && baseMonth !== undefined) {
          // Calculate from selected month
          const monthStart = new Date(baseYear, baseMonth - 1 - i, 1);
          const monthEnd = new Date(baseYear, baseMonth - i, 0);
          startDate = formatDateLocal(monthStart);
          endDate = formatDateLocal(monthEnd);
        } else {
          // Calculate from today
          const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
          startDate = formatDateLocal(monthStart);
          endDate = formatDateLocal(monthEnd);
        }
        break;
      case "QUARTERLY":
        if (baseYear !== undefined && baseQuarter !== undefined) {
          // Calculate from selected quarter
          const quarterStartMonth = (baseQuarter - 1) * 3;
          const targetQuarterStartMonth = quarterStartMonth - (i * 3);
          let targetYear = baseYear;
          let targetMonth = targetQuarterStartMonth;
          
          // Adjust year if month goes negative
          while (targetMonth < 0) {
            targetMonth += 12;
            targetYear -= 1;
          }
          
          const quarterStart = new Date(targetYear, targetMonth, 1);
          const quarterEnd = new Date(targetYear, targetMonth + 3, 0);
          startDate = formatDateLocal(quarterStart);
          endDate = formatDateLocal(quarterEnd);
        } else {
          // Calculate from today
          const monthsBack = i * 3;
          let targetMonth = today.getMonth() - monthsBack;
          let targetYear = today.getFullYear();
          while (targetMonth < 0) {
            targetMonth += 12;
            targetYear -= 1;
          }
          const quarterStartMonth = Math.floor(targetMonth / 3) * 3;
          const quarterStart = new Date(targetYear, quarterStartMonth, 1);
          const quarterEnd = new Date(targetYear, quarterStartMonth + 3, 0);
          startDate = formatDateLocal(quarterStart);
          endDate = formatDateLocal(quarterEnd);
        }
        break;
      case "YEARLY":
        if (baseYear !== undefined) {
          // Calculate from selected year
          const yearStart = new Date(baseYear - i, 0, 1);
          const yearEnd = new Date(baseYear - i, 11, 31);
          startDate = formatDateLocal(yearStart);
          endDate = formatDateLocal(yearEnd);
        } else {
          // Calculate from today
          const yearStart = new Date(today.getFullYear() - i, 0, 1);
          const yearEnd = new Date(today.getFullYear() - i, 11, 31);
          startDate = formatDateLocal(yearStart);
          endDate = formatDateLocal(yearEnd);
        }
        break;
      default:
        const defaultMonthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const defaultMonthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        startDate = formatDateLocal(defaultMonthStart);
        endDate = formatDateLocal(defaultMonthEnd);
    }
    
    periods.push({ startDate, endDate });
  }
  
  return periods;
};

