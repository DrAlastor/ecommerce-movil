import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { mobileReportsService } from '../services/reports.service';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';
import type {
  ReportTabType,
  DashboardMetrics,
  ReportData,
  MlDemandPrediction,
  MlRfmCluster,
  MlScenarioSimulation,
  VoiceChatMessage,
} from '../types/reports.types';

const { width } = Dimensions.get('window');

export default function ReportsDashboardScreen({ navigation }: any) {
  const [currentTab, setCurrentTab] = useState<ReportTabType>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Datos Dashboard
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Datos Reportes Genéricos
  const [selectedReportType, setSelectedReportType] = useState<'ventas' | 'productos'>('ventas');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);

  // Datos QBE
  const [qbeEntity, setQbeEntity] = useState<'ventas' | 'productos' | 'reservas'>('ventas');
  const [qbeOperator, setQbeOperator] = useState<'=' | '>' | '<' | 'contiene'>('>');
  const [qbeValue, setQbeValue] = useState<string>('500');
  const [qbeResult, setQbeResult] = useState<ReportData | null>(null);
  const [isExecutingQbe, setIsExecutingQbe] = useState<boolean>(false);

  // Datos Por Voz / IA
  const [voiceInput, setVoiceInput] = useState<string>('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [lastSpeechReply, setLastSpeechReply] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<VoiceChatMessage[]>([
    {
      id: '1',
      emisor: 'ia',
      texto: 'Hola, soy tu consultor de inteligencia de negocios. Puedes pulsar el micrófono para dictarme consultas de voz o preguntarme por texto sobre ventas, inventario y sucursales.',
      fecha: 'Ahora',
    },
  ]);
  const [isSendingVoice, setIsSendingVoice] = useState<boolean>(false);

  // Datos Machine Learning
  const [demandData, setDemandData] = useState<MlDemandPrediction[]>([]);
  const [demandVerdict, setDemandVerdict] = useState<string>('');
  const [rfmData, setRfmData] = useState<MlRfmCluster[]>([]);
  const [rfmVerdict, setRfmVerdict] = useState<string>('');
  const [scenariosData, setScenariosData] = useState<MlScenarioSimulation[]>([]);
  const [scenariosVerdict, setScenariosVerdict] = useState<string>('');
  const [isLoadingMl, setIsLoadingMl] = useState<boolean>(false);
  const [mlSubTab, setMlSubTab] = useState<'demanda' | 'rfm' | 'escenarios'>('demanda');

  // Cargar métricas del Dashboard
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await mobileReportsService.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.warn('Error cargando dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Cargar Reporte Genérico
  const loadGenericReport = useCallback(async () => {
    try {
      setIsLoadingReport(true);
      const data = await mobileReportsService.generateGenericReport({
        tipo_reporte: selectedReportType,
      });
      setReportData(data);
    } catch (err) {
      console.warn('Error cargando reporte:', err);
    } finally {
      setIsLoadingReport(false);
    }
  }, [selectedReportType]);

  // Cargar datos ML
  const loadMlData = useCallback(async () => {
    try {
      setIsLoadingMl(true);
      const [d, r, s] = await Promise.all([
        mobileReportsService.getMlDemand(),
        mobileReportsService.getMlRfmClusters(),
        mobileReportsService.getMlScenarios(),
      ]);
      setDemandData(d.alerts || []);
      setDemandVerdict(d.verdict || '');
      setRfmData(r.clusters || []);
      setRfmVerdict(r.verdict || '');
      setScenariosData(s.scenarios || []);
      setScenariosVerdict(s.verdict || '');
    } catch (err) {
      console.warn('Error cargando datos ML:', err);
    } finally {
      setIsLoadingMl(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'dashboard') {
      loadDashboardData();
    } else if (currentTab === 'reports') {
      loadGenericReport();
    } else if (currentTab === 'ml') {
      loadMlData();
    }
  }, [currentTab, loadDashboardData, loadGenericReport, loadMlData]);

  // Ejecutar QBE
  const handleRunQbe = async () => {
    try {
      setIsExecutingQbe(true);
      const res = await mobileReportsService.executeQbeQuery({
        entidad: qbeEntity,
        filtros: [
          {
            campo: qbeEntity === 'ventas' ? 'total' : qbeEntity === 'productos' ? 'precio' : 'total_estimado',
            operador: qbeOperator,
            valor: qbeValue,
          },
        ],
      });
      setQbeResult(res);
    } catch (err) {
      console.warn('Error ejecutando QBE:', err);
    } finally {
      setIsExecutingQbe(false);
    }
  };

  // Enviar mensaje de voz/IA
  const handleSendVoiceQuestion = async (preguntaTexto?: string) => {
    const textToSend = preguntaTexto || voiceInput;
    if (!textToSend.trim()) return;

    const userMsg: VoiceChatMessage = {
      id: String(Date.now()),
      emisor: 'usuario',
      texto: textToSend,
      fecha: 'Ahora',
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setVoiceInput('');
    setIsSendingVoice(true);

    try {
      const reply = await mobileReportsService.sendVoiceQuestion(textToSend);
      const iaMsg: VoiceChatMessage = {
        id: String(Date.now() + 1),
        emisor: 'ia',
        texto: reply,
        fecha: 'Ahora',
      };
      setChatHistory((prev) => [...prev, iaMsg]);
      setLastSpeechReply(reply);
    } catch {
      const errReply: VoiceChatMessage = {
        id: String(Date.now() + 1),
        emisor: 'ia',
        texto: 'Hubo un error procesando tu consulta analítica.',
        fecha: 'Ahora',
      };
      setChatHistory((prev) => [...prev, errReply]);
    } finally {
      setIsSendingVoice(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Inteligencia y Reportes</Text>
        <Text style={styles.headerSubtitle}>Métricas, consultas analíticas y modelos predictivos</Text>
      </View>

      {/* Tabs Principales */}
      <View style={styles.mainTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'reports', label: '📑 Genéricos' },
            { key: 'qbe', label: '🔍 QBE' },
            { key: 'voz', label: '🎙️ Por Voz' },
            { key: 'ml', label: '🧠 Decisiones & ML' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.mainTabPill, currentTab === tab.key && styles.mainTabPillActive]}
              onPress={() => setCurrentTab(tab.key as ReportTabType)}
            >
              <Text style={[styles.mainTabText, currentTab === tab.key && styles.mainTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido según Tab */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboardData(true)}
            colors={['#1A1A1A']}
          />
        }
      >
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <View>
            {isLoading && !metrics ? (
              <ActivityIndicator size="large" color="#1A1A1A" style={{ marginTop: 30 }} />
            ) : metrics ? (
              <>
                {/* Cuadrícula de KPIs */}
                <View style={styles.kpiGrid}>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Total Facturado</Text>
                    <Text style={styles.kpiValue}>{metrics.totalVentas.toLocaleString()} Bs</Text>
                    <Text style={styles.kpiTrend}>↗ +14.2% vs mes anterior</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Ventas del Mes</Text>
                    <Text style={styles.kpiValue}>{metrics.totalTransacciones}</Text>
                    <Text style={styles.kpiSub}>Ticket: {metrics.ticketPromedio.toFixed(2)} Bs</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Clientes Activos</Text>
                    <Text style={styles.kpiValue}>{metrics.totalClientes}</Text>
                    <Text style={styles.kpiSub}>Base fidelizada</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Reservas Activas</Text>
                    <Text style={[styles.kpiValue, { color: '#8C5E35' }]}>{metrics.reservasActivas}</Text>
                    <Text style={styles.kpiSub}>Pendientes de retiro</Text>
                  </View>
                </View>

                {/* Ventas por Sucursal */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>Ventas por Sucursal</Text>
                  {metrics.ventasPorSucursal.map((item, idx) => (
                    <View key={idx} style={styles.branchProgressRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.branchNameText}>{item.sucursal}</Text>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${Math.min(100, item.porcentaje)}%` },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                        <Text style={styles.branchAmountText}>{item.total.toLocaleString()} Bs</Text>
                        <Text style={styles.branchPercentText}>{item.porcentaje}%</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Top Prendas */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>Prendas Más Vendidas</Text>
                  {metrics.topProductos.map((p, idx) => (
                    <View key={idx} style={styles.topProductRow}>
                      <View style={styles.topIndexBadge}>
                        <Text style={styles.topIndexText}>#{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.topProdName}>{p.nombre}</Text>
                        <Text style={styles.topProdCat}>{p.categoria} • {p.unidades} unidades</Text>
                      </View>
                      <Text style={styles.topProdTotal}>{p.total.toLocaleString()} Bs</Text>
                    </View>
                  ))}
                </View>

                {/* Alertas Ejecutivas */}
                {metrics.alertasStock && metrics.alertasStock.length > 0 && (
                  <View style={[styles.sectionCard, { borderColor: '#FDE68A', backgroundColor: '#FFFDF9' }]}>
                    <Text style={[styles.sectionHeading, { color: '#92400E' }]}>⚠️ Alertas de Inventario</Text>
                    {metrics.alertasStock.map((al, idx) => (
                      <View key={idx} style={styles.alertRow}>
                        <Text style={styles.alertPrenda}>{al.prenda}</Text>
                        <Text style={styles.alertMsg}>📍 {al.sucursal}: {al.mensaje} (Stock: {al.stock})</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : null}
          </View>
        )}

        {/* TAB 2: REPORTES GENÉRICOS */}
        {currentTab === 'reports' && (
          <View>
            {/* Selector de Tipo */}
            <View style={styles.selectorBar}>
              <TouchableOpacity
                style={[styles.selectorBtn, selectedReportType === 'ventas' && styles.selectorBtnActive]}
                onPress={() => setSelectedReportType('ventas')}
              >
                <Text style={[styles.selectorBtnText, selectedReportType === 'ventas' && styles.selectorBtnTextActive]}>
                  💰 Ventas y Facturación
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectorBtn, selectedReportType === 'productos' && styles.selectorBtnActive]}
                onPress={() => setSelectedReportType('productos')}
              >
                <Text style={[styles.selectorBtnText, selectedReportType === 'productos' && styles.selectorBtnTextActive]}>
                  👗 Rendimiento Prendas
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingReport ? (
              <ActivityIndicator size="large" color="#1A1A1A" style={{ marginTop: 20 }} />
            ) : reportData ? (
              <View style={styles.reportContainer}>
                <Text style={styles.reportTitle}>{reportData.reporte}</Text>
                <Text style={styles.reportSub}>Total filas analizadas: {reportData.totalFilas}</Text>

                {/* Tabla de Resultados */}
                <View style={styles.tableCard}>
                  {/* Encabezado */}
                  <View style={styles.tableHeaderRow}>
                    {(reportData.columnas || []).map((col) => (
                      <Text key={col.key} style={[styles.tableColHeader, { flex: col.key === 'prenda' || col.key === 'cliente' || col.key === 'comprobante' ? 2 : 1 }]}>
                        {col.label}
                      </Text>
                    ))}
                  </View>

                  {/* Filas */}
                  {(reportData.filas || []).length === 0 ? (
                    <Text style={{ textAlign: 'center', padding: 16, color: '#888' }}>No hay registros disponibles</Text>
                  ) : (
                    (reportData.filas || []).map((fila, rIdx) => (
                      <View key={rIdx} style={[styles.tableDataRow, rIdx % 2 === 1 && styles.tableRowAlt]}>
                        {(reportData.columnas || []).map((col) => (
                          <Text key={col.key} style={[styles.tableCell, { flex: col.key === 'prenda' || col.key === 'cliente' || col.key === 'comprobante' ? 2 : 1 }]}>
                            {String(fila[col.key] ?? fila[col.key.toLowerCase()] ?? '-')}
                          </Text>
                        ))}
                      </View>
                    ))
                  )}
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* TAB 3: QBE (QUERY BY EXAMPLE) */}
        {currentTab === 'qbe' && (
          <View>
            <View style={styles.qbeCard}>
              <Text style={styles.qbeTitle}>🔍 Constructor Visual de Consultas QBE</Text>
              <Text style={styles.qbeSub}>Construye filtros dinámicos por entidad y operador:</Text>

              {/* Selector de Entidad */}
              <Text style={styles.qbeLabel}>Entidad de Negocio:</Text>
              <View style={styles.qbeEntityRow}>
                {(['ventas', 'productos', 'reservas'] as const).map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.qbeEntityPill, qbeEntity === e && styles.qbeEntityPillActive]}
                    onPress={() => setQbeEntity(e)}
                  >
                    <Text style={[styles.qbeEntityText, qbeEntity === e && styles.qbeEntityTextActive]}>
                      {e.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selector de Operador */}
              <Text style={styles.qbeLabel}>Criterio / Operador:</Text>
              <View style={styles.qbeOperatorRow}>
                {(['=', '>', '<', 'contiene'] as const).map((op) => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.qbeOpPill, qbeOperator === op && styles.qbeOpPillActive]}
                    onPress={() => setQbeOperator(op)}
                  >
                    <Text style={[styles.qbeOpText, qbeOperator === op && styles.qbeOpTextActive]}>
                      {op}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Valor */}
              <Text style={styles.qbeLabel}>Valor de Filtro:</Text>
              <TextInput
                style={styles.qbeInput}
                value={qbeValue}
                onChangeText={setQbeValue}
                placeholder="Ej: 500, Gala, etc."
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={styles.btnRunQbe}
                onPress={handleRunQbe}
                disabled={isExecutingQbe}
              >
                {isExecutingQbe ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnRunQbeText}>⚡ Ejecutar Consulta QBE</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Resultados QBE */}
            {qbeResult && (
              <View style={styles.reportContainer}>
                <Text style={styles.reportTitle}>{qbeResult.reporte}</Text>
                <View style={styles.tableCard}>
                  <View style={styles.tableHeaderRow}>
                    {(qbeResult.columnas || []).map((c) => (
                      <Text key={c.key} style={[styles.tableColHeader, { flex: 1 }]}>
                        {c.label}
                      </Text>
                    ))}
                  </View>
                  {(qbeResult.filas || []).map((f, idx) => (
                    <View key={idx} style={[styles.tableDataRow, idx % 2 === 1 && styles.tableRowAlt]}>
                      {(qbeResult.columnas || []).map((c) => (
                        <Text key={c.key} style={[styles.tableCell, { flex: 1 }]}>
                          {String(f[c.key] ?? '')}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: REPORTES POR VOZ / ASISTENTE IA */}
        {currentTab === 'voz' && (
          <View style={styles.voiceSection}>
            {/* Tarjeta Destacada de Asistente de Voz */}
            <View style={styles.voiceHeroCard}>
              <View style={styles.voiceHeroHeader}>
                <View style={styles.voiceIconCircle}>
                  <Text style={{ fontSize: 28 }}>🎙️</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.voiceHeroTitle}>Consultor Analítico por Voz</Text>
                  <Text style={styles.voiceHeroSub}>
                    Dicta preguntas por micrófono o pulsa para escuchar el informe hablado
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.btnRecordVoiceLarge}
                onPress={() => setIsVoiceModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnRecordVoiceText}>🎙️ Hablar por Micrófono (Dictado por Voz)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.voiceHeaderCard}>
              {/* Sugerencias Rápidas de Voz */}
              <Text style={styles.suggLabel}>Consultas Rápidas por Voz:</Text>
              <View style={styles.suggChips}>
                {[
                  '¿Cuánto se vendió hoy?',
                  '¿Cuáles son las prendas más vendidas?',
                  '¿Cuántas reservas pendientes hay?',
                  '¿Alertas de stock crítico?',
                ].map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggChip}
                    onPress={() => handleSendVoiceQuestion(q)}
                  >
                    <Text style={styles.suggChipText}>🎙️ {q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Historial de Chat y Voz */}
            <View style={styles.chatBox}>
              {chatHistory.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubble,
                    msg.emisor === 'usuario' ? styles.bubbleUser : styles.bubbleIa,
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.chatSender}>
                      {msg.emisor === 'usuario' ? '👤 Tú' : '🤖 Asistente FashionStore IA'}
                    </Text>
                    {msg.emisor === 'ia' && (
                      <TouchableOpacity
                        onPress={() => {
                          setLastSpeechReply(msg.texto);
                          setIsVoiceModalOpen(true);
                        }}
                        style={styles.btnListenBubble}
                      >
                        <Text style={styles.btnListenBubbleText}>🔊 Escuchar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.chatMessageText}>{msg.texto}</Text>
                </View>
              ))}
              {isSendingVoice && (
                <View style={[styles.chatBubble, styles.bubbleIa]}>
                  <ActivityIndicator size="small" color="#1A1A1A" />
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Sintetizando análisis y reporte por voz...
                  </Text>
                </View>
              )}
            </View>

            {/* Input para escribir o dictar */}
            <View style={styles.voiceInputBar}>
              <TouchableOpacity
                style={styles.btnMicInline}
                onPress={() => setIsVoiceModalOpen(true)}
              >
                <Text style={{ fontSize: 20 }}>🎙️</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.voiceTextInput}
                placeholder="Escribe o pulsa el micrófono..."
                placeholderTextColor="#999"
                value={voiceInput}
                onChangeText={setVoiceInput}
                onSubmitEditing={() => handleSendVoiceQuestion()}
              />
              <TouchableOpacity
                style={styles.btnSendVoice}
                onPress={() => handleSendVoiceQuestion()}
                disabled={isSendingVoice}
              >
                <Text style={styles.btnSendVoiceText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 5: DECISIONES Y MACHINE LEARNING */}
        {currentTab === 'ml' && (
          <View>
            {/* Sub-tabs de ML */}
            <View style={styles.mlSubTabs}>
              {[
                { key: 'demanda', label: '📈 Demanda (Red Neuronal)' },
                { key: 'rfm', label: '👥 Clientes RFM (K-Means)' },
                { key: 'escenarios', label: '🎲 Escenarios (Monte Carlo)' },
              ].map((st) => (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.mlSubTabBtn, mlSubTab === st.key && styles.mlSubTabBtnActive]}
                  onPress={() => setMlSubTab(st.key as any)}
                >
                  <Text style={[styles.mlSubTabText, mlSubTab === st.key && styles.mlSubTabTextActive]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isLoadingMl ? (
              <ActivityIndicator size="large" color="#1A1A1A" style={{ marginTop: 30 }} />
            ) : (
              <>
                {/* Sub-tab 1: Pronóstico de Demanda */}
                {mlSubTab === 'demanda' && (
                  <View>
                    {demandVerdict ? (
                      <View style={styles.verdictCard}>
                        <Text style={styles.verdictTitle}>🧠 Veredicto de Demanda Predictiva</Text>
                        <Text style={styles.verdictText}>{demandVerdict}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.mlSectionTitle}>Matriz de Demanda y Abastecimiento</Text>
                    {(demandData || []).map((d, idx) => (
                      <View key={idx} style={styles.mlCard}>
                        <View style={styles.mlCardHeader}>
                          <Text style={styles.mlCardTitle}>{d.prenda}</Text>
                          <View style={styles.confidenceBadge}>
                            <Text style={styles.confidenceText}>{d.probabilidadExito}% confianza</Text>
                          </View>
                        </View>
                        <Text style={styles.mlCardSub}>Categoría: {d.categoria}</Text>
                        <View style={styles.mlNumbersRow}>
                          <Text style={styles.mlNumberText}>Histórico: {d.demandaHistorica} u.</Text>
                          <Text style={styles.mlNumberHighlight}>Proyectado: {d.demandaProyectada} u. ↗</Text>
                        </View>
                        <View style={styles.mlRecommendationBox}>
                          <Text style={styles.mlRecLabel}>Recomendación del Modelo:</Text>
                          <Text style={styles.mlRecText}>{d.recomendacion}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Sub-tab 2: Segmentación RFM */}
                {mlSubTab === 'rfm' && (
                  <View>
                    {rfmVerdict ? (
                      <View style={styles.verdictCard}>
                        <Text style={styles.verdictTitle}>🧠 Diagnóstico de Clientes (K-Means)</Text>
                        <Text style={styles.verdictText}>{rfmVerdict}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.mlSectionTitle}>Clusters de Fidelización y Gasto</Text>
                    {(rfmData || []).map((c, idx) => (
                      <View key={idx} style={styles.mlCard}>
                        <View style={styles.mlCardHeader}>
                          <Text style={styles.mlCardTitle}>{c.segmento}</Text>
                          <Text style={styles.rfmCount}>{c.clientesCount} clientes</Text>
                        </View>
                        <View style={styles.mlNumbersRow}>
                          <Text style={styles.mlNumberText}>Gasto Promedio: {c.valorPromedio.toFixed(2)} Bs</Text>
                          <Text style={styles.mlNumberText}>Frecuencia: {c.frecuenciaMedia} compras</Text>
                        </View>
                        <View style={styles.mlRecommendationBox}>
                          <Text style={styles.mlRecLabel}>Estrategia Sugerida:</Text>
                          <Text style={styles.mlRecText}>{c.estrategia}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Sub-tab 3: Simulación Monte Carlo */}
                {mlSubTab === 'escenarios' && (
                  <View>
                    {scenariosVerdict ? (
                      <View style={styles.verdictCard}>
                        <Text style={styles.verdictTitle}>🧠 Análisis Estocástico de Decisión</Text>
                        <Text style={styles.verdictText}>{scenariosVerdict}</Text>
                      </View>
                    ) : null}

                    <Text style={styles.mlSectionTitle}>Simulación Probabilística de Escenarios</Text>
                    {(scenariosData || []).map((s, idx) => (
                      <View key={idx} style={styles.mlCard}>
                        <View style={styles.mlCardHeader}>
                          <Text style={[styles.mlCardTitle, { flex: 1 }]}>{s.escenario}</Text>
                          <View
                            style={[
                              styles.riskBadge,
                              { backgroundColor: s.nivelRiesgo === 'Bajo' ? '#D1FAE5' : '#FEF3C7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.riskText,
                                { color: s.nivelRiesgo === 'Bajo' ? '#065F46' : '#92400E' },
                              ]}
                            >
                              Riesgo {s.nivelRiesgo}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mlNumbersRow}>
                          <Text style={styles.mlNumberText}>Transacciones: {s.ventasEsperadas}</Text>
                          <Text style={styles.mlNumberHighlight}>Proyección: {s.ingresoProyectado.toLocaleString()} Bs</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de Voz Interactivo */}
      <VoiceAssistantModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceResult={(spokenText) => {
          setIsVoiceModalOpen(false);
          handleSendVoiceQuestion(spokenText);
        }}
        lastReplyText={lastSpeechReply}
        isProcessing={isSendingVoice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#7C7267',
    marginTop: 2,
  },
  mainTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
    paddingVertical: 8,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  mainTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3EFEA',
  },
  mainTabPillActive: {
    backgroundColor: '#1C1510',
  },
  mainTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#554A40',
  },
  mainTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: (width - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C8379',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1510',
    marginTop: 4,
  },
  kpiTrend: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 12,
  },
  branchProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  branchNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1510',
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0ECE8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#8C5E35',
    borderRadius: 3,
  },
  branchAmountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1510',
  },
  branchPercentText: {
    fontSize: 10,
    color: '#888',
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  topIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F3EFEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  topIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8C5E35',
  },
  topProdName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  topProdCat: {
    fontSize: 11,
    color: '#777',
  },
  topProdTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1510',
  },
  alertRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  alertPrenda: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  alertMsg: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  selectorBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEBE6',
    alignItems: 'center',
  },
  selectorBtnActive: {
    backgroundColor: '#8C5E35',
    borderColor: '#8C5E35',
  },
  selectorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  selectorBtnTextActive: {
    color: '#FFFFFF',
  },
  reportContainer: {
    marginTop: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1510',
  },
  reportSub: {
    fontSize: 11,
    color: '#777',
    marginBottom: 10,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE8',
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1510',
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  tableRowAlt: {
    backgroundColor: '#FDFBF9',
  },
  tableCell: {
    fontSize: 11,
    color: '#333',
  },
  qbeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    marginBottom: 14,
  },
  qbeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  qbeSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
    marginBottom: 12,
  },
  qbeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5E35',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  qbeEntityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  qbeEntityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3EFEA',
  },
  qbeEntityPillActive: {
    backgroundColor: '#1C1510',
  },
  qbeEntityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  qbeEntityTextActive: {
    color: '#FFFFFF',
  },
  qbeOperatorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  qbeOpPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3EFEA',
  },
  qbeOpPillActive: {
    backgroundColor: '#8C5E35',
  },
  qbeOpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  qbeOpTextActive: {
    color: '#FFFFFF',
  },
  qbeInput: {
    height: 42,
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#1C1510',
    marginTop: 4,
    marginBottom: 12,
  },
  btnRunQbe: {
    backgroundColor: '#1C1510',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnRunQbeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  voiceSection: {},
  voiceHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    marginBottom: 12,
  },
  voiceHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  voiceSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
    marginBottom: 10,
  },
  suggLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5E35',
    marginBottom: 6,
  },
  suggChips: {
    gap: 6,
  },
  suggChip: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDEBE8',
  },
  suggChipText: {
    fontSize: 11,
    color: '#444',
  },
  chatBox: {
    marginBottom: 12,
    gap: 8,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '92%',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#1C1510',
  },
  bubbleIa: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  chatSender: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 3,
    color: '#8C5E35',
  },
  chatMessageText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#222',
  },
  voiceInputBar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    padding: 6,
  },
  voiceTextInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#1C1510',
  },
  btnSendVoice: {
    backgroundColor: '#8C5E35',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  btnSendVoiceText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  mlSubTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  mlSubTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEBE6',
    alignItems: 'center',
  },
  mlSubTabBtnActive: {
    backgroundColor: '#1C1510',
    borderColor: '#1C1510',
  },
  mlSubTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  mlSubTabTextActive: {
    color: '#FFFFFF',
  },
  mlSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 10,
  },
  mlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    marginBottom: 10,
  },
  mlCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mlCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1510',
  },
  confidenceBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
  },
  mlCardSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  mlNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  mlNumberText: {
    fontSize: 12,
    color: '#555',
  },
  mlNumberHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5E35',
  },
  mlRecommendationBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F0ECE8',
  },
  mlRecLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C5E35',
    textTransform: 'uppercase',
  },
  mlRecText: {
    fontSize: 11,
    color: '#333',
    marginTop: 2,
  },
  rfmCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5E35',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '800',
  },
  voiceHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  voiceHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE6D9',
  },
  voiceHeroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  voiceHeroSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    lineHeight: 16,
  },
  btnRecordVoiceLarge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRecordVoiceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnListenBubble: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE6D9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  btnListenBubbleText: {
    fontSize: 10,
    color: '#8C5E35',
    fontWeight: '700',
  },
  btnMicInline: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verdictCard: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE6D9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  verdictTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C5E35',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  verdictText: {
    fontSize: 12,
    color: '#3A2E26',
    lineHeight: 18,
  },
});
