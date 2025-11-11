import '../entities/chat_room.dart';
import '../repositories/chat_repository.dart';

class GetChatRoomsUseCase {
  final ChatRepository _repository;

  GetChatRoomsUseCase(this._repository);

  Future<List<ChatRoom>> call() async {
    try {
      return await _repository.getChatRooms();
    } catch (e) {
      throw Exception('Không thể tải danh sách chat: $e');
    }
  }
}
