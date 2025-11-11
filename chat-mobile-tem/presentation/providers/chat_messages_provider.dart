import 'dart:io';

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/services/file_upload_service_provider.dart';
import '../../domain/entities/chat_message.dart';
import '../../domain/usecases/get_messages_usecase.dart';
import '../../domain/usecases/send_message_usecase.dart';
import 'chat_repository_provider.dart';

part '../../../../generated/features/chat/presentation/providers/chat_messages_provider.g.dart';

@riverpod
class ChatMessages extends _$ChatMessages {
  int _currentPage = 1;
  bool _hasMore = true;
  String? _roomId;

  @override
  Future<List<ChatMessage>> build(String roomId) async {
    _roomId = roomId;
    _currentPage = 1;
    _hasMore = true;

    final useCase = GetMessagesUseCase(ref.watch(chatRepositoryProvider));
    final messages = await useCase(
      GetMessagesParams(roomId: roomId, page: _currentPage),
    );

    _hasMore = messages.length >= 50; // Default limit is 50
    return messages;
  }

  /// Load more messages (pagination)
  Future<void> loadMoreMessages() async {
    if (!_hasMore || _roomId == null) return;

    state.whenData((currentMessages) async {
      _currentPage++;

      final useCase = GetMessagesUseCase(ref.read(chatRepositoryProvider));
      final newMessages = await useCase(
        GetMessagesParams(roomId: _roomId!, page: _currentPage),
      );

      _hasMore = newMessages.length >= 50;

      // Append to existing messages
      state = AsyncValue.data([...currentMessages, ...newMessages]);
    });
  }

  /// Send a message with optimistic update
  Future<void> sendMessage(
    String content, {
    String messageType = 'TEXT',
    String? replyTo,
    Map<String, dynamic>? fileData,
  }) async {
    if (_roomId == null) return;

    print('💬 [ChatMessages] Sending message: $content');

    try {
      final useCase = SendMessageUseCase(ref.read(chatRepositoryProvider));
      final params = SendMessageParams(
        roomId: _roomId!,
        content: content,
        messageType: messageType,
        replyTo: replyTo,
        fileData: fileData,
      );

      // Get current user ID for temp message
      final currentUserId =
          Supabase.instance.client.auth.currentUser?.id ?? 'unknown';

      // Create temporary message for optimistic update
      final tempId = 'temp-${DateTime.now().millisecondsSinceEpoch}';
      final tempMessage = ChatMessage(
        id: tempId,
        roomId: _roomId!,
        senderId: currentUserId, // Use real user ID for correct display
        senderType: 'TENANT',
        content: content,
        messageType: messageType,
        fileUrl: fileData?['fileUrl'],
        fileName: fileData?['fileName'],
        fileSize: fileData?['fileSize'],
        replyTo: replyTo,
        isEdited: false,
        isDeleted: false,
        createdAt: DateTime.now(),
      );

      print(
        '⚡ [ChatMessages] Adding temp message: $tempId (sender: $currentUserId)',
      );

      // Add temp message to state - force rebuild with new list
      state = state.whenData((currentMessages) {
        print('🎨 [ChatMessages] Creating new list with temp message');
        return [tempMessage, ...currentMessages];
      });

      // Send to server
      print('📤 [ChatMessages] Sending to server...');
      final sentMessage = await useCase(params);
      print('✅ [ChatMessages] Server returned: ${sentMessage.id}');

      // Replace temp message with real message - force rebuild
      state = state.whenData((messages) {
        print('🔄 [ChatMessages] Replacing temp with real message');
        return messages.map((msg) {
          if (msg.id == tempMessage.id) {
            return sentMessage;
          }
          return msg;
        }).toList();
      });
    } catch (e) {
      print('❌ [ChatMessages] Error sending message: $e');
      // Remove temp message on error - force rebuild
      state = state.whenData((messages) {
        print('🗑️ [ChatMessages] Removing temp message due to error');
        return messages.where((msg) => !msg.id.startsWith('temp-')).toList();
      });
      rethrow;
    }
  }

  /// Add a new message to the list (for realtime updates)
  void addMessage(ChatMessage message) {
    print('🔔 [ChatMessages] Realtime message received: ${message.id}');

    // Force rebuild with new state
    state = state.whenData((messages) {
      // Check if message already exists (including temp messages)
      final exists = messages.any(
        (msg) =>
            msg.id == message.id ||
            (msg.id.startsWith('temp-') && msg.content == message.content),
      );

      if (!exists) {
        print('➕ [ChatMessages] Adding new message to list');
        return [message, ...messages];
      } else {
        print(
          '⚠️ [ChatMessages] Message already exists or temp found, replacing...',
        );
        // Replace temp message with real one
        return messages.map((msg) {
          if (msg.id.startsWith('temp-') && msg.content == message.content) {
            print(
              '🔄 [ChatMessages] Replacing temp ${msg.id} with real ${message.id}',
            );
            return message;
          }
          return msg;
        }).toList();
      }
    });
  }

  /// Remove a message from the list (e.g., failed temp message)
  void removeMessage(String messageId) {
    print('🗑️ [ChatMessages] Removing message: $messageId');
    state = state.whenData((messages) {
      return messages.where((msg) => msg.id != messageId).toList();
    });
  }

