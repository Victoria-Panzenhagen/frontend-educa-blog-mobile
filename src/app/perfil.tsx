import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';

import { AppHeader } from '@/components/common/AppHeader';
import { BottomActionBar } from '@/components/common/BottomActionBar';
import { UserForm } from '@/components/users/UserForm';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById, updateUser } from '@/services/user.service';
import { UpdateUserInput, User } from '@/types/user';
import { colors, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { user: authUser, updateProfile } = useAuth();
  const authUserId = authUser?.id;
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!authUserId) return;
      try {
        const user = await getUserById(authUserId);
        if (active) setProfile(user);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (active) {
          Alert.alert('Erro', 'Não foi possível carregar seu perfil. Tente novamente.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => { active = false; };
  }, [authUserId]);

  async function handleSubmit(data: UpdateUserInput) {
    if (!authUser) return;
    try {
      setSaving(true);
      await updateUser(authUser.id, data);
      await updateProfile({ name: data.name ?? authUser.name, email: data.email ?? authUser.email });
      Alert.alert('Sucesso', 'Seu perfil foi atualizado.', [
        { text: 'OK', onPress: () => router.replace('/posts' as Href) },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const message = isAxiosError(error) && error.response?.status === 409
        ? 'Já existe um usuário com este e-mail.'
        : 'Não foi possível atualizar seu perfil. Tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Meu perfil</Text>
        <Text style={styles.subtitle}>Visualize e atualize seus dados pessoais.</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : profile ? (
        <UserForm
          key={profile.id}
          mode="edit"
          initialUser={profile}
          loading={saving}
          onSubmit={(data) => handleSubmit(data as UpdateUserInput)}
        />
      ) : null}
      <BottomActionBar label="Cancelar" onPress={() => router.replace('/posts' as Href)} />
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
