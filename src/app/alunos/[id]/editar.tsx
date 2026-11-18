import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { AppHeader } from '@/components/common/AppHeader';
import { BottomActionBar } from '@/components/common/BottomActionBar';
import { UserForm } from '@/components/users/UserForm';
import { getUserById, updateUser } from '@/services/user.service';
import { UpdateUserInput, User } from '@/types/user';
import { colors, spacing, typography } from '@/theme';

export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStudent() {
      try {
        const user = await getUserById(Number(id));
        if (!active) return;
        if (user.role !== 'ALUNO') {
          Alert.alert('Acesso restrito', 'Esta página é destinada somente a cadastros de alunos.', [
            { text: 'Voltar', onPress: () => router.replace('/alunos' as Href) },
          ]);
          return;
        }
        setStudent(user);
      } catch (error) {
        console.error('Erro ao carregar aluno:', error);
        if (active) {
          Alert.alert('Erro', 'Não foi possível carregar o aluno para edição.', [
            { text: 'Voltar', onPress: () => router.replace('/alunos' as Href) },
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) void loadStudent();
    return () => { active = false; };
  }, [id]);

  async function handleSubmit(data: UpdateUserInput) {
    if (!id) return;
    try {
      setSaving(true);
      await updateUser(Number(id), data);
      Alert.alert('Sucesso', 'Aluno atualizado com sucesso.', [
        { text: 'OK', onPress: () => router.replace('/alunos' as Href) },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      const message = isAxiosError(error) && error.response?.status === 409
        ? 'Já existe um usuário com este e-mail.'
        : 'Não foi possível atualizar o aluno. Tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Editar aluno</Text>
        <Text style={styles.subtitle}>Atualize os dados do cadastro.</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : student ? (
        <UserForm
          key={student.id}
          mode="edit"
          initialUser={student}
          loading={saving}
          onSubmit={(data) => handleSubmit(data as UpdateUserInput)}
        />
      ) : null}
      <BottomActionBar label="Cancelar" onPress={() => router.replace('/alunos' as Href)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  title: { color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: spacing.xs },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
