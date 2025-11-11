import '../entities/chat_room.dart';
import '../entities/chat_message.dart';

abstract class ChatRepository {
  /// Get all chat rooms for current user
  Future<List<ChatRoom>> getChatRooms();

  /// Get messages for a specific room with pagination
  Future<List<ChatMessage>> getMessages(
    String roomId, {
    int limit = 50,
    int offset = 0,
  });

  /// Send a message to a room
  Future<ChatMessage> sendMessage({
    required String roomId,
    required String content,
    String messageType = 'TEXT',
    String? replyTo,
    Map<String, dynamic>? fileData,
  });

  /// Mark all messages in a room as read
  Future<void> markAsRead(String roomId);

  /// Stream new messages for a room (realtime)
  Stream<ChatMessage> streamMessages(String roomId);
}
