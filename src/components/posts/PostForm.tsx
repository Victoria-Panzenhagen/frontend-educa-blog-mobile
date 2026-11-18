
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Discipline,
  getDisciplines,
} from '@/services/discipline.service';
import { PostInput } from '@/types/post';
import { colors, spacing, radius, typography } from '@/theme';

interface PostFormProps {
  initialValues?: PostInput;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (data: PostInput) => void;
}

export function PostForm({
  initialValues,
  submitLabel = 'Salvar post',
  loading = false,
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [disciplineId, setDisciplineId] = useState<number | null>(
    initialValues?.disciplineId ?? null,
  );

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loadingDisciplines, setLoadingDisciplines] = useState(true);
  const [disciplineError, setDisciplineError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDisciplines() {
      try {
        setDisciplineError(null);
        const response = await getDisciplines();
        setDisciplines(response);
      } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        setDisciplineError('Não foi possível carregar as disciplinas.');
      } finally {
        setLoadingDisciplines(false);
      }
    }

    loadDisciplines();
  }, []);

  const selectedDiscipline = disciplines.find(
    (discipline) => discipline.id === disciplineId,
  );

  function handleSubmit() {
    if (!title.trim() || !content.trim() || !disciplineId) {
      setValidationError('Preencha todos os campos obrigatórios.');
      return;
    }

    setValidationError(null);

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      disciplineId,
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Digite o título do post"
          placeholderTextColor={colors.textSecondary}
          maxLength={150}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Disciplina</Text>

        {loadingDisciplines ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.helperText}>
              Carregando disciplinas...
            </Text>
          </View>
        ) : disciplineError ? (
          <View>
            <Text style={styles.errorText}>{disciplineError}</Text>
          </View>
        ) : (
          <Pressable
            style={styles.select}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={[
                styles.selectText,
                !selectedDiscipline && styles.placeholder,
              ]}
            >
              {selectedDiscipline?.name ?? 'Selecione uma disciplina'}
            </Text>

            <Text style={styles.selectArrow}>⌄</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Conteúdo</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Escreva o conteúdo do post..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
      </View>

      {validationError && (
        <Text style={styles.errorText}>{validationError}</Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          (pressed || loading) && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={loading || loadingDisciplines || !!disciplineError}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione uma disciplina</Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Fechar</Text>
              </Pressable>
            </View>

            <ScrollView>
              {disciplines.map((discipline) => (
                <Pressable
                  key={discipline.id}
                  style={[
                    styles.disciplineOption,
                    discipline.id === disciplineId &&
                      styles.selectedOption,
                  ]}
                  onPress={() => {
                    setDisciplineId(discipline.id);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.disciplineOptionText,
                      discipline.id === disciplineId &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {discipline.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },

  field: {
    gap: spacing.sm,
  },

  label: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.sizes.sm,
  },

  textArea: {
    minHeight: 160,
  },

  select: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
  },

  placeholder: {
    color: colors.textSecondary,
  },

  selectArrow: {
    color: colors.textSecondary,
    fontSize: typography.sizes.lg,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },

  helperText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },

  errorText: {
    color: '#DC2626',
    fontSize: typography.sizes.sm,
  },

  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xxl,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  modalTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },

  closeButton: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  disciplineOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  selectedOption: {
    backgroundColor: '#F5E5FF',
  },

  disciplineOptionText: {
    color: colors.text,
    fontSize: typography.sizes.sm,
  },

  selectedOptionText: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
