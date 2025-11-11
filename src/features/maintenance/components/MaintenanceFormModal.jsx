import React, { useState, useEffect } from "react";
import { XMarkIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../../core/components/ui";
import { supabase } from "../../../core/data/remote/supabase";
import { useAuth } from "../../auth/context";

const MaintenanceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
}) => {
  const { user } = useAuth(); // Lấy user hiện tại
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formData, setFormData] = useState({
    property_id: "",
    room_id: "",
    maintenance_type: "ROOM",
    title: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    cost: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Load data khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadProperties();
      if (editData) {
        setFormData({
          property_id: editData.property_id || "",
          room_id: editData.room_id || "",
          maintenance_type: editData.maintenance_type || "ROOM",
          title: editData.title || "",
          description: editData.description || "",
          status: editData.status || "PENDING",
          priority: editData.priority || "MEDIUM",
          cost: editData.cost || "",
          notes: editData.notes || "",
        });

        // Load existing images if editing
        if (editData.url_image && Array.isArray(editData.url_image)) {
          const existingImages = editData.url_image.map((url) => ({
            path: url, // For existing images, path is the URL
            url: url,
            existing: true, // Mark as existing to avoid deletion
          }));
          setUploadedImages(existingImages);
        }
      } else {
        setFormData({
          property_id: "",
          room_id: "",
          maintenance_type: "ROOM",
          title: "",
          description: "",
          status: "PENDING",
          priority: "MEDIUM",
          cost: "",
          notes: "",
        });
        setUploadedImages([]);
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  // Cleanup temporary images on modal close
  useEffect(() => {
    return () => {
      if (!isOpen && uploadedImages.length > 0) {
        // Delete only temporary images (not existing ones) if modal is closed without submitting
        uploadedImages.forEach(async (image) => {
          if (!image.existing) {
            try {
              await supabase.storage
                .from("maintain-files")
                .remove([image.path]);
            } catch (error) {
              console.error("Error cleaning up temp image:", error);
            }
          }
        });
      }
    };
  }, [isOpen, uploadedImages]);

  // Load properties
  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  // Load rooms based on property
  const loadRooms = async (propertyId) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, code, name")
        .eq("property_id", propertyId)
        .is("deleted_at", null)
        .order("code");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  // Handle property change
  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    setFormData({ ...formData, property_id: propertyId, room_id: "" });
    if (propertyId) {
      loadRooms(propertyId);
    } else {
      setRooms([]);
    }
  };

  // Handle maintenance type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData({
      ...formData,
      maintenance_type: type,
      room_id: type === "ROOM" ? formData.room_id : "",
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Validate number of images
    if (uploadedImages.length + files.length > 3) {
      alert("❌ Chỉ được tải lên tối đa 3 ảnh!");
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        alert(`❌ File ${file.name} vượt quá 10MB!`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert(`❌ File ${file.name} không phải là ảnh!`);
        return;
      }
    }

    setUploadingImages(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        // Upload to Supabase storage
        const { error } = await supabase.storage
          .from("maintain-files")
          .upload(`temp/${fileName}`, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("maintain-files")
          .getPublicUrl(`temp/${fileName}`);

        uploadedUrls.push({
          path: `temp/${fileName}`,
          url: urlData.publicUrl,
          file: file,
        });
      }

      setUploadedImages([...uploadedImages, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert(`❌ Lỗi khi tải ảnh: ${error.message}`);
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const handleRemoveImage = async (index) => {
    const image = uploadedImages[index];

    try {
      // Only delete from storage if it's a temporary image (not existing)
      if (!image.existing) {
        await supabase.storage.from("maintain-files").remove([image.path]);
      }

      // Remove from state
      setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error removing image:", error);
      alert(`❌ Lỗi khi xóa ảnh: ${error.message}`);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.property_id) {
      newErrors.property_id = "Vui lòng chọn bất động sản";
    }

    if (formData.maintenance_type === "ROOM" && !formData.room_id) {
      newErrors.room_id = "Vui lòng chọn phòng";
    }

    if (!formData.title?.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị data để submit
      const submitData = {
        property_id: formData.property_id,
        room_id: formData.maintenance_type === "ROOM" ? formData.room_id : null,
        maintenance_type: formData.maintenance_type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        user_report_id: user?.userid || null, // Tự động lấy user hiện tại
        cost: formData.cost ? parseFloat(formData.cost) : null,
        notes: formData.notes?.trim() || null,
      };

      // Submit và nhận về maintenance ID
      const newMaintenance = await onSubmit(submitData);
      const maintenanceId = editData?.id || newMaintenance?.id;

      // Di chuyển ảnh từ temp sang thư mục maintenance ID
      if (uploadedImages.length > 0 && maintenanceId) {
        const finalImageUrls = [];

        for (const image of uploadedImages) {
          const fileName = image.path.split("/").pop();
          const newPath = `${maintenanceId}/${fileName}`;

          // Copy file to new location
          const { error: copyError } = await supabase.storage
            .from("maintain-files")
            .copy(image.path, newPath);

          if (copyError) {
            console.error("Error copying image:", copyError);
            continue;
          }

          // Delete old temp file
          await supabase.storage.from("maintain-files").remove([image.path]);

          // Get new public URL
          const { data: urlData } = supabase.storage
            .from("maintain-files")
            .getPublicUrl(newPath);

          finalImageUrls.push(urlData.publicUrl);
        }

        // Update maintenance with image URLs
        if (finalImageUrls.length > 0) {
          await supabase
            .from("maintenance")
            .update({ url_image: finalImageUrls })
            .eq("id", maintenanceId);
        }
      }

      // Reset state
      setUploadedImages([]);
      onClose();
    } catch (error) {
      console.error("Error submitting maintenance:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="max-h-[85vh] overflow-hidden flex flex-col -mx-6 -my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {editData ? "Cập nhật yêu cầu bảo trì" : "Tạo yêu cầu bảo trì mới"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-5">
            {/* Row 1: Property & Room */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bất động sản <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.property_id}
                  onChange={handlePropertyChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.property_id ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">-- Chọn bất động sản --</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </option>
                  ))}
                </select>
                {errors.property_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.property_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại bảo trì <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maintenance_type}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="BUILDING">Tòa nhà</option>
                  <option value="ROOM">Phòng</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {/* Row 2: Room (conditional) */}
            {formData.maintenance_type === "ROOM" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.room_id}
                  onChange={(e) =>
                    setFormData({ ...formData, room_id: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.room_id ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading || !formData.property_id}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} - {room.name}
                    </option>
                  ))}
                </select>
                {errors.room_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.room_id}</p>
                )}
              </div>
            )}

            {/* Row 3: Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Sửa chữa ống nước bị rò rỉ"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Row 4: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả chi tiết vấn đề cần bảo trì..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Row 5: Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="LOW">Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khẩn cấp</option>
                </select>
              </div>
            </div>

            {/* Row 7: Costs & Scheduled Date */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi phí (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 8: Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Ghi chú thêm (nếu có)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Row 9: Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh (Tối đa 3 ảnh, mỗi ảnh dưới 10MB)
              </label>

              {/* Upload Button */}
              {uploadedImages.length < 3 && (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50">
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      {uploadingImages ? "Đang tải lên..." : "Nhấp để chọn ảnh"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadedImages.length}/3 ảnh đã tải
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={loading || uploadingImages}
                  />
                </label>
              )}

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        disabled={loading}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : editData ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MaintenanceFormModal;
