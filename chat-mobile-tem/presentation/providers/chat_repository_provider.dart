import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/chat_repository_impl.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../../../core/network/supabase_client.dart';
import '../../data/datasources/chat_remote_datasource.dart';

part '../../../../generated/features/chat/presentation/providers/chat_repository_provider.g.dart';

@riverpod
ChatRepository chatRepository(Ref ref) {
  final supabase = ref.watch(supabaseClientProvider);
  final datasource = ChatRemoteDatasource(supabase);
  return ChatRepositoryImpl(datasource);
}
