-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  id bigint NOT NULL DEFAULT nextval('audit_logs_id_seq'::regclass),
  entity text,
  entity_id uuid,
  action text,
  changed_by uuid,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bill_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL,
  description text,
  service_id uuid,
  quantity numeric DEFAULT 1,
  unit_price numeric DEFAULT 0,
  amount numeric DEFAULT (quantity * unit_price),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bill_items_pkey PRIMARY KEY (id),
  CONSTRAINT bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id),
  CONSTRAINT bill_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.bills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid,
  room_id uuid,
  tenant_id uuid,
  bill_number text UNIQUE,
  period_start date,
  period_end date,
  due_date date,
  total_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'UNPAID'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bills_pkey PRIMARY KEY (id),
  CONSTRAINT bills_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id),
  CONSTRAINT bills_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT bills_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.contract_tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  CONSTRAINT contract_tenants_pkey PRIMARY KEY (id),
  CONSTRAINT contract_tenants_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id),
  CONSTRAINT contract_tenants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  tenant_id uuid,
  landlord_id uuid,
  contract_number text UNIQUE,
  status USER-DEFINED DEFAULT 'DRAFT'::contract_status,
  start_date date,
  end_date date,
  monthly_rent numeric NOT NULL,
  deposit numeric DEFAULT 0,
  payment_cycle text DEFAULT 'MONTHLY'::text,
  terms text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contracts_pkey PRIMARY KEY (id),
  CONSTRAINT contracts_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT contracts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.floors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  floor_number integer NOT NULL,
  name text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT floors_pkey PRIMARY KEY (id),
  CONSTRAINT floors_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.maintenance_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  reported_by uuid,
  description text,
  status text DEFAULT 'OPEN'::text,
  cost_estimate numeric,
  cost_actual numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_requests_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT maintenance_requests_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(userId)
);
CREATE TABLE public.meters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  service_id uuid NOT NULL,
  meter_code text,
  last_read numeric DEFAULT 0,
  last_read_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meters_pkey PRIMARY KEY (id),
  CONSTRAINT meters_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT meters_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bill_id uuid,
  tenant_id uuid,
  amount numeric NOT NULL,
  payment_date timestamp with time zone DEFAULT now(),
  method USER-DEFINED,
  reference text,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id),
  CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  city text,
  district text,
  ward text,
  latitude numeric,
  longitude numeric,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT properties_pkey PRIMARY KEY (id)
);
CREATE TABLE public.room_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  storage_path text NOT NULL,
  caption text,
  is_primary boolean DEFAULT false,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT room_images_pkey PRIMARY KEY (id),
  CONSTRAINT room_images_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  floor_id uuid,
  code text NOT NULL,
  name text,
  description text,
  status USER-DEFINED DEFAULT 'VACANT'::room_status,
  capacity integer DEFAULT 1,
  current_occupants integer DEFAULT 0,
  monthly_rent numeric NOT NULL DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  deposit_months integer DEFAULT 1,
  area_sqm numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT rooms_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_type USER-DEFINED NOT NULL,
  name text NOT NULL,
  unit text,
  price_per_unit numeric DEFAULT 0,
  pricing_note text,
  is_metered boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  fullname text NOT NULL,
  birthdate date,
  gender text,
  phone text,
  email text,
  hometown text,
  occupation text,
  id_number text,
  note text,
  move_in_date date,
  move_out_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.users (
  userId uuid NOT NULL,
  full_name text,
  email text UNIQUE,
  phone text UNIQUE,
  role USER-DEFINED DEFAULT 'ADMIN'::user_role,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (userId),
  CONSTRAINT users_userId_fkey FOREIGN KEY (userId) REFERENCES auth.users(id)
);

-- Function to handle new user creation (updated to handle both OAuth and email/password signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (userId, full_name, avatar_url, email, role)
  VALUES (
    NEW.id,                                  -- id từ auth.users
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',  -- tên từ OAuth metadata
      NEW.email                              -- fallback: dùng email làm tên
    ),
    NEW.raw_user_meta_data->>'avatar_url',   -- avatar từ OAuth metadata (có thể NULL)
    NEW.email,                               -- email từ auth.users
    'ADMIN'::user_role                       -- role mặc định
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create user in public.users when auth.users is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();


