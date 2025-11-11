import '../../data/models/chat_message_model.dart';
import '../../data/models/message_reaction_model.dart';

class ChatMessage {
  final String id;
  final String roomId;
  final String senderId;
  final String senderType;
  final String content;
  final String messageType;
  final String? fileUrl;
  final String? fileName;
  final int? fileSize;
  final String? replyTo;
  final bool isEdited;
  final DateTime? editedAt;
  final bool isDeleted;
  final DateTime? deletedAt;
  final DateTime createdAt;
  final ChatMessageModel? replyToMessage;
  final List<MessageReactionModel>? reactions;

  const ChatMessage({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.senderType,
    required this.content,
    required this.messageType,
    this.fileUrl,
    this.fileName,
    this.fileSize,
    this.replyTo,
    required this.isEdited,
    this.editedAt,
    required this.isDeleted,
    this.deletedAt,
    required this.createdAt,
    this.replyToMessage,
    this.reactions,
  });

  factory ChatMessage.fromModel(ChatMessageModel model) {
    return ChatMessage(
      id: model.id,
      roomId: model.roomId,
      senderId: model.senderId,
      senderType: model.senderType,
      content: model.content,
      messageType: model.messageType,
      fileUrl: model.fileUrl,
      fileName: model.fileName,
      fileSize: model.fileSize,
      replyTo: model.replyTo,
      isEdited: model.isEdited,
      editedAt: model.editedAt,
      isDeleted: model.isDeleted,
      deletedAt: model.deletedAt,
      createdAt: model.createdAt,
      replyToMessage: model.replyToMessage,
      reactions: model.reactions,
    );
  }
}
