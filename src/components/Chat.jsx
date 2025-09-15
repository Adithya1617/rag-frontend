import { useRef, useState } from 'react'

export default function Chat({ setRetrieved, messages, setMessages, setCurrentResponseId }){
    const [input, setInput] = useState('')
    const [streaming, setStreaming] = useState(false)
    const scrollRef = useRef()

    const appendMessage = (role, text) => {
        setMessages(prev => [...prev, {role, text}])
    }

    const handleSubmit = async (e) => {
        e && e.preventDefault()
        if(!input.trim()) return
        appendMessage('user', input)
        setInput('')
        setStreaming(true)
        // POST to /api/query/chat and stream response
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${backendUrl}/api/query/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: input, top_k: 5 })
        })
        if(!res.ok){
            appendMessage('assistant', 'Error: ' + (await res.text()))
            setStreaming(false)
            return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        let assistantText = ''
        let currentRetrieved = []
        while(true){
            const {done, value} = await reader.read()
            if(done) break
            buf += decoder.decode(value, {stream:true})
            // SSE-like parsing: extract blocks separated by \n\n
            let parts = buf.split('\n\n')
            buf = parts.pop() // leftover
            for(const part of parts){
                const line = part.trim()
                if(!line) continue
                if(line.startsWith('data:')){
                    const payload = line.replace(/^data:\s*/, '')
                    try{
                        const obj = JSON.parse(payload)
                        if(obj.type === 'retrieved'){
                            currentRetrieved = obj.items
                            setRetrieved(obj.items)
                        } else if(obj.type === 'token'){
                            assistantText += obj.token
                            // optimistic render
                            const last = messages[messages.length-1]
                            setMessages(prev => {
                                // if last message is assistant in progress, replace it
                                const copy = prev.slice()
                                if(copy.length>0 && copy[copy.length-1].role==='assistant' && copy[copy.length-1].id==='__inflight'){
                                    copy[copy.length-1].text = assistantText
                                } else {
                                    copy.push({role:'assistant', text: assistantText, id:'__inflight'})
                                }
                                return copy
                            })
                        } else if(obj.type === 'done'){
                            // finalize
                            setMessages(prev => {
                                const copy = prev.slice()
                                // replace inflight id
                                if(copy.length>0 && copy[copy.length-1].id==='__inflight'){
                                    copy[copy.length-1].id = Date.now().toString()
                                }
                                return copy
                            })
                            setCurrentResponseId(Date.now().toString())
                        }
                    }catch(err){
                        console.error('parse error', err)
                    }
                }
            }
        }
        setStreaming(false)
    }

    return (
        <div>
            <div className="chat-window" ref={scrollRef}>
                {messages.map((m, idx)=> (
                    <div key={idx} className={`message ${m.role}`}><strong>{m.role}:</strong> {m.text}</div>
                ))}
            </div>
            <form onSubmit={handleSubmit} style={{marginTop:8, display:'flex', gap:8}}>
                <input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question..." />
                <button className={`btn ${streaming ? '' : 'btn-primary'}`} type="submit">{streaming ? 'Streaming...' : 'Send'}</button>
            </form>
        </div>
    )
}
