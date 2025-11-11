import 'package:json_annotation/json_annotation.dart';

part '../../../../generated/features/chat/data/models/message_reaction_model.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake)
class MessageReactionModel {
  final String id;
  final String messageId;
  final String userId;
  final String reaction;
  final DateTime createdAt;

  const MessageReactionModel({
    required this.id,
    required this.messageId,
    required this.userId,
    required this.reaction,
    required this.createdAt,
  });

  factory MessageReactionModel.fromJson(Map<String, dynamic> json) =>
      _$MessageReactionModelFromJson(json);

  Map<String, dynamic> toJson() => _$MessageReactionModelToJson(this);
}
