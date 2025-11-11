import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

/// Image preview dialog with caption input
class ImagePreviewDialog extends StatefulWidget {
  final File imageFile;

  const ImagePreviewDialog({super.key, required this.imageFile});

  @override
  State<ImagePreviewDialog> createState() => _ImagePreviewDialogState();

  /// Show dialog and return caption
  static Future<String?> show(BuildContext context, File imageFile) {
    return showDialog<String>(
      context: context,
      builder: (context) => ImagePreviewDialog(imageFile: imageFile),
    );
  }
}

class _ImagePreviewDialogState extends State<ImagePreviewDialog> {
  final _captionController = TextEditingController();

  @override
  void dispose() {
    _captionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Image preview
          Container(
            constraints: const BoxConstraints(maxHeight: 400),
            child: Image.file(
              widget.imageFile,
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
              controller: _captionController,
              decoration: const InputDecoration(
                hintText: 'Thêm chú thích (tùy chọn)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              textCapitalization: TextCapitalization.sentences,
            ),
          ),
          // Buttons
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
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
                    Navigator.pop(context, _captionController.text.trim());
                  },
                  icon: const Icon(Icons.send),
                  label: const Text('Gửi'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Image source selector dialog
class ImageSourceDialog extends StatelessWidget {
  const ImageSourceDialog({super.key});

  /// Show dialog and return selected source
  static Future<ImageSource?> show(BuildContext context) {
    return showDialog<ImageSource>(
      context: context,
      builder: (context) => const ImageSourceDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Chọn hình ảnh từ'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.camera_alt),
            title: const Text('Camera'),
            onTap: () => Navigator.pop(context, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Thư viện'),
            onTap: () => Navigator.pop(context, ImageSource.gallery),
          ),
        ],
      ),
    );
  }
}
