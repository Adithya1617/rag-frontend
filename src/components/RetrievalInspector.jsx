import React from 'react'
export default function RetrievalInspector({ retrieved }){
    return (
        <div>
            <h3>Retrieved Chunks</h3>
            <div className="retrieval">
                {retrieved && retrieved.length>0 ? retrieved.map((r, i)=> (
                    <div key={i} style={{padding:8, borderBottom:'1px solid #f3f4f6'}}>
                        <div style={{fontSize:13}}><strong>Score:</strong> {r.score}</div>
                        <div style={{marginTop:6}}>{r.text}</div>
                        <div style={{marginTop:6}} className="small">Source: {r.metadata?.source || r.source || 'unknown'}</div>
                    </div>
                )) : <div className="small">No retrieved chunks yet</div>}
            </div>
        </div>
    )
}
