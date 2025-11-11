import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_room_model.dart';
import '../models/chat_message_model.dart';

class ChatRemoteDatasource {
  final SupabaseClient _supabase;

  ChatRemoteDatasource(this._supabase);

  /// Get all chat rooms for current user
  Future<List<ChatRoomModel>> getChatRooms() async {
    try {
      // Authentication check
      final user = _supabase.auth.currentUser;

      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Query with nested relations including owner info and participants
      final response = await _supabase
          .from('chat_rooms')
          .select('''
        *,
        rooms!inner(
          id,
          code,
          name,
          property_id,
          properties!inner(
            id,
            name,
            address,
            city,
            ward,
            district,
            owner_id,
            owner:users(
              userid,
              full_name,
              email,
              phone,
              avatar_url
            )
          )
        ),
        chat_participants(
          id,
          room_id,
          user_id,
          user_type,
          joined_at,
          last_read_at,
          is_active,
          last_seen_at,
          is_online
        )
      ''')
          .eq('is_active', true)
          .order('updated_at', ascending: false)
          .limit(50);

      if ((response as List).isEmpty) {
        return [];
      }

      // Parse rooms and fetch last message for each
      final rooms = <ChatRoomModel>[];

      for (var json in (response as List)) {
        try {
          // Fetch last message AND unread messages for this room
          final roomId = json['id'] as String;

          // Get user's lastReadAt from participants
          final participants = json['chat_participants'] as List?;
          DateTime? userLastReadAt;

          if (participants != null) {
            try {
              final userParticipant = participants.firstWhere(
                (p) => p['user_id'] == user.id,
              );
              userLastReadAt = DateTime.parse(userParticipant['last_read_at']);
            } catch (e) {
              // User not found in participants
            }
          }

          // Strategy: Fetch recent 50 messages OR all messages after lastReadAt
          // This ensures we ALWAYS have last message to display
          // AND all unread messages for counting
          final messagesQuery = _supabase
              .from('chat_messages')
              .select('''
                id,
                room_id,
                sender_id,
                sender_type,
                content,
                message_type,
                file_url,
                file_name,
                file_size,
                reply_to,
                is_edited,
                edited_at,
                is_deleted,
                deleted_at,
                created_at
              ''')
              .eq('room_id', roomId)
              .eq('is_deleted', false)
              .order('created_at', ascending: false);

          // Always fetch at least 10 most recent messages for display
          // But if there are unread messages beyond that, fetch them too
          final recentMessages = await messagesQuery.limit(10);

          List messagesResponse = recentMessages;

          // If we have lastReadAt and it's older than the 10th message,
          // fetch all messages after lastReadAt to ensure unread count is correct
          if (userLastReadAt != null && recentMessages.length == 10) {
            final oldestRecentMessage = recentMessages.last;
            final oldestRecentTime = DateTime.parse(
              oldestRecentMessage['created_at'],
            );

            // If lastReadAt is before the oldest recent message,
            // we need to fetch more messages to get accurate unread count
            if (userLastReadAt.isBefore(oldestRecentTime)) {
              messagesResponse = await _supabase
                  .from('chat_messages')
                  .select('''
                    id,
                    room_id,
                    sender_id,
                    sender_type,
                    content,
                    message_type,
                    file_url,
                    file_name,
                    file_size,
                    reply_to,
                    is_edited,
                    edited_at,
                    is_deleted,
                    deleted_at,
                    created_at
                  ''')
                  .eq('room_id', roomId)
                  .eq('is_deleted', false)
                  .gt('created_at', userLastReadAt.toIso8601String())
                  .order('created_at', ascending: false);
            }
          }

          // Add messages to room JSON
          json['chat_messages'] = messagesResponse;

          final room = ChatRoomModel.fromJson(json);
          rooms.add(room);
        } catch (e, stackTrace) {
          print('❌ [ChatDS] Failed to parse room ${json['id']}: $e');
          print('   Stack trace: $stackTrace');
          // Continue with other rooms
        }
      }

      return rooms;
    } catch (e, stackTrace) {
      print('❌ [ChatDS] Error: $e');
      print('📚 [ChatDS] Stack trace: $stackTrace');
      rethrow;
    }
  }

