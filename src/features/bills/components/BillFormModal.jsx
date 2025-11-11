import React, { useState, useEffect, useMemo } from "react";
import Modal from "../../../core/components/ui/Modal";
import Button from "../../../core/components/ui/Button";
import { propertyService } from "../../property/services/propertyService";
import { roomService } from "../../property/services/roomService";
import { meterService } from "../../meters/services/meterService";
import { serviceService } from "../../services/services/serviceService";
import { billService } from "../services/billService";
import { supabase } from "../../../core/data/remote/supabase";
import { canEditBill } from "../constants/billStatus";
import BillItemsList from "./BillItemsList";
import BillSelectionForm from "./BillSelectionForm";
import BillPeriodForm from "./BillPeriodForm";
import BillSummarySection from "./BillSummarySection";

const BillFormModal = ({ isOpen, onClose, bill, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Check if bill is read-only (already paid or cancelled)
  const isReadOnly = bill && !canEditBill(bill.status);

  // Step-by-step selection state
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [currentContract, setCurrentContract] = useState(null);

  const [formData, setFormData] = useState({
    property_id: "",
    room_id: "",
    tenant_id: "",
    contract_id: "",
    name: "",
    bill_number: "",
    period_start: "",
    period_end: "",
    due_date: "",
    bill_type: "RENT",
    status: "UNPAID",
    late_fee: 0,
    discount_amount: 0,
    notes: "",
  });

  const [billItems, setBillItems] = useState([]);
  const [errors, setErrors] = useState({});

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset errors when opening modal
      setErrors({});
      // Only reset form and load properties if NOT editing
      if (!bill) {
        resetForm();
        loadProperties();
      }
    } else {
      // Reset when closing
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load bill data when editing
  useEffect(() => {
    const loadBillData = async () => {
      console.log("🔍 loadBillData check:", { bill: bill?.id, isOpen });

      if (bill?.id && isOpen) {
        console.log("✅ Loading bill data for edit:", bill.id);
        console.log("🔍 Bill object:", bill);
        try {
          setLoadingData(true);

          // Use contract from bill object if available, otherwise load from database
          let contract = bill.contracts;
          console.log("🔍 Contract from bill.contracts:", contract);

          // If contract is not fully loaded or missing required relationships, load it
          if (!contract || !contract.rooms || !contract.tenants) {
            console.log("📥 Loading contract from database...");
            const { data: contractData, error: contractError } = await supabase
              .from("contracts")
              .select(
                `
                *,
                rooms(id, code, name, property_id),
                tenants(id, fullname, phone, email)
              `
              )
              .eq("id", bill.contract_id)
              .single();

            if (contractError) throw contractError;
            contract = contractData;
          } else {
            console.log("✅ Using contract from bill object:", contract);
          }

          // Extract property_id from nested structure
          // Note: getBillById returns nested properties object, not property_id directly
          const propertyId =
            contract?.rooms?.properties?.id ||
            contract?.rooms?.property_id ||
            "";
          console.log(
            "🔍 Extracted property_id:",
            propertyId,
            "from contract.rooms:",
            contract?.rooms
          );

          // Set form data with property_id from contract
          setFormData({
            property_id: propertyId,
            room_id: bill.room_id || "",
            tenant_id: bill.tenant_id || "",
            contract_id: bill.contract_id || "",
            name: bill.name || "",
            bill_number: bill.bill_number || "",
            period_start: bill.period_start || "",
            period_end: bill.period_end || "",
            due_date: bill.due_date || "",
            bill_type: bill.bill_type || "RENT",
            status: bill.status || "UNPAID",
            late_fee: bill.late_fee || 0,
            discount_amount: bill.discount_amount || 0,
            notes: bill.notes || "",
          });

          // Load rooms for the property
          if (propertyId) {
            const roomsData = await roomService.getRoomsByProperty(propertyId);
            console.log("✅ Loaded rooms for edit:", roomsData);
            setRooms(roomsData || []);
          } else {
            console.warn("⚠️ No property_id found, cannot load rooms");
          }

          // Load tenants for the room
          const { data: tenantsData } = await supabase
            .from("tenants")
            .select("id, fullname, phone, email, is_active")
            .eq("room_id", bill.room_id)
            .eq("is_active", true);
          console.log("✅ Loaded tenants for edit:", tenantsData);
          setTenants(tenantsData || []);

          // Set contract info
          setCurrentContract(contract);
          console.log("✅ Set contract:", contract);

          // Load properties for edit mode (needed for display)
          try {
            const { data: user } = await supabase.auth.getUser();
            if (user?.user?.id) {
              const propertiesData = await propertyService.getPropertiesByOwner(
                user.user.id
              );
              setProperties(propertiesData || []);
            }
          } catch (error) {
            console.error("Error loading properties for edit:", error);
          }

          // Load existing bill items and map unit from services
          if (
            bill.bill_items &&
            Array.isArray(bill.bill_items) &&
            bill.bill_items.length > 0
          ) {
            console.log("✅ Set bill items from bill object:", bill.bill_items);
            // Map unit from services to each bill item
            const itemsWithUnit = bill.bill_items.map((item) => ({
              ...item,
              unit: item.services?.unit || item.unit || "đơn vị",
            }));
            setBillItems(itemsWithUnit);
          } else {
            // Try to load bill items from billService if not in bill object
            try {
              console.log(
                "📥 Loading bill items from service for bill:",
                bill.id
              );
              const items = await billService.getBillItems(bill.id);
              if (items && items.length > 0) {
                console.log("✅ Loaded bill items from service:", items);
                // Map unit from services to each bill item
                const itemsWithUnit = items.map((item) => ({
                  ...item,
                  unit: item.services?.unit || item.unit || "đơn vị",
                }));
                setBillItems(itemsWithUnit);
              } else {
                console.log("⚠️ No bill items found for bill:", bill.id);
                setBillItems([]);
              }
            } catch (error) {
              console.error("❌ Error loading bill items:", error);
              setBillItems([]);
            }
          }

          console.log("✅ Finished loading bill data for edit");
        } catch (error) {
          console.error("❌ Error loading bill data for edit:", error);
          setErrors({ submit: `Lỗi tải dữ liệu hóa đơn: ${error.message}` });
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadBillData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill?.id, isOpen]);

  // Step 1: Load properties
  const loadProperties = async () => {
    try {
      // Don't set loading if already loading bill data
      if (!loadingData) {
        setLoadingData(true);
      }
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error("User not authenticated");

      const data = await propertyService.getPropertiesByOwner(user.user.id);
      console.log("✅ Loaded properties:", data);
      setProperties(data || []);
    } catch (error) {
      console.error("❌ Error loading properties:", error);
      setErrors({ property_id: `Lỗi tải bất động sản: ${error.message}` });
    } finally {
      // Only reset loading if we set it
      if (!bill) {
        setLoadingData(false);
      }
    }
  };

  // Step 2: Load rooms when property is selected (only for new bill)
  useEffect(() => {
    const loadRooms = async () => {
      // Only load rooms when creating new bill, not editing
      if (formData.property_id && !bill?.id) {
        try {
          setLoadingData(true);
          const data = await roomService.getRoomsByProperty(
            formData.property_id
          );
          console.log("✅ Loaded rooms:", data);
          setRooms(data || []);
          // Reset subsequent selections
          setTenants([]);
          setCurrentContract(null);
          setFormData((prev) => ({
            ...prev,
            room_id: "",
            tenant_id: "",
            contract_id: "",
          }));
          setBillItems([]);
        } catch (error) {
          console.error("❌ Error loading rooms:", error);
          setErrors({ room_id: `Lỗi tải phòng: ${error.message}` });
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadRooms();
  }, [formData.property_id, bill]);

  // Step 3: Load tenants when room is selected (only for new bill)
  useEffect(() => {
    const loadTenants = async () => {
      // Only load tenants when creating new bill, not editing
      if (formData.room_id && !bill?.id) {
        try {
          setLoadingData(true);
          // Get tenants in this room
          const { data, error } = await supabase
            .from("tenants")
            .select("id, fullname, phone, email, is_active")
            .eq("room_id", formData.room_id)
            .eq("is_active", true);

          if (error) throw error;
          console.log("✅ Loaded tenants:", data);
          setTenants(data || []);
          // Reset subsequent selections
          setCurrentContract(null);
          setFormData((prev) => ({ ...prev, tenant_id: "", contract_id: "" }));
          setBillItems([]);
        } catch (error) {
          console.error("❌ Error loading tenants:", error);
          setErrors({ tenant_id: `Lỗi tải khách thuê: ${error.message}` });
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadTenants();
  }, [formData.room_id, bill]);

  // Step 4: Load contract when tenant is selected (only for new bill)
  useEffect(() => {
    const loadContract = async () => {
      // Only load contract when creating new bill, not editing
      if (formData.tenant_id && formData.room_id && !bill?.id) {
        try {
          setLoadingData(true);
          // Find ACTIVE contract for this tenant in this room
          const { data, error } = await supabase
            .from("contracts")
            .select(
              `
              *,
              rooms(id, code, name, property_id),
              tenants(id, fullname, phone, email)
            `
            )
            .eq("tenant_id", formData.tenant_id)
            .eq("room_id", formData.room_id)
            .eq("status", "ACTIVE")
            .single();

          if (error) throw error;

          console.log("✅ Loaded contract:", data);
          setCurrentContract(data);
          
          // Auto-generate bill name based on period
          const today = new Date();
          const month = today.getMonth() + 1;
          const year = today.getFullYear();
          const defaultName = `Hóa đơn tiền thuê tháng ${month}/${year}`;
          
          setFormData((prev) => ({ 
            ...prev, 
            contract_id: data.id,
            name: prev.name || defaultName
          }));

          // Auto-generate bill items
          await loadContractDataAndGenerateBillItems(data);
        } catch (error) {
          console.error("❌ Error loading contract:", error);
          setErrors({
            tenant_id: `Không tìm thấy hợp đồng đang hoạt động cho khách thuê này`,
          });
          setCurrentContract(null);
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tenant_id, formData.room_id, bill]);

  const loadContractDataAndGenerateBillItems = async (contract) => {
    try {
      setLoadingData(true);

      if (!contract || !contract.rooms) {
        throw new Error("Contract or room not found");
      }

      const roomId = contract.rooms.id;
      const propertyId = contract.rooms.property_id;

      // Load meters for the room
      const metersData = await meterService.getMeters({ room: roomId });

      // Load services for the property
      const servicesData = await serviceService.getServices({
        property: propertyId,
      });

      // Auto-generate bill items
      await generateBillItems(contract, metersData, servicesData);
    } catch (error) {
      console.error("Error loading contract data:", error);
      setErrors({ contract_id: "Không thể tải dữ liệu hợp đồng" });
    } finally {
      setLoadingData(false);
    }
  };

  const generateBillItems = async (contract, metersData, servicesData) => {
    const items = [];

    // 1. Add rent item
    items.push({
      id: `temp-rent-${Date.now()}`,
      description: `Tiền thuê phòng ${contract.rooms.code}`,
      service_id: null,
      quantity: 1,
      unit: "tháng",
      unit_price: parseFloat(contract.monthly_rent || 0),
      amount: parseFloat(contract.monthly_rent || 0),
    });

    // 2. Add metered services (electricity, water)
    for (const meter of metersData) {
      const service = meter.services;
      if (service && service.is_metered) {
        const consumption = 0; // User will input new reading
        const amount = consumption * parseFloat(service.price_per_unit || 0);

        items.push({
          id: `temp-meter-${meter.id}-${Date.now()}`,
          description: `${service.name} - ${meter.meter_code}`,
          service_id: service.id,
          meter_id: meter.id,
          old_reading: meter.last_read || 0,
          new_reading: "", // Empty to show placeholder
          quantity: consumption,
          unit: service.unit,
          unit_price: parseFloat(service.price_per_unit || 0),
          amount: amount,
        });
      }
    }

    // 3. Add non-metered services (wifi, parking, etc.)
    for (const service of servicesData) {
      if (!service.is_metered) {
        items.push({
          id: `temp-service-${service.id}-${Date.now()}`,
          description: service.name,
          service_id: service.id,
          quantity: 1, // Default value
          unit: service.unit,
          unit_price: parseFloat(service.price_per_unit || 0),
          amount: parseFloat(service.price_per_unit || 0),
        });
      }
    }

    setBillItems(items);
  };

  const resetForm = () => {
    setFormData({
      property_id: "",
      room_id: "",
      tenant_id: "",
      contract_id: "",
      name: "",
      bill_number: "",
      period_start: "",
      period_end: "",
      due_date: "",
      bill_type: "RENT",
      status: "UNPAID",
      late_fee: 0,
      discount_amount: 0,
      notes: "",
    });
    setProperties([]);
    setRooms([]);
    setTenants([]);
    setCurrentContract(null);
    setBillItems([]);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBillItemChange = (updatedItems) => {
    setBillItems(updatedItems);
  };

  // Calculate total with useMemo to auto-recalculate when dependencies change
  const calculateTotal = useMemo(() => {
    const itemsTotal = billItems.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    const lateFee = parseFloat(formData.late_fee || 0);
    const discount = parseFloat(formData.discount_amount || 0);
    return itemsTotal + lateFee - discount;
  }, [billItems, formData.late_fee, formData.discount_amount]);

  // Generate bill number from contract number + timestamp (6 characters with letters and numbers)
  const generateBillNumberFromContract = () => {
    if (!currentContract?.contract_number) {
      return "";
    }

    try {
      // Get contract number (remove spaces, convert to uppercase)
      const contractNum = currentContract.contract_number
        .replace(/\s+/g, "")
        .toUpperCase();

      // Get current timestamp
      const timestamp = Date.now().toString();

      // Combine contract number + timestamp
      const combined = contractNum + timestamp;

      // Simple hash function to generate a value
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      // Convert to positive number
      const hashValue = Math.abs(hash);

      // Characters pool: uppercase letters and numbers
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      // Generate 6 characters using hash value
      let result = "";
      let value = hashValue;
      for (let i = 0; i < 6; i++) {
        result += chars[value % chars.length];
        value = Math.floor(value / chars.length);
      }

      // Format: ContractNumber-6CharCode (example: HD202510180001-A3B2C1)
      return `${contractNum}-${result}`;
    } catch (error) {
      console.error("Error generating bill number:", error);
      // Fallback: contract_number + random 6 alphanumeric characters
      const contractNum = (currentContract.contract_number || "")
        .replace(/\s+/g, "")
        .toUpperCase();
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomCode = "";
      for (let i = 0; i < 6; i++) {
        randomCode += chars[Math.floor(Math.random() * chars.length)];
      }
      return `${contractNum}-${randomCode}`;
    }
  };

  const handleGenerateBillNumber = () => {
    const generatedNumber = generateBillNumberFromContract();
    setFormData((prev) => ({
      ...prev,
      bill_number: generatedNumber,
    }));
    // Clear error if exists
    if (errors.bill_number) {
      setErrors((prev) => ({ ...prev, bill_number: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contract_id) {
      newErrors.contract_id = "Vui lòng chọn hợp đồng";
    }

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Vui lòng nhập tên hóa đơn";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Tên hóa đơn không được vượt quá 50 ký tự";
    }

    if (!formData.bill_number || formData.bill_number.trim() === "") {
      newErrors.bill_number = "Vui lòng nhập mã hóa đơn";
    }

    if (!formData.period_start) {
      newErrors.period_start = "Vui lòng chọn ngày bắt đầu kỳ";
    }

    if (!formData.period_end) {
      newErrors.period_end = "Vui lòng chọn ngày kết thúc kỳ";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Vui lòng chọn hạn thanh toán";
    }

    if (billItems.length === 0) {
      newErrors.items = "Hóa đơn phải có ít nhất 1 dịch vụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Không cho phép submit nếu bill đã thanh toán hoặc đã hủy
    if (isReadOnly) {
      alert("❌ Không thể sửa hóa đơn đã thanh toán hoặc đã hủy");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Loại bỏ property_id (chỉ dùng cho UI selection, không có trong bảng bills)
      // room_id và tenant_id CÓ trong bảng bills và cần thiết cho RLS
      const { property_id: _property, ...billFields } = formData;

      const billData = {
        ...billFields,
        bill_items: billItems,
        total_amount: calculateTotal, // calculateTotal is now a computed value, not a function
      };

      await onSubmit(billData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error submitting bill:", error);
      setErrors({ submit: error.message || "Có lỗi xảy ra khi lưu hóa đơn" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bill ? "Sửa hóa đơn" : "Tạo hóa đơn mới"}
      size="xl"
      className="!max-w-[90vw]"
    >
      <form onSubmit={handleSubmit} className="overflow-hidden relative">
        {/* Warning message if bill is read-only */}
        {isReadOnly && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Hóa đơn đã {bill.status === "PAID" ? "thanh toán" : "hủy"}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Bạn chỉ có thể xem thông tin, không thể chỉnh sửa.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay for edit mode */}
        {bill?.id && loadingData && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Đang tải dữ liệu hóa đơn...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* LEFT COLUMN: Selection Form */}
          <BillSelectionForm
            formData={formData}
            errors={errors}
            properties={properties}
            rooms={rooms}
            tenants={tenants}
            currentContract={currentContract}
            loading={loading}
            loadingData={loadingData}
            bill={bill}
            onChange={handleChange}
            disabled={isReadOnly}
          />

          {/* RIGHT COLUMN: Bill Items Preview */}
          <div className="space-y-4 lg:col-span-2">
            {/* Period Dates */}
            <BillPeriodForm
              formData={formData}
              errors={errors}
              loading={loading}
              loadingData={loadingData}
              currentContract={currentContract}
              onChange={handleChange}
              onGenerateBillNumber={handleGenerateBillNumber}
              bill={bill}
              disabled={isReadOnly}
            />

            {/* Bill Items List */}
            {formData.contract_id && billItems.length > 0 && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-gray-800">
                  📝 Chi tiết hóa đơn ({billItems.length} dịch vụ)
                </h4>
                <div className="overflow-x-auto">
                  <BillItemsList
                    items={billItems}
                    onChange={handleBillItemChange}
                    disabled={loading || isReadOnly}
                  />
                </div>
              </div>
            )}

            {errors.items && (
              <p className="text-red-500 text-sm">{errors.items}</p>
            )}

            {/* Late Fee, Discount, Notes & Total Summary */}
            <BillSummarySection
              formData={formData}
              billItems={billItems}
              loading={loading}
              onChange={handleChange}
              totalAmount={calculateTotal}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {errors.submit && (
          <p className="text-red-500 text-sm text-center mt-4">
            {errors.submit}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={
              loading ||
              loadingData ||
              !currentContract ||
              billItems.length === 0 ||
              isReadOnly
            }
          >
            {loading ? "Đang lưu..." : bill ? "Cập nhật" : "Tạo hóa đơn"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BillFormModal;
