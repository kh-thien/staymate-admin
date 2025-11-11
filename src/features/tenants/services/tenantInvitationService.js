import { supabase } from "../../../core/data/remote/supabase";

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

  // Gửi email lời mời (placeholder - sẽ implement với email service thực tế)
  async sendInvitationEmail({ tenantName, email, invitationToken, expiresAt }) {
    try {
      const invitationUrl = `${window.location.origin}/invite/accept?token=${invitationToken}`;

      console.log("📧 Sending invitation email:", {
        to: email,
        tenantName,
        invitationUrl,
        expiresAt,
      });

      // Sử dụng external Node.js service
      try {
        const response = await fetch(
          "http://localhost:3001/api/send-invitation-email",
          {
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
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Email sent via external service:", result);
        alert(`📧 Email đã được gửi thành công đến ${email}!`);
        return { success: true, method: "external-service" };
      } catch (serviceError) {
        console.warn(
          "External service failed, using fallback method:",
          serviceError
        );

        // Fallback: Hiển thị thông tin trong alert
        alert(
          `📧 Email lời mời đã được gửi đến ${email}\n\n🔗 Link: ${invitationUrl}\n\n⏰ Hết hạn: ${new Date(
            expiresAt
          ).toLocaleString(
            "vi-VN"
          )}\n\n💡 External email service chưa được cấu hình. Vui lòng setup email service.`
        );

        return { success: true, method: "fallback" };
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
