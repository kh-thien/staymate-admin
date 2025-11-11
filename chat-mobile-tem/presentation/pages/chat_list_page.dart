import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/ui_constants.dart';
import '../providers/chat_rooms_provider.dart';
import '../providers/unread_count_provider.dart';
import '../providers/realtime_chat_rooms_provider.dart';
import '../widgets/chat_room_card.dart';
import '../widgets/chat_empty_state.dart';

/// Chat list page showing all chat rooms
class ChatListPage extends ConsumerWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roomsAsync = ref.watch(chatRoomsProvider);
    // Keep provider active for badge updates
    ref.watch(unreadCountProvider);

    // Listen to realtime updates for chat rooms
    ref.listen<AsyncValue<void>>(realtimeChatRoomsProvider, (previous, next) {
      print('🔔 [ChatListPage] Realtime update detected');
    });

    return Scaffold(
      backgroundColor: Colors.white,
      body: roomsAsync.when(
        data: (rooms) {
          if (rooms.isEmpty) {
            return const ChatEmptyState(message: 'Chưa có cuộc trò chuyện nào');
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(chatRoomsProvider);
            },
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                8,
                8,
                8,
                UIConstants.contentBottomPadding,
              ),
              child: ListView.builder(
                itemCount: rooms.length,
                itemBuilder: (context, index) {
                  final room = rooms[index];
                  return ChatRoomCard(
                    room: room,
                    onTap: () {
                      context.go('/chat/${room.id}');
                    },
                  );
                },
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: SelectableText.rich(
            TextSpan(
              text: 'Lỗi: ${error.toString()}',
              style: const TextStyle(color: Colors.red),
            ),
          ),
        ),
      ),
    );
  }
}
