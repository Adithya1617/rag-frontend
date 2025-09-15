import { useState } from 'react'
import Chat from './components/Chat'
import Evaluations from './components/Evaluations'
import IngestForm from './components/IngestForm'
import RetrievalInspector from './components/RetrievalInspector'

export default function App(){
    const [retrieved, setRetrieved] = useState([])
    const [messages, setMessages] = useState([])
    const [currentResponseId, setCurrentResponseId] = useState(null)
    const [activeTab, setActiveTab] = useState('chat') // 'chat' or 'evaluation'

    return (
        <div className="app">
            <header>
                <h1>RAG Chatbot (Gemini + Pinecone)</h1>
                <div className="small">Enhanced with BGE embeddings and comprehensive evaluation</div>
                
                {/* Tab Navigation */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button 
                        className={`btn ${activeTab === 'chat' ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Chat & Documents
                    </button>
                    <button 
                        className={`btn ${activeTab === 'evaluation' ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab('evaluation')}
                    >
                        Evaluation
                    </button>
                </div>
            </header>

            {activeTab === 'chat' && (
                <div className="grid">
                    <div>
                        <div className="card" style={{marginBottom:12}}>
                            <IngestForm />
                        </div>
                        <div className="card">
                            <Chat 
                                setRetrieved={setRetrieved} 
                                messages={messages} 
                                setMessages={setMessages} 
                                setCurrentResponseId={setCurrentResponseId} 
                            />
                        </div>
                    </div>
                    <div>
                        <div className="card" style={{marginBottom:12}}>
                            <RetrievalInspector retrieved={retrieved} />
                        </div>
                        <div className="card">
                            <div>
                                <h3>Quick Feedback</h3>
                                <div className="small">Response ID: {currentResponseId || '—'}</div>
                                <div className="small" style={{marginTop: 8}}>
                                    Use the Evaluation tab for comprehensive RAG analysis
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'evaluation' && (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div className="card">
                        <Evaluations responseId={currentResponseId} />
                    </div>
                </div>
            )}
        </div>
    )
}
