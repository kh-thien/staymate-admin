import 'package:json_annotation/json_annotation.dart';
import 'user_info_model.dart';

part '../../../../generated/features/chat/data/models/property_info_model.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, explicitToJson: true)
class PropertyInfoModel {
  final String id;
  final String name;
  final String address;
  final String? city;
  final String? ward;
  final String? district;
  final String ownerId;

  /// Owner information (nested from users table)
  @JsonKey(includeFromJson: true, includeToJson: false)
  final UserInfoModel? owner;

  const PropertyInfoModel({
    required this.id,
    required this.name,
    required this.address,
    this.city,
    this.ward,
    this.district,
    required this.ownerId,
    this.owner,
  });

  factory PropertyInfoModel.fromJson(Map<String, dynamic> json) =>
      _$PropertyInfoModelFromJson(json);

  Map<String, dynamic> toJson() => _$PropertyInfoModelToJson(this);

  /// Get full address string
  String get fullAddress {
    final parts = <String>[
      address,
      if (ward != null && ward!.isNotEmpty) ward!,
      if (district != null && district!.isNotEmpty) district!,
      if (city != null && city!.isNotEmpty) city!,
    ];
    return parts.join(', ');
  }
}
