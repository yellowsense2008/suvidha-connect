import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import KioskHeader from './KioskHeader';
import LandingPage from './LandingPage';
import LoginScreen from './LoginScreen';
import ServiceModules from './ServiceModules';
import BillPaymentModule from './BillPaymentModule';
import ComplaintModule from './ComplaintModule';
import NewServiceModule from './NewServiceModule';
import TrackStatusModule from './TrackStatusModule';
import DocumentsModule from './DocumentsModule';
import AlertsModule from './AlertsModule';
import WasteModule from './WasteModule';
import AppointmentModule from './AppointmentModule';
import RewardsModule from './RewardsModule';
import VoiceCommander from './VoiceCommander';
import ChatAssistant from './ChatAssistant';
import ElectricityModule from './ElectricityModule';
import GasModule from './GasModule';
import MunicipalModule from './MunicipalModule';
import CredentialManagement from './CredentialManagement';
import MeterService from './MeterService';
import CitizenDashboard from './CitizenDashboard';
import NearbyKioskFinder from './NearbyKioskFinder';
import SeniorCitizenMode from './SeniorCitizenMode';
import EmergencySOS from './EmergencySOSModule';
import OutageHeatmap from './OutageHeatmap';
import FamilyBillManager from './FamilyBillManager';
import BillDisputeAnalyzer from './BillDisputeAnalyzer';
import CivicLeaderboard from './CivicLeaderboard';
import VoiceAssistantModule from './VoiceAssistantModule';
import PredictiveMaintenance from './PredictiveMaintenance';
import WaterQualityReporter from './WaterQualityReporter';
import EscalationTimer from './EscalationTimer';
import CivicHealthScore from './CivicHealthScore';
import BlindMode from './BlindMode';
import LiveKioskTicker from './LiveKioskTicker';
import { useAuth } from '@/context/AuthContext';

type ModuleType =
  | 'home' | 'bills' | 'complaint' | 'newService' | 'track' | 'documents'
  | 'alerts' | 'waste' | 'appointment' | 'rewards' | 'meter' | 'credentials'
  | 'dashboard' | 'nearbyKiosk' | 'outageMap' | 'familyBills'
  | 'disputeAnalyzer' | 'leaderboard' | 'voiceAssistant'
  | 'predictiveMaintenance' | 'waterQuality' | 'escalationTimer'
  | 'civicHealth' | 'blindMode';

