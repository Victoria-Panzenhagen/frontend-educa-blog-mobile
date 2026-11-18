import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { AppHeader } from '@/components/common/AppHeader';
import { UserForm } from '@/components/users/UserForm';
import { createUser } from '@/services/user.service';
import { CreateUserInput, UpdateUserInput } from '@/types/user';
import { colors, spacing, typography } from '@/theme';

export default function NewUserScreen() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: CreateUserInput | UpdateUserInput) {
    if (!('password' in data) || !data.password || !('role' in data)) return;
    try {
      setLoading(true);
      await createUser(data as CreateUserInput);
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso.', [
        { text: 'OK', onPress: () => router.replace('/usuarios' as Href) },
      ]);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      if (isAxiosError(error) && error.response?.status === 409) {
        Alert.alert('E-mail já cadastrado', 'Já existe um usuário com este e-mail.');
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o usuário. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Novo usuário</Text>
        <Text style={styles.subtitle}>Preencha os dados para cadastrar.</Text>
      </View>
      <UserForm mode="create" loading={loading} onSubmit={handleSubmit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  title: { color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: spacing.xs },
});
