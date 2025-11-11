import 'package:flutter/material.dart';

/// Chat AppBar with owner information
class ChatDetailAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String ownerName;
  final String? ownerAvatar;
  final String? propertyName;
  final VoidCallback onOwnerTap;
  final VoidCallback onInfoTap;

  const ChatDetailAppBar({
    super.key,
    required this.ownerName,
    this.ownerAvatar,
    this.propertyName,
    required this.onOwnerTap,
    required this.onInfoTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 1);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: Colors.grey[200]),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.black87),
        onPressed: () => Navigator.pop(context),
      ),
      title: InkWell(
        onTap: onOwnerTap,
        child: Row(
          children: [
            // Owner Avatar
            _buildOwnerAvatar(ownerAvatar, ownerName),
            const SizedBox(width: 12),
            // Owner Name
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    ownerName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (propertyName != null)
                    Text(
                      propertyName!,
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: Icon(Icons.info_outline, color: Colors.grey[700]),
          onPressed: onInfoTap,
          tooltip: 'Thông tin',
        ),
      ],
    );
  }

  /// Build owner avatar widget
  Widget _buildOwnerAvatar(String? avatarUrl, String ownerName) {
    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      return ClipOval(
        child: Image.network(
          avatarUrl,
          width: 40,
          height: 40,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stack) {
            return _buildLetterAvatar(ownerName);
          },
        ),
      );
    } else {
      return _buildLetterAvatar(ownerName);
    }
  }

  /// Build letter avatar
  Widget _buildLetterAvatar(String name) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue[400]!, Colors.blue[700]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : 'C',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
