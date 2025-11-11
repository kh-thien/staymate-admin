import '../../data/models/chat_room_model.dart';
import '../../data/models/chat_message_model.dart';
import '../../data/models/chat_participant_model.dart';
import '../../data/models/property_info_model.dart';
import '../../data/models/room_info_model.dart';

class ChatRoom {
  final String id;
  final String name;
  final String type;
  final String propertyId;
  final String? roomId;
  final String? contractId;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;
  final bool isActivated;
  final String? roomCode;
  final List<ChatParticipantModel>? participants;
  final List<ChatMessageModel>? messages;
  final RoomInfoModel? room;

  const ChatRoom({
    required this.id,
    required this.name,
    required this.type,
    required this.propertyId,
    this.roomId,
    this.contractId,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    required this.isActive,
    required this.isActivated,
    this.roomCode,
    this.participants,
    this.messages,
    this.room,
  });

  factory ChatRoom.fromModel(ChatRoomModel model) {
    return ChatRoom(
      id: model.id,
      name: model.name,
      type: model.type,
      propertyId: model.propertyId,
      roomId: model.roomId,
      contractId: model.contractId,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: model.isActive,
      isActivated: model.isActivated,
      roomCode: model.roomCode,
      participants: model.participants,
      messages: model.messages,
      room: model.room,
    );
  }

  ChatMessageModel? get lastMessage => messages?.firstOrNull;

  String get displayName {
    return isActivated ? name : '$name (Chờ kích hoạt)';
  }

  int getUnreadCount(String currentUserId) {
    if (participants == null || messages == null) return 0;

    final userParticipant = participants!.firstWhere(
      (p) => p.userId == currentUserId,
      orElse: () => participants!.first,
    );

    return messages!
        .where((msg) => msg.createdAt.isAfter(userParticipant.lastReadAt))
        .length;
  }

  PropertyInfoModel? get property => room?.properties;
}