const KioskLayout: React.FC = () => {
  const { isAuthenticated, sessionTimeout, organization } = useAuth();
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');
  const [landingDone, setLandingDone] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const warningShownRef = useRef(false);
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      if (prevAuthRef.current) {
        toast.info('Session Ended', { description: 'You have been logged out due to inactivity.' });
        setLandingDone(false);
      }
      prevAuthRef.current = false;
      warningShownRef.current = false;
      return;
    }
    prevAuthRef.current = true;
    if (sessionTimeout < 30000 && !warningShownRef.current) {
      toast.warning('Session expiring soon', { description: 'You will be logged out in 30 seconds.', duration: 5000 });
      warningShownRef.current = true;
    }
    if (sessionTimeout > 30000) warningShownRef.current = false;
  }, [sessionTimeout, isAuthenticated]);

  useEffect(() => {
    if (organization) (window as any).__suvidhaOrg = organization;
  }, [organization]);

  const handleModuleSelect = (module: string) => setCurrentModule(module as ModuleType);
  const handleBack = () => setCurrentModule('home');

  const renderModule = () => {
    if (!landingDone || !organization) return <LandingPage onComplete={() => setLandingDone(true)} />;
    if (!isAuthenticated) return <LoginScreen onSuccess={() => setCurrentModule('home')} />;

    // All innovation modules — accessible from any org
    switch (currentModule) {
      case 'dashboard': return <CitizenDashboard onBack={handleBack} />;
      case 'nearbyKiosk': return <NearbyKioskFinder onBack={handleBack} />;
      case 'outageMap': return <OutageHeatmap onBack={handleBack} />;
      case 'familyBills': return <FamilyBillManager onBack={handleBack} />;
      case 'disputeAnalyzer': return <BillDisputeAnalyzer onBack={handleBack} />;
      case 'leaderboard': return <CivicLeaderboard onBack={handleBack} />;
      case 'voiceAssistant': return <VoiceAssistantModule onBack={handleBack} onNavigate={handleModuleSelect} />;
      case 'predictiveMaintenance': return <PredictiveMaintenance onBack={handleBack} />;
      case 'waterQuality': return <WaterQualityReporter onBack={handleBack} />;
      case 'escalationTimer': return <EscalationTimer onBack={handleBack} />;
      case 'civicHealth': return <CivicHealthScore onBack={handleBack} />;
    }

    if (organization === 'electricity') {
      switch (currentModule) {
        case 'bills': return <BillPaymentModule onBack={handleBack} />;
        case 'complaint': return <ComplaintModule onBack={handleBack} />;
        case 'newService': return <NewServiceModule onBack={handleBack} />;
        case 'track': return <TrackStatusModule onBack={handleBack} />;
        case 'documents': return <DocumentsModule onBack={handleBack} />;
        case 'alerts': return <AlertsModule onBack={handleBack} />;
        case 'appointment': return <AppointmentModule onBack={handleBack} />;
        case 'rewards': return <RewardsModule onBack={handleBack} />;
        case 'meter': return <MeterService onBack={handleBack} />;
        case 'credentials': return <CredentialManagement onBack={handleBack} />;
        default: return <ElectricityModule onModuleSelect={handleModuleSelect} onChangeOrg={() => setLandingDone(false)} />;
      }
    }

    if (organization === 'gas') {
      switch (currentModule) {
        case 'bills': return <BillPaymentModule onBack={handleBack} />;
        case 'complaint': return <ComplaintModule onBack={handleBack} />;
        case 'newService': return <NewServiceModule onBack={handleBack} />;
        case 'track': return <TrackStatusModule onBack={handleBack} />;
        case 'documents': return <DocumentsModule onBack={handleBack} />;
        case 'meter': return <MeterService onBack={handleBack} />;
        case 'credentials': return <CredentialManagement onBack={handleBack} />;
        default: return <GasModule onModuleSelect={handleModuleSelect} onChangeOrg={() => setLandingDone(false)} />;
      }
    }

    if (organization === 'municipal') {
      switch (currentModule) {
        case 'bills': return <BillPaymentModule onBack={handleBack} />;
        case 'complaint': return <ComplaintModule onBack={handleBack} />;
        case 'newService': return <NewServiceModule onBack={handleBack} />;
        case 'track': return <TrackStatusModule onBack={handleBack} />;
        case 'documents': return <DocumentsModule onBack={handleBack} />;
        case 'waste': return <WasteModule onBack={handleBack} />;
        case 'credentials': return <CredentialManagement onBack={handleBack} />;
        default: return <MunicipalModule onModuleSelect={handleModuleSelect} onChangeOrg={() => setLandingDone(false)} />;
      }
    }

    return <ServiceModules onModuleSelect={handleModuleSelect} />;
  };

  // Blind Mode
  if (blindMode && landingDone && isAuthenticated) {
    return (
      <BlindMode
        onModuleSelect={(m) => { setBlindMode(false); handleModuleSelect(m); }}
        onExit={() => setBlindMode(false)}
      />
    );
  }

  // Senior Mode
  if (seniorMode && landingDone && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SeniorCitizenMode
          onModuleSelect={(m) => { setSeniorMode(false); handleModuleSelect(m); }}
          onExit={() => setSeniorMode(false)}
        />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col kiosk-portrait kiosk-touch kiosk-no-select ${!landingDone || !organization ? 'bg-[hsl(220,90%,18%)]' : 'bg-background'}`}>
      {landingDone && organization && (
        <KioskHeader
          onSOS={() => setShowSOS(true)}
          onSeniorMode={() => setSeniorMode(true)}
          onDashboard={() => handleModuleSelect('dashboard')}
          onNearbyKiosk={() => handleModuleSelect('nearbyKiosk')}
          onBlindMode={() => setBlindMode(true)}
        />
      )}
      {landingDone && organization && isAuthenticated && <LiveKioskTicker compact />}
      {landingDone && organization && <VoiceCommander onNavigate={handleModuleSelect} />}
      {landingDone && organization && <ChatAssistant onNavigate={handleModuleSelect} />}
      {showSOS && <EmergencySOS onClose={() => setShowSOS(false)} />}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {renderModule()}
      </main>
      {landingDone && organization && (
        <footer className="bg-slate-900 text-slate-300 py-4 px-6 text-center text-xs border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono">SYSTEM ONLINE • v1.0.0</span>
            </div>
            <div className="flex items-center gap-6 opacity-80">
              <span>© 2026 SUVIDHA - Govt of India</span>
              <span className="hidden md:inline">•</span>
              <span>Powered by Smart City Mission</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider opacity-60">
              <span>SECURE CONNECTION</span>
              <span>DPDP COMPLIANT</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default KioskLayout;
