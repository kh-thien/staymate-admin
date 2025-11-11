import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/usecases/mark_as_read_usecase.dart';
import 'chat_repository_provider.dart';
import 'chat_rooms_provider.dart';

/// Provider to mark a room as read
final markAsReadProvider = FutureProvider.family<void, String>((
  ref,
  roomId,
) async {
  print('📖 [MarkAsRead] Marking room as read: $roomId');

  final useCase = MarkAsReadUseCase(ref.watch(chatRepositoryProvider));
  final params = MarkAsReadParams(roomId: roomId);

  try {
    await useCase(params);
    print('✅ [MarkAsRead] Room marked as read');

    // Invalidate chat rooms to update unread count
    ref.invalidate(chatRoomsProvider);
  } catch (e) {
    print('❌ [MarkAsRead] Error: $e');
    rethrow;
  }
});
