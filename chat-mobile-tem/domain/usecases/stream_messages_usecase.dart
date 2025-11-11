import '../entities/chat_message.dart';
import '../repositories/chat_repository.dart';

class StreamMessagesParams {
  final String roomId;

  const StreamMessagesParams({required this.roomId});
}

class StreamMessagesUseCase {
  final ChatRepository _repository;

  StreamMessagesUseCase(this._repository);

  Stream<ChatMessage> call(StreamMessagesParams params) {
    try {
      if (params.roomId.isEmpty) {
        throw Exception('Room ID không được để trống');
      }

      return _repository.streamMessages(params.roomId);
    } catch (e) {
      throw Exception('Không thể kết nối realtime: $e');
    }
  }
}
