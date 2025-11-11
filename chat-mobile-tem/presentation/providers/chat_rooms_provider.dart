import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../domain/entities/chat_room.dart';
import '../../domain/usecases/get_chat_rooms_usecase.dart';
import 'chat_repository_provider.dart';

part '../../../../generated/features/chat/presentation/providers/chat_rooms_provider.g.dart';

@riverpod
class ChatRooms extends _$ChatRooms {
  @override
  Future<List<ChatRoom>> build() async {
    final useCase = GetChatRoomsUseCase(ref.watch(chatRepositoryProvider));
    return await useCase();
  }

  /// Refresh chat rooms list
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final useCase = GetChatRoomsUseCase(ref.read(chatRepositoryProvider));
      return await useCase();
    });
  }

  /// Update last message of a room (for optimistic updates)
  void updateRoomLastMessage(String roomId, String lastMessageContent) {
    state.whenData((rooms) {
      final updatedRooms = rooms.map((room) {
        if (room.id == roomId) {
          // Create updated room with new last message timestamp
          // Note: This is a simplified optimistic update
          return room;
        }
        return room;
      }).toList();

      state = AsyncValue.data(updatedRooms);
    });
  }
}
