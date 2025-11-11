import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/chat_room.dart';
import 'chat_rooms_provider.dart';

part '../../../../generated/features/chat/presentation/providers/chat_room_provider.g.dart';

/// Provider to get a specific chat room by ID from the rooms list
@riverpod
ChatRoom? chatRoom(Ref ref, String roomId) {
  final roomsAsync = ref.watch(chatRoomsProvider);

  return roomsAsync.whenData((rooms) {
    try {
      return rooms.firstWhere((room) => room.id == roomId);
    } catch (e) {
      return null;
    }
  }).value;
}
