import '../../data/models/chat_participant_model.dart';

class ChatParticipant {
  final String id;
  final String roomId;
  final String userId;
  final String userType;
  final DateTime joinedAt;
  final DateTime lastReadAt;
  final bool isActive;
  final DateTime? lastSeenAt;
  final bool isOnline;

  const ChatParticipant({
    required this.id,
    required this.roomId,
    required this.userId,
    required this.userType,
    required this.joinedAt,
    required this.lastReadAt,
    required this.isActive,
    this.lastSeenAt,
    required this.isOnline,
  });

  factory ChatParticipant.fromModel(ChatParticipantModel model) {
    return ChatParticipant(
      id: model.id,
      roomId: model.roomId,
      userId: model.userId,
      userType: model.userType,
      joinedAt: model.joinedAt,
      lastReadAt: model.lastReadAt,
      isActive: model.isActive,
      lastSeenAt: model.lastSeenAt,
      isOnline: model.isOnline,
    );
  }
}
