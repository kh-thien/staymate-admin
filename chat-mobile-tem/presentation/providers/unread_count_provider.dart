import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'chat_rooms_provider.dart';

part '../../../../generated/features/chat/presentation/providers/unread_count_provider.g.dart';

@riverpod
int unreadCount(Ref ref) {
  final roomsAsync = ref.watch(chatRoomsProvider);

  return roomsAsync.when(
    data: (rooms) {
      // TODO: Get current user ID from auth
      const currentUserId = 'current-user-id';

      return rooms.fold<int>(
        0,
        (total, room) => total + room.getUnreadCount(currentUserId),
      );
    },
    loading: () => 0,
    error: (_, __) => 0,
  );
}
