import { supabase } from "../../../core/data/remote/supabase";

/**
 * Dashboard Service - Fetch tất cả dashboard data
 */
export const dashboardService = {
  /**
   * Get properties stats
   */
  async getPropertiesStats(userId) {
    try {
      const { count: total, error: totalError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

      if (totalError) throw totalError;

      const { count: active, error: activeError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("is_active", true);

      if (activeError) throw activeError;

      return { total: total || 0, active: active || 0 };
    } catch (error) {
      console.error("Error fetching properties stats:", error);
      throw error;
    }
  },

  /**
   * Get rooms stats
   */
  async getRoomsStats(userId) {
    try {
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { total: 0, occupied: 0, vacant: 0, maintenance: 0, deposited: 0 };
      }

      // Get all rooms for these properties in one query
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("status")
        .in("property_id", propertyIds)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      const rooms = roomsData || [];
      const total = rooms.length;
      const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
      const vacant = rooms.filter((r) => r.status === "VACANT").length;
      const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;
      const deposited = rooms.filter((r) => r.status === "DEPOSITED").length;

      return {
        total,
        occupied,
        vacant,
        maintenance,
        deposited,
      };
    } catch (error) {
      console.error("Error fetching rooms stats:", error);
      throw error;
    }
  },

  /**
   * Get tenants stats
   */
  async getTenantsStats(userId) {
    try {
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all tenants for these rooms
      // Filter out deleted tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("is_active")
        .in("room_id", roomIds)
        .is("deleted_at", null);

      if (tenantsError) throw tenantsError;

      const tenants = tenantsData || [];
      const total = tenants.length;
      const active = tenants.filter((t) => t.is_active === true).length;

      return { total, active };
    } catch (error) {
      console.error("Error fetching tenants stats:", error);
      throw error;
    }
  },

  /**
   * Get contracts stats
   */
  async getContractsStats(userId) {
    try {
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all contracts for these rooms
      const { data: contractsData, error: contractsError } = await supabase
        .from("contracts")
        .select("status")
        .in("room_id", roomIds);

      if (contractsError) throw contractsError;

      const contracts = contractsData || [];
      const total = contracts.length;
      const active = contracts.filter((c) => c.status === "ACTIVE").length;

      return { total, active };
    } catch (error) {
      console.error("Error fetching contracts stats:", error);
      throw error;
    }
  },

  /**
   * Get revenue stats
   */
  async getRevenueStats(userId) {
    try {
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { totalRevenue: 0, monthlyRevenue: 0 };
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        return { totalRevenue: 0, monthlyRevenue: 0 };
      }

      // Total revenue từ bills
      // Select period_start for accurate monthly revenue calculation
      const { data: billsData, error: billsError } = await supabase
        .from("bills")
        .select("total_amount, period_start, created_at, status")
        .in("room_id", roomIds)
        .eq("status", "PAID")
        .is("deleted_at", null);

      if (billsError) throw billsError;

      // Calculate total revenue
      const totalRevenue = (billsData || []).reduce(
        (sum, bill) => sum + (parseFloat(bill.total_amount) || 0),
        0
      );

      // Calculate monthly revenue (this month)
      // Use period_start instead of created_at for accurate monthly revenue
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyRevenue = (billsData || [])
        .filter((bill) => {
          // Use period_start if available, fallback to created_at
          const billDate = new Date(bill.period_start || bill.created_at);
          return (
            billDate.getMonth() === currentMonth &&
            billDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, bill) => sum + (parseFloat(bill.total_amount) || 0), 0);

      return { totalRevenue, monthlyRevenue };
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      throw error;
    }
  },

  /**
   * Get occupancy rate
   */
  async getOccupancyRate(userId, roomsStats = null) {
    try {
      const resolvedRoomsStats =
        roomsStats ?? (await this.getRoomsStats(userId));

      if (resolvedRoomsStats.total === 0) return 0;

      const rate = Math.round(
        (resolvedRoomsStats.occupied / resolvedRoomsStats.total) * 100
      );
      return rate;
    } catch (error) {
      console.error("Error calculating occupancy rate:", error);
      throw error;
    }
  },

  /**
   * Get recent activities with entity names (not just IDs)
   */
  async getRecentActivities(userId, limit = 10) {
    try {
      // Get activity logs
      const { data: activities, error: activitiesError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (activitiesError) throw activitiesError;
      if (!activities || activities.length === 0) return [];

      // Collect ALL entity IDs from activities (not just from entityGroups)
      // This ensures we fetch all entities, even if they weren't in the initial grouping
      const allEntityIds = {
        contracts: new Set(),
        contract: new Set(), // Handle singular form
        properties: new Set(),
        property: new Set(), // Handle singular form
        rooms: new Set(),
        room: new Set(), // Handle singular form
        tenants: new Set(),
        tenant: new Set(), // Handle singular form
        bills: new Set(),
        bill: new Set(), // Handle singular form
      };

      // Collect all unique entity IDs by type from activities
      activities.forEach((activity) => {
        let entityType = activity.entity_type?.toLowerCase();
        const entityId = activity.entity_id;
        
        // Normalize entity type (handle both singular and plural)
        if (entityType) {
          // Map singular to plural for consistency
          if (entityType === 'property') entityType = 'properties';
          else if (entityType === 'contract') entityType = 'contracts';
          else if (entityType === 'room') entityType = 'rooms';
          else if (entityType === 'tenant') entityType = 'tenants';
          else if (entityType === 'bill') entityType = 'bills';
        }
        
        // Ensure entity_id is valid and entityType exists
        if (entityType && entityId) {
          // Add to both singular and plural sets to ensure we catch it
          if (allEntityIds[entityType]) {
            allEntityIds[entityType].add(entityId);
          }
          // Also add to normalized plural form
          if (entityType === 'properties' && allEntityIds.property) {
            allEntityIds.property.add(entityId);
          } else if (entityType === 'contracts' && allEntityIds.contract) {
            allEntityIds.contract.add(entityId);
          } else if (entityType === 'rooms' && allEntityIds.room) {
            allEntityIds.room.add(entityId);
          } else if (entityType === 'tenants' && allEntityIds.tenant) {
            allEntityIds.tenant.add(entityId);
          } else if (entityType === 'bills' && allEntityIds.bill) {
            allEntityIds.bill.add(entityId);
          }
        }
      });

      // Convert Sets to Arrays for querying
      // Merge singular and plural forms
      const entityGroups = {
        contracts: Array.from(new Set([...allEntityIds.contracts, ...allEntityIds.contract])),
        properties: Array.from(new Set([...allEntityIds.properties, ...allEntityIds.property])),
        rooms: Array.from(new Set([...allEntityIds.rooms, ...allEntityIds.room])),
        tenants: Array.from(new Set([...allEntityIds.tenants, ...allEntityIds.tenant])),
        bills: Array.from(new Set([...allEntityIds.bills, ...allEntityIds.bill])),
      };

      // Fetch entity names in parallel - fetch ALL entities from activities
      const [contractsData, propertiesData, roomsData, tenantsData, billsData] = await Promise.all([
        // Contracts
        entityGroups.contracts.length > 0
          ? supabase
              .from("contracts")
              .select("id, contract_number, room_id, tenant_id")
              .in("id", entityGroups.contracts)
          : { data: [], error: null },
        
        // Properties
        entityGroups.properties.length > 0
          ? supabase
              .from("properties")
              .select("id, name, property_type")
              .in("id", entityGroups.properties)
          : { data: [], error: null },
        
        // Rooms
        entityGroups.rooms.length > 0
          ? supabase
              .from("rooms")
              .select("id, code, name")
              .in("id", entityGroups.rooms)
          : { data: [], error: null },
        
        // Tenants
        entityGroups.tenants.length > 0
          ? supabase
              .from("tenants")
              .select("id, fullname")
              .in("id", entityGroups.tenants)
          : { data: [], error: null },
        
        // Bills
        entityGroups.bills.length > 0
          ? supabase
              .from("bills")
              .select("id, bill_number, name")
              .in("id", entityGroups.bills)
          : { data: [], error: null },
      ]);

      // Get room and tenant IDs from contracts for additional lookups
      // Remove duplicates and ensure valid UUIDs
      const contractRoomIds = [...new Set(
        (contractsData.data || [])
          .map((c) => c.room_id)
          .filter((id) => id && typeof id === 'string' && id.length > 0)
      )];
      const contractTenantIds = [...new Set(
        (contractsData.data || [])
          .map((c) => c.tenant_id)
          .filter((id) => id && typeof id === 'string' && id.length > 0)
      )];

      // Fetch rooms and tenants for contracts (if not already fetched)
      const [contractRoomsData, contractTenantsData] = await Promise.all([
        contractRoomIds.length > 0
          ? supabase
              .from("rooms")
              .select("id, code, name")
              .in("id", contractRoomIds)
          : { data: [], error: null },
        contractTenantIds.length > 0
          ? supabase
              .from("tenants")
              .select("id, fullname")
              .in("id", contractTenantIds)
          : { data: [], error: null },
      ]);

      // Create lookup maps
      const contractsMap = new Map(
        (contractsData.data || []).map((c) => [c.id, c])
      );
      const contractRoomsMap = new Map(
        (contractRoomsData.data || []).map((r) => [r.id, r])
      );
      const contractTenantsMap = new Map(
        (contractTenantsData.data || []).map((t) => [t.id, t])
      );
      const propertiesMap = new Map(
        (propertiesData.data || []).map((p) => [p.id, p])
      );
      // Merge rooms from contracts into main roomsMap
      const roomsMap = new Map(
        (roomsData.data || []).map((r) => [r.id, r])
      );
      (contractRoomsData.data || []).forEach((r) => {
        if (!roomsMap.has(r.id)) {
          roomsMap.set(r.id, r);
        }
      });
      // Merge tenants from contracts into main tenantsMap
      const tenantsMap = new Map(
        (tenantsData.data || []).map((t) => [t.id, t])
      );
      (contractTenantsData.data || []).forEach((t) => {
        if (!tenantsMap.has(t.id)) {
          tenantsMap.set(t.id, t);
        }
      });
      const billsMap = new Map(
        (billsData.data || []).map((b) => [b.id, b])
      );

      // All entities should already be in maps from the initial fetch above
      // But we'll check for any missing ones and fetch them as a safety net
      const missingEntities = {
        contracts: [],
        properties: [],
        rooms: [],
        tenants: [],
        bills: [],
      };

      activities.forEach((activity) => {
        let entityType = activity.entity_type?.toLowerCase();
        const entityId = activity.entity_id;
        if (!entityId) return;

        // Normalize entity type (handle both singular and plural)
        if (entityType) {
          if (entityType === 'property') entityType = 'properties';
          else if (entityType === 'contract') entityType = 'contracts';
          else if (entityType === 'room') entityType = 'rooms';
          else if (entityType === 'tenant') entityType = 'tenants';
          else if (entityType === 'bill') entityType = 'bills';
        }

        switch (entityType) {
          case "contracts":
            if (!contractsMap.has(entityId)) {
              missingEntities.contracts.push(entityId);
            }
            break;
          case "properties":
            if (!propertiesMap.has(entityId)) {
              missingEntities.properties.push(entityId);
            }
            break;
          case "rooms":
            if (!roomsMap.has(entityId)) {
              missingEntities.rooms.push(entityId);
            }
            break;
          case "tenants":
            if (!tenantsMap.has(entityId)) {
              missingEntities.tenants.push(entityId);
            }
            break;
          case "bills":
            if (!billsMap.has(entityId)) {
              missingEntities.bills.push(entityId);
            }
            break;
        }
      });

      // Fetch any remaining missing entities in parallel (safety net)
      if (missingEntities.contracts.length > 0 || missingEntities.properties.length > 0 || 
          missingEntities.rooms.length > 0 || missingEntities.tenants.length > 0 || 
          missingEntities.bills.length > 0) {
        const [missingContractsData, missingPropertiesData, missingRoomsData, missingTenantsData, missingBillsData] = await Promise.all([
          missingEntities.contracts.length > 0
            ? supabase
                .from("contracts")
                .select("id, contract_number, room_id, tenant_id")
                .in("id", [...new Set(missingEntities.contracts)])
            : { data: [], error: null },
          missingEntities.properties.length > 0
            ? supabase
                .from("properties")
                .select("id, name, property_type")
                .in("id", [...new Set(missingEntities.properties)])
            : { data: [], error: null },
          missingEntities.rooms.length > 0
            ? supabase
                .from("rooms")
                .select("id, code, name")
                .in("id", [...new Set(missingEntities.rooms)])
            : { data: [], error: null },
          missingEntities.tenants.length > 0
            ? supabase
                .from("tenants")
                .select("id, fullname")
                .in("id", [...new Set(missingEntities.tenants)])
            : { data: [], error: null },
          missingEntities.bills.length > 0
            ? supabase
                .from("bills")
                .select("id, bill_number, name")
                .in("id", [...new Set(missingEntities.bills)])
            : { data: [], error: null },
        ]);

        // Merge missing entities into existing maps
        (missingContractsData.data || []).forEach((c) => contractsMap.set(c.id, c));
        (missingPropertiesData.data || []).forEach((p) => {
          propertiesMap.set(p.id, p);
          // Also update property_type if needed
          if (p.property_type && !propertiesMap.get(p.id)?.property_type) {
            const existing = propertiesMap.get(p.id);
            if (existing) {
              existing.property_type = p.property_type;
            }
          }
        });
        (missingRoomsData.data || []).forEach((r) => roomsMap.set(r.id, r));
        (missingTenantsData.data || []).forEach((t) => tenantsMap.set(t.id, t));
        (missingBillsData.data || []).forEach((b) => billsMap.set(b.id, b));
      }


      // Now enrich activities with entity names
      const enrichedActivities = activities.map((activity) => {
        let entityType = activity.entity_type?.toLowerCase();
        const entityId = activity.entity_id;
        let entityName = null;
        // Always create new friendlyDescription, don't use old description
        let friendlyDescription = null;

        // Normalize entity type (handle both singular and plural)
        if (entityType) {
          if (entityType === 'property') entityType = 'properties';
          else if (entityType === 'contract') entityType = 'contracts';
          else if (entityType === 'room') entityType = 'rooms';
          else if (entityType === 'tenant') entityType = 'tenants';
          else if (entityType === 'bill') entityType = 'bills';
        }

        switch (entityType) {
          case "contracts":
            const contract = contractsMap.get(entityId);
            if (contract) {
              entityName = contract.contract_number || `Hợp đồng ${contract.id.substring(0, 8)}`;
              const room = contract.room_id ? contractRoomsMap.get(contract.room_id) : null;
              const tenant = contract.tenant_id ? contractTenantsMap.get(contract.tenant_id) : null;
              const roomName = room ? (room.code || room.name) : "";
              const tenantName = tenant ? tenant.fullname : "";
              
              // Tạo mô tả rõ ràng và đầy đủ
              const actionText = this.getActionText(activity.action);
              if (roomName && tenantName) {
                friendlyDescription = `${actionText} hợp đồng ${entityName} cho phòng ${roomName} - ${tenantName}`;
              } else if (roomName) {
                friendlyDescription = `${actionText} hợp đồng ${entityName} cho phòng ${roomName}`;
              } else if (tenantName) {
                friendlyDescription = `${actionText} hợp đồng ${entityName} - ${tenantName}`;
              } else {
                friendlyDescription = `${actionText} hợp đồng ${entityName}`;
              }
            } else {
              // Fallback: Create friendly description even if contract not found
              const shortId = entityId ? entityId.substring(0, 8) : "N/A";
              friendlyDescription = `${this.getActionText(activity.action)} hợp đồng ${shortId}`;
            }
            break;
          
          case "properties":
            const property = propertiesMap.get(entityId);
            if (property) {
              const actionText = this.getActionText(activity.action);
              // Nếu có tên, hiển thị: "Tạo mới nhà trọ "Tên""
              // Nếu không có tên nhưng có property_type, hiển thị: "Tạo mới nhà trọ"
              if (property.name) {
                friendlyDescription = `${actionText} nhà trọ "${property.name}"`;
              } else if (property.property_type) {
                // Map property_type sang tiếng Việt
                const propertyTypeMap = {
                  'BOARDING_HOUSE': 'nhà trọ',
                  'APARTMENT': 'chung cư',
                  'HOUSE': 'nhà',
                  'STUDIO': 'studio',
                };
                const propertyTypeText = propertyTypeMap[property.property_type] || property.property_type.toLowerCase();
                friendlyDescription = `${actionText} ${propertyTypeText}`;
              } else {
                entityName = `Nhà trọ ${entityId.substring(0, 8)}`;
                friendlyDescription = `${actionText} ${entityName}`;
              }
            } else {
              // Fallback: Create friendly description even if property not found
              const shortId = entityId ? entityId.substring(0, 8) : "N/A";
              friendlyDescription = `${this.getActionText(activity.action)} nhà trọ (${shortId})`;
            }
            break;
          
          case "rooms":
            const room = roomsMap.get(entityId);
            if (room) {
              entityName = room.code || room.name || `Phòng ${entityId.substring(0, 8)}`;
              const actionText = this.getActionText(activity.action);
              friendlyDescription = `${actionText} phòng ${entityName}`;
            } else {
              // Fallback: Create friendly description even if room not found
              const shortId = entityId ? entityId.substring(0, 8) : "N/A";
              friendlyDescription = `${this.getActionText(activity.action)} phòng ${shortId}`;
            }
            break;
          
          case "tenants":
            const tenant = tenantsMap.get(entityId);
            if (tenant) {
              entityName = tenant.fullname || `Người thuê ${entityId.substring(0, 8)}`;
              const actionText = this.getActionText(activity.action);
              friendlyDescription = `${actionText} người thuê "${entityName}"`;
            } else {
              // Fallback: Create friendly description even if tenant not found
              const shortId = entityId ? entityId.substring(0, 8) : "N/A";
              friendlyDescription = `${this.getActionText(activity.action)} người thuê ${shortId}`;
            }
            break;
          
          case "bills":
            const bill = billsMap.get(entityId);
            if (bill) {
              entityName = bill.bill_number || bill.name || `Hóa đơn ${entityId.substring(0, 8)}`;
              const actionText = this.getActionText(activity.action);
              friendlyDescription = `${actionText} hóa đơn ${entityName}`;
            } else {
              // Fallback: Create friendly description even if bill not found
              const shortId = entityId ? entityId.substring(0, 8) : "N/A";
              friendlyDescription = `${this.getActionText(activity.action)} hóa đơn ${shortId}`;
            }
            break;
          
          default:
            // For unknown entity types, create a basic friendly description
            const shortId = entityId ? entityId.substring(0, 8) : "N/A";
            const actionText = this.getActionText(activity.action);
            const entityTypeText = entityType === "maintenance" ? "yêu cầu bảo trì" :
                                  entityType === "payment" ? "thanh toán" :
                                  entityType === "user" ? "người dùng" :
                                  entityType || "đối tượng";
            friendlyDescription = `${actionText} ${entityTypeText} ${shortId}`;
            break;
        }

        // Ensure friendlyDescription is always set
        // If friendlyDescription is still null, create a fallback
        if (!friendlyDescription && entityId) {
          const shortId = entityId.substring(0, 8);
          const actionText = this.getActionText(activity.action);
          const entityTypeText = entityType === "contracts" ? "hợp đồng" :
                                entityType === "properties" ? "nhà trọ" :
                                entityType === "rooms" ? "phòng" :
                                entityType === "tenants" ? "người thuê" :
                                entityType === "bills" ? "hóa đơn" :
                                entityType === "maintenance" ? "yêu cầu bảo trì" :
                                entityType === "payment" ? "thanh toán" :
                                entityType === "user" ? "người dùng" :
                                entityType || "đối tượng";
          friendlyDescription = `${actionText} ${entityTypeText} ${shortId}`;
        }

        // Final fallback
        if (!friendlyDescription) {
          friendlyDescription = activity.description || "Hoạt động";
        }

        return {
          ...activity,
          entityName,
          friendlyDescription,
        };
      });

      return enrichedActivities;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Return empty array as fallback instead of throwing
      return [];
    }
  },

  /**
   * Helper to get action text in Vietnamese
   */
  getActionText(action) {
    if (!action) return "Thao tác";
    
    const actionUpper = action.toUpperCase();
    const actionMap = {
      CREATE: "Tạo mới",
      CREATED: "Tạo mới",
      "CREATED PROPERTIES": "Tạo mới",
      "CREATED CONTRACTS": "Tạo mới",
      "CREATED ROOMS": "Tạo mới",
      "CREATED TENANTS": "Tạo mới",
      "CREATED BILLS": "Tạo mới",
      UPDATE: "Cập nhật",
      UPDATED: "Cập nhật",
      "UPDATED PROPERTIES": "Cập nhật",
      "UPDATED CONTRACTS": "Cập nhật",
      "UPDATED ROOMS": "Cập nhật",
      "UPDATED TENANTS": "Cập nhật",
      "UPDATED BILLS": "Cập nhật",
      DELETE: "Xóa",
      DELETED: "Xóa",
      LOGIN: "Đăng nhập",
      LOGOUT: "Đăng xuất",
      PAY: "Thanh toán",
      PAID: "Đã thanh toán",
      MOVE: "Chuyển",
      TRANSFER: "Chuyển",
    };
    
    // Check exact match first
    if (actionMap[actionUpper]) {
      return actionMap[actionUpper];
    }
    
    // Check if action contains keywords
    if (actionUpper.includes("CREATE") || actionUpper.includes("CREATED")) {
      return "Tạo mới";
    }
    if (actionUpper.includes("UPDATE") || actionUpper.includes("UPDATED")) {
      return "Cập nhật";
    }
    if (actionUpper.includes("DELETE") || actionUpper.includes("DELETED")) {
      return "Xóa";
    }
    
    return action || "Thao tác";
  },

  /**
   * Get revenue trend (last 6 months)
   */
  async getRevenueTrend(userId, months = 6) {
    try {
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        // Return empty data for all months
        const now = new Date();
        const result = [];
        for (let i = months - 1; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          result.push({
            month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
            revenue: 0,
            bills: 0,
          });
        }
        return result;
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        // Return empty data for all months
        const now = new Date();
        const result = [];
        for (let i = months - 1; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          result.push({
            month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
            revenue: 0,
            bills: 0,
          });
        }
        return result;
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

      // Use period_start for accurate monthly grouping
      const { data, error } = await supabase
        .from("bills")
        .select("total_amount, period_start, created_at, status")
        .in("room_id", roomIds)
        .eq("status", "PAID")
        .gte("period_start", startDate.toISOString())
        .is("deleted_at", null);

      if (error) throw error;

      // Group by month
      const monthlyData = new Map();

      (data || []).forEach((bill) => {
        // Use period_start if available, fallback to created_at
        const date = new Date(bill.period_start || bill.created_at);
        if (Number.isNaN(date.getTime())) {
          return;
        }
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;

        if (!monthlyData.has(key)) {
          monthlyData.set(key, { revenue: 0, count: 0 });
        }

        const monthEntry = monthlyData.get(key);
        monthEntry.revenue += parseFloat(bill.total_amount) || 0;
        monthEntry.count += 1;
      });

      const result = [];
      for (let i = months - 1; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        const entry = monthlyData.get(key) || { revenue: 0, count: 0 };

        result.push({
          month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
          revenue: entry.revenue,
          bills: entry.count,
        });
      }

      return result;
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
      throw error;
    }
  },

  /**
   * Get dashboard overview (all stats at once)
   */
  async getDashboardOverview(userId) {
    try {
      const [
        propertiesStats,
        roomsStats,
        tenantsStats,
        contractsStats,
        revenueStats,
        recentActivities,
        revenueTrend,
      ] = await Promise.all([
        this.getPropertiesStats(userId),
        this.getRoomsStats(userId),
        this.getTenantsStats(userId),
        this.getContractsStats(userId),
        this.getRevenueStats(userId),
        this.getRecentActivities(userId, 10),
        this.getRevenueTrend(userId, 6),
      ]);

      const occupancyRate = await this.getOccupancyRate(userId, roomsStats);

      return {
        properties: propertiesStats,
        rooms: roomsStats,
        tenants: tenantsStats,
        contracts: contractsStats,
        revenue: revenueStats,
        occupancyRate,
        recentActivities,
        revenueTrend,
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },
};
