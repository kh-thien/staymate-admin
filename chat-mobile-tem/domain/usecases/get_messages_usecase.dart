import '../entities/chat_message.dart';
import '../repositories/chat_repository.dart';

class GetMessagesParams {
  final String roomId;
  final int page;
  final int limit;

  const GetMessagesParams({
    required this.roomId,
    this.page = 1,
    this.limit = 50,
  });

  int get offset => (page - 1) * limit;
}

class GetMessagesUseCase {
  final ChatRepository _repository;

  GetMessagesUseCase(this._repository);

  Future<List<ChatMessage>> call(GetMessagesParams params) async {
    try {
      if (params.page < 1) {
        throw Exception('Page number must be greater than 0');
      }

      return await _repository.getMessages(
        params.roomId,
        limit: params.limit,
        offset: params.offset,
      );
    } catch (e) {
      throw Exception('Không thể tải tin nhắn: $e');
    }
  }
}
