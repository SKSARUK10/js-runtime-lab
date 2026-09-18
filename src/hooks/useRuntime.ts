import { useState, useRef, useCallback, useEffect } from 'react';
import type { RuntimeSnapshot, Speed, AppMode } from '@/types/runtime';
import {
  generateSimulation,
  createInitialSnapshot,
  applyStep,
  type SimStep,
} from '@/engine/runtimeEngine';
import { defaultExample, examples } from '@/data/examples';

export function useRuntimeState() {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(createInitialSnapshot);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [code, setCode] = useState(defaultExample.code);
  const [selectedExampleId, setSelectedExampleId] = useState(defaultExample.id);
  const [mode, setMode] = useState<AppMode>('learning');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showPanels, setShowPanels] = useState({
    stack: true,
    webapis: true,
    microtasks: true,
    cpu: true,
    memory: true,
    explanations: true,
  });

  const stepsRef = useRef<SimStep[]>([]);
  const stepIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapRef = useRef<RuntimeSnapshot>(snapshot);
  const [supported, setSupported] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [stepCount, setStepCount] = useState(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const rebuild = useCallback((newCode: string) => {
    clearTimer();
    setIsRunning(false);
    const result = generateSimulation(newCode);
    stepsRef.current = result.steps;
    stepIndexRef.current = 0;
    setSupported(result.supported);
    setParseError(result.parseResult.error || null);
    setTotalSteps(result.steps.length);
    setStepCount(0);
    const fresh = createInitialSnapshot();
    snapRef.current = fresh;
    setSnapshot(fresh);
  }, [clearTimer]);

  // Initialize on mount and when code changes
  useEffect(() => {
    rebuild(code);
  }, [rebuild, code]);

  const advanceStep = useCallback(() => {
    if (stepIndexRef.current >= stepsRef.current.length) {
      setIsRunning(false);
      return false;
    }
    const step = stepsRef.current[stepIndexRef.current];
    const newSnap = applyStep(snapRef.current, step);

    if (step.waitDuration && step.waitDuration > 0) {
      newSnap.executionTime += step.waitDuration;
    } else {
      newSnap.executionTime += Math.round(10 / (speed || 1));
    }

    snapRef.current = newSnap;
    setSnapshot(newSnap);
    stepIndexRef.current++;
    setStepCount(stepIndexRef.current);
    return true;
  }, [speed]);

  const run = useCallback(() => {
    if (stepIndexRef.current >= stepsRef.current.length) return;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const step = useCallback(() => {
    setIsRunning(false);
    clearTimer();
    advanceStep();
  }, [advanceStep, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    stepIndexRef.current = 0;
    setStepCount(0);
    const fresh = createInitialSnapshot();
    snapRef.current = fresh;
    setSnapshot(fresh);
  }, [clearTimer]);

  const selectExample = useCallback((id: string) => {
    const ex = examples.find(e => e.id === id);
    if (ex) {
      setSelectedExampleId(id);
      setCode(ex.code);
    }
  }, []);

  const togglePanel = useCallback((key: keyof typeof showPanels) => {
    setShowPanels(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Run loop
  useEffect(() => {
    if (!isRunning) return;
    if (stepIndexRef.current >= stepsRef.current.length) {
      setIsRunning(false);
      return;
    }

    const currentStep = stepsRef.current[stepIndexRef.current];
    const baseDelay = currentStep?.waitDuration
      ? Math.max(100, currentStep.waitDuration / speed / 2)
      : 600 / speed;

    timerRef.current = setTimeout(() => {
      const cont = advanceStep();
      if (!cont) {
        setIsRunning(false);
      }
    }, baseDelay);

    return () => clearTimer();
  }, [isRunning, speed, advanceStep, clearTimer, stepCount]);

  return {
    snapshot,
    isRunning,
    speed,
    setSpeed,
    code,
    setCode,
    selectedExampleId,
    mode,
    setMode,
    reducedMotion,
    setReducedMotion,
    showPanels,
    togglePanel,
    selectExample,
    run,
    pause,
    step,
    reset,
    stepCount,
    totalSteps,
    supported,
    parseError,
  };
}
