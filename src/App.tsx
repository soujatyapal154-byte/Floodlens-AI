import React, { useState, useEffect } from 'react';
import { PageId, AnalysisRunData, BoundingBox } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AiAssistantModal } from './components/AiAssistantModal';
import { HomePage } from './pages/HomePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { FloodMapPage } from './pages/FloodMapPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { ConnectivityPage } from './pages/ConnectivityPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { ReportPage } from './pages/ReportPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { LimitationsPage } from './pages/LimitationsPage';
import { startFloodAnalysis } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  // Starts empty per Section 22: "The application starts empty."
  const [analysisData, setAnalysisData] = useState<AnalysisRunData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [errorReason, setErrorReason] = useState<string | undefined>();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [mapLayersOpen, setMapLayersOpen] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Last user inputs for retry
  const [lastInput, setLastInput] = useState<{ areaName: string; bbox: BoundingBox; floodDate: string } | null>(null);

  const handleStartAnalysis = async (areaName: string, bbox: BoundingBox, floodDate: string) => {
    setLastInput({ areaName, bbox, floodDate });
    setErrorMessage(undefined);
    setErrorReason(undefined);
    setIsAnalyzing(true);
    setCurrentStep(1);
    setCurrentPage('analysis');

    // Simulate clean 7-step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const res = await startFloodAnalysis({ areaName, bbox, floodDate });
      clearInterval(stepInterval);
      setCurrentStep(7);

      if (res.status === 'failed' || !res.data) {
        setIsAnalyzing(false);
        setErrorMessage(res.errorMessage || 'Suitable satellite imagery could not be found for this area and date.');
        setErrorReason(res.errorReason || 'Acquisition geometry or cloud conditions are unsuitable.');
      } else {
        setTimeout(() => {
          setAnalysisData(res.data ?? null);
          setIsAnalyzing(false);
        }, 500);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMessage('We couldn’t retrieve the satellite data right now.');
      setErrorReason('Network error or satellite service temporarily unavailable.');
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleStartAnalysis(lastInput.areaName, lastInput.bbox, lastInput.floodDate);
    } else {
      setCurrentPage('home');
    }
  };

  const handleWiderSearch = () => {
    if (lastInput) {
      // Expand bbox by 50%
      const latHalf = Math.abs(lastInput.bbox.maxLat - lastInput.bbox.minLat) * 0.25;
      const lngHalf = Math.abs(lastInput.bbox.maxLng - lastInput.bbox.minLng) * 0.25;
      const widerBbox: BoundingBox = {
        minLat: lastInput.bbox.minLat - latHalf,
        maxLat: lastInput.bbox.maxLat + latHalf,
        minLng: lastInput.bbox.minLng - lngHalf,
        maxLng: lastInput.bbox.maxLng + lngHalf,
      };
      handleStartAnalysis(`${lastInput.areaName} (Wider Area)`, widerBbox, lastInput.floodDate);
    } else {
      setCurrentPage('home');
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Google Maps Quota Exceeded Sticky Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Header */}
      <Header
        analysisData={analysisData}
        onSelectPage={(page) => {
          if (page !== 'map') setMapLayersOpen(false);
          setCurrentPage(page);
          setIsMobileMenuOpen(false);
        }}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Workspace (Sidebar + Dynamic Page) */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => {
            if (page !== 'map') setMapLayersOpen(false);
            setCurrentPage(page);
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 pb-20 md:pb-8">
          {currentPage === 'home' && (
            <HomePage
              onStartAnalysis={handleStartAnalysis}
              onSelectPage={(page) => setCurrentPage(page)}
              isAnalyzing={isAnalyzing}
            />
          )}

          {currentPage === 'analysis' && (
            <AnalysisPage
              analysisData={analysisData}
              isAnalyzing={isAnalyzing}
              currentStep={currentStep}
              errorMessage={errorMessage}
              errorReason={errorReason}
              onSelectPage={(page) => setCurrentPage(page)}
              onRetry={handleRetry}
              onWiderSearch={handleWiderSearch}
              onChangeDate={() => setCurrentPage('home')}
              onOpenAiAssistant={() => setIsAiModalOpen(true)}
            />
          )}

          {currentPage === 'map' && (
            <FloodMapPage
              analysisData={analysisData}
              onSelectPage={(page) => setCurrentPage(page)}
              onOpenAiAssistant={() => setIsAiModalOpen(true)}
              initialLayersOpen={mapLayersOpen}
              layersOpen={mapLayersOpen}
              onLayersOpenChange={(open) => setMapLayersOpen(open)}
            />
          )}

          {currentPage === 'infrastructure' && (
            <InfrastructurePage
              analysisData={analysisData}
              onSelectPage={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'connectivity' && (
            <ConnectivityPage
              analysisData={analysisData}
              onSelectPage={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'ai' && (
            <AIAnalysisPage
              analysisData={analysisData}
              onSelectPage={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'report' && (
            <ReportPage
              analysisData={analysisData}
              onSelectPage={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'datasources' && <DataSourcesPage />}

          {currentPage === 'limitations' && <LimitationsPage />}
        </main>
      </div>

      {/* Production-Grade Mobile Bottom Navigation Dock */}
      <BottomNav
        currentPage={currentPage}
        onSelectPage={(page) => {
          if (page !== 'map') {
            setMapLayersOpen(false);
          }
          setCurrentPage(page);
          setIsMobileMenuOpen(false);
        }}
        onToggleLayers={() => {
          if (currentPage === 'map') {
            setMapLayersOpen((prev) => !prev);
          } else {
            setCurrentPage('map');
            setMapLayersOpen(true);
          }
        }}
        isLayersOpen={currentPage === 'map' && mapLayersOpen}
        onOpenAiCopilot={() => setIsAiModalOpen(true)}
        isAiCopilotOpen={isAiModalOpen}
        onToggleMoreMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMenuOpen={isMobileMenuOpen}
        analysisData={analysisData}
      />

      {/* Ask FloodLens AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysisData={analysisData}
      />
    </div>
  </ThemeProvider>
  );
}