  /// Retry sending a failed message
  Future<void> retryMessage(ChatMessage failedMessage) async {
    print('🔄 [ChatMessages] Retrying message: ${failedMessage.id}');

    // Remove the failed message first
    removeMessage(failedMessage.id);

    // Resend based on message type
    if (failedMessage.messageType == 'TEXT') {
      await sendMessage(failedMessage.content);
    }
    // Note: Image/File retry not supported (file already disposed)
  }

  /// Send message with image file
  Future<void> sendImageMessage(
    File imageFile, {
    String? caption,
    String? replyTo,
  }) async {
    if (_roomId == null) return;

    print('📸 [ChatMessages] Sending image message...');

    try {
      // Generate temp message ID (will use as storage messageId)
      final tempId = 'temp-${DateTime.now().millisecondsSinceEpoch}';

      // Get current user ID
      final currentUserId =
          Supabase.instance.client.auth.currentUser?.id ?? 'unknown';

      // Create temp message with loading state
      final tempMessage = ChatMessage(
        id: tempId,
        roomId: _roomId!,
        senderId: currentUserId,
        senderType: 'TENANT',
        content: caption ?? '📷 Hình ảnh',
        messageType: 'IMAGE',
        isEdited: false,
        isDeleted: false,
        createdAt: DateTime.now(),
      );

      print('⚡ [ChatMessages] Adding temp image message: $tempId');

      // Add temp message immediately
      state = state.whenData((currentMessages) {
        return [tempMessage, ...currentMessages];
      });

      // Upload image to storage
      print('☁️ [ChatMessages] Uploading image...');
      final uploadService = ref.read(fileUploadServiceProvider);
      final uploadResult = await uploadService.uploadImage(
        file: imageFile,
        roomId: _roomId!,
        messageId: tempId,
      );

      print('✅ [ChatMessages] Image uploaded: ${uploadResult.url}');

      // Send message with file data
      final useCase = SendMessageUseCase(ref.read(chatRepositoryProvider));
      final params = SendMessageParams(
        roomId: _roomId!,
        content: caption ?? '📷 Hình ảnh',
        messageType: 'IMAGE',
        replyTo: replyTo,
        fileData: {
          'url': uploadResult.url,
          'name': uploadResult.fileName,
          'size': uploadResult.fileSize,
        },
      );

      final sentMessage = await useCase(params);
      print('✅ [ChatMessages] Image message sent: ${sentMessage.id}');

      // Replace temp with real message
      state = state.whenData((messages) {
        return messages.map((msg) {
          if (msg.id == tempMessage.id) {
            return sentMessage;
          }
          return msg;
        }).toList();
      });
    } catch (e) {
      print('❌ [ChatMessages] Error sending image: $e');
      // Remove temp message on error
      state = state.whenData((messages) {
        return messages.where((msg) => !msg.id.startsWith('temp-')).toList();
      });
      rethrow;
    }
  }

  /// Send message with file
  Future<void> sendFileMessage(
    File file, {
    String? caption,
    String? replyTo,
  }) async {
    if (_roomId == null) return;

    print('📎 [ChatMessages] Sending file message...');

    try {
      // Generate temp message ID
      final tempId = 'temp-${DateTime.now().millisecondsSinceEpoch}';

      // Get current user ID
      final currentUserId =
          Supabase.instance.client.auth.currentUser?.id ?? 'unknown';

      // Create temp message
      final tempMessage = ChatMessage(
        id: tempId,
        roomId: _roomId!,
        senderId: currentUserId,
        senderType: 'TENANT',
        content: caption ?? '📎 File',
        messageType: 'FILE',
        isEdited: false,
        isDeleted: false,
        createdAt: DateTime.now(),
      );

      print('⚡ [ChatMessages] Adding temp file message: $tempId');

      // Add temp message immediately
      state = state.whenData((currentMessages) {
        return [tempMessage, ...currentMessages];
      });

      // Upload file to storage
      print('☁️ [ChatMessages] Uploading file...');
      final uploadService = ref.read(fileUploadServiceProvider);
      final uploadResult = await uploadService.uploadFile(
        file: file,
        roomId: _roomId!,
        messageId: tempId,
      );

      print('✅ [ChatMessages] File uploaded: ${uploadResult.url}');

      // Send message with file data
      final useCase = SendMessageUseCase(ref.read(chatRepositoryProvider));
      final params = SendMessageParams(
        roomId: _roomId!,
        content: caption ?? '📎 File',
        messageType: 'FILE',
        replyTo: replyTo,
        fileData: {
          'url': uploadResult.url,
          'name': uploadResult.fileName,
          'size': uploadResult.fileSize,
        },
      );

      final sentMessage = await useCase(params);
      print('✅ [ChatMessages] File message sent: ${sentMessage.id}');

      // Replace temp with real message
      state = state.whenData((messages) {
        return messages.map((msg) {
          if (msg.id == tempMessage.id) {
            return sentMessage;
          }
          return msg;
        }).toList();
      });
    } catch (e) {
      print('❌ [ChatMessages] Error sending file: $e');
      // Remove temp message on error
      state = state.whenData((messages) {
        return messages.where((msg) => !msg.id.startsWith('temp-')).toList();
      });
      rethrow;
    }
  }

  /// Check if there are more messages to load
  bool get hasMore => _hasMore;
}
