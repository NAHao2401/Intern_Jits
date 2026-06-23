import { useState } from "react";

// ============================================================
// SearchBar component
// ============================================================
// Props:
//   onSearch  (function) — gọi khi user submit (click hoặc Enter)
//   inputRef  (ref)      — để App auto-focus khi mount
//
// Lưu ý: inputRef được truyền từ App xuống — đây là pattern
// "forwarding ref" đơn giản qua prop thông thường.
// Cách đúng hơn dùng React.forwardRef, nhưng truyền ref qua prop
// cũng hoạt động tốt cho bài tập này.
// ============================================================

// TODO: Xây dựng SearchBar component
//
// State nội bộ: inputValue — giá trị đang gõ trong input
// (khác với username ở App — đây là "draft" trước khi submit)
//
// handleSubmit:
//   - Gọi onSearch(inputValue)
//
// Render:
//   <div className="search-bar">
//     <input
//       ref={inputRef}
//       type="text"
//       placeholder="Nhập GitHub username..."
//       value={inputValue}
//       onChange={...}
//       onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//     />
//     <button onClick={handleSubmit} disabled={!inputValue.trim()}>
//       Tìm kiếm
//     </button>
//   </div>

function SearchBar({ onSearch, inputRef }) {
  // TODO: implement
  const [inputValue, setInputValue] = useState("");

  function handleSubmit() {
    if (!inputValue.trim()) {
      return;
    }

    onSearch(inputValue.trim());
  }
  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        type="text"
        placeholder="Nhập GitHub username... (vd: torvalds, gaearon)"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit}
      />
      <button onClick={handleSubmit} disabled={!inputValue.trim()}>
        Tìm kiếm
      </button>
    </div>
  );
}

export default SearchBar;
