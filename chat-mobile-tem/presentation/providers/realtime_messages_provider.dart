import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../domain/entities/chat_message.dart';
import '../../domain/usecases/stream_messages_usecase.dart';
import 'chat_repository_provider.dart';

part '../../../../generated/features/chat/presentation/providers/realtime_messages_provider.g.dart';

@riverpod
Stream<ChatMessage> realtimeMessages(Ref ref, String roomId) {
  final useCase = StreamMessagesUseCase(ref.watch(chatRepositoryProvider));
  final params = StreamMessagesParams(roomId: roomId);
  return useCase(params);
}
