import { useState, useEffect } from "react";

// ============================================================
// Bài tập 1 — useEffect Lifecycle
// ============================================================
// Mục tiêu: Hiểu thứ tự chạy mount → update → unmount
//
// Yêu cầu:
// 1. Khi component mount: set document.title = "LifecycleDemo loaded"
// 2. Khi count thay đổi: console.log("Count updated: X")
// 3. Khi component unmount (cleanup): reset document.title = "React App"
// 4. Thêm console.log("Render") ở đầu component body để thấy
//    thứ tự: Render → Effect → (Render → Cleanup → Effect) → ...
//
// Kết quả kỳ vọng trong Console khi mở trang:
//   "Render"
//   "Component mounted"          ← useEffect([])
//   "Count updated: 0"           ← useEffect([count])
//
// Sau khi click tăng count:
//   "Render"
//   "Cleanup count effect"       ← cleanup của effect trước
//   "Count updated: 1"           ← effect mới
// ============================================================

// TODO: Xây dựng component LifecycleDemo
// Gợi ý cấu trúc:
//
// function LifecycleDemo() {
//   console.log("Render"); // chạy mỗi lần render
//
//   const [count, setCount] = useState(0);
//
//   // Effect 1: chỉ chạy khi mount
//   useEffect(() => {
//     // TODO: set document.title
//     console.log("Component mounted");
//
//     return () => {
//       // TODO: reset document.title
//       console.log("Component unmounted");
//     };
//   }, []);
//
//   // Effect 2: chạy khi count thay đổi
//   useEffect(() => {
//     // TODO: log count
//
//     return () => {
//       console.log("Cleanup count effect");
//     };
//   }, [count]);
//
//   return (
//     <div>
//       <p>Count: {count}</p>
//       <button onClick={() => setCount(c => c + 1)}>Tăng count</button>
//     </div>
//   );
// }

function LifecycleDemo() {
  console.log("Render");

  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = "LifecycleDemo loaded";
    console.log("Component mounted");

    return () => {
      document.title = "React App";
      console.log("Component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log(`Count updated: ${count}`);

    return () => {
      console.log("Cleanup count effect");
    };
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Tăng count</button>
    </div>
  );
}

// Wrapper để demo mount/unmount
function App() {
  const [show, setShow] = useState(true);

  return (
    <div>
      <button onClick={() => setShow((s) => !s)}>
        {show ? "Unmount component" : "Mount component"}
      </button>
      {/* Unmount bằng cách ẩn component — observer cleanup trong console */}
      {show && <LifecycleDemo />}
    </div>
  );
}

export default App;
