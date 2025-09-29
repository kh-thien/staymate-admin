-- Chat System Database Schema
-- Tạo các bảng cần thiết cho hệ thống chat
-- Tương thích với cấu trúc database hiện có

-- Bảng chat rooms
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  room_id uuid,
  name text,
  type text DEFAULT 'DIRECT'::text, -- DIRECT, GROUP
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id),
  CONSTRAINT chat_rooms_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT chat_rooms_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT chat_rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(userid)
);

-- Bảng chat participants
CREATE TABLE public.chat_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_type text NOT NULL, -- LANDLORD, TENANT, ADMIN
  joined_at timestamp with time zone DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT chat_participants_pkey PRIMARY KEY (id),
  CONSTRAINT chat_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid),
  UNIQUE(room_id, user_id)
);

-- Bảng chat messages
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL, -- LANDLORD, TENANT, ADMIN
  content text NOT NULL,
  message_type text DEFAULT 'TEXT'::text, -- TEXT, IMAGE, FILE, SYSTEM
  file_url text,
  file_name text,
  file_size bigint,
  reply_to uuid,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(userid),
  CONSTRAINT chat_messages_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.chat_messages(id)
);

-- Bảng message reactions
CREATE TABLE public.message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction text NOT NULL, -- emoji
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid),
  UNIQUE(message_id, user_id, reaction)
);

-- Bảng chat notifications
CREATE TABLE public.chat_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  message_id uuid NOT NULL,
  type text NOT NULL, -- NEW_MESSAGE, MENTION, REACTION
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT chat_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(userid),
  CONSTRAINT chat_notifications_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id),
  CONSTRAINT chat_notifications_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id)
);

-- Indexes cho performance
CREATE INDEX idx_chat_rooms_property_id ON public.chat_rooms(property_id);
CREATE INDEX idx_chat_rooms_room_id ON public.chat_rooms(room_id);
CREATE INDEX idx_chat_rooms_created_by ON public.chat_rooms(created_by);
CREATE INDEX idx_chat_participants_room_id ON public.chat_participants(room_id);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_notifications_user_id ON public.chat_notifications(user_id);
CREATE INDEX idx_chat_notifications_is_read ON public.chat_notifications(is_read);
CREATE INDEX idx_chat_notifications_created_at ON public.chat_notifications(created_at);

-- RLS Policies
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_notifications ENABLE ROW LEVEL SECURITY;

-- Policy cho chat_rooms: User chỉ có thể xem rooms mà họ tham gia
CREATE POLICY "Users can view rooms they participate in" ON public.chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Policy cho INSERT chat_rooms: Chỉ landlord có thể tạo rooms
CREATE POLICY "Landlords can create rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

-- Policy cho UPDATE chat_rooms: Chỉ landlord có thể update rooms
CREATE POLICY "Landlords can update rooms" ON public.chat_rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

-- Policy cho chat_participants: User chỉ có thể xem participants của rooms họ tham gia
CREATE POLICY "Users can view participants of their rooms" ON public.chat_participants
  FOR SELECT USING (user_id = auth.uid());

-- Policy cho INSERT participants: Chỉ landlord hoặc admin có thể thêm participants
CREATE POLICY "Landlords can add participants" ON public.chat_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      JOIN public.properties p ON cr.property_id = p.id
      WHERE cr.id = room_id AND p.owner_id = auth.uid()
    )
  );

-- Policy cho UPDATE participants: User chỉ có thể update chính họ
CREATE POLICY "Users can update their own participation" ON public.chat_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Policy cho DELETE participants: Chỉ landlord hoặc chính user đó có thể xóa
CREATE POLICY "Users can delete their own participation" ON public.chat_participants
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      JOIN public.properties p ON cr.property_id = p.id
      WHERE cr.id = room_id AND p.owner_id = auth.uid()
    )
  );

