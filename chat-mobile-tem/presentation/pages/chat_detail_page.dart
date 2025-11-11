import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../providers/chat_messages_provider.dart';
import '../providers/chat_room_provider.dart';
import '../providers/realtime_messages_provider.dart';
import '../providers/mark_as_read_provider.dart';
import '../../domain/entities/chat_message.dart';
import '../widgets/message_bubble.dart';
import '../widgets/message_input.dart';
import '../widgets/chat_empty_state.dart';
import '../widgets/chat_detail_app_bar.dart';
import '../widgets/owner_detail_bottom_sheet.dart';

/// Chat detail page showing messages for a room
class ChatDetailPage extends HookConsumerWidget {
  final String roomId;

  const ChatDetailPage({super.key, required this.roomId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messagesAsync = ref.watch(chatMessagesProvider(roomId));
    final scrollController = useScrollController();
    final textController = useTextEditingController();

    // Get current user ID for message comparison
    final currentUserId = Supabase.instance.client.auth.currentUser?.id ?? '';

    // Get room info (contains owner data)
    final currentRoom = ref.watch(chatRoomProvider(roomId));

    // Listen to realtime messages
    ref.listen<AsyncValue<ChatMessage>>(realtimeMessagesProvider(roomId), (
      previous,
      next,
    ) {
      next.whenData((newMessage) {
        // Add message to list
        ref.read(chatMessagesProvider(roomId).notifier).addMessage(newMessage);
        // Auto-scroll to bottom
        _scrollToBottom(scrollController);
      });
    });

    // Mark as read when entering chat
    useEffect(() {
      Future.delayed(Duration.zero, () async {
        try {
          await ref.read(markAsReadProvider(roomId).future);
        } catch (e) {
          // Silently fail - not critical
        }
      });
      return null;
    }, [roomId]);

    final ownerName =
        currentRoom?.room?.properties?.owner?.displayName ?? 'Chủ nhà';
    final ownerAvatar = currentRoom?.room?.properties?.owner?.avatar;
    final propertyName = currentRoom?.room?.properties?.name;

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: Colors.grey[50],
        appBar: ChatDetailAppBar(
          ownerName: ownerName,
          ownerAvatar: ownerAvatar,
          propertyName: propertyName,
          onOwnerTap: () => _showOwnerDetail(context, currentRoom),
          onInfoTap: () => _showOwnerDetail(context, currentRoom),
        ),
        body: Column(
          children: [
            // Messages list
            Expanded(
              child: messagesAsync.when(
                data: (messages) {
                  if (messages.isEmpty) {
                    return const ChatEmptyState(
                      message: 'Chưa có tin nhắn nào\nHãy bắt đầu trò chuyện!',
                    );
                  }

                  return NotificationListener<ScrollNotification>(
                    onNotification: (notification) {
                      // Load more when scrolling to top
                      if (notification is ScrollEndNotification) {
                        if (scrollController.position.pixels ==
                            scrollController.position.maxScrollExtent) {
                          final notifier = ref.read(
                            chatMessagesProvider(roomId).notifier,
                          );
                          if (notifier.hasMore) {
                            notifier.loadMoreMessages();
                          }
                        }
                      }
                      return false;
                    },
                    child: ListView.builder(
                      controller: scrollController,
                      reverse: true, // Start from bottom
                      padding: const EdgeInsets.only(
                        top: 16,
                        bottom: 8,
                        left: 16,
                        right: 16,
                      ),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        // State: [newest(0), newer(1), old(2), older(3)]
                        // reverse: true means:
                        //   - index 0 renders at BOTTOM
                        //   - index 3 renders at TOP
                        // So messages[0] (newest) will be at bottom ✅
                        final message = messages[index];

                        return MessageBubble(
                          message: message,
                          isMe: message.senderId == currentUserId,
                          onRetry: message.id.startsWith('temp-')
                              ? () {
                                  final notifier = ref.read(
                                    chatMessagesProvider(roomId).notifier,
                                  );

                                  // Retry based on message type
                                  if (message.messageType == 'TEXT') {
                                    notifier.retryMessage(message);
                                  } else {
                                    // For image/file, can't retry (file disposed)
                                    notifier.removeMessage(message.id);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'Không thể gửi lại file. Vui lòng chọn file mới.',
                                        ),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                }
                              : null,
                        );
                      },
                    ),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) => Center(
                  child: SelectableText.rich(
                    TextSpan(
                      text: 'Lỗi: ${error.toString()}',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                ),
              ),
            ),
            // Message input
            MessageInput(
              controller: textController,
              onSend: () async {
                final content = textController.text.trim();
                if (content.isEmpty) return;

                try {
                  // Clear input immediately
                  textController.clear();

                  // Send message
                  await ref
                      .read(chatMessagesProvider(roomId).notifier)
                      .sendMessage(content, messageType: 'TEXT');

                  // Scroll to bottom
                  _scrollToBottom(scrollController);
                } catch (e) {
                  // Show error
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Lỗi: ${e.toString()}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              onPickImage: () async {
                try {
                  // Show image source options
                  final source = await showDialog<ImageSource>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Chọn hình ảnh từ'),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ListTile(
                            leading: const Icon(Icons.camera_alt),
                            title: const Text('Camera'),
                            onTap: () =>
                                Navigator.pop(context, ImageSource.camera),
                          ),
                          ListTile(
                            leading: const Icon(Icons.photo_library),
                            title: const Text('Thư viện'),
                            onTap: () =>
                                Navigator.pop(context, ImageSource.gallery),
                          ),
                        ],
                      ),
                    ),
                  );

                  if (source == null) return;

                  // Make sure keyboard is hidden before opening system pickers
                  FocusScope.of(context).unfocus();

                  // Pick image - image_picker handles permissions automatically on iOS
                  final picker = ImagePicker();
                  final pickedFile = await picker.pickImage(
                    source: source,
                    maxWidth: 1920,
                    maxHeight: 1920,
                    imageQuality: 85,
                  );

                  if (pickedFile == null) return;

                  // Show preview and send
                  final file = File(pickedFile.path);
                  final caption = await _showImagePreview(context, file);

                  if (caption != null) {
                    await ref
                        .read(chatMessagesProvider(roomId).notifier)
                        .sendImageMessage(file, caption: caption);
                    _scrollToBottom(scrollController);
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Lỗi chọn hình ảnh: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              onPickFile: () async {
                try {
                  // ensure keyboard is hidden before opening file picker
                  FocusScope.of(context).unfocus();
                  // Note: FilePicker.platform.pickFiles() uses system file picker
                  // No permission needed on Android 10+ (Scoped Storage)
                  // Permission handled automatically by the system

                  // Pick file
                  final result = await FilePicker.platform.pickFiles(
                    type: FileType.any,
                    allowMultiple: false,
                  );

                  if (result == null || result.files.isEmpty) return;

                  final file = File(result.files.first.path!);

                  // Check file size (max 10MB)
                  final fileSize = await file.length();
                  if (fileSize > 10 * 1024 * 1024) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('File quá lớn. Tối đa 10MB'),
                          backgroundColor: Colors.red,
                        ),
                      );
                    }
                    return;
                  }

                  // Send file
                  await ref
                      .read(chatMessagesProvider(roomId).notifier)
                      .sendFileMessage(file);
                  _scrollToBottom(scrollController);
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Lỗi chọn file: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Show image preview dialog with caption input
  Future<String?> _showImagePreview(
    BuildContext context,
    File imageFile,
  ) async {
    final captionController = TextEditingController();

    return showDialog<String>(
      context: context,
      builder: (context) => GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Dialog(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Image preview
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.5,
                  ),
                  child: Image.file(
                    imageFile,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Center(
                      child: Icon(Icons.error, size: 48, color: Colors.red),
                    ),
                  ),
                ),
                // Caption input
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    controller: captionController,
                    decoration: const InputDecoration(
                      hintText: 'Thêm chú thích (tùy chọn)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    textInputAction: TextInputAction.done,
                  ),
                ),
                // Buttons
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                    bottom: 16,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Hủy'),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context, captionController.text.trim());
                        },
                        icon: const Icon(Icons.send),
                        label: const Text('Gửi'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _scrollToBottom(ScrollController controller) {
    if (controller.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (controller.hasClients) {
          controller.animateTo(
            0.0,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  /// Show owner detail bottom sheet
  void _showOwnerDetail(BuildContext context, dynamic selectedRoom) {
    if (selectedRoom == null) return;

    // Hide keyboard before showing bottom sheet
    FocusScope.of(context).unfocus();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => OwnerDetailBottomSheet(chatRoom: selectedRoom),
    );
  }
}
