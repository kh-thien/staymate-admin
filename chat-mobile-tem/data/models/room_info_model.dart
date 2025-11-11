import 'package:json_annotation/json_annotation.dart';
import 'property_info_model.dart';

part '../../../../generated/features/chat/data/models/room_info_model.g.dart';

@JsonSerializable(fieldRename: FieldRename.snake, explicitToJson: true)
class RoomInfoModel {
  final String id;
  final String code;
  final String? name;
  final String propertyId;

  /// Property information with owner details
  @JsonKey(includeFromJson: true, includeToJson: false)
  final PropertyInfoModel? properties;

  const RoomInfoModel({
    required this.id,
    required this.code,
    this.name,
    required this.propertyId,
    this.properties,
  });

  factory RoomInfoModel.fromJson(Map<String, dynamic> json) =>
      _$RoomInfoModelFromJson(json);

  Map<String, dynamic> toJson() => _$RoomInfoModelToJson(this);

  /// Get room display name
  String get displayName => name ?? 'Phòng $code';
}
