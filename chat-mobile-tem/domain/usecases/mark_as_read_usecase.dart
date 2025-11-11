import '../repositories/chat_repository.dart';

class MarkAsReadParams {
  final String roomId;

  const MarkAsReadParams({required this.roomId});
}

class MarkAsReadUseCase {
  final ChatRepository _repository;

  MarkAsReadUseCase(this._repository);

  Future<void> call(MarkAsReadParams params) async {
    try {
      if (params.roomId.isEmpty) {
        throw Exception('Room ID không được để trống');
      }

      await _repository.markAsRead(params.roomId);
    } catch (e) {
      throw Exception('Không thể đánh dấu đã đọc: $e');
    }
  }
}
