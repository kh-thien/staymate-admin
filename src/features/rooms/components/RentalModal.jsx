import React, { useState, useEffect } from "react";
import TenantSelector from "./TenantSelector";
import FileUpload from "./FileUpload";
import { rentalService } from "../services/rentalService";
import { supabase } from "../../../core/data/remote/supabase";

const RentalModal = ({ isOpen, onClose, onSubmit, room }) => {
  const [tenantOption, setTenantOption] = useState("new"); // "new" or "existing"
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [contractFiles, setContractFiles] = useState([]);
  const [syncMoveInDate, setSyncMoveInDate] = useState(true); // Checkbox để đồng bộ move_in_date với start_date

  const [formData, setFormData] = useState({
    // Thông tin người thuê
    fullname: "",
    birthdate: "",
    gender: "",
    phone: "",
    email: "",
    hometown: "",
    occupation: "",
    id_number: "",
    note: "",
    move_in_date: "",

    // Thông tin hợp đồng
    contract_number: "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    deposit: "",
    payment_cycle: "MONTHLY",
    payment_day: 1,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen && room) {
      // Pre-fill với thông tin phòng
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        monthly_rent: room.monthly_rent || "",
        deposit: room.deposit_amount || "",
        start_date: today,
        move_in_date: today, // Đồng bộ với start_date
        payment_day: 1, // Mặc định ngày 1
      }));
    }
  }, [isOpen, room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Đồng bộ move_in_date với start_date nếu checkbox được check
      if (name === "start_date" && syncMoveInDate) {
        newData.move_in_date = value;
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTenantOptionChange = (option) => {
    setTenantOption(option);
    if (option === "existing") {
      // Clear form data when switching to existing tenant
      setFormData((prev) => ({
        ...prev,
        fullname: "",
        birthdate: "",
        gender: "",
        phone: "",
        email: "",
        hometown: "",
        occupation: "",
        id_number: "",
        note: "",
      }));
    }
  };

  const handleSelectTenant = (tenant) => {
    setSelectedTenant(tenant);
    // Pre-fill form with tenant data
    setFormData((prev) => ({
      ...prev,
      fullname: tenant.fullname,
      birthdate: tenant.birthdate || "",
      gender: tenant.gender || "",
      phone: tenant.phone,
      email: tenant.email || "",
      hometown: tenant.hometown || "",
      occupation: tenant.occupation || "",
      id_number: tenant.id_number || "",
      note: tenant.note || "",
    }));
  };

  const handleClearTenant = () => {
    setSelectedTenant(null);
    setFormData((prev) => ({
      ...prev,
      fullname: "",
      birthdate: "",
      gender: "",
      phone: "",
      email: "",
      hometown: "",
      occupation: "",
      id_number: "",
      note: "",
    }));
  };

  const handleFileSelect = (files) => {
    // Convert FileList to Array if needed
    const fileArray = Array.from(files);
    setContractFiles((prev) => [...prev, ...fileArray]);
  };

  const handleFileRemove = (index) => {
    setContractFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setContractFiles([]);
  };

  // Validate duplicate phone and id_number
  const validateTenantUniqueness = async (
    phone,
    idNumber,
    excludeTenantId = null
  ) => {
    const errors = {};

    // Check phone uniqueness
    if (phone) {
      let query = supabase
        .from("tenants")
        .select("id, phone, fullname")
        .eq("phone", phone)
        .eq("is_active", true);

      // Exclude current tenant if updating
      if (excludeTenantId) {
        query = query.neq("id", excludeTenantId);
      }

      const { data: phoneCheck } = await query;

      // If we found records (not empty array), it means phone is duplicated
      if (phoneCheck && phoneCheck.length > 0) {
        errors.phone = `Số điện thoại này đã được sử dụng bởi ${phoneCheck[0].fullname}`;
      }
    }

    // Check id_number uniqueness
    if (idNumber) {
      let query = supabase
        .from("tenants")
        .select("id, id_number, fullname")
        .eq("id_number", idNumber)
        .eq("is_active", true);

      // Exclude current tenant if updating
      if (excludeTenantId) {
        query = query.neq("id", excludeTenantId);
      }

      const { data: idCheck } = await query;

      // If we found records (not empty array), it means id_number is duplicated
      if (idCheck && idCheck.length > 0) {
        errors.id_number = `CMND/CCCD này đã được sử dụng bởi ${idCheck[0].fullname}`;
      }
    }

    return errors;
  };

  const handleSyncMoveInDateChange = (checked) => {
    setSyncMoveInDate(checked);
    if (checked) {
      // Nếu check, đồng bộ move_in_date với start_date hiện tại
      setFormData((prev) => ({
        ...prev,
        move_in_date: prev.start_date,
      }));
    }
  };

  // Handle start_date change to sync with move_in_date if sync is enabled
  const handleStartDateChange = (value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        start_date: value,
      };

      // Nếu sync được bật, cập nhật move_in_date
      if (syncMoveInDate) {
        newData.move_in_date = value;
      }

      return newData;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation cho thông tin người thuê
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Họ tên là bắt buộc";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.move_in_date) {
      newErrors.move_in_date = "Ngày chuyển vào là bắt buộc";
    }

    // Validation cho hợp đồng
    if (!formData.start_date) {
      newErrors.start_date = "Ngày bắt đầu hợp đồng là bắt buộc";
    }

    if (!formData.end_date) {
      newErrors.end_date = "Ngày kết thúc hợp đồng là bắt buộc";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date >= formData.end_date
    ) {
      newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Validation cho move_in_date
    if (
      formData.move_in_date &&
      formData.start_date &&
      formData.move_in_date > formData.start_date
    ) {
      newErrors.move_in_date =
        "Ngày chuyển vào không được sau ngày bắt đầu hợp đồng";
    }

    if (
      formData.move_in_date &&
      formData.end_date &&
      formData.move_in_date > formData.end_date
    ) {
      newErrors.move_in_date =
        "Ngày chuyển vào không được sau ngày kết thúc hợp đồng";
    }

    if (!formData.monthly_rent || formData.monthly_rent <= 0) {
      newErrors.monthly_rent = "Tiền thuê phải lớn hơn 0";
    }

    if (formData.deposit && formData.deposit < 0) {
      newErrors.deposit = "Tiền cọc không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validate tenant uniqueness for new tenants
    if (tenantOption === "new") {
      const uniquenessErrors = await validateTenantUniqueness(
        formData.phone,
        formData.id_number
      );
      if (Object.keys(uniquenessErrors).length > 0) {
        setValidationErrors(uniquenessErrors);
        return;
      }
    }

    setLoading(true);
    setValidationErrors({});
    try {
      const rentalData = {
        // Thông tin người thuê
        tenant:
          tenantOption === "existing" && selectedTenant
            ? {
                id: selectedTenant.id, // Use existing tenant ID
                move_in_date: formData.move_in_date,
              }
            : {
                fullname: formData.fullname,
                birthdate: formData.birthdate || null,
                gender: formData.gender || null,
                phone: formData.phone,
                email: formData.email || null,
                hometown: formData.hometown || null,
                occupation: formData.occupation || null,
                id_number: formData.id_number || null,
                note: formData.note || null,
                move_in_date: formData.move_in_date,
                is_active: true,
              },

        // Thông tin hợp đồng
        contract: {
          contract_number: formData.contract_number || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          monthly_rent: parseFloat(formData.monthly_rent),
          deposit: parseFloat(formData.deposit) || 0,
          payment_cycle: formData.payment_cycle,
          payment_day: parseInt(formData.payment_day) || 1,
          status: "ACTIVE",
          // Files information
          contract_files: contractFiles.length > 0 ? contractFiles : null,
        },

        // Thông tin phòng
        room_id: room.id,
      };

      // Use rentalService to create rental with file upload
      const result = await rentalService.createRental(rentalData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Call parent onSubmit with result
      await onSubmit(result.data);
      onClose();
    } catch (error) {
      console.error("Error creating rental:", error);
      alert(`Lỗi khi tạo hợp đồng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTenantOption("new");
    setSelectedTenant(null);
    setContractFiles([]);
    setSyncMoveInDate(true);
    setFormData({
      fullname: "",
      birthdate: "",
      gender: "",
      phone: "",
      email: "",
      hometown: "",
      occupation: "",
      id_number: "",
      note: "",
      move_in_date: "",
      contract_number: "",
      start_date: "",
      end_date: "",
      monthly_rent: "",
      deposit: "",
      payment_cycle: "MONTHLY",
      payment_day: 1,
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Cho thuê phòng {room?.code}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tạo hợp đồng và thêm thông tin người thuê
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin người thuê */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin người thuê
              </h3>

              {/* Tenant Option Selection */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tenantOption"
                      value="new"
                      checked={tenantOption === "new"}
                      onChange={(e) => handleTenantOptionChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Thêm người thuê mới
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tenantOption"
                      value="existing"
                      checked={tenantOption === "existing"}
                      onChange={(e) => handleTenantOptionChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Chọn người thuê hiện có
                    </span>
                  </label>
                </div>

                {tenantOption === "existing" && (
                  <TenantSelector
                    onSelectTenant={handleSelectTenant}
                    selectedTenant={selectedTenant}
                    onClear={handleClearTenant}
                  />
                )}
              </div>

              {tenantOption === "new" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullname ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nhập họ tên"
                    />
                    {errors.fullname && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullname}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone || validationErrors.phone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                    {validationErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nhập email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nghề nghiệp
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sinh viên, Nhân viên, Tự do..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quê quán
                    </label>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập quê quán"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CMND/CCCD
                    </label>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.id_number || validationErrors.id_number
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập số CMND/CCCD"
                    />
                    {errors.id_number && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.id_number}
                      </p>
                    )}
                    {validationErrors.id_number && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.id_number}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Ngày chuyển vào <span className="text-red-500">*</span>
                      </label>
                      <label className="flex items-center text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={syncMoveInDate}
                          onChange={(e) =>
                            handleSyncMoveInDateChange(e.target.checked)
                          }
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span>Trùng ngày hợp đồng</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      name="move_in_date"
                      value={formData.move_in_date}
                      onChange={handleChange}
                      disabled={syncMoveInDate}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.move_in_date
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        syncMoveInDate ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {syncMoveInDate
                        ? "Tự động đồng bộ với ngày bắt đầu hợp đồng"
                        : "Có thể khác với ngày bắt đầu hợp đồng nếu cần"}
                    </p>
                    {errors.move_in_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.move_in_date}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú thêm về người thuê..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Thông tin hợp đồng */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin hợp đồng
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số hợp đồng
                  </label>
                  <input
                    type="text"
                    name="contract_number"
                    value={formData.contract_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tự động tạo nếu để trống"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.start_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.start_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.end_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.end_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền thuê/tháng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="monthly_rent"
                      value={formData.monthly_rent}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.monthly_rent
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập tiền thuê"
                    />
                    {errors.monthly_rent && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.monthly_rent}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền cọc
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.deposit ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nhập tiền cọc"
                    />
                    {errors.deposit && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.deposit}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chu kỳ thanh toán
                    </label>
                    <select
                      name="payment_cycle"
                      value={formData.payment_cycle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MONTHLY">Hàng tháng</option>
                      <option value="QUARTERLY">Hàng quý</option>
                      <option value="YEARLY">Hàng năm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.payment_cycle === "MONTHLY"
                        ? "Ngày thanh toán trong tháng"
                        : formData.payment_cycle === "QUARTERLY"
                        ? "Ngày thanh toán trong quý"
                        : "Ngày thanh toán trong năm"}
                    </label>
                    <select
                      name="payment_day"
                      value={formData.payment_day}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {formData.payment_cycle === "MONTHLY"
                        ? // Hàng tháng: chọn ngày 1-31
                          Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option key={day} value={day}>
                                Ngày {day}
                              </option>
                            )
                          )
                        : formData.payment_cycle === "QUARTERLY"
                        ? // Hàng quý: chọn ngày 1-31
                          Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option key={day} value={day}>
                                Ngày {day}
                              </option>
                            )
                          )
                        : // Hàng năm: chọn ngày 1-31
                          Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option key={day} value={day}>
                                Ngày {day}
                              </option>
                            )
                          )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.payment_cycle === "MONTHLY"
                        ? "Chọn ngày thanh toán trong tháng (1-31)"
                        : formData.payment_cycle === "QUARTERLY"
                        ? "Chọn ngày thanh toán trong tháng (áp dụng cho mỗi quý)"
                        : "Chọn ngày thanh toán trong tháng (áp dụng cho mỗi năm)"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh hợp đồng thuê trọ
                  </label>
                  <div className="space-y-4">
                    {/* File Upload Input */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        id="contract-files-upload"
                      />
                      <label
                        htmlFor="contract-files-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Chọn nhiều ảnh
                          </span>{" "}
                          hoặc kéo thả vào đây
                        </div>
                        <p className="text-xs text-gray-500">
                          Hỗ trợ: JPG, PNG, PDF, DOC, DOCX (tối đa 10MB mỗi
                          file)
                        </p>
                      </label>
                    </div>

                    {/* Selected Files List */}
                    {contractFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">
                            Files đã chọn ({contractFiles.length})
                          </h4>
                          <button
                            type="button"
                            onClick={handleClearAllFiles}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Xóa tất cả
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {contractFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                            >
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span className="text-sm text-gray-700 truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFileRemove(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Tạo hợp đồng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentalModal;
