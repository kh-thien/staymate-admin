import React, { useState } from "react";
import TenantContractsModal from "./TenantContractsModal";
import TenantBillsModal from "./TenantBillsModal";
import TenantMoveModal from "./TenantMoveModal";
import StatusBadge from "./StatusBadge";
import { tenantInvitationService } from "../services/tenantInvitationService";
import { supabase } from "../../../core/data/remote/supabase";
import { getEmergencyContact } from "../utils/emergencyContactUtils";

const TenantDetailModal = ({ isOpen, onClose, tenant, onEdit, onDelete }) => {
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveAction, setMoveAction] = useState("move_out");
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleMoveOut = () => {
    setMoveAction("move_out");
    setShowMoveModal(true);
  };

  const handleMoveIn = () => {
    setMoveAction("move_in");
    setShowMoveModal(true);
  };

  const handleMoveSubmit = async (moveData) => {
    try {
      if (moveData.action === "move_out") {
        await handleMoveOutLogic(moveData);
      } else {
        await handleMoveInLogic(moveData);
      }

      alert(
        `${
          moveData.action === "move_out" ? "Chuyển ra" : "Chuyển vào"
        } thành công!`
      );
      setShowMoveModal(false);
      onClose(); // Đóng modal chính để refresh data
    } catch (error) {
      console.error("Error processing move:", error);
      alert("Lỗi khi xử lý chuyển nhà");
    }
  };

  const handleMoveOutLogic = async (moveData) => {
    const { moveDate, reason, note } = moveData;

    // 1. Lấy thông tin contract hiện tại
    const { data: currentContract, error: contractFetchError } = await supabase
      .from("contracts")
      .select("id, end_date, status")
      .eq("tenant_id", tenant.id)
      .eq("status", "ACTIVE")
      .single();

    if (contractFetchError) throw contractFetchError;

    // 2. Update tenant - set is_active = false
    const { error: tenantError } = await supabase
      .from("tenants")
      .update({
        is_active: false,
        note: note || null,
      })
      .eq("id", tenant.id);

    if (tenantError) throw tenantError;

    // 3. Update room - set status = VACANT và giảm current_occupants
    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status: "VACANT",
        current_occupants: supabase.raw("current_occupants - 1"),
      })
      .eq("id", tenant.room_id);

    if (roomError) throw roomError;

    // 4. Xử lý contract dựa trên ngày chuyển ra
    const moveOutDate = new Date(moveDate);
    const contractEndDate = new Date(currentContract.end_date);

    let contractUpdateData = {
      status: "TERMINATED",
    };

    // Nếu chuyển ra trước hạn hợp đồng
    if (moveOutDate < contractEndDate) {
      contractUpdateData.end_date = moveDate;
      contractUpdateData.termination_reason = reason;
      contractUpdateData.termination_note = note;
      contractUpdateData.is_early_termination = true;
    } else {
      // Chuyển ra đúng hạn hoặc sau hạn
      contractUpdateData.is_early_termination = false;
    }

    const { error: contractError } = await supabase
      .from("contracts")
      .update(contractUpdateData)
      .eq("id", currentContract.id);

    if (contractError) throw contractError;

    console.log("✅ Tenant moved out successfully:", {
      tenantId: tenant.id,
      moveDate,
      reason,
      isEarlyTermination: moveOutDate < contractEndDate,
      originalEndDate: currentContract.end_date,
    });
  };

  const handleMoveInLogic = async (moveData) => {
    const { moveDate, reason, note, newRoomId } = moveData;

    // 1. Update tenant - set room_id mới
    const { error: tenantError } = await supabase
      .from("tenants")
      .update({
        room_id: newRoomId,
        is_active: true,
        note: note || null,
      })
      .eq("id", tenant.id);

    if (tenantError) throw tenantError;

    // 2. Update room cũ - set status = VACANT
    const { error: oldRoomError } = await supabase
      .from("rooms")
      .update({
        status: "VACANT",
        current_occupants: supabase.raw("current_occupants - 1"),
      })
      .eq("id", tenant.room_id);

    if (oldRoomError) throw oldRoomError;

    // 3. Update room mới - set status = OCCUPIED
    const { error: newRoomError } = await supabase
      .from("rooms")
      .update({
        status: "OCCUPIED",
        current_occupants: supabase.raw("current_occupants + 1"),
      })
      .eq("id", newRoomId);

    if (newRoomError) throw newRoomError;

    console.log("✅ Tenant moved in successfully:", {
      tenantId: tenant.id,
      newRoomId,
      moveDate,
      reason,
    });
  };

  const handleCheckEmail = async () => {
    if (!tenant.email) {
      setEmailCheckResult({
        exists: false,
        message: "Người thuê chưa có email.",
      });
      return;
    }

    setCheckingEmail(true);
    try {
      const result = await tenantInvitationService.checkEmailExists(
        tenant.email
      );
      setEmailCheckResult(result);
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailCheckResult({
        exists: false,
        message: "Lỗi khi kiểm tra email.",
      });
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!tenant.email) {
      alert("Người thuê chưa có email để gửi lời mời");
      return;
    }

    try {
      setSendingInvitation(true);
      const result = await tenantInvitationService.sendInvitation(
        tenant.id,
        tenant.email,
        `Lời mời tham gia StayMate cho ${tenant.fullname}`
      );

      // Hiển thị thông báo thành công
      alert(result.message);

      // Hiển thị thông tin invitation nếu có
      if (result.invitation) {
        const invitationUrl = `${window.location.origin}/invite/accept?token=${result.invitation.invitation_token}`;
        const expiresAt = new Date(result.invitation.expires_at).toLocaleString(
          "vi-VN"
        );

        alert(
          `📧 Email: ${tenant.email}\n🔗 Link: ${invitationUrl}\n⏰ Hết hạn: ${expiresAt}`
        );
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert(`Lỗi gửi lời mời: ${error.message}`);
    } finally {
      setSendingInvitation(false);
    }
  };

  if (!isOpen || !tenant) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case "Nam":
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "Nữ":
        return (
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-pink-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {getGenderIcon(tenant.gender)}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tenant.fullname}
              </h2>
              <p className="text-sm text-gray-600">
                {tenant.occupation || "Chưa cập nhật"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge 
              isActive={tenant.active_in_room}
              className="px-4 py-2 text-sm"
            />
            <button
              onClick={onClose}
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
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin cá nhân
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Họ tên
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {tenant.fullname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Giới tính
                    </label>
                    <p className="text-gray-900">{tenant.gender || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ngày sinh
                    </label>
                    <p className="text-gray-900">
                      {formatDate(tenant.birthdate)}
                      {tenant.birthdate && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({calculateAge(tenant.birthdate)} tuổi)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nghề nghiệp
                    </label>
                    <p className="text-gray-900">
                      {tenant.occupation || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Quê quán
                  </label>
                  <p className="text-gray-900">{tenant.hometown || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    CMND/CCCD
                  </label>
                  <p className="text-gray-900">{tenant.id_number || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin liên hệ
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số điện thoại
                  </label>
                  <p className="text-gray-900 font-semibold">{tenant.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900">{tenant.email || "N/A"}</p>
                </div>

                {tenant.active_in_room && tenant.rooms ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phòng đang ở
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {tenant.rooms.code}
                        {tenant.rooms.name && ` - ${tenant.rooms.name}`}
                      </p>
                    </div>

                    {tenant.rooms.properties && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Nhà trọ
                        </label>
                        <p className="text-gray-900">
                          {tenant.rooms.properties.name || "N/A"}
                        </p>
                        {tenant.rooms.properties.address && (
                          <p className="text-sm text-gray-500 mt-1">
                            {tenant.rooms.properties.address}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phòng
                    </label>
                    <p className="text-gray-500 italic">Chưa có phòng</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact & Account Status */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emergency Contact */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Liên hệ khẩn cấp
              </h3>

              <div className="space-y-4">
                {(() => {
                  const emergencyContact = getEmergencyContact(tenant);
                  return emergencyContact ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Họ tên người liên hệ
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {emergencyContact.contact_name}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Số điện thoại
                        </label>
                        <p className="text-gray-900">
                          {emergencyContact.phone}
                        </p>
                      </div>

                      {emergencyContact.relationship && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Mối quan hệ
                          </label>
                          <p className="text-gray-900">
                            {emergencyContact.relationship}
                          </p>
                        </div>
                      )}

                      {emergencyContact.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Email
                          </label>
                          <p className="text-gray-900">
                            {emergencyContact.email}
                          </p>
                        </div>
                      )}

                      {emergencyContact.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Địa chỉ
                          </label>
                          <p className="text-gray-900">
                            {emergencyContact.address}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Chưa cập nhật thông tin liên hệ khẩn cấp
                    </p>
                  </div>
                  );
                })()}
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Trạng thái tài khoản
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Trạng thái
                  </label>
                  <div className="mt-2 flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tenant.account_status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : tenant.account_status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : tenant.account_status === "SUSPENDED"
                          ? "bg-orange-100 text-orange-800"
                          : tenant.account_status === "DELETED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tenant.account_status === "ACTIVE"
                        ? "Đang hoạt động"
                        : tenant.account_status === "PENDING"
                        ? "Chưa kích hoạt"
                        : tenant.account_status === "SUSPENDED"
                        ? "Đã tạm khóa"
                        : tenant.account_status === "DELETED"
                        ? "Đã xóa"
                        : "Không xác định"}
                    </span>

                    {tenant.account_status === "PENDING" && tenant.email && (
                      <div className="mt-2 space-y-2">
                        {!emailCheckResult && (
                          <button
                            onClick={handleCheckEmail}
                            disabled={checkingEmail}
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              checkingEmail
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {checkingEmail ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Đang kiểm tra...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Kiểm tra email
                              </>
                            )}
                          </button>
                        )}

                        {emailCheckResult && emailCheckResult.exists && (
                          <button
                            onClick={handleSendInvitation}
                            disabled={sendingInvitation}
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              sendingInvitation
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {sendingInvitation ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Đang gửi...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                Gửi lời mời
                              </>
                            )}
                          </button>
                        )}

                        {emailCheckResult && !emailCheckResult.exists && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                              <svg
                                className="w-5 h-5 text-red-600 mt-0.5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                              <div>
                                <p className="text-sm text-red-800 font-medium">
                                  Email chưa đăng ký
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                  {emailCheckResult.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {tenant.user_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tài khoản hệ thống
                    </label>
                    <p className="text-gray-900">Đã tạo tài khoản</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Ngày tạo
                  </label>
                  <p className="text-gray-900">
                    {formatDate(tenant.created_at)}
                  </p>
                </div>

                {tenant.updated_at &&
                  tenant.updated_at !== tenant.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Cập nhật lần cuối
                      </label>
                      <p className="text-gray-900">
                        {formatDate(tenant.updated_at)}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Thông tin phòng
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 ${
                      tenant.active_in_room ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {tenant.active_in_room ? "Đang ở" : "Chưa có phòng"}
                    </h4>
                    <StatusBadge isActive={tenant.active_in_room} />
                  </div>

                  {tenant.active_in_room && tenant.rooms ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Phòng: {tenant.rooms.code}
                          {tenant.rooms.name && ` - ${tenant.rooms.name}`}
                        </p>
                      </div>
                      {tenant.rooms.properties && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Nhà trọ: {tenant.rooms.properties.name}
                          </p>
                          {tenant.rooms.properties.address && (
                            <p className="text-xs text-gray-500 mt-1">
                              {tenant.rooms.properties.address}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Người thuê chưa được gán vào phòng nào
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {tenant.note && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Ghi chú
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {tenant.note}
                </p>
              </div>
            </div>
          )}

          {/* Contract Information */}
          {tenant.contracts && tenant.contracts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Hợp đồng
              </h3>
              <div className="space-y-4">
                {tenant.contracts.map((contract, index) => (
                  <div
                    key={contract.id || index}
                    className="bg-blue-50 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Số hợp đồng
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {contract.contract_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Thời hạn
                        </p>
                        <p className="text-gray-900">
                          {formatDate(contract.start_date)} -{" "}
                          {formatDate(contract.end_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tiền thuê
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {contract.monthly_rent
                            ? `${contract.monthly_rent.toLocaleString()} VNĐ`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setShowContractsModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Hợp đồng
            </button>
            <button
              onClick={() => setShowBillsModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Hóa đơn
            </button>
            {tenant.active_in_room ? (
              <button
                onClick={handleMoveOut}
                className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Chuyển ra
              </button>
            ) : (
              <button
                onClick={handleMoveIn}
                className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                Chuyển vào
              </button>
            )}
            <button
              onClick={() => onEdit(tenant)}
              className="flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => onDelete(tenant)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>

      {/* Modals */}
      <TenantContractsModal
        isOpen={showContractsModal}
        onClose={() => setShowContractsModal(false)}
        tenant={tenant}
      />

      <TenantBillsModal
        isOpen={showBillsModal}
        onClose={() => setShowBillsModal(false)}
        tenant={tenant}
      />

      <TenantMoveModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onSubmit={handleMoveSubmit}
        tenant={tenant}
        action={moveAction}
      />
    </div>
  );
};

export default TenantDetailModal;
