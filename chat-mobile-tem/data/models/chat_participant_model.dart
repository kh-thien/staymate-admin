import 'package:json_annotation/json_annotation.dart';

part '../../../../generated/features/chat/data/models/chat_participant_model.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class ChatParticipantModel {
  final String id;
  final String roomId;
  final String userId;
  final String userType;
  final DateTime joinedAt;
  final DateTime lastReadAt;
  final bool isActive;
  final DateTime? lastSeenAt;
  final bool isOnline;

  const ChatParticipantModel({
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

  factory ChatParticipantModel.fromJson(Map<String, dynamic> json) =>
      _$ChatParticipantModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChatParticipantModelToJson(this);
}
