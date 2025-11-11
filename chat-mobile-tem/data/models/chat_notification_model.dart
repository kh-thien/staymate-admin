import 'package:json_annotation/json_annotation.dart';

part '../../../../generated/features/chat/data/models/chat_notification_model.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class ChatNotificationModel {
  final String id;
  final String userId;
  final String roomId;
  final String messageId;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  const ChatNotificationModel({
    required this.id,
    required this.userId,
    required this.roomId,
    required this.messageId,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory ChatNotificationModel.fromJson(Map<String, dynamic> json) =>
      _$ChatNotificationModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChatNotificationModelToJson(this);
}