-- Policy cho chat_messages: User chỉ có thể xem messages của rooms họ tham gia
CREATE POLICY "Users can view messages of their rooms" ON public.chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Policy cho INSERT messages: Chỉ participants có thể gửi messages
CREATE POLICY "Participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    room_id IN (
      SELECT room_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Policy cho UPDATE messages: Chỉ sender có thể edit messages
CREATE POLICY "Senders can edit their messages" ON public.chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Policy cho DELETE messages: Chỉ sender có thể delete messages
CREATE POLICY "Senders can delete their messages" ON public.chat_messages
  FOR DELETE USING (sender_id = auth.uid());

-- Policy cho message_reactions: User chỉ có thể xem reactions của messages họ có thể xem
CREATE POLICY "Users can view reactions of accessible messages" ON public.message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM public.chat_messages 
      WHERE room_id IN (
        SELECT room_id FROM public.chat_participants 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy cho INSERT reactions: Chỉ participants có thể thêm reactions
CREATE POLICY "Participants can add reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    message_id IN (
      SELECT id FROM public.chat_messages 
      WHERE room_id IN (
        SELECT room_id FROM public.chat_participants 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy cho DELETE reactions: User chỉ có thể xóa reactions của họ
CREATE POLICY "Users can delete their reactions" ON public.message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Policy cho chat_notifications: User chỉ có thể xem notifications của họ
CREATE POLICY "Users can view their own notifications" ON public.chat_notifications
  FOR SELECT USING (user_id = auth.uid());

-- Policy cho INSERT notifications: System có thể tạo notifications
CREATE POLICY "System can create notifications" ON public.chat_notifications
  FOR INSERT WITH CHECK (true);

-- Policy cho UPDATE notifications: User chỉ có thể update notifications của họ
CREATE POLICY "Users can update their notifications" ON public.chat_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Policy cho DELETE notifications: User chỉ có thể xóa notifications của họ
CREATE POLICY "Users can delete their notifications" ON public.chat_notifications
  FOR DELETE USING (user_id = auth.uid());

-- Functions để tự động tạo chat room
CREATE OR REPLACE FUNCTION public.create_tenant_chat_room()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo chat room khi tenant được assign vào room
  IF NEW.room_id IS NOT NULL AND NEW.is_active = true THEN
    -- Kiểm tra xem đã có chat room chưa
    IF NOT EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE room_id = NEW.room_id AND is_active = true
    ) THEN
      -- Tạo chat room mới
      INSERT INTO public.chat_rooms (property_id, room_id, name, type, created_by)
      SELECT 
        r.property_id,
        NEW.room_id,
        'Chat với ' || NEW.fullname,
        'DIRECT',
        p.owner_id
      FROM public.rooms r
      JOIN public.properties p ON r.property_id = p.id
      WHERE r.id = NEW.room_id;
      
      -- Thêm landlord và tenant vào participants
      INSERT INTO public.chat_participants (room_id, user_id, user_type)
      SELECT 
        cr.id,
        p.owner_id,
        'LANDLORD'
      FROM public.chat_rooms cr
      JOIN public.rooms r ON cr.room_id = r.id
      JOIN public.properties p ON r.property_id = p.id
      WHERE cr.room_id = NEW.room_id
      ORDER BY cr.created_at DESC
      LIMIT 1;
      
      INSERT INTO public.chat_participants (room_id, user_id, user_type)
      SELECT 
        cr.id,
        (SELECT userid FROM public.users WHERE userid = auth.uid() LIMIT 1),
        'TENANT'
      FROM public.chat_rooms cr
      WHERE cr.room_id = NEW.room_id
      ORDER BY cr.created_at DESC
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động tạo chat room khi tenant được tạo/cập nhật
CREATE TRIGGER trigger_create_tenant_chat_room
  AFTER INSERT OR UPDATE OF room_id, is_active ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_tenant_chat_room();

-- Function để tạo chat room thủ công
CREATE OR REPLACE FUNCTION public.create_chat_room(
  p_property_id uuid,
  p_room_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_type text DEFAULT 'DIRECT'
)
RETURNS uuid AS $$
DECLARE
  new_room_id uuid;
  landlord_id uuid;
BEGIN
  -- Lấy landlord_id từ property
  SELECT owner_id INTO landlord_id 
  FROM public.properties 
  WHERE id = p_property_id;
  
  -- Tạo chat room
  INSERT INTO public.chat_rooms (property_id, room_id, name, type, created_by)
  VALUES (p_property_id, p_room_id, p_name, p_type, landlord_id)
  RETURNING id INTO new_room_id;
  
  -- Thêm landlord vào participants
  INSERT INTO public.chat_participants (room_id, user_id, user_type)
  VALUES (new_room_id, landlord_id, 'LANDLORD');
  
  RETURN new_room_id;
END;
$$ LANGUAGE plpgsql;

-- Function để thêm participant vào chat room
CREATE OR REPLACE FUNCTION public.add_chat_participant(
  p_room_id uuid,
  p_user_id uuid,
  p_user_type text
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.chat_participants (room_id, user_id, user_type)
  VALUES (p_room_id, p_user_id, p_user_type)
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function để lấy unread count cho user
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM public.chat_notifications cn
  WHERE cn.user_id = p_user_id 
    AND cn.is_read = false;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function để mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_room_id uuid,
  p_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- Cập nhật last_read_at cho participant
  UPDATE public.chat_participants 
  SET last_read_at = now()
  WHERE room_id = p_room_id AND user_id = p_user_id;
  
  -- Đánh dấu notifications đã đọc
  UPDATE public.chat_notifications 
  SET is_read = true
  WHERE room_id = p_room_id AND user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- View để lấy chat rooms với thông tin chi tiết
CREATE VIEW public.chat_rooms_with_details AS
SELECT 
  cr.id,
  cr.property_id,
  cr.room_id,
  cr.name,
  cr.type,
  cr.created_by,
  cr.created_at,
  cr.updated_at,
  cr.is_active,
  p.name as property_name,
  p.address as property_address,
  r.code as room_code,
  r.name as room_name,
  u.full_name as created_by_name,
  (SELECT COUNT(*) FROM public.chat_participants cp WHERE cp.room_id = cr.id) as participant_count,
  (SELECT COUNT(*) FROM public.chat_messages cm WHERE cm.room_id = cr.id AND cm.is_deleted = false) as message_count
FROM public.chat_rooms cr
LEFT JOIN public.properties p ON cr.property_id = p.id
LEFT JOIN public.rooms r ON cr.room_id = r.id
LEFT JOIN public.users u ON cr.created_by = u.userid;

-- View để lấy messages với thông tin sender
CREATE VIEW public.chat_messages_with_sender AS
SELECT 
  cm.id,
  cm.room_id,
  cm.sender_id,
  cm.sender_type,
  cm.content,
  cm.message_type,
  cm.file_url,
  cm.file_name,
  cm.file_size,
  cm.reply_to,
  cm.is_edited,
  cm.edited_at,
  cm.is_deleted,
  cm.deleted_at,
  cm.created_at,
  u.full_name as sender_name,
  u.avatar_url as sender_avatar,
  reply_msg.content as reply_content,
  reply_msg.sender_type as reply_sender_type
FROM public.chat_messages cm
LEFT JOIN public.users u ON cm.sender_id = u.userid
LEFT JOIN public.chat_messages reply_msg ON cm.reply_to = reply_msg.id;

-- Grant permissions
GRANT ALL ON public.chat_rooms TO authenticated;
GRANT ALL ON public.chat_participants TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.message_reactions TO authenticated;
GRANT ALL ON public.chat_notifications TO authenticated;
GRANT SELECT ON public.chat_rooms_with_details TO authenticated;
GRANT SELECT ON public.chat_messages_with_sender TO authenticated;