import { useState } from 'react';
import { examples } from '@/data/examples';
import { Brain, Check, X, RotateCcw } from 'lucide-react';
import { SubscribeCTA } from '@/components/SubscribeCTA/SubscribeCTA';

interface InterviewModeProps {
  onExit?: () => void;
  /** Render inline as page content instead of a fixed fullscreen overlay. */
  embedded?: boolean;
}

export function InterviewMode({ onExit, embedded = false }: InterviewModeProps) {
  const challenges = examples.filter(e => e.difficulty);
  const [selectedId, setSelectedId] = useState(challenges[0]?.id || '');
  const [userAnswer, setUserAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const challenge = challenges.find(c => c.id === selectedId);

  const checkAnswer = () => {
    if (!challenge?.expectedOutput) return;
    const userLines = userAnswer.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const expected = challenge.expectedOutput;
    const correct = userLines.length === expected.length &&
      userLines.every((line, i) => line === expected[i]);
    setIsCorrect(correct);
    setRevealed(true);
  };

  const resetChallenge = () => {
    setUserAnswer('');
    setRevealed(false);
    setIsCorrect(false);
  };

  return (
    <div className={embedded ? 'overflow-auto' : 'fixed inset-0 z-40 bg-panel-bg/95 backdrop-blur-sm overflow-auto'}>
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-accent-violet" />
            <h2 className="text-lg font-bold text-gray-200">Interview Challenge Mode</h2>
          </div>
          {onExit && (
            <button onClick={onExit} className="btn-default">
              Exit
            </button>
          )}
        </div>

        {/* Challenge selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {challenges.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedId(c.id); resetChallenge(); }}
              className={`px-3 py-1.5 text-xs rounded border transition-all ${
                selectedId === c.id
                  ? 'bg-accent-violet/20 border-accent-violet/50 text-accent-violet'
                  : 'bg-panel-surface border-panel-border text-gray-400 hover:text-gray-200'
              }`}
            >
              {c.name} <span className="text-[9px] ml-1 opacity-60">({c.difficulty})</span>
            </button>
          ))}
        </div>

        {challenge && (
          <div className="space-y-4">
            {/* Code */}
            <div className="glass-panel overflow-hidden">
              <div className="panel-header">
                <span>Challenge Code</span>
                <span className={`text-[10px] normal-case tracking-normal px-1.5 py-0.5 rounded ${
                  challenge.difficulty === 'Easy' ? 'bg-accent-green/20 text-accent-green' :
                  challenge.difficulty === 'Medium' ? 'bg-accent-amber/20 text-accent-amber' :
                  challenge.difficulty === 'Hard' ? 'bg-accent-red/20 text-accent-red' :
                  'bg-accent-violet/20 text-accent-violet'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              <pre className="p-3 font-mono text-[12px] text-gray-300 overflow-auto leading-relaxed">{challenge.code}</pre>
            </div>

            {/* Question */}
            <div className="glass-panel p-3">
              <p className="text-sm text-gray-300 mb-3">
                What will be the output? Enter each line of output on its own line:
              </p>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={revealed}
                placeholder="Enter expected output, one line per console.log..."
                className="w-full h-32 bg-panel-surface border border-panel-border rounded p-2 font-mono text-[12px] text-gray-200 outline-none focus:border-accent-violet/50 resize-none disabled:opacity-60"
              />
              <div className="flex gap-2 mt-2">
                {!revealed ? (
                  <button onClick={checkAnswer} className="btn-primary">
                    <Check size={12} className="inline mr-1" /> Predict Output
                  </button>
                ) : (
                  <button onClick={resetChallenge} className="btn-default">
                    <RotateCcw size={12} className="inline mr-1" /> Try Again
                  </button>
                )}
              </div>
            </div>

            {/* Result */}
            {revealed && (
              <div className="glass-panel p-3 space-y-3" style={{ animation: 'slideIn 0.3s ease-out' }}>
                <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
                  {isCorrect ? <Check size={16} /> : <X size={16} />}
                  {isCorrect ? 'Correct!' : 'Not quite — see the answer below.'}
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Expected Output:</div>
                  <pre className="font-mono text-[12px] text-accent-green bg-panel-surface p-2 rounded border border-panel-border">
                    {challenge.expectedOutput?.join('\n')}
                  </pre>
                </div>

                {challenge.explanation && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Explanation:</div>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{challenge.explanation}</p>
                  </div>
                )}

                {/* Post-session subscribe CTA (quiz finished). */}
                <SubscribeCTA />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
