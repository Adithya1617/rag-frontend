

export default function SimpleApp() {
  console.log('SimpleApp rendering...')
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🎉 React App is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <p>Backend URL: {import.meta.env.VITE_BACKEND_URL}</p>
      <p>Environment: {import.meta.env.MODE}</p>
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>React: ✅ Working</li>
          <li>Vite: ✅ Working</li>
          <li>CSS: ✅ Working</li>
          <li>Environment Variables: {import.meta.env.VITE_BACKEND_URL ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  )
}