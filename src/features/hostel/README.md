# Hostel Management System - Clean Architecture

This document describes the hostel management system built with clean architecture principles, following the same patterns as the authentication system.

## Database Schema

### Core Tables

```sql
-- Hostels table
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  description TEXT,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('single', 'double', 'triple', 'quad', 'dormitory')),
  floor_number INTEGER NOT NULL,
  area_sqft DECIMAL(10,2),
  max_occupancy INTEGER NOT NULL DEFAULT 1,
  current_occupancy INTEGER DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hostel_id, room_number)
);

-- Room Information table (detailed room specs)
CREATE TABLE room_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_type VARCHAR(50),
  bed_count INTEGER DEFAULT 1,
  has_private_bathroom BOOLEAN DEFAULT false,
  has_balcony BOOLEAN DEFAULT false,
  has_air_conditioning BOOLEAN DEFAULT false,
  has_heating BOOLEAN DEFAULT false,
  has_wifi BOOLEAN DEFAULT true,
  has_tv BOOLEAN DEFAULT false,
  has_mini_fridge BOOLEAN DEFAULT false,
  has_wardrobe BOOLEAN DEFAULT true,
  has_desk BOOLEAN DEFAULT false,
  window_type VARCHAR(50),
  floor_type VARCHAR(50),
  wall_color VARCHAR(50),
  special_features JSONB DEFAULT '[]',
  maintenance_notes TEXT,
  last_cleaned_at TIMESTAMP WITH TIME ZONE,
  last_maintenance_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  tenant_email VARCHAR(255) NOT NULL,
  tenant_phone VARCHAR(20),
  tenant_emergency_contact VARCHAR(255),
  tenant_emergency_phone VARCHAR(20),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  utilities_included BOOLEAN DEFAULT false,
  utilities_cost DECIMAL(10,2) DEFAULT 0,
  contract_terms TEXT,
  special_conditions TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  payment_due_day INTEGER DEFAULT 1,
  late_fee_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Contract Payments table
CREATE TABLE contract_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Constraints

```sql
-- Indexes for better performance
CREATE INDEX idx_rooms_hostel_id ON rooms(hostel_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_contracts_room_id ON contracts(room_id);
CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contract_payments_contract_id ON contract_payments(contract_id);
CREATE INDEX idx_contract_payments_status ON contract_payments(status);

-- Row Level Security (RLS) policies
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth requirements)
CREATE POLICY "Users can view all hostels" ON hostels FOR SELECT USING (true);
CREATE POLICY "Users can insert hostels" ON hostels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update hostels" ON hostels FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete hostels" ON hostels FOR DELETE USING (auth.uid() IS NOT NULL);

-- Similar policies for other tables...
```

## Architecture Overview

```
src/features/hostel/
├── domain/                    # Business Logic Layer (Pure)
│   ├── types.js              # Domain types and entities
│   ├── validators.js          # Pure validation functions
│   ├── errorHandler.js        # Error mapping and handling
│   └── index.js               # Domain exports
├── services/                  # Data Access Layer
│   ├── hostelServices.jsx     # Hostel CRUD operations
│   ├── roomServices.jsx       # Room CRUD operations
│   ├── roomInfoServices.jsx   # Room information services
│   └── contractServices.jsx   # Contract management services
├── store/                     # Redux Store Layer
│   ├── hostelSlice.js         # Hostel state management
│   ├── roomSlice.js           # Room state management
│   ├── roomInfoSlice.js       # Room info state management
│   ├── contractSlice.js       # Contract state management
│   ├── selectors.js            # Memoized selectors
│   ├── thunks.js               # Async thunks
│   └── index.js                # Store exports
├── hooks/                     # Application Logic Layer
│   ├── useHostel.js           # Hostel business logic hooks
│   ├── useRoom.js             # Room business logic hooks
│   ├── useRoomInfo.js         # Room info business logic hooks
│   ├── useContract.js          # Contract business logic hooks
│   └── index.js                # Hooks exports
├── components/                # Presentation Layer
│   ├── hostel/                # Hostel management components
│   │   ├── HostelList.jsx
│   │   ├── HostelForm.jsx
│   │   ├── HostelCard.jsx
│   │   └── index.js
│   ├── room/                  # Room management components
│   │   ├── RoomList.jsx
│   │   ├── RoomForm.jsx
│   │   ├── RoomCard.jsx
│   │   └── index.js
│   ├── roomInfo/              # Room info components
│   │   ├── RoomInfoForm.jsx
│   │   ├── RoomInfoDisplay.jsx
│   │   └── index.js
│   ├── contract/              # Contract components
│   │   ├── ContractList.jsx
│   │   ├── ContractForm.jsx
│   │   ├── ContractCard.jsx
│   │   └── index.js
│   └── shared/                # Shared components
│       ├── DataTable.jsx
│       ├── SearchFilter.jsx
│       ├── StatusBadge.jsx
│       └── index.js
├── pages/                     # Route Components
│   ├── HostelDashboard.jsx
│   ├── HostelManagement.jsx
│   ├── RoomManagement.jsx
│   ├── RoomInfoManagement.jsx
│   ├── ContractManagement.jsx
│   └── index.js
└── index.js                   # Feature exports
```

## Key Features

### 1. **Hostel Management**
- Create, read, update, delete hostels
- Hostel information management
- Amenities and image management
- Status tracking (active, inactive, maintenance)

### 2. **Room Management**
- Room creation and management
- Room type classification (single, double, triple, quad, dormitory)
- Occupancy tracking
- Pricing management
- Status management (available, occupied, maintenance, reserved)

### 3. **Room Information Management**
- Detailed room specifications
- Amenities tracking
- Maintenance history
- Cleaning schedules
- Special features documentation

### 4. **Contract Management**
- Contract creation and management
- Tenant information management
- Payment tracking
- Contract terms and conditions
- Status management (active, expired, terminated, pending)

## Clean Architecture Principles

### 1. **Domain Layer (Pure Business Logic)**
- No external dependencies
- Pure functions for validation
- Domain entities and types
- Business rules and constraints

### 2. **Services Layer (Data Access)**
- Supabase integration
- CRUD operations
- Data transformation
- Error handling

### 3. **Store Layer (State Management)**
- Redux state management
- Async thunks for API calls
- Memoized selectors
- Predictable state updates

### 4. **Hooks Layer (Application Logic)**
- Reusable business logic
- Form management
- State synchronization
- Custom hooks for complex operations

### 5. **Components Layer (Presentation)**
- Pure UI components
- Container components
- Reusable components
- Clean separation of concerns

## Benefits

### ✅ **Maintainability**
- Clear separation of concerns
- Easy to test individual layers
- Business logic isolated from UI
- Consistent patterns across features

### ✅ **Scalability**
- Easy to add new features
- Modular architecture
- Reusable components
- Extensible design

### ✅ **Performance**
- Memoized selectors
- Efficient state updates
- Optimized re-renders
- Lazy loading support

### ✅ **Developer Experience**
- Consistent patterns
- Easy to understand
- Good documentation
- Type safety (when using TypeScript)
