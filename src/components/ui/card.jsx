function Card({ children, className = "" }) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        {children}
      </div>
    )
  }
  
  function CardHeader({ children, className = "" }) {
    return (
      <div className={`p-4 border-b ${className}`}>
        {children}
      </div>
    )
  }
  
  function CardContent({ children, className = "" }) {
    return (
      <div className={`p-4 ${className}`}>
        {children}
      </div>
    )
  }
  
  export { Card, CardHeader, CardContent }