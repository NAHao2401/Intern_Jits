// ============================================================
// SearchHistory component
// ============================================================
// Props:
//   history  (string[]) — mảng username đã tìm gần nhất (tối đa 5)
//   onSelect (function) — gọi khi click vào history item
//
// Render:
//   <div className="search-history">
//     <span className="history-label">Gần đây:</span>
//     {history.map(h => (
//       <button key={h} className="history-item" onClick={() => onSelect(h)}>
//         {h}
//       </button>
//     ))}
//   </div>
// ============================================================

// TODO: implement SearchHistory component

function SearchHistory({ history, onSelect }) {
  // TODO: implement
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="search-history">
      <span className="history-label">Gần đây:</span>
      {history.map((h) => (
        <button key={h} className="history-item" onClick={() => onSelect(h)}>
          {h}
        </button>
      ))}
    </div>
  );
}

export default SearchHistory;
