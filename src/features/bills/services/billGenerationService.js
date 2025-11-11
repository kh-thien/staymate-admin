import { supabase } from "../../../core/data/remote/supabase";
import { billService } from "./billService";

export const billGenerationService = {
  // Tạo bills tự động cho tất cả contracts active
  async generateBillsForActiveContracts() {
    try {
      // Lấy tất cả contracts active
      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select(
          `
          id,
          room_id,
          tenant_id,
          monthly_rent,
          payment_cycle,
          payment_day,
          start_date,
          end_date,
          tenants!inner(
            id,
            fullname,
            phone,
            email
          ),
          rooms!inner(
            id,
            code,
            name
          )
        `
        )
        .eq("status", "ACTIVE");

      if (contractsError) throw contractsError;

      const billsToCreate = [];

      for (const contract of contracts) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let shouldCreateBill = false;
        let periodStart, periodEnd, dueDate;

        if (contract.payment_cycle === "MONTHLY") {
          // Hàng tháng: tạo bill mỗi tháng
          const paymentDate = new Date(
            currentYear,
            currentMonth,
            contract.payment_day
          );

          // Nếu ngày thanh toán đã qua trong tháng này, tạo cho tháng tiếp theo
          if (paymentDate < today) {
            paymentDate.setMonth(currentMonth + 1);
          }

          // Kiểm tra xem đã có bill cho tháng này chưa
          const { data: existingBill, error: billCheckError } = await supabase
            .from("bills")
            .select("id")
            .eq("contract_id", contract.id)
            .gte(
              "period_start",
              new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
            )
            .lt(
              "period_start",
              new Date(currentYear, currentMonth + 1, 1)
                .toISOString()
                .split("T")[0]
            )
            .single();

          if (billCheckError && billCheckError.code !== "PGRST116") {
            console.error(
              `Error checking existing bill for contract ${contract.id}:`,
              billCheckError
            );
            continue;
          }

          if (!existingBill) {
            shouldCreateBill = true;
            periodStart = new Date(currentYear, currentMonth, 1);
            periodEnd = new Date(currentYear, currentMonth + 1, 0);
            dueDate = paymentDate;
          }
        } else if (contract.payment_cycle === "QUARTERLY") {
          // Hàng quý: tạo bill mỗi 3 tháng
          const currentQuarter = Math.floor(currentMonth / 3);
          const quarterStartMonth = currentQuarter * 3;

          const paymentDate = new Date(
            currentYear,
            quarterStartMonth,
            contract.payment_day
          );

          // Nếu ngày thanh toán đã qua trong quý này, tạo cho quý tiếp theo
          if (paymentDate < today) {
            paymentDate.setMonth(quarterStartMonth + 3);
          }

          // Kiểm tra xem đã có bill cho quý này chưa
          const { data: existingBill, error: billCheckError } = await supabase
            .from("bills")
            .select("id")
            .eq("contract_id", contract.id)
            .gte(
              "period_start",
              new Date(currentYear, quarterStartMonth, 1)
                .toISOString()
                .split("T")[0]
            )
            .lt(
              "period_start",
              new Date(currentYear, quarterStartMonth + 3, 1)
                .toISOString()
                .split("T")[0]
            )
            .single();

          if (billCheckError && billCheckError.code !== "PGRST116") {
            console.error(
              `Error checking existing bill for contract ${contract.id}:`,
              billCheckError
            );
            continue;
          }

          if (!existingBill) {
            shouldCreateBill = true;
            periodStart = new Date(currentYear, quarterStartMonth, 1);
            periodEnd = new Date(currentYear, quarterStartMonth + 3, 0);
            dueDate = paymentDate;
          }
        } else if (contract.payment_cycle === "YEARLY") {
          // Hàng năm: tạo bill mỗi năm
          const paymentDate = new Date(currentYear, 0, contract.payment_day); // Ngày 1 tháng 1

          // Nếu ngày thanh toán đã qua trong năm này, tạo cho năm tiếp theo
          if (paymentDate < today) {
            paymentDate.setFullYear(currentYear + 1);
          }

          // Kiểm tra xem đã có bill cho năm này chưa
          const { data: existingBill, error: billCheckError } = await supabase
            .from("bills")
            .select("id")
            .eq("contract_id", contract.id)
            .gte(
              "period_start",
              new Date(currentYear, 0, 1).toISOString().split("T")[0]
            )
            .lt(
              "period_start",
              new Date(currentYear + 1, 0, 1).toISOString().split("T")[0]
            )
            .single();

          if (billCheckError && billCheckError.code !== "PGRST116") {
            console.error(
              `Error checking existing bill for contract ${contract.id}:`,
              billCheckError
            );
            continue;
          }

          if (!existingBill) {
            shouldCreateBill = true;
            periodStart = new Date(currentYear, 0, 1);
            periodEnd = new Date(currentYear, 11, 31); // Ngày 31 tháng 12
            dueDate = paymentDate;
          }
        }

        if (shouldCreateBill) {
          // Tính số tiền dựa trên chu kỳ
          let amount = contract.monthly_rent;
          let billName = "";
          
          if (contract.payment_cycle === "MONTHLY") {
            const month = periodStart.getMonth() + 1;
            const year = periodStart.getFullYear();
            billName = `Hóa đơn tiền thuê tháng ${month}/${year}`;
          } else if (contract.payment_cycle === "QUARTERLY") {
            amount = contract.monthly_rent * 3; // 3 tháng
            const quarter = Math.floor(periodStart.getMonth() / 3) + 1;
            const year = periodStart.getFullYear();
            billName = `Hóa đơn tiền thuê quý ${quarter}/${year}`;
          } else if (contract.payment_cycle === "YEARLY") {
            amount = contract.monthly_rent * 12; // 12 tháng
            const year = periodStart.getFullYear();
            billName = `Hóa đơn tiền thuê năm ${year}`;
          }

          const billData = {
            contract_id: contract.id,
            room_id: contract.room_id,
            tenant_id: contract.tenant_id,
            name: billName,
            bill_number: await billService.generateBillNumber(),
            period_start: periodStart.toISOString().split("T")[0],
            period_end: periodEnd.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
            total_amount: amount,
            status: "UNPAID",
          };

          billsToCreate.push(billData);
        }
      }

      // Tạo tất cả bills
      if (billsToCreate.length > 0) {
        const { data: newBills, error: createError } = await supabase
          .from("bills")
          .insert(billsToCreate)
          .select();

        if (createError) throw createError;

        return {
          success: true,
          billsCreated: newBills.length,
          bills: newBills,
        };
      }

      return {
        success: true,
        billsCreated: 0,
        bills: [],
      };
    } catch (error) {
      console.error("Error generating bills:", error);
      throw error;
    }
  },

  // Tạo bill cho một contract cụ thể
  async generateBillForContract(contractId) {
    try {
      const { data: contract, error: contractError } = await supabase
        .from("contracts")
        .select(
          `
          id,
          room_id,
          tenant_id,
          monthly_rent,
          payment_cycle,
          payment_day,
          start_date,
          end_date,
          tenants!inner(
            id,
            fullname,
            phone,
            email
          ),
          rooms!inner(
            id,
            code,
            name
          )
        `
        )
        .eq("id", contractId)
        .eq("status", "ACTIVE")
        .single();

      if (contractError) throw contractError;

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Tạo ngày thanh toán trong tháng hiện tại
      const paymentDate = new Date(
        currentYear,
        currentMonth,
        contract.payment_day
      );

      // Nếu ngày thanh toán đã qua trong tháng này, tạo cho tháng tiếp theo
      if (paymentDate < today) {
        paymentDate.setMonth(currentMonth + 1);
      }

      // Kiểm tra xem đã có bill cho tháng này chưa
      const { data: existingBill, error: billCheckError } = await supabase
        .from("bills")
        .select("id")
        .eq("contract_id", contract.id)
        .gte(
          "period_start",
          new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
        )
        .lt(
          "period_start",
          new Date(currentYear, currentMonth + 1, 1).toISOString().split("T")[0]
        )
        .single();

      if (billCheckError && billCheckError.code !== "PGRST116") {
        throw billCheckError;
      }

      // Nếu đã có bill cho tháng này, trả về thông báo
      if (existingBill) {
        return {
          success: false,
          message: "Bill cho tháng này đã tồn tại",
        };
      }

      // Tính period_start và period_end
      const periodStart = new Date(currentYear, currentMonth, 1);
      const periodEnd = new Date(currentYear, currentMonth + 1, 0); // Ngày cuối tháng

      // Tạo tên hóa đơn
      const month = currentMonth + 1;
      const year = currentYear;
      const billName = `Hóa đơn tiền thuê tháng ${month}/${year}`;
      
      // Tạo bill data
      const billData = {
        contract_id: contract.id,
        room_id: contract.room_id,
        tenant_id: contract.tenant_id,
        name: billName,
        bill_number: await billService.generateBillNumber(),
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
        due_date: paymentDate.toISOString().split("T")[0],
        total_amount: contract.monthly_rent,
        status: "UNPAID",
      };

      const { data: newBill, error: createError } = await supabase
        .from("bills")
        .insert([billData])
        .select()
        .single();

      if (createError) throw createError;

      return {
        success: true,
        bill: newBill,
      };
    } catch (error) {
      console.error("Error generating bill for contract:", error);
      throw error;
    }
  },

  // Lên lịch tạo bills tự động (có thể được gọi bởi cron job)
  async scheduleBillGeneration() {
    try {
      // Lấy tất cả contracts có payment_day = ngày hiện tại
      const today = new Date();
      const currentDay = today.getDate();

      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select(
          `
          id,
          room_id,
          tenant_id,
          monthly_rent,
          payment_cycle,
          payment_day,
          start_date,
          end_date,
          tenants!inner(
            id,
            fullname,
            phone,
            email
          ),
          rooms!inner(
            id,
            code,
            name
          )
        `
        )
        .eq("status", "ACTIVE")
        .eq("payment_cycle", "MONTHLY")
        .eq("payment_day", currentDay);

      if (contractsError) throw contractsError;

      const billsToCreate = [];

      for (const contract of contracts) {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Kiểm tra xem đã có bill cho tháng này chưa
        const { data: existingBill, error: billCheckError } = await supabase
          .from("bills")
          .select("id")
          .eq("contract_id", contract.id)
          .gte(
            "period_start",
            new Date(currentYear, currentMonth, 1).toISOString().split("T")[0]
          )
          .lt(
            "period_start",
            new Date(currentYear, currentMonth + 1, 1)
              .toISOString()
              .split("T")[0]
          )
          .single();

        if (billCheckError && billCheckError.code !== "PGRST116") {
          console.error(
            `Error checking existing bill for contract ${contract.id}:`,
            billCheckError
          );
          continue;
        }

        // Nếu đã có bill cho tháng này, bỏ qua
        if (existingBill) {
          continue;
        }

        // Tính period_start và period_end
        const periodStart = new Date(currentYear, currentMonth, 1);
        const periodEnd = new Date(currentYear, currentMonth + 1, 0); // Ngày cuối tháng

        // Tạo tên hóa đơn
        const month = currentMonth + 1;
        const year = currentYear;
        const billName = `Hóa đơn tiền thuê tháng ${month}/${year}`;

        // Tạo bill data
        const billData = {
          contract_id: contract.id,
          room_id: contract.room_id,
          tenant_id: contract.tenant_id,
          name: billName,
          bill_number: await billService.generateBillNumber(),
          period_start: periodStart.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
          due_date: today.toISOString().split("T")[0],
          total_amount: contract.monthly_rent,
          status: "UNPAID",
        };

        billsToCreate.push(billData);
      }

      // Tạo tất cả bills
      if (billsToCreate.length > 0) {
        const { data: newBills, error: createError } = await supabase
          .from("bills")
          .insert(billsToCreate)
          .select();

        if (createError) throw createError;

        return {
          success: true,
          billsCreated: newBills.length,
          bills: newBills,
        };
      }

      return {
        success: true,
        billsCreated: 0,
        bills: [],
      };
    } catch (error) {
      console.error("Error scheduling bill generation:", error);
      throw error;
    }
  },
};
