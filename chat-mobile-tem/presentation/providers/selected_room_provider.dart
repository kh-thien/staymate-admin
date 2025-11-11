import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../domain/entities/chat_room.dart';

part '../../../../generated/features/chat/presentation/providers/selected_room_provider.g.dart';

/// Simple state provider for the currently selected chat room
@riverpod
class SelectedRoom extends _$SelectedRoom {
  @override
  ChatRoom? build() => null;

  void setRoom(ChatRoom? room) {
    state = room;
  }

  void clearRoom() {
    state = null;
  }
}
