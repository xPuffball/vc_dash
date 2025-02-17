export const Alert = ({ children, className = '' }) => (
    <div className={`bg-blue-50 border-l-4 border-blue-500 p-4 ${className}`}>
      {children}
    </div>
  );
  
  export const AlertDescription = ({ children }) => (
    <div className="text-sm text-gray-600">
      {children}
    </div>
  );