import { useState } from 'react'

export default function Evaluations({ responseId }) {
    const [feedback, setFeedback] = useState('')
    const [evaluationResults, setEvaluationResults] = useState(null)
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [questions, setQuestions] = useState([])
    const [customQuestions, setCustomQuestions] = useState('')
    const [showResults, setShowResults] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

    // Generate test questions from uploaded documents
    const generateQuestions = async () => {
        setFeedback('Generating questions...')
        try {
            const response = await fetch(`${backendUrl}/api/evaluation/generate-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 5 })
            })
            
            if (response.ok) {
                const data = await response.json()
                setQuestions(data.generated_questions)
                setFeedback(`Generated ${data.count} questions from your documents`)
            } else {
                const error = await response.text()
                setFeedback(`Failed to generate questions: ${error}`)
            }
        } catch (e) {
            setFeedback('Error generating questions')
            console.error(e)
        }
    }

    // Run batch evaluation with auto-generated questions
    const runBatchEvaluation = async () => {
        setIsEvaluating(true)
        setFeedback('Running evaluation...')
        setShowResults(false)
        
        try {
            const payload = { auto_generate_count: 5, top_k: 5 }
            
            const response = await fetch(`${backendUrl}/api/evaluation/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            
            if (response.ok) {
                const results = await response.json()
                setEvaluationResults(results)
                setFeedback(`Evaluation completed in ${results.evaluation_time.toFixed(2)}s`)
                setShowResults(true)
            } else {
                const error = await response.text()
                setFeedback(`Evaluation failed: ${error}`)
            }
        } catch (e) {
            setFeedback('Error running evaluation')
            console.error(e)
        } finally {
            setIsEvaluating(false)
        }
    }

    // Run evaluation with custom questions
    const runCustomEvaluation = async () => {
        if (!customQuestions.trim()) {
            setFeedback('Please enter some questions first')
            return
        }

        setIsEvaluating(true)
        setFeedback('Running custom evaluation...')
        setShowResults(false)
        
        try {
            const questionsList = customQuestions
                .split('\n')
                .map(q => q.trim())
                .filter(q => q.length > 0)
                .slice(0, 5) // Limit to 5 questions

            const payload = { 
                questions: questionsList,
                top_k: 5 
            }
            
            const response = await fetch(`${backendUrl}/api/evaluation/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            
            if (response.ok) {
                const results = await response.json()
                setEvaluationResults(results)
                setFeedback(`Custom evaluation completed in ${results.evaluation_time.toFixed(2)}s`)
                setShowResults(true)
            } else {
                const error = await response.text()
                setFeedback(`Evaluation failed: ${error}`)
            }
        } catch (e) {
            setFeedback('Error running custom evaluation')
            console.error(e)
        } finally {
            setIsEvaluating(false)
        }
    }

    const getScoreColor = (score) => {
        if (score >= 0.8) return '#10b981' // green
        if (score >= 0.6) return '#f59e0b' // yellow
        if (score >= 0.4) return '#f97316' // orange
        return '#ef4444' // red
    }

    const getScoreLabel = (score) => {
        if (score >= 0.8) return 'Excellent'
        if (score >= 0.6) return 'Good'
        if (score >= 0.4) return 'Fair'
        return 'Poor'
    }

    return (
        <div>
            <h3>RAG Evaluation</h3>
            
            {/* Auto Evaluation Section */}
            <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Auto Evaluation</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button 
                        className="btn" 
                        onClick={generateQuestions}
                        disabled={isEvaluating}
                    >
                        Generate Questions
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={runBatchEvaluation}
                        disabled={isEvaluating}
                    >
                        {isEvaluating ? 'Evaluating...' : 'Run Evaluation'}
                    </button>
                </div>
                
                {questions.length > 0 && (
                    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Generated Questions:</div>
                        {questions.map((q, i) => (
                            <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>• {q}</div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Questions Section */}
            <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Custom Evaluation</h4>
                <textarea 
                    className="input"
                    value={customQuestions}
                    onChange={(e) => setCustomQuestions(e.target.value)}
                    placeholder="Enter your questions (one per line, max 5):"
                    rows={4}
                    style={{ marginBottom: 8, resize: 'vertical' }}
                />
                <button 
                    className="btn btn-primary" 
                    onClick={runCustomEvaluation}
                    disabled={isEvaluating || !customQuestions.trim()}
                >
                    Evaluate Custom Questions
                </button>
            </div>

            {/* Status */}
            <div className="small" style={{ marginTop: 8, marginBottom: 12 }}>
                {feedback}
            </div>

            {/* Results Section */}
            {showResults && evaluationResults && (
                <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: 14, marginBottom: 8 }}>Evaluation Results</h4>
                    
                    {/* Summary */}
                    <div style={{ 
                        padding: 12, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 6, 
                        marginBottom: 12 
                    }}>
                        <div style={{ 
                            fontSize: 16, 
                            fontWeight: 'bold', 
                            color: getScoreColor(evaluationResults.summary.overall_quality || 0),
                            marginBottom: 8 
                        }}>
                            Overall Quality: {((evaluationResults.summary.overall_quality || 0) * 100).toFixed(1)}% 
                            ({getScoreLabel(evaluationResults.summary.overall_quality || 0)})
                        </div>
                        
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                            <strong>Questions Evaluated:</strong> {evaluationResults.summary.total_questions}
                        </div>
                        
                        {evaluationResults.summary.avg_avg_retrieval_score && (
                            <div style={{ fontSize: 12, marginBottom: 4 }}>
                                <strong>Avg Retrieval Score:</strong> {(evaluationResults.summary.avg_avg_retrieval_score * 100).toFixed(1)}%
                            </div>
                        )}
                        
                        {evaluationResults.summary.avg_answer_relevance && (
                            <div style={{ fontSize: 12, marginBottom: 4 }}>
                                <strong>Avg Answer Relevance:</strong> {(evaluationResults.summary.avg_answer_relevance * 100).toFixed(1)}%
                            </div>
                        )}
                        
                        {evaluationResults.summary.avg_total_time && (
                            <div style={{ fontSize: 12 }}>
                                <strong>Avg Response Time:</strong> {evaluationResults.summary.avg_total_time.toFixed(2)}s
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {evaluationResults.recommendations && evaluationResults.recommendations.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>Recommendations:</div>
                            {evaluationResults.recommendations.map((rec, i) => (
                                <div key={i} style={{ fontSize: 12, marginBottom: 4, paddingLeft: 8 }}>
                                    {rec}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Toggle for detailed results */}
                    <details style={{ marginTop: 12 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>
                            View Detailed Results ({evaluationResults.detailed_results?.length || 0} questions)
                        </summary>
                        <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                            {evaluationResults.detailed_results?.map((result, i) => (
                                <div key={i} style={{ 
                                    padding: 8, 
                                    borderBottom: '1px solid #e5e7eb',
                                    fontSize: 12 
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                        Q{i+1}: {result.question}
                                    </div>
                                    <div style={{ marginBottom: 4 }}>
                                        <strong>Answer:</strong> {result.generated_answer.substring(0, 100)}...
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <span>Score: {(result.metrics.composite_score * 100).toFixed(1)}%</span>
                                        <span>Relevance: {(result.metrics.answer_relevance * 100).toFixed(1)}%</span>
                                        <span>Faithfulness: {(result.metrics.context_faithfulness * 100).toFixed(1)}%</span>
                                        <span>Time: {result.timing.total_time.toFixed(2)}s</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}
        </div>
    )
}
