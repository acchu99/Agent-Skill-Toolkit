---
name: Client-Side CSV Export
description: Browser-native CSV blob generation utility.
---

# Native Client-Side CSV Export

## Overview
A lightweight pattern to convert state data (or mock data, table items, logs) into a downloadable `.csv` file directly within the browser, without requiring any backend generation step.

## Prerequisites
- None. This uses standard browser APIs (`Blob` and `URL.createObjectURL`).

## Step-by-Step Implementation Guide

### 1. Build the Export Utility
Define the function that formats the JSON/Array of objects into CSV format.

```typescript
export const exportCSV = (dataList: any[], filename: string = 'export.csv') => {
  if (!dataList || dataList.length === 0) {
    console.warn("No data provided for CSV export.");
    return;
  }

  // 1. Define your headers based on object keys (or hardcode them)
  const headers = ['ID', 'Name', 'Status', 'Created At'].join(',') + '\n';
  
  // 2. Map data to rows, ensuring you wrap string fields in quotes to escape potential commas inside the data
  const rows = dataList.map(item => {
    // Example fields. Adjust according to your dataset.
    return [
      item.id,
      `"${item.name || ''}"`, // Wrap strings that might contain commas
      item.status,
      item.created_at
    ].join(',');
  }).join('\n');
  
  // 3. Create a Blob with the CSV content
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  
  // 4. Generate a temporary URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // 5. Create a hidden <a> link, trigger click, and cleanup
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Append for Firefox support
  document.body.appendChild(a); 
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

### 2. Attach to UI
Hook this utility up to a button in your React component. If you have active filters applied to an array, ensure you pass the *filtered* array so the user only downloads what they see.

```tsx
<button 
  className="btn btn-primary" 
  onClick={() => exportCSV(filteredLogs, 'audit_logs_export.csv')}
>
  Export to CSV
</button>
```

## Gotchas & Warnings
- **Comma escapes:** If your data fields might contain commas (like a description or name field), you MUST wrap those fields in double quotes (`"${item.desc}"`) when joining your string array. Otherwise, Excel/CSV parsers will split the single field into two columns.
- **Quote escapes:** If text strings contain double quotes naturally, they need to be escaped per CSV RFC standard (usually by doubling them `""`).
- **Memory leaks:** Always call `URL.revokeObjectURL(url)` to free up browser memory after the download begins. If this is omitted, the Blob will remain in memory until the document is unloaded.
