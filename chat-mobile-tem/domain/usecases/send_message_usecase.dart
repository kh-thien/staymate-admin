import '../entities/chat_message.dart';
import '../repositories/chat_repository.dart';

class SendMessageParams {
  final String roomId;
  final String content;
  final String messageType;
  final String? replyTo;
  final Map<String, dynamic>? fileData;

  const SendMessageParams({
    required this.roomId,
    required this.content,
    this.messageType = 'TEXT',
    this.replyTo,
    this.fileData,
  });
}

class SendMessageUseCase {
  final ChatRepository _repository;

  SendMessageUseCase(this._repository);

  Future<ChatMessage> call(SendMessageParams params) async {
    try {
      // Validate content length for text messages
      if (params.messageType == 'TEXT' && params.content.trim().isEmpty) {
        throw Exception('Nội dung tin nhắn không được để trống');
      }

      if (params.content.length > 5000) {
        throw Exception('Nội dung tin nhắn không được vượt quá 5000 ký tự');
      }

      // Validate file size if uploading file
      if (params.fileData != null) {
        final fileSize = params.fileData!['fileSize'] as int?;
        if (fileSize != null && fileSize > 50 * 1024 * 1024) {
          // 50MB
          throw Exception('Kích thước file không được vượt quá 50MB');
        }
      }

      return await _repository.sendMessage(
        roomId: params.roomId,
        content: params.content,
        messageType: params.messageType,
        replyTo: params.replyTo,
        fileData: params.fileData,
      );
    } catch (e) {
      throw Exception('Không thể gửi tin nhắn: $e');
    }
  }
}
