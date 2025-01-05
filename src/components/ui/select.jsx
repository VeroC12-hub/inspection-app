import React from 'react';

function Select({ value, onValueChange, children }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
    >
      {children}
    </select>
  );
}

function SelectTrigger({ children }) {
  return children;
}

function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }) {
  return children;
}

function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };