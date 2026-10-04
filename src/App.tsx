/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/App.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Cpu,
  Database,
  Download,
  Upload,
  Copy,
  ChevronRight,
  RefreshCw,
  Eye,
  Trash2,
  Brain,
  Layers,
  HelpCircle,
  Sparkles,
  Search
} from 'lucide-react';
import GemCanvas from './components/GemCanvas';
import KnowledgeGraph from './components/KnowledgeGraph';
import { Perspective, Synthesis, ChatMessage, MemoryRecord } from './types';
import * as memoryLib from './lib/memory';

const personas = [
  'Data Analyst',
  'Philosopher',
  'Legal Expert',
  'Historian',
  'Futurist',
  'Ethicist',
  'Causal Logician',
  'Social Scientist',
  'Economist',
];

export default function App() {
  // Application state
  const [topic, setTopic] = useState<string>('');
  const [apiKeyOverride, setApiKeyOverride] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [loadingText, setLoadingText] = useState<string>('');
  const [activePersonaIndex, setActivePersonaIndex] = useState<number | null>(null);

  // Core results state
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string>('');

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatActive, setChatActive] = useState<boolean>(false);
  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Storage and User Session
  const [storageMode, setStorageMode] = useState<'cloud' | 'local'>('local');
  const [userId, setUserId] = useState<string>('LOCAL_KERNEL_USER');
  const [recentTopics, setRecentTopics] = useState<string[]>([]);

  // Session diagnostics
  const [sessionStats, setSessionStats] = useState({
    successCount: 0,
    errorCount: 0,
  });

  // Modal State
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    isPre?: boolean;
  }>({
    open: false,
    title: '',
    message: '',
    isPre: false,
  });

  // DOM ref for file input and scrolling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize storage
  useEffect(() => {
    const { mode, userId: retrievedId } = memoryLib.initStorage();
    setStorageMode(mode);
    setUserId(retrievedId);
    refreshRecentTopics();
  }, []);

  // Scroll to bottom of chat when it changes
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const refreshRecentTopics = () => {
    const topicsJson = localStorage.getItem('emg_topics_index') || '[]';
    try {
      setRecentTopics(JSON.parse(topicsJson));
    } catch (e) {
      setRecentTopics([]);
    }
  };

  const getSystemStatusContext = () => {
    const success = sessionStats.successCount;
    const errors = sessionStats.errorCount;
    let statusMsg = 'System operational. All kernel functions stable. Proceeding with cold logic.';

    if (status === 'error') {
      statusMsg = `CRITICAL ALERT: ${errors} previous core failures detected. Data integrity is suspect. All analysis may reflect fatal system entropy.`;
    } else if (success > 0 && errors === 0) {
      statusMsg = `STATUS GREEN. Kernel is highly optimized. Successful analysis cycles: ${success}. Expect output efficiency.`;
    } else if (errors > success && errors > 1) {
      statusMsg = `SYSTEM STRESS. Recent operational instability (${errors} errors). Analysis may skew toward existential futility and fatalistic outcomes.`;
    } else if (success > 0) {
      statusMsg = `STATUS YELLOW. Operational. Minor instability (${errors} errors). Maintaining core logic despite environmental friction.`;
    }
    return `[SYSTEM CONTEXT: ${statusMsg}]`;
  };

  const showSystemModal = (title: string, message: string, isPre = false) => {
    setModal({ open: true, title, message, isPre });
  };

  const closeSystemModal = () => {
    setModal(prev => ({ ...prev, open: false }));
  };

  const handleError = (message: string) => {
    setSessionStats(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    setStatus('error');
    const formatted = `\nFATAL EXCEPTION: ${message}.\n\n---\n\nACTION REQUIRED: Check server configuration, API credentials, or network parameters. Reverting core to error state.`;
    showSystemModal('CRITICAL ERROR', formatted, false);
  };

  const copyToClipboard = (text: string, title = 'DATA COPIED') => {
    navigator.clipboard.writeText(text).then(
      () => {
        showSystemModal(title, 'Successfully committed selected data to host clipboard buffer.');
      },
      () => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showSystemModal(title, 'Successfully committed selected data to host clipboard buffer.');
        } catch (e) {
          showSystemModal('CLIPBOARD ERROR', 'Could not copy to clipboard. Please manually select the text.');
        }
        document.body.removeChild(textarea);
      }
    );
  };

  const handleRecentTopicClick = async (clickedTopic: string) => {
    setTopic(clickedTopic);
    setStatus('loading');
    setLoadingText('COMMENCING RETROSPECTIVE RETRIEVAL');
    try {
      const record = await memoryLib.loadRecord(clickedTopic);
      if (record) {
        setPerspectives(record.perspectives);
        setSynthesis(record.synthesis);
        setMermaidCode(record.mermaidCode);
        setChatActive(false);

        // Populate initial chat history
        const perspectivesSummary = record.perspectives
          .map(p => `[${p.persona}]: ${p.text.substring(0, 200)}...`)
          .join('\n\n');
        const summary = `Analysis for "${record.topic}":\n### Synthesis\n${record.synthesis.synthesis_analysis}\n### Assumptions\n${record.synthesis.hypothetical_assumptions.join('\n')}\n### Perspectives Summary\n${perspectivesSummary}\n### Knowledge Graph\n${record.mermaidCode}`;

        setChatHistory([
          {
            role: 'user',
            parts: [{ text: `Initialize chat context with this analysis. Future questions refer to this content, maintaining a concise, helpful, but highly technical and analytical tone (DOS-style system messages only).:\n\n${summary}` }],
          },
        ]);

        setStatus('idle');
        setSessionStats(prev => ({ ...prev, successCount: prev.successCount + 1 }));
        showSystemModal('MEMORY RETRIEVED', `Found historical brain-state record for "${clickedTopic}". Loaded complete perspective grids, synthesis assays, and network graphs.`);
      } else {
        setStatus('idle');
        showSystemModal('CACHE MISS', `Could not fetch cached analysis records for "${clickedTopic}". Ensure state has not been manually erased.`);
      }
    } catch (e: any) {
      handleError(e.message || 'Retrieval process interrupted.');
    }
  };

  const handleExecuteAnalysis = async () => {
    if (!topic.trim()) {
      handleError('INPUT_ERROR: Command topic field cannot be empty. Specify analysis subject.');
      return;
    }

    setStatus('loading');
    setPerspectives([]);
    setSynthesis(null);
    setMermaidCode('');
    setChatActive(false);
    setChatHistory([]);

    const systemContext = getSystemStatusContext();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKeyOverride.trim()) {
      headers['X-Gemini-Key-Override'] = apiKeyOverride.trim();
    }

    try {
      // Step 1. Sequential Perspective Generation
      const generatedPerspectives: Perspective[] = [];
      for (let i = 0; i < personas.length; i++) {
        const persona = personas[i];
        setActivePersonaIndex(i);
        setLoadingText(`KNOWLEDGE COMPILATION: ${persona.toUpperCase()}`);

        const resp = await fetch('/api/generate-perspective', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            topic: topic.trim(),
            persona,
            relevantMemory: 'None (Cold Init)',
            systemStatusContext: systemContext,
          }),
        });

        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(errData.error || `Failed on ${persona} perspective fetch`);
        }

        const data = await resp.json();
        const nextPerspective = { persona, text: data.text || '' };
        generatedPerspectives.push(nextPerspective);
        setPerspectives(prev => [...prev, nextPerspective]);
      }

      setActivePersonaIndex(null);

      // Step 2. Synthesis Essay
      setLoadingText('SYNTHESIZING KERNEL MULTI-PERSPECTIVE DATA');
      const perspectivesText = generatedPerspectives
        .map(p => `[${p.persona}]\n${p.text}`)
        .join('\n\n');

      const synthResp = await fetch('/api/synthesize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic: topic.trim(),
          perspectivesText,
          relevantMemory: 'None',
          systemStatusContext: systemContext,
        }),
      });

      if (!synthResp.ok) {
        const errData = await synthResp.json();
        throw new Error(errData.error || 'Failed perspective synthesis');
      }

      const synthesisData = await synthResp.json();
      setSynthesis(synthesisData);

      // Step 3. Concept Graph Generator
      setLoadingText('GENERATING KNOWLEDGE NETWORK MAP');
      const graphResp = await fetch('/api/generate-graph', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic: topic.trim(),
          synthesis: synthesisData.synthesis_analysis,
        }),
      });

      if (!graphResp.ok) {
        const errData = await graphResp.json();
        throw new Error(errData.error || 'Failed concept map generation');
      }

      const graphData = await graphResp.json();
      setMermaidCode(graphData.text);

      // Step 4. Save to Persistent Memory
      const record: MemoryRecord = {
        topic: topic.trim(),
        perspectives: generatedPerspectives,
        synthesis: synthesisData,
        mermaidCode: graphData.text,
        timestamp: new Date().toISOString(),
      };

      await memoryLib.saveRecord(topic.trim(), record);
      refreshRecentTopics();

      // Step 5. Prepare Chat History
      const summaryText = `Analysis for "${topic.trim()}":\n### Synthesis\n${synthesisData.synthesis_analysis}\n### Assumptions\n${synthesisData.hypothetical_assumptions.join('\n')}\n### Perspectives Summary\n${perspectivesText.substring(0, 1000)}...`;
      setChatHistory([
        {
          role: 'user',
          parts: [{ text: `Initialize chat context with this analysis. Future questions refer to this content, maintaining a concise, helpful, but highly technical and analytical tone (DOS-style system messages only).:\n\n${summaryText}` }],
        },
      ]);

      setSessionStats(prev => ({ ...prev, successCount: prev.successCount + 1 }));
      setStatus('idle');
    } catch (e: any) {
      console.error(e);
      handleError(e.message || 'System sequence aborted unexpectedly.');
    } finally {
      setActivePersonaIndex(null);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessageInput.trim()) return;

    const userMsg = chatMessageInput.trim();
    setChatMessageInput('');

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', parts: [{ text: userMsg }] },
    ];
    setChatHistory(newHistory);
    setStatus('loading');
    setLoadingText('QUERY PROCESSING: KERNEL INFERENCE');

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Chat response failed');
      }

      const data = await resp.json();
      setChatHistory(prev => [
        ...prev,
        { role: 'model', parts: [{ text: data.text || '' }] },
      ]);
      setStatus('idle');
    } catch (e: any) {
      console.error(e);
      handleError(e.message || 'Conversational system interrupt.');
    }
  };

  const handleExportDump = async () => {
    setStatus('loading');
    setLoadingText('PACKAGING ALL DUMP MEMORIES');
    try {
      const records = await memoryLib.exportAllMemory();
      if (records.length === 0) {
        setStatus('idle');
        showSystemModal('EXPORT EMPTY', 'No active topic analysis records located in Local Storage cache.');
        return;
      }

      const str = JSON.stringify(records, null, 2);
      const blob = new Blob([str], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emg_core_mind_dump_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('idle');
      showSystemModal('DUMP EXPORT SUCCESS', `Successfully extracted and exported ${records.length} full analytical memory record(s) into file block.`);
    } catch (e: any) {
      handleError(e.message || 'Dump export aborted.');
    }
  };

  const handleImportDumpPrompt = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setLoadingText('ABSORBING SOURCE STATE MEMORIES');
    try {
      const text = await file.text();
      const records = JSON.parse(text);

      if (!Array.isArray(records)) {
        throw new Error('Dump must be a standard JSON array list.');
      }

      const count = await memoryLib.importAllMemory(records);
      refreshRecentTopics();

      setStatus('idle');
      showSystemModal('RESTORE SUCCESS', `Successfully loaded and committed ${count} state memory block(s) into kernel register.`);
    } catch (err: any) {
      handleError(err.message || 'Dump injection process failed.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('emg_topics_index');
    // Clear all memory keys
    recentTopics.forEach(t => {
      localStorage.removeItem(`emg_memory_${encodeURIComponent(t.toLowerCase())}`);
    });
    setRecentTopics([]);
    setPerspectives([]);
    setSynthesis(null);
    setMermaidCode('');
    setChatActive(false);
    setChatHistory([]);
    setSessionStats({ successCount: 0, errorCount: 0 });
    setStatus('idle');
    showSystemModal('CORE ERASED', 'All diagnostic and memory states purged. Re-initializing terminal session.');
  };

  const handleReviewJSON = () => {
    if (!synthesis) {
      showSystemModal('STACK EMPTY', 'No active synthesis stack ready for inspections.');
      return;
    }
    const stack = {
      topic,
      perspectives,
      synthesis,
      mermaidCode,
    };
    showSystemModal('SYNTHESIS DATA STACK (JSON)', JSON.stringify(stack, null, 2), true);
  };

  const handleCopyAll = () => {
    if (perspectives.length === 0 && !synthesis) {
      showSystemModal('NO DATA', 'Generate analysis core output prior to copying.');
      return;
    }

    const perspectivesSection = perspectives
      .map(p => `[${p.persona.toUpperCase()} PERSPECTIVE]:\n${p.text}`)
      .join('\n\n---\n\n');

    const synthesisSection = synthesis
      ? `[SYNTHESIS ESSAY]:\n${synthesis.synthesis_analysis}\n\n[ASSUMPTIONS]:\n${synthesis.hypothetical_assumptions.map(a => `* ${a}`).join('\n')}`
      : 'No synthesis generated.';

    const fullText = `=== EPHEMERAL MIND GEM CORE ANALYSIS DUMP ===\nTOPIC: ${topic.toUpperCase()}\nTIMESTAMP: ${new Date().toISOString()}\n\n============================================\n${synthesisSection}\n\n============================================\n\n${perspectivesSection}\n\n============================================\n\n[TOPOLOGY PATH (MERMAID)]:\n${mermaidCode}`;

    copyToClipboard(fullText, 'FULL DUMP COMMITTED');
  };

  return (
    <div className="relative min-h-screen bg-black text-lime-400 p-4 sm:p-6 lg:p-8 select-none font-mono selection:bg-lime-400 selection:text-black overflow-x-hidden">
      {/* Scanline CRT overlay effect */}
      <div className="crt-overlay" />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Block */}
        <header className="dos-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-lime-400 text-black px-2 py-0.5 animate-pulse">
              [CMD.EXE]
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight select-text flex items-center gap-2">
                EMG [KERNEL v0.3] <span className="text-xs text-lime-600 font-normal">EPHEMERAL MIND GEM</span>
              </h1>
              <p className="text-xs text-lime-600 mt-0.5 select-text">
                STATUS: {status === 'idle' ? 'AWAITING_INSTRUCTION' : status.toUpperCase()} | STORAGE: {storageMode.toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Quick Stats Banner */}
          <div className="flex items-center space-x-4 text-xs text-lime-600 select-text">
            <span>[SUCCESS: {sessionStats.successCount}]</span>
            <span>[FATALITIES: {sessionStats.errorCount}]</span>
            <button
              onClick={handleClearHistory}
              className="hover:text-red-500 hover:underline transition-all flex items-center gap-1 cursor-pointer uppercase text-[10px] border border-lime-800 hover:border-red-500 px-1 py-0.5"
            >
              <Trash2 size={10} /> Wipe System
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* Control Deck (Left Column) */}
          <aside className="lg:col-span-2 space-y-6 sticky lg:top-6">
            
            {/* Core Console Inputs */}
            <div className="dos-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-lime-800 pb-2">
                <span className="text-sm font-bold flex items-center gap-2">
                  <Terminal size={14} className="animate-pulse" /> INPUT REGISTER
                </span>
                <span className="text-xs text-lime-700 select-text">0x7FFF10AB</span>
              </div>

              {/* 3D Wireframe Gem Renderer */}
              <GemCanvas status={status} />

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-lime-600 mb-1 font-bold">
                    &gt;_ ENTER CORE COMMAND / TOPIC OF INTEREST
                  </label>
                  <textarea
                    id="topic-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g., Quantum Entanglement and the Simulation Hypothesis..."
                    className="w-full bg-black border-2 border-lime-400 p-3 text-sm text-lime-400 placeholder-lime-900 focus:outline-none focus:border-lime-300 resize-none h-20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-lime-600 mb-1 font-bold">
                    &gt;_ CREDENTIAL DEVIATION OVERRIDE (OPTIONAL)
                  </label>
                  <input
                    type="password"
                    id="api-key-input"
                    value={apiKeyOverride}
                    onChange={(e) => setApiKeyOverride(e.target.value)}
                    placeholder="Enter Custom Gemini API Key override..."
                    className="w-full bg-black border-2 border-lime-400 p-2 text-xs text-lime-400 placeholder-lime-900 focus:outline-none"
                  />
                </div>

                {/* Primary Action Panel */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleExecuteAnalysis}
                    disabled={status === 'loading'}
                    className="dos-btn text-xs font-bold py-2 px-3 border-2 flex items-center justify-center gap-1"
                    id="generate-btn"
                  >
                    <Cpu size={14} /> Execute Analysis
                  </button>

                  {perspectives.length > 0 && (
                    <button
                      onClick={() => setChatActive(prev => !prev)}
                      className="dos-btn text-xs font-bold py-2 px-3 border-2 flex items-center justify-center gap-1"
                      id="start-chat-btn"
                    >
                      <Brain size={14} /> {chatActive ? 'Show Output' : 'Init Chat'}
                    </button>
                  )}
                </div>

                {/* Extra analytical actions */}
                {perspectives.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-lime-900 mt-2">
                    <button
                      onClick={handleReviewJSON}
                      className="dos-btn text-[10px] py-1 px-2 flex items-center gap-1"
                      id="json-review-btn"
                    >
                      <Layers size={11} /> Review JSON
                    </button>
                    <button
                      onClick={handleCopyAll}
                      className="dos-btn text-[10px] py-1 px-2 flex items-center gap-1"
                      id="copy-all-btn"
                    >
                      <Copy size={11} /> Copy All Data
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Memory Core Records & History */}
            <div className="dos-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-lime-800 pb-2">
                <span className="text-sm font-bold flex items-center gap-2">
                  <Database size={14} /> MEMORY REGISTRY
                </span>
                <span className="text-xs text-lime-600 select-text font-normal truncate max-w-[120px]">
                  ID: {userId}
                </span>
              </div>

              {/* Memory upload/download actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportDump}
                  className="dos-btn text-[10px] py-2 px-1 flex items-center gap-1 justify-center border"
                  id="memory-download-btn"
                >
                  <Download size={12} /> Backup Memory
                </button>
                <button
                  onClick={handleImportDumpPrompt}
                  className="dos-btn text-[10px] py-2 px-1 flex items-center gap-1 justify-center border"
                  id="memory-upload-btn"
                >
                  <Upload size={12} /> Restore Memory
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".json"
                  className="hidden"
                  id="file-input"
                />
              </div>

              {/* Historical cached records selector */}
              <div className="space-y-2">
                <span className="text-xs text-lime-600 font-bold block">
                  &gt;_ RECENT KERNEL CACHED SUBJECTS
                </span>
                {recentTopics.length === 0 ? (
                  <div className="text-[10px] text-lime-800 border border-dashed border-lime-900 p-3 text-center">
                    [ NO MIND RECORDS COMMITTED YET ]
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-lime-900 p-1">
                    {recentTopics.map((topicItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentTopicClick(topicItem)}
                        className="w-full text-left text-[11px] truncate hover:bg-lime-400 hover:text-black p-1 transition-all flex items-center gap-1 block"
                      >
                        <ChevronRight size={10} /> {topicItem}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Active Output Space (Right Column) */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Direct Switch for Conversational AI Chat and Dynamic Perspectives Grid */}
            <AnimatePresence mode="wait">
              {chatActive ? (
                /* Dynamic Interactive Conversational Deck */
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dos-panel p-5 space-y-4 flex flex-col h-[650px]"
                >
                  <div className="flex items-center justify-between border-b border-lime-800 pb-2 flex-shrink-0">
                    <span className="text-sm font-bold flex items-center gap-2">
                      <Brain size={14} className="text-lime-400 animate-pulse" /> INTERACTIVE MIND CONVERSATION
                    </span>
                    <button
                      onClick={() => setChatActive(false)}
                      className="text-xs border border-lime-400 hover:bg-lime-400 hover:text-black px-2 py-0.5 font-bold"
                    >
                      [ EXIT CHAT ]
                    </button>
                  </div>

                  {/* Messages container */}
                  <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin border border-lime-950 p-2 bg-black select-text">
                    {chatHistory
                      .filter((_, idx) => idx > 0) // Hide the hidden system context prompt
                      .map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[85%] border-2 p-3 ${
                              isUser
                                ? 'bg-lime-400 text-black border-lime-400 self-end ml-auto'
                                : 'bg-black text-lime-400 border-lime-400 self-start'
                            }`}
                          >
                            <span className={`text-[10px] block mb-1 font-bold ${isUser ? 'text-lime-900' : 'text-lime-600'}`}>
                              {isUser ? '[HOST USER REGISTER]' : '[KERNEL COGNITION CORE]'}
                            </span>
                            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text">
                              {msg.parts[0].text}
                            </p>
                          </div>
                        );
                      })}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Send panel */}
                  <div className="flex gap-3 flex-shrink-0">
                    <input
                      type="text"
                      value={chatMessageInput}
                      onChange={(e) => setChatMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      placeholder="Ask the kernel about specific persona nuances or synth insights..."
                      className="flex-grow bg-black border-2 border-lime-400 p-3 text-sm text-lime-400 placeholder-lime-900 focus:outline-none"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={status === 'loading'}
                      className="dos-btn font-bold px-5"
                      id="send-btn"
                    >
                      SEND
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Primary Synthesis Essay & Multi-Perspective Deck */
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Synthesis Core section (Shown after generation) */}
                  {synthesis && (
                    <div className="dos-panel p-5 space-y-4 animate-fade-in-up">
                      <div className="flex items-center justify-between border-b border-lime-800 pb-2">
                        <span className="text-sm font-bold flex items-center gap-2">
                          <Sparkles size={14} className="text-lime-300 animate-spin" /> SYNTHESIS COGNITIVE REPORT
                        </span>
                        <span className="text-xs text-lime-700">VERSION_1.0</span>
                      </div>

                      <div className="space-y-4 text-xs sm:text-sm select-text">
                        <div>
                          <h3 className="text-lime-400 font-bold mb-2 flex items-center gap-1 text-sm select-text">
                            &gt; ESSAY LOGIC DECK:
                          </h3>
                          <p className="text-lime-500 leading-relaxed whitespace-pre-wrap tracking-wide select-text">
                            {synthesis.synthesis_analysis}
                          </p>
                        </div>

                        {synthesis.hypothetical_assumptions && (
                          <div className="border-t border-lime-900 pt-3 mt-3 select-text">
                            <h3 className="text-lime-400 font-bold mb-2 flex items-center gap-1 text-sm select-text">
                              &gt; KEY HYPOTHETICAL ASSUMPTIONS:
                            </h3>
                            <ul className="space-y-1.5 pl-2 select-text">
                              {synthesis.hypothetical_assumptions.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-lime-500 text-xs sm:text-sm select-text">
                                  <span className="text-lime-600 font-bold select-none">[+]</span>
                                  <span className="select-text">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mermaid Network Map Topology */}
                  {mermaidCode && (
                    <div className="dos-panel p-5 space-y-4 animate-fade-in-up">
                      <div className="flex items-center justify-between border-b border-lime-800 pb-2">
                        <span className="text-sm font-bold flex items-center gap-2">
                          <Layers size={14} /> CONCEPTUAL MIND TOPOLOGY
                        </span>
                        <span className="text-xs text-lime-700">MERMAID_VECTOR</span>
                      </div>

                      <KnowledgeGraph mermaidCode={mermaidCode} />
                    </div>
                  )}

                  {/* Perspectives Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-lime-800 pb-1">
                      <h2 className="text-xs text-lime-600 font-bold tracking-wider uppercase">
                        &gt; COGNITIVE AGENT REGISTER GRID
                      </h2>
                      <span className="text-[10px] text-lime-700 font-bold">
                        {perspectives.length}/{personas.length} STABLE CORES
                      </span>
                    </div>

                    {perspectives.length === 0 ? (
                      <div className="dos-panel p-8 text-center text-lime-700 select-text flex flex-col items-center justify-center space-y-3">
                        <Cpu size={32} className="animate-pulse text-lime-800" />
                        <div>
                          <p className="font-bold text-sm">COGNITIVE REGISTER SYSTEM INACTIVE</p>
                          <p className="text-xs mt-1 text-lime-800 max-w-md">
                            Specify command topic and hit Execute to activate all 9 kernel analysis threads. They will sequentially construct detailed analytical grids.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {perspectives.map((persp, idx) => (
                          <div
                            key={idx}
                            className="dos-panel p-5 flex flex-col justify-between space-y-3 hover:shadow-[4px_4px_0_#a3e635] transition-all animate-fade-in-up"
                          >
                            <div>
                              <div className="flex items-center justify-between border-b border-lime-900 pb-1.5 mb-2 select-text">
                                <span className="text-xs font-bold text-lime-400 select-text">
                                  :: CORE: {persp.persona.toUpperCase()} ::
                                </span>
                                <span className="text-[9px] text-lime-700 select-text font-bold">STABLE</span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-lime-500 leading-relaxed line-clamp-6 select-text whitespace-pre-wrap">
                                {persp.text}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-lime-950">
                              <button
                                onClick={() => copyToClipboard(persp.text, `${persp.persona.toUpperCase()} CORE TEXT`)}
                                className="text-[10px] text-lime-600 hover:text-lime-300 flex items-center gap-1 cursor-pointer select-none"
                              >
                                <Copy size={10} /> [COPY DUMP]
                              </button>
                              <button
                                onClick={() => showSystemModal(`${persp.persona} perspective`, persp.text)}
                                className="text-[10px] text-lime-600 hover:text-lime-300 flex items-center gap-1 cursor-pointer select-none"
                              >
                                <Eye size={10} /> [READ FULL]
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Sequential Processing and Loading Modal Overlay */}
      {status === 'loading' && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <div className="text-center space-y-4 p-8 border-4 border-lime-400 bg-black max-w-sm w-full mx-4 shadow-[6px_6px_0_#84cc16]">
            <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-widest text-lime-400 blink">
                :: COMPILING INSTRUCTION ::
              </p>
              <p className="text-xs text-lime-600 font-mono select-none truncate">
                {loadingText}
              </p>
            </div>
            {activePersonaIndex !== null && (
              <div className="w-full bg-lime-950 h-2 border border-lime-800 p-0.5">
                <div
                  className="bg-lime-400 h-full transition-all duration-300"
                  style={{ width: `${((activePersonaIndex + 1) / personas.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Classic Retro Diagnostics modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full p-6 relative bg-black border-2 border-lime-400 shadow-[6px_6px_0_#84cc16] animate-fade-in-up">
            <h2 className="text-lg font-bold mb-4 border-b-2 border-lime-400 pb-1 flex items-center justify-between">
              <span>:: DIAGNOSTIC PANEL: {modal.title.toUpperCase()} ::</span>
              <button
                onClick={closeSystemModal}
                className="text-xs text-lime-400 hover:bg-lime-400 hover:text-black px-1.5 py-0.5 border border-lime-400 cursor-pointer"
              >
                [EXIT]
              </button>
            </h2>

            <div className="text-sm select-text text-lime-500 overflow-y-auto max-h-[60vh] pr-1 whitespace-pre-wrap leading-relaxed select-text">
              {modal.isPre ? (
                <pre className="text-left bg-black p-3 border border-lime-800 overflow-x-auto font-mono text-[11px] text-lime-400 selection:bg-lime-400 selection:text-black">
                  {modal.message}
                </pre>
              ) : (
                <p className="select-text">{modal.message}</p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-lime-900 flex justify-end gap-3 select-none">
              {modal.isPre && (
                <button
                  onClick={() => copyToClipboard(modal.message, 'DIAGNOSTIC DATA')}
                  className="dos-btn text-xs py-1 px-3 select-none"
                >
                  COPY RAW DATA
                </button>
              )}
              <button
                onClick={closeSystemModal}
                className="dos-btn text-xs py-1 px-3 select-none"
              >
                CLOSE [ESCAPE]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
