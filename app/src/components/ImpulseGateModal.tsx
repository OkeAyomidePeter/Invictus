import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { invictusTheme } from '../constants/theme';

interface ImpulseGateModalProps {
  visible: boolean;
  onGate: () => void;
  onLeak: () => void;
}

export function ImpulseGateModal({ visible, onGate, onLeak }: ImpulseGateModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Gate or Leak?</Text>
          <Text style={styles.subtitle}>An urge appeared. What did you do?</Text>
          <View style={styles.buttons}>
            <Pressable onPress={onGate} style={[styles.button, styles.gateButton]}>
              <Text style={styles.buttonText}>GATED</Text>
              <Text style={styles.buttonSub}>I sat with it. Let it pass.</Text>
            </Pressable>
            <Pressable onPress={onLeak} style={[styles.button, styles.leakButton]}>
              <Text style={styles.buttonText}>LEAKED</Text>
              <Text style={styles.buttonSub}>I acted on it.</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: invictusTheme.spacing.lg,
  },
  container: {
    backgroundColor: invictusTheme.surfaceHigh,
    borderRadius: invictusTheme.radius.lg,
    padding: invictusTheme.spacing.lg,
    width: '100%',
    maxWidth: 340,
    gap: invictusTheme.spacing.md,
  },
  title: {
    color: invictusTheme.text,
    fontSize: invictusTheme.fontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: invictusTheme.textMuted,
    fontSize: invictusTheme.fontSizes.sm,
    textAlign: 'center',
  },
  buttons: {
    gap: invictusTheme.spacing.sm,
    marginTop: invictusTheme.spacing.sm,
  },
  button: {
    padding: invictusTheme.spacing.md,
    borderRadius: invictusTheme.radius.md,
    alignItems: 'center',
    gap: invictusTheme.spacing.xs,
  },
  gateButton: {
    backgroundColor: invictusTheme.success + '20',
    borderWidth: 1,
    borderColor: invictusTheme.success,
  },
  leakButton: {
    backgroundColor: invictusTheme.danger + '20',
    borderWidth: 1,
    borderColor: invictusTheme.danger,
  },
  buttonText: {
    fontSize: invictusTheme.fontSizes.lg,
    fontWeight: '700',
    color: invictusTheme.text,
  },
  buttonSub: {
    fontSize: invictusTheme.fontSizes.xs,
    color: invictusTheme.textMuted,
  },
});
