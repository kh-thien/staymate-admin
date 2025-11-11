import 'package:json_annotation/json_annotation.dart';

part '../../../../generated/features/chat/data/models/user_info_model.g.dart';

/// User info model for displaying owner/participant information
@JsonSerializable(fieldRename: FieldRename.snake)
class UserInfoModel {
  @JsonKey(name: 'userid')
  final String id;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? avatarUrl;

  const UserInfoModel({
    required this.id,
    this.fullName,
    this.email,
    this.phone,
    this.avatarUrl,
  });

  factory UserInfoModel.fromJson(Map<String, dynamic> json) =>
      _$UserInfoModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserInfoModelToJson(this);

  /// Get display name with fallback
  String get displayName => fullName ?? email ?? phone ?? 'Người dùng';

  /// Get avatar URL or null
  String? get avatar => avatarUrl;
}
