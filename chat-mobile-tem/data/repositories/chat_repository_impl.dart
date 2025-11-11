import '../../domain/entities/chat_message.dart';
import '../../domain/entities/chat_room.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_datasource.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDatasource _remoteDatasource;

  ChatRepositoryImpl(this._remoteDatasource);

  @override
  Future<List<ChatRoom>> getChatRooms() async {
    try {
      final models = await _remoteDatasource.getChatRooms();
      return models.map((model) => ChatRoom.fromModel(model)).toList();
    } catch (e) {
      throw Exception('Failed to load chat rooms: $e');
    }
  }

  @override
  Future<List<ChatMessage>> getMessages(
    String roomId, {
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final models = await _remoteDatasource.getMessages(
        roomId,
        limit: limit,
        offset: offset,
      );
      return models.map((model) => ChatMessage.fromModel(model)).toList();
    } catch (e) {
      throw Exception('Failed to load messages: $e');
    }
  }

  @override
  Future<ChatMessage> sendMessage({
    required String roomId,
    required String content,
    String messageType = 'TEXT',
    String? replyTo,
    Map<String, dynamic>? fileData,
  }) async {
    try {
      final model = await _remoteDatasource.sendMessage(
        roomId: roomId,
        content: content,
        messageType: messageType,
        replyTo: replyTo,
        fileData: fileData,
      );
      return ChatMessage.fromModel(model);
    } catch (e) {
      throw Exception('Failed to send message: $e');
    }
  }

  @override
  Future<void> markAsRead(String roomId) async {
    try {
      await _remoteDatasource.markAsRead(roomId);
    } catch (e) {
      throw Exception('Failed to mark as read: $e');
    }
  }

  @override
  Stream<ChatMessage> streamMessages(String roomId) {
    return _remoteDatasource
        .streamMessages(roomId)
        .map((model) => ChatMessage.fromModel(model));
  }
}
