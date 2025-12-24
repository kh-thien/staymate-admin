import { supabase } from "../../../core/data/remote/supabase";
import { toast } from "react-toastify";
import { chatService } from "../../chat/services/chatService";

// Utility function để generate token
const generateInvitationToken = () => {
  const chars = import.meta.env.VITE_INVITATION_TOKEN_CHARS;
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Utility function để generate expiration time (7 days from now)
const getExpirationTime = () => {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return expirationTime.toISOString();
};

export const tenantInvitationService = {
  // Kiểm tra email có tồn tại trong hệ thống không
  async checkEmailExists(tenantEmail) {
    try {
      if (!tenantEmail) {
        return { exists: false, message: "Người thuê chưa có email." };
      }

      // Kiểm tra email có trong bảng users không (bảng users đã sync với auth.users)
      const { data: userInUsers, error: usersError } = await supabase
        .from("users")
        .select("userid, email, role")
        .eq("email", tenantEmail)
        .single();

      console.log("Users check result:", { userInUsers, usersError });

      if (usersError || !userInUsers) {
        return {
          exists: false,
          message: `Người dùng chưa đăng ký tài khoản bằng email ${tenantEmail}. Vui lòng yêu cầu họ tạo tài khoản trên mobile app trước.`,
        };
      }

      // Kiểm tra role phải là TENANT
      if (userInUsers.role !== "TENANT") {
        return {
          exists: false,
          message: `Tài khoản ${tenantEmail} không phải là người thuê. Vui lòng kiểm tra lại.`,
        };
      }

      return { exists: true, message: "Email đã tồn tại trong hệ thống." };
    } catch (error) {
      console.error("Error checking email:", error);
      return { exists: false, message: "Lỗi khi kiểm tra email." };
    }
  },

  // Gửi lời mời cho tenant
  async sendInvitation(tenantId, email, notes = null) {
    try {
      // Kiểm tra xem tenant có tồn tại không
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id, fullname, email, account_status, user_id")
        .eq("id", tenantId)
        .single();

      if (tenantError) {
        throw new Error(`Không tìm thấy người thuê: ${tenantError.message}`);
      }

      // Kiểm tra email của tenant có tồn tại trong bảng users và auth.users không
      if (!tenant.email) {
        throw new Error("Người thuê chưa có email để gửi lời mời.");
      }

      // Kiểm tra email có trong bảng users không (bảng users đã sync với auth.users)
      const { data: userInUsers, error: usersError } = await supabase
        .from("users")
        .select("userid, email, role")
        .eq("email", tenant.email)
        .single();

      if (usersError || !userInUsers) {
        throw new Error(
          `Người dùng chưa đăng ký tài khoản bằng email ${tenant.email}. Vui lòng yêu cầu họ tạo tài khoản trên mobile app trước.`
        );
      }

      // Kiểm tra role phải là TENANT
      if (userInUsers.role !== "TENANT") {
        throw new Error(
          `Tài khoản ${tenant.email} không phải là người thuê. Vui lòng kiểm tra lại.`
        );
      }

      // Kiểm tra xem đã có lời mời đang pending chưa
      const { data: existingInvitations, error: checkError } = await supabase
        .from("tenant_invitations")
        .select("id, status, expires_at")
        .eq("tenant_id", tenantId)
        .eq("status", "PENDING")
        .gt("expires_at", new Date().toISOString());

      if (checkError) {
        console.warn("Error checking existing invitations:", checkError);
      }

      if (existingInvitations && existingInvitations.length > 0) {
        // Kiểm tra thời gian gửi cuối cùng
        const existingInvitation = existingInvitations[0];
        const lastSentTime = new Date(existingInvitation.created_at);
        const now = new Date();
        const timeDiff = (now - lastSentTime) / 1000; // seconds

        if (timeDiff < 30) {
          const remainingTime = Math.ceil(30 - timeDiff);
          throw new Error(
            `Vui lòng chờ ${remainingTime} giây nữa trước khi gửi lại lời mời`
          );
        }

        // Cập nhật invitation hiện tại với token mới
        const newToken = generateInvitationToken();
        const newExpiresAt = getExpirationTime();

        const { data: updatedInvitation, error: updateError } = await supabase
          .from("tenant_invitations")
          .update({
            invitation_token: newToken,
            expires_at: newExpiresAt,
            created_at: new Date().toISOString(),
          })
          .eq("id", existingInvitation.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Lỗi cập nhật invitation: ${updateError.message}`);
        }

        // Gửi email với token mới
        await this.sendInvitationEmail({
          tenantName: tenant.fullname,
          email: tenant.email,
          invitationToken: newToken,
          expiresAt: newExpiresAt,
        });

        return {
          success: true,
          invitation: updatedInvitation,
          message: "Đã cập nhật và gửi lại lời mời với token mới",
        };
      }

      // Tạo invitation record
      const invitationToken = generateInvitationToken();
      const expiresAt = getExpirationTime();

      // Lấy user hiện tại
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: invitation, error: createError } = await supabase
        .from("tenant_invitations")
        .insert({
          tenant_id: tenantId,
          email: email || tenant.email,
          invitation_token: invitationToken,
          expires_at: expiresAt,
          notes: notes,
          created_by: user?.id,
        })
        .select()
        .single();

      if (createError) {
        console.error("Create invitation error:", createError);
        throw new Error(`Lỗi tạo lời mời: ${createError.message}`);
      }

      // Gửi email (sẽ implement sau)
      await this.sendInvitationEmail({
        tenantName: tenant.fullname,
        email: email || tenant.email,
        invitationToken: invitationToken,
        expiresAt: expiresAt,
      });

      return {
        success: true,
        invitation: invitation,
        message: "Lời mời đã được gửi thành công",
      };
    } catch (error) {
      console.error("Error sending invitation:", error);
      throw error;
    }
  },

  // Gửi email lời mời qua StayMate Server
  async sendInvitationEmail({ tenantName, email, invitationToken, expiresAt }) {
    try {
      const invitationUrl = `${window.location.origin}/invite/accept?token=${invitationToken}`;
      const serverUrl = import.meta.env.VITE_STAYMATE_SERVER;

      console.log("📧 Sending invitation email:", {
        to: email,
        tenantName,
        invitationUrl,
        expiresAt,
        serverUrl,
      });

      // Kiểm tra server URL có được cấu hình không
      if (!serverUrl) {
        console.warn("⚠️ VITE_STAYMATE_SERVER not configured, using fallback");
        // Fallback: Hiển thị thông tin trong toast
        const expiresAtFormatted = new Date(expiresAt).toLocaleString("vi-VN");
        toast.warning(
          `Server URL chưa được cấu hình. Link lời mời: ${invitationUrl}`,
          {
            position: "top-right",
            autoClose: 8000,
          }
        );
        // Copy link to clipboard
        navigator.clipboard.writeText(invitationUrl).then(() => {
          toast.info("Đã copy link vào clipboard", {
            position: "top-right",
            autoClose: 3000,
          });
        });
        return { success: true, method: "fallback" };
      }

      // Sử dụng StayMate Server
      try {
        // Đảm bảo URL có trailing slash và endpoint đúng
        const baseUrl = serverUrl.endsWith("/") ? serverUrl : `${serverUrl}/`;
        const apiEndpoint = `${baseUrl}api/send-invitation-email`;

        console.log("📡 Calling StayMate Server:", apiEndpoint);

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantName,
            email,
            invitationUrl,
            expiresAt,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const result = await response.json();
        console.log("✅ Email sent via StayMate Server:", result);

        // Hiển thị thông báo thành công
        toast.success(`📧 Email đã được gửi thành công đến ${email}!`, {
          position: "top-right",
          autoClose: 5000,
        });

        return { success: true, method: "staymate-server", data: result };
      } catch (serviceError) {
        console.error("❌ StayMate Server error:", serviceError);

        const expiresAtFormatted = new Date(expiresAt).toLocaleString("vi-VN");

        // Fallback: Hiển thị thông tin trong toast
        toast.error(
          `Không thể gửi email tự động. Vui lòng copy link và gửi thủ công.`,
          {
            position: "top-right",
            autoClose: 6000,
          }
        );

        // Hiển thị thông tin link trong toast info
        setTimeout(() => {
          toast.info(
            `🔗 Link: ${invitationUrl}\n⏰ Hết hạn: ${expiresAtFormatted}`,
            {
              position: "top-right",
              autoClose: 10000,
            }
          );
        }, 500);

        // Copy link to clipboard
        navigator.clipboard
          .writeText(invitationUrl)
          .then(() => {
            setTimeout(() => {
              toast.success("Đã copy link vào clipboard", {
                position: "top-right",
                autoClose: 3000,
              });
            }, 1500);
          })
          .catch(() => {
            // Clipboard API không available, bỏ qua
          });

        return {
          success: false,
          method: "fallback",
          error: serviceError.message,
        };
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  // Xác nhận lời mời
  async acceptInvitation(invitationToken) {
    try {
      // Sử dụng RPC function để bypass RLS issues
      const { data: result, error: rpcError } = await supabase.rpc(
        "accept_tenant_invitation",
        {
          p_invitation_token: invitationToken,
        }
      );

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        throw new Error(
          rpcError.message || "Lời mời không hợp lệ hoặc đã hết hạn"
        );
      }

      if (!result || !result.success) {
        throw new Error(
          result?.error || "Lời mời không hợp lệ hoặc đã hết hạn"
        );
      }

      // ✅ TỰ ĐỘNG TẠO CHAT ROOM sau khi accept invitation thành công
      if (result.tenant && result.tenant.id) {
        try {
          // Lấy thông tin tenant và contract để tìm landlord_id
          const { data: tenantData, error: tenantError } = await supabase
            .from("tenants")
            .select(
              `
              id,
              user_id,
              fullname,
              room_id,
              rooms!room_id(
                id,
                property_id,
                properties!property_id(
                  id,
                  owner_id
                )
              )
            `
            )
            .eq("id", result.tenant.id)
            .single();

          if (
            !tenantError &&
            tenantData?.user_id &&
            tenantData?.rooms?.properties?.owner_id
          ) {
            // Tenant đã có user_id và có landlord → tạo chat room
            const landlordId = tenantData.rooms.properties.owner_id;

            await chatService.createChatRoomWithTenant(
              tenantData.id,
              landlordId
            );

            console.log(
              "✅ Chat room created after tenant accepted invitation:",
              {
                tenantId: tenantData.id,
                tenantName: tenantData.fullname,
                landlordId: landlordId,
              }
            );
          } else {
            console.log("ℹ️ Cannot create chat room yet:", {
              hasUserId: !!tenantData?.user_id,
              hasLandlord: !!tenantData?.rooms?.properties?.owner_id,
              reason: !tenantData?.user_id
                ? "Tenant user_id not set"
                : "No landlord found",
            });
          }
        } catch (chatError) {
          // Không fail invitation nếu chat room creation lỗi
          console.warn(
            "⚠️ Warning: Could not create chat room after invitation acceptance:",
            chatError.message
          );
        }
      }

      return {
        success: true,
        message: result.message || "Xác nhận lời mời thành công!",
        tenant: result.tenant,
      };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      throw error;
    }
  },

  // Lấy danh sách invitations
  async getInvitations(filters = {}) {
    try {
      let query = supabase
        .from("tenant_invitations")
        .select(
          `
          *,
          tenants!inner(
            id,
            fullname,
            email,
            phone,
            account_status
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.tenant_id) {
        query = query.eq("tenant_id", filters.tenant_id);
      }

      if (filters.email) {
        query = query.ilike("email", `%${filters.email}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Lỗi lấy danh sách invitations: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error getting invitations:", error);
      throw error;
    }
  },

  // Hủy invitation
  async cancelInvitation(invitationId) {
    try {
      const { error } = await supabase
        .from("tenant_invitations")
        .update({ status: "EXPIRED" })
        .eq("id", invitationId)
        .eq("status", "PENDING");

      if (error) {
        throw new Error(`Lỗi hủy invitation: ${error.message}`);
      }

      return { success: true, message: "Đã hủy lời mời thành công" };
    } catch (error) {
      console.error("Error canceling invitation:", error);
      throw error;
    }
  },

  // Gửi lại lời mời
  async resendInvitation(invitationId) {
    try {
      // Lấy thông tin invitation
      const { data: invitation, error: findError } = await supabase
        .from("tenant_invitations")
        .select(
          `
          *,
          tenants!inner(
            id,
            fullname,
            email,
            phone
          )
        `
        )
        .eq("id", invitationId)
        .single();

      if (findError || !invitation) {
        throw new Error("Không tìm thấy lời mời");
      }

      // Cập nhật expiration time
      const newExpiresAt = getExpirationTime();
      const { error: updateError } = await supabase
        .from("tenant_invitations")
        .update({ expires_at: newExpiresAt })
        .eq("id", invitationId);

      if (updateError) {
        throw new Error(`Lỗi cập nhật invitation: ${updateError.message}`);
      }

      // Gửi lại email
      await this.sendInvitationEmail({
        tenantName: invitation.tenants.fullname,
        email: invitation.email,
        invitationToken: invitation.invitation_token,
        expiresAt: newExpiresAt,
      });

      return { success: true, message: "Đã gửi lại lời mời thành công" };
    } catch (error) {
      console.error("Error resending invitation:", error);
      throw error;
    }
  },
};
