import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { AppHeader } from '@/components/common/AppHeader';
import { BottomActionBar } from '@/components/common/BottomActionBar';
import { UserForm } from '@/components/users/UserForm';
import { createUser } from '@/services/user.service';
import { CreateUserInput, UpdateUserInput } from '@/types/user';
import { colors, spacing, typography } from '@/theme';

export default function NewStudentScreen() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: CreateUserInput | UpdateUserInput) {
    if (!('role' in data) || data.role !== 'ALUNO' || !data.password) return;
    const student: CreateUserInput = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'ALUNO',
    };

    try {
      setLoading(true);
      await createUser(student);
      Alert.alert('Sucesso', 'Aluno cadastrado com sucesso.', [
        { text: 'OK', onPress: () => router.replace('/alunos' as Href) },
      ]);
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      const message = isAxiosError(error) && error.response?.status === 409
        ? 'Já existe um usuário com este e-mail.'
        : 'Não foi possível cadastrar o aluno. Tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Novo aluno</Text>
        <Text style={styles.subtitle}>Preencha os dados para cadastrar um aluno.</Text>
      </View>
      <UserForm mode="create" fixedRole="ALUNO" loading={loading} onSubmit={handleSubmit} />
      <BottomActionBar label="Cancelar" onPress={() => router.replace('/alunos' as Href)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  title: { color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: spacing.xs },
});
