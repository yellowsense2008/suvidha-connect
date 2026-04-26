import { AuthProvider } from '@/context/AuthContext';
import { KioskProvider } from '@/context/KioskContext';
import { KeyboardProvider } from '@/context/KeyboardContext';
import { OfflineQueueProvider } from '@/context/OfflineQueueContext';
import KioskLayout from '@/components/kiosk/KioskLayout';
import VirtualKeyboard from '@/components/kiosk/VirtualKeyboard';

const Index = () => {
  return (
    <AuthProvider>
      <KioskProvider>
        <KeyboardProvider>
          <OfflineQueueProvider>
            <KioskLayout />
            <VirtualKeyboard />
          </OfflineQueueProvider>
        </KeyboardProvider>
      </KioskProvider>
    </AuthProvider>
  );
};

export default Index;
