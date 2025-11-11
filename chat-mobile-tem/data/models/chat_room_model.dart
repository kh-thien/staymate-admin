import 'package:json_annotation/json_annotation.dart';
import 'chat_participant_model.dart';
import 'chat_message_model.dart';
import 'property_info_model.dart';
import 'room_info_model.dart';

part '../../../../generated/features/chat/data/models/chat_room_model.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, explicitToJson: true)
class ChatRoomModel {
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

  @JsonKey(name: 'chat_participants')
  final List<ChatParticipantModel>? participants;

  @JsonKey(name: 'chat_messages')
  final List<ChatMessageModel>? messages;

  @JsonKey(name: 'rooms')
  final RoomInfoModel? room;

  const ChatRoomModel({
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

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) =>
      _$ChatRoomModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChatRoomModelToJson(this);

  // Computed properties
  ChatMessageModel? get lastMessage {
    if (messages == null || messages!.isEmpty) return null;
    return messages!.first;
  }

  String get displayName {
    return isActivated ? name : '$name (Chờ kích hoạt)';
  }

  int getUnreadCount(String currentUserId) {
    if (participants == null || messages == null) return 0;

    final userParticipant = participants!.firstWhere(
      (p) => p.userId == currentUserId,
      orElse: () => participants!.first,
    );

    return messages!.where((msg) {
      return msg.createdAt.isAfter(userParticipant.lastReadAt);
    }).length;
  }

  PropertyInfoModel? get property => room?.properties;
}
