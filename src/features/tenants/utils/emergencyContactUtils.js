// Helper functions để làm việc với emergency contacts

/**
 * Lấy primary emergency contact từ array của tenant
 * @param {Object} tenant - Tenant object có tenant_emergency_contacts array
 * @returns {Object|null} Primary emergency contact hoặc null
 */
export const getPrimaryEmergencyContact = (tenant) => {
  if (!tenant?.tenant_emergency_contacts || !Array.isArray(tenant.tenant_emergency_contacts)) {
    return null;
  }
  
  // Tìm primary contact
  const primary = tenant.tenant_emergency_contacts.find(
    (contact) => contact.is_primary === true
  );
  
  if (primary) {
    return primary;
  }
  
  // Nếu không có primary, lấy contact đầu tiên
  return tenant.tenant_emergency_contacts.length > 0
    ? tenant.tenant_emergency_contacts[0]
    : null;
};

/**
 * Lấy tất cả emergency contacts của tenant
 * @param {Object} tenant - Tenant object có tenant_emergency_contacts array
 * @returns {Array} Array of emergency contacts
 */
export const getAllEmergencyContacts = (tenant) => {
  if (!tenant?.tenant_emergency_contacts || !Array.isArray(tenant.tenant_emergency_contacts)) {
    return [];
  }
  
  return tenant.tenant_emergency_contacts.sort((a, b) => {
    // Sắp xếp: primary trước, sau đó theo created_at
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return new Date(a.created_at) - new Date(b.created_at);
  });
};

/**
 * Backward compatibility: Lấy emergency contact từ tenant object
 * Chỉ lấy từ tenant_emergency_contacts (các cột cũ đã được xóa)
 * @param {Object} tenant - Tenant object
 * @returns {Object|null} Emergency contact object với format chuẩn
 */
export const getEmergencyContact = (tenant) => {
  // Lấy từ tenant_emergency_contacts (dữ liệu mới)
  const primaryContact = getPrimaryEmergencyContact(tenant);
  if (primaryContact) {
    return {
      contact_name: primaryContact.contact_name,
      phone: primaryContact.phone,
      relationship: primaryContact.relationship,
      email: primaryContact.email,
      address: primaryContact.address,
    };
  }
  
  // Không còn fallback về các cột cũ vì đã được xóa
  return null;
};

/**
 * Format emergency contact để hiển thị
 * @param {Object} contact - Emergency contact object
 * @returns {String} Formatted string
 */
export const formatEmergencyContact = (contact) => {
  if (!contact) return "Chưa có";
  
  const parts = [];
  if (contact.contact_name) parts.push(contact.contact_name);
  if (contact.phone) parts.push(contact.phone);
  if (contact.relationship) parts.push(`(${contact.relationship})`);
  
  return parts.length > 0 ? parts.join(" - ") : "Chưa có";
};

