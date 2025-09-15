import { useState } from 'react'

export default function IngestForm(){
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState('')

    const handleUpload = async (e) => {
        e.preventDefault()
        if(!file) return
        const fd = new FormData()
        fd.append('file', file)
        fd.append('max_tokens', '500')
        fd.append('overlap', '100')
        setStatus('Uploading...')
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${backendUrl}/api/ingest/file`, { method:'POST', body: fd })
        if(res.ok){
            const data = await res.json()
            setStatus('Ingestion started for ' + data.filename)
        } else {
            setStatus('Upload failed: ' + await res.text())
        }
    }

    return (
        <div>
            <h3>Ingest Documents</h3>
            <form onSubmit={handleUpload} style={{display:'flex', gap:8, flexDirection:'column'}}>
                <input type="file" onChange={e=>setFile(e.target.files[0])} />
                <div style={{display:'flex', gap:8}}>
                    <button className="btn btn-primary" type="submit">Upload & Ingest</button>
                </div>
            </form>
            <div className="small" style={{marginTop:8}}>{status}</div>
        </div>
    )
}