  /// Get messages for a specific room with pagination
  Future<List<ChatMessageModel>> getMessages(
    String roomId, {
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_deleted', false)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      if ((response as List).isEmpty) {
        return [];
      }

      final messages = <ChatMessageModel>[];

      for (var json in (response as List)) {
        try {
          final message = ChatMessageModel.fromJson(json);
          messages.add(message);
        } catch (e) {
          print('❌ [ChatDS] Failed to parse message ${json['id']}: $e');
          // Continue with other messages
        }
      }

      // Return as-is: newest first (order by created_at DESC)
      // This matches how we add new messages in provider: [newMessage, ...oldMessages]
      return messages;
    } catch (e) {
      throw Exception('Failed to get messages: $e');
    }
  }

  /// Send a message to a room
  Future<ChatMessageModel> sendMessage({
    required String roomId,
    required String content,
    String messageType = 'TEXT',
    String? replyTo,
    Map<String, dynamic>? fileData,
  }) async {
    try {
      // Get current user
      final user = _supabase.auth.currentUser;

      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Get user info from users table
      final userResponse = await _supabase
          .from('users')
          .select('userid, role')
          .eq('userid', user.id)
          .single();

      // Prepare message data
      final messageData = {
        'room_id': roomId,
        'content': content,
        'sender_id': userResponse['userid'],
        'sender_type': userResponse['role'] == 'ADMIN' ? 'ADMIN' : 'TENANT',
        'message_type': messageType,
        'reply_to': replyTo,
      };

      // Add file data if provided
      if (fileData != null) {
        messageData['file_url'] = fileData['url'];
        messageData['file_name'] = fileData['name'];
        messageData['file_size'] = fileData['size'];
      }

      // Insert message
      final response = await _supabase
          .from('chat_messages')
          .insert(messageData)
          .select()
          .single();

      // Update room timestamp
      await _supabase
          .from('chat_rooms')
          .update({'updated_at': DateTime.now().toIso8601String()})
          .eq('id', roomId);

      // Create notifications for other participants
      print('🔔 [ChatDS] Creating notifications for message ${response['id']}');
      try {
        await _createNotifications(
          roomId,
          response['id'],
          userResponse['userid'],
        );
        print('✅ [ChatDS] Notifications created successfully');
      } catch (e) {
        print('⚠️ [ChatDS] Failed to create notifications: $e');
        // Don't fail the whole operation if notifications fail
      }

      return ChatMessageModel.fromJson(response);
    } catch (e, stackTrace) {
      print('❌ [ChatDS] Error sending message: $e');
      print('📚 [ChatDS] Stack trace: $stackTrace');
      throw Exception('Failed to send message: $e');
    }
  }

  /// Create notifications for other participants
  Future<void> _createNotifications(
    String roomId,
    String messageId,
    String senderId,
  ) async {
    try {
      final participantsResponse = await _supabase
          .from('chat_participants')
          .select('user_id')
          .eq('room_id', roomId)
          .neq('user_id', senderId);

      if (participantsResponse.isEmpty) {
        return;
      }

      final participants = participantsResponse as List;
      final notifications = participants
          .map(
            (p) => {
              'user_id': p['user_id'],
              'room_id': roomId,
              'message_id': messageId,
              'type': 'NEW_MESSAGE',
              'is_read': false,
            },
          )
          .toList();

      if (notifications.isNotEmpty) {
        await _supabase.from('chat_notifications').insert(notifications);
      }
    } catch (e) {
      // Don't throw, just log
      print('Failed to create notifications: $e');
    }
  }

  /// Mark all messages in a room as read
  Future<void> markAsRead(String roomId) async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Update last_read_at in chat_participants using UTC time
      final now = DateTime.now().toUtc();

      await _supabase
          .from('chat_participants')
          .update({'last_read_at': now.toIso8601String()})
          .eq('room_id', roomId)
          .eq('user_id', user.id);

      // Mark notifications as read
      await _supabase
          .from('chat_notifications')
          .update({'is_read': true})
          .eq('room_id', roomId)
          .eq('user_id', user.id);
    } catch (e) {
      throw Exception('Failed to mark as read: $e');
    }
  }

  /// Setup realtime subscription for new messages - returns stream
  Stream<ChatMessageModel> streamMessages(String roomId) {
    final controller = StreamController<ChatMessageModel>();

    final channel = _supabase
        .channel('chat_room_$roomId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'chat_messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'room_id',
            value: roomId,
          ),
          callback: (payload) {
            print(
              '🔔 [ChatDS] Realtime message received: ${payload.newRecord['id']}',
            );

            try {
              final newMessage = ChatMessageModel.fromJson(payload.newRecord);
              controller.add(newMessage);
            } catch (e) {
              print('❌ [ChatDS] Error parsing realtime message: $e');
              controller.addError('Error parsing realtime message: $e');
            }
          },
        )
        .subscribe();

    // Clean up channel when stream is cancelled
    controller.onCancel = () {
      _supabase.removeChannel(channel);
    };

    return controller.stream;
  }

  /// Unsubscribe from realtime channel
  Future<void> unsubscribeChannel(RealtimeChannel channel) async {
    await _supabase.removeChannel(channel);
  }
}
