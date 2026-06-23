# Day 7 - useEffect, API Calls & Mini Project Tổng Hợp

**Mục tiêu:** Nắm vững useEffect (lifecycle đầy đủ), gọi API thực tế với loading/error state, controlled forms — rồi kết hợp tất cả kiến thức Day 6-7 vào một mini project hoàn chỉnh.

Sau Day 7, thực tập sinh có thể:
- Giải thích useEffect chạy khi nào với mỗi dạng dependency array
- Gọi API trong useEffect, xử lý loading/error state đúng chuẩn
- Tránh race condition khi fetch API trong useEffect
- Xây dựng controlled form với validation
- Kết hợp component tree, props, useState, useEffect, API call, routing vào 1 app hoàn chỉnh

---

## Câu hỏi tìm hiểu trước

Trước khi học, nghĩ qua và trả lời các câu hỏi sau:

**useEffect**
- Side effect là gì? Cho 3 ví dụ side effect trong một React component.
- Tại sao không nên gọi API trực tiếp trong function body của component (ngoài hook)?
- Cleanup function trong useEffect trả về là gì? Khi nào nó chạy?
- Nếu useEffect có dependency array `[userId]` và userId thay đổi từ 1 → 2, thứ tự chạy là gì?

**API & async**
- Tại sao không thể viết `useEffect(async () => {...})` trực tiếp?
- Race condition trong fetch API là gì? Ví dụ?
- HTTP status 404 và network error khác nhau thế nào khi dùng `fetch()`?

**Forms**
- Controlled component là gì? Khác uncontrolled component thế nào?
- Tại sao nên dùng controlled form trong React thay vì `document.getElementById()`?

---

## Phần 0 - Recap & Setup

### Kiến thức đã có (Day 6)

```
useState    — lưu data cần hiển thị trên UI
useRef      — DOM access, lưu giá trị không trigger re-render
useMemo     — cache kết quả tính toán nặng
useCallback — cache function reference, tránh re-render child thừa
Props       — truyền data từ cha xuống con (read-only)
Component   — function trả về JSX
```

### Hôm nay thêm

```
useEffect   — side effects: fetch API, subscribe, document title, timer
Controlled forms — input value gắn với state
API pattern — loading / error / data state
```

### Setup project

```bash
npm create vite@latest day7-react -- --template react
cd day7-react
npm install
npm run dev
```

---

## Phần 1 - useEffect: Lifecycle đầy đủ

### Side effect là gì?

Side effect = bất kỳ thứ gì component làm **ngoài việc render UI**:
- Gọi API (fetch data)
- Subscribe event (WebSocket, window resize)
- Cập nhật document.title
- Set timer (setTimeout, setInterval)
- Ghi localStorage

React cần kiểm soát side effects qua `useEffect` để đảm bảo chúng chạy đúng lúc và được dọn dẹp đúng cách.

### Cú pháp và dependency array

```jsx
import { useEffect } from "react";

// Dạng 1: Không có deps — chạy SAU MỖI lần render
useEffect(() => {
  console.log("Render xong");
});
// Cảnh báo: Thường không dùng dạng này — dễ gây infinite loop nếu có setState bên trong

// Dạng 2: Deps rỗng [] — chạy MỘT LẦN sau render đầu tiên (mount)
useEffect(() => {
  console.log("Component mount");
  // Thường dùng để: fetch data lần đầu, subscribe events
}, []);

// Dạng 3: Deps có giá trị — chạy khi giá trị trong deps thay đổi
useEffect(() => {
  console.log("userId thay đổi:", userId);
  // Fetch lại data khi userId thay đổi
}, [userId]);
```

### Thứ tự chạy — hiểu rõ lifecycle

```
MOUNT (lần đầu tiên):
  1. Component function chạy → JSX render
  2. React update DOM
  3. useEffect([]) chạy
  4. useEffect([dep]) chạy

UPDATE (state/props thay đổi):
  1. Component function chạy lại → JSX re-render
  2. React update DOM
  3. Cleanup của effect trước (nếu có) chạy
  4. useEffect([dep]) chạy lại NẾU dep thay đổi

UNMOUNT (component bị xóa khỏi tree):
  1. Cleanup function của tất cả effects chạy
```

### Cleanup function

```jsx
import { useState, useEffect } from "react";

function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    // Subscribe
    window.addEventListener("resize", handleResize);

    // Cleanup: PHẢI remove listener khi component unmount
    // Nếu không cleanup: listener tích lũy mỗi lần re-render → memory leak
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // [] = chỉ subscribe một lần khi mount

  return <p>{size.width} x {size.height}</p>;
}
```

```jsx
// Cleanup với timer
function AutoSave({ data }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Auto saving...", data);
    }, 2000); // save sau 2 giây không thao tác

    // Nếu data thay đổi trước khi timer chạy → cancel timer cũ, tạo timer mới
    return () => clearTimeout(timer);
  }, [data]); // chạy lại mỗi khi data thay đổi

  return <span>Sẽ tự lưu sau 2 giây...</span>;
}
```

---

## Phần 2 - Gọi API trong useEffect

### Pattern chuẩn: loading / error / data

```jsx
import { useState, useEffect } from "react";

function UserList() {
  // Ba state cho mọi API call
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);   // true = đang tải
  const [error, setError] = useState(null);        // null = không có lỗi

  useEffect(() => {
    // KHÔNG viết async trực tiếp vào useEffect callback
    // Vì: useEffect callback phải return cleanup function hoặc undefined
    //     async function trả về Promise — React sẽ cảnh báo

    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null); // reset lỗi cũ

        const response = await fetch("https://jsonplaceholder.typicode.com/users");

        // fetch() KHÔNG throw error cho HTTP 4xx/5xx
        // Phải check response.ok thủ công
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message); // lưu error message vào state
      } finally {
        setLoading(false); // tắt loading dù thành công hay lỗi
      }
    }

    fetchUsers();
  }, []); // [] = fetch 1 lần khi mount

  // Render dựa theo state
  if (loading) return <p>Đang tải...</p>;
  if (error)   return <p style={{ color: "red" }}>Lỗi: {error}</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  );
}
```

### Fetch lại khi parameter thay đổi

```jsx
function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mỗi khi userId thay đổi, effect này chạy lại
    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!res.ok) throw new Error(`User ${userId} not found`);

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // dependency: chạy lại khi userId thay đổi

  if (loading) return <p>Đang tải user {userId}...</p>;
  if (error)   return <p>Lỗi: {error}</p>;
  if (!user)   return null;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### Tránh race condition với AbortController

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    // Race condition: user gõ nhanh → nhiều request bay ra
    // Request sau trả về trước → kết quả cũ đè lên kết quả mới
    // AbortController cho phép cancel request cũ khi effect chạy lại

    const controller = new AbortController();

    async function fetchResults() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/posts?title=${query}`,
          { signal: controller.signal } // gắn signal vào fetch
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name === "AbortError") {
          // Request bị cancel — không phải lỗi thực sự, bỏ qua
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

    // Cleanup: cancel request khi query thay đổi (effect chạy lại)
    return () => controller.abort();
  }, [query]);

  if (loading) return <p>Searching...</p>;
  return <ul>{results.slice(0, 5).map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

---

## Phần 3 - Controlled Forms

### Uncontrolled vs Controlled

```jsx
// UNCONTROLLED — React không kiểm soát giá trị input
// Dùng useRef để đọc giá trị khi cần (submit)
function UncontrolledForm() {
  const nameRef = useRef();

  function handleSubmit(e) {
    e.preventDefault();
    console.log(nameRef.current.value); // đọc khi submit
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} type="text" />
      <button type="submit">Submit</button>
    </form>
  );
}

// CONTROLLED — React kiểm soát giá trị input qua state
// Mỗi keystroke → setName() → re-render → input hiển thị giá trị mới
function ControlledForm() {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log(name); // lấy từ state — luôn đúng
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}              // gắn value vào state
        onChange={(e) => setName(e.target.value)} // cập nhật state khi gõ
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Khi nào dùng Controlled:**
- Cần validate ngay khi gõ (real-time)
- Cần disable button dựa trên giá trị input
- Cần reset form sau submit
- Cần đồng bộ nhiều input với nhau

**Khi nào dùng Uncontrolled:**
- Form đơn giản, chỉ cần giá trị khi submit
- Integrate với non-React library
- File input (`<input type="file">` — không thể controlled)

### Form với nhiều field và validation

```jsx
import { useState } from "react";

// Quản lý nhiều field trong một object state
function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Single handler cho tất cả input — dùng e.target.name
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa error của field khi user bắt đầu sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên không được để trống";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault(); // ngăn browser reload trang

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // dừng nếu có lỗi
    }

    setSubmitting(true);
    try {
      // Gọi API (ví dụ JSONPlaceholder không có register endpoint
      // nên dùng POST users để demo)
      const res = await fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (!res.ok) throw new Error("Đăng ký thất bại");

      setSuccess(true);
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <p style={{ color: "green" }}>Đăng ký thành công!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Tên</label>
        <input
          type="text"
          name="name"           // phải khớp với key trong formData
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
      </div>

      <div>
        <label>Mật khẩu</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span style={{ color: "red" }}>{errors.password}</span>}
      </div>

      <div>
        <label>Xác nhận mật khẩu</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <span style={{ color: "red" }}>{errors.confirmPassword}</span>
        )}
      </div>

      {errors.submit && <p style={{ color: "red" }}>{errors.submit}</p>}

      {/* Disable button khi đang submit hoặc có lỗi */}
      <button type="submit" disabled={submitting}>
        {submitting ? "Đang đăng ký..." : "Đăng ký"}
      </button>
    </form>
  );
}
```

---

## Phần 4 - Tổng hợp: Component Communication Pattern

### Lift state up — chia sẻ state giữa các component

```
Vấn đề: Component A và Component B cùng cần dùng một state
Giải pháp: Đưa state lên component cha chung (lift state up)
           Truyền state và setter xuống con qua props
```

```jsx
// BAD — mỗi component giữ state riêng, không đồng bộ được
function App() {
  return (
    <div>
      <SearchBar />    {/* có state riêng */}
      <ResultList />   {/* không biết search query là gì */}
    </div>
  );
}

// GOOD — cha giữ state, truyền xuống con
function App() {
  const [query, setQuery] = useState("");         // state ở cha
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    // fetch...
  }, [query]);

  return (
    <div>
      <SearchBar query={query} onSearch={setQuery} />      {/* nhận query, gọi setQuery */}
      <ResultList results={results} loading={loading} />   {/* chỉ hiển thị */}
    </div>
  );
}

function SearchBar({ query, onSearch }) {
  return (
    <input
      value={query}
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Tìm kiếm..."
    />
  );
}

function ResultList({ results, loading }) {
  if (loading) return <p>Đang tìm...</p>;
  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

---

## Bài tập trong giờ

### Bài tập 1 — useEffect Lifecycle (exercises/01-useeffect-basics/App.jsx)

Tạo component `LifecycleDemo`:
- Mount: set document.title = "LifecycleDemo loaded"
- Có button tăng count — mỗi lần count thay đổi, log "Count updated: X"
- Unmount (cleanup): reset document.title = "React App"
- Thêm console.log để quan sát thứ tự chạy: render → effect → cleanup

**Kết quả kỳ vọng:** Mở DevTools Console, quan sát log theo thứ tự đúng.

---

### Bài tập 2 — Gọi API (exercises/02-api-call/App.jsx)

Dùng JSONPlaceholder API (`https://jsonplaceholder.typicode.com`).

Tạo component `PostList`:
- Fetch `GET /posts` khi mount
- Hiển thị loading spinner (có thể dùng text "Đang tải...") trong khi chờ
- Hiển thị danh sách posts (title + body preview 100 ký tự)
- Xử lý error: nếu fetch fail, hiển thị "Lỗi: [message]" và button "Thử lại"
- Button "Thử lại" gọi fetch lại (hint: dùng state `retryCount` trong dependency array)

**Hint:**
```jsx
const [retryCount, setRetryCount] = useState(0);

useEffect(() => {
  // fetch ở đây
}, [retryCount]); // tăng retryCount để trigger fetch lại

// Button: <button onClick={() => setRetryCount(c => c + 1)}>Thử lại</button>
```

---

### Bài tập 3 — Controlled Form (exercises/03-controlled-forms/App.jsx)

Xây dựng form tạo post mới:

**Fields:**
- `title` (text, required, min 5 ký tự)
- `body` (textarea, required, min 10 ký tự)
- `userId` (select 1-10, required)

**Yêu cầu:**
- Validate khi submit: hiển thị lỗi dưới mỗi field
- Submit gọi `POST https://jsonplaceholder.typicode.com/posts`
- Button submit disabled khi đang gửi
- Sau submit thành công: hiển thị response data (JSON) và reset form
- Sau submit thất bại: hiển thị error message

---

### Bài tập 4 — Loading/Error State Pattern (exercises/04-loading-error/App.jsx)

Tạo component `UserSelector`:
- Dropdown chọn userId từ 1-10
- Khi chọn user → fetch `GET /users/:id` và `GET /users/:id/posts`
- Hiển thị thông tin user + số posts của họ
- Xử lý đúng loading state (hiển thị loading khi đang fetch)
- Xử lý error state (nếu fetch fail, hiển thị lỗi)
- Khi chọn user mới → cancel request cũ (dùng AbortController)

---

### Bài tập 5 — Integration (exercises/05-integration/App.jsx)

Kết hợp tất cả kiến thức:

Tạo `PostManager`:
- Fetch và hiển thị danh sách posts (GET /posts?_limit=10)
- Search posts theo title (filter phía client, dùng `useMemo`)
- Click vào post → hiển thị detail (fetch GET /posts/:id/comments)
- Form tạo post mới (POST /posts) — thêm vào đầu danh sách khi thành công
- Mỗi post có button "Xóa" (DELETE /posts/:id) — xóa khỏi UI khi thành công

**Sử dụng:**
- `useState` cho posts, selectedPost, comments, search, form data
- `useEffect` cho fetch posts (mount) và fetch comments (khi selectedPost thay đổi)
- `useMemo` cho filtered posts
- `useCallback` cho handleDelete, handleCreate (tránh re-render)

---

## Mini Project — GitHub User Explorer

Xây dựng app tìm kiếm và xem thông tin GitHub user. Dùng GitHub API (public, không cần auth).

**API endpoints:**
```
GET https://api.github.com/users/{username}          — thông tin user
GET https://api.github.com/users/{username}/repos    — danh sách repos
```

**Yêu cầu chức năng:**
1. Search: ô nhập username → click "Tìm kiếm" hoặc nhấn Enter
2. Profile card: avatar, tên, bio, location, followers/following, số repos
3. Repos list: tên repo, description, ngôn ngữ, stars, forks — sort theo stars (desc)
4. Loading state khi đang fetch
5. Error state: "User not found" (404) hoặc lỗi network
6. Empty state: "Nhập username để tìm kiếm"
7. Click vào repo → mở link GitHub trong tab mới
8. Lưu lịch sử tìm kiếm gần nhất (5 username) bằng `localStorage`
   - Hiển thị lịch sử dưới search bar
   - Click vào history item → tìm kiếm lại user đó

**Yêu cầu kỹ thuật (phải dùng đủ):**

| Hook | Dùng cho |
|---|---|
| `useState` | username input, userData, repos, loading, error, searchHistory |
| `useEffect` | fetch user + repos khi username thay đổi; sync history vào localStorage |
| `useMemo` | sort repos theo stars |
| `useCallback` | handleSearch (truyền xuống SearchBar) |
| `useRef` | auto-focus search input khi mount |

**Cấu trúc component bắt buộc:**

```
App
├── SearchBar         — input + button, nhận onSearch callback
├── SearchHistory     — hiển thị 5 username gần nhất
├── UserProfile       — avatar, bio, stats (nhận userData prop)
└── RepoList          — danh sách repos (nhận repos prop)
    └── RepoCard      — một repo item
```

**Cấu trúc file:**

```
mini-project/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── components/
    │   ├── SearchBar.jsx
    │   ├── SearchHistory.jsx
    │   ├── UserProfile.jsx
    │   ├── RepoList.jsx
    │   └── RepoCard.jsx
    ├── App.jsx
    ├── App.css
    └── main.jsx
```

**Chạy:**

```bash
cd mini-project
npm install
npm run dev
```

**Gợi ý triển khai App.jsx:**

```jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import SearchBar from "./components/SearchBar";
import SearchHistory from "./components/SearchHistory";
import UserProfile from "./components/UserProfile";
import RepoList from "./components/RepoList";

const HISTORY_KEY = "github_search_history";
const MAX_HISTORY = 5;

function App() {
  const [username, setUsername] = useState("");          // username đang xem
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() => {
    // Lazy initial state — đọc từ localStorage một lần khi mount
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const searchInputRef = useRef(null);

  // Auto-focus search input khi mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Fetch khi username thay đổi
  useEffect(() => {
    if (!username) {
      setUserData(null);
      setRepos([]);
      return;
    }

    const controller = new AbortController();

    async function fetchGitHubData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch song song (Promise.all) để nhanh hơn
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`, { signal: controller.signal }),
          fetch(`https://api.github.com/users/${username}/repos?per_page=30`, { signal: controller.signal }),
        ]);

        if (userRes.status === 404) throw new Error("User not found");
        if (!userRes.ok) throw new Error(`GitHub API error: ${userRes.status}`);

        const [user, repoList] = await Promise.all([
          userRes.json(),
          reposRes.json(),
        ]);

        setUserData(user);
        setRepos(repoList);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        setUserData(null);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubData();
    return () => controller.abort();
  }, [username]);

  // Sync history vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Sort repos theo stars — cache với useMemo
  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  }, [repos]);

  // handleSearch — cache với useCallback để SearchBar không re-render thừa
  const handleSearch = useCallback((searchUsername) => {
    const trimmed = searchUsername.trim();
    if (!trimmed || trimmed === username) return;

    setUsername(trimmed);

    // Thêm vào history, loại trùng, giữ tối đa MAX_HISTORY
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX_HISTORY);
    });
  }, [username]);

  return (
    <div className="app">
      <h1>GitHub User Explorer</h1>

      <SearchBar onSearch={handleSearch} inputRef={searchInputRef} />

      {searchHistory.length > 0 && (
        <SearchHistory history={searchHistory} onSelect={handleSearch} />
      )}

      {/* Render theo state */}
      {!username && <p className="empty-state">Nhập username để tìm kiếm</p>}
      {loading && <p className="loading">Đang tải...</p>}
      {error && <p className="error">Lỗi: {error}</p>}
      {userData && !loading && (
        <>
          <UserProfile user={userData} />
          <RepoList repos={sortedRepos} />
        </>
      )}
    </div>
  );
}

export default App;
```

---

## Tiêu chí đánh giá (Pass >= 70/100)

### Bài tập trong giờ (40 điểm)

| Bài tập | Điểm | Tiêu chí |
|---|---|---|
| BT1 — useEffect lifecycle | 8 | Log đúng thứ tự mount/update/unmount; cleanup chạy đúng |
| BT2 — API call | 8 | Loading/error/data state đúng; button retry hoạt động |
| BT3 — Controlled form | 8 | Validation đúng; submit gọi API; reset form sau thành công |
| BT4 — Loading/Error pattern | 8 | AbortController cancel request cũ; hiển thị đúng state |
| BT5 — Integration | 8 | Tất cả CRUD hoạt động; useMemo/useCallback dùng đúng chỗ |

### Mini Project (60 điểm)

| Hạng mục | Điểm | Tiêu chí |
|---|---|---|
| Search + fetch đúng | 12 | Fetch user + repos khi submit search; AbortController |
| Loading/Error/Empty state | 10 | 3 state hiển thị đúng; 404 có message rõ ràng |
| UserProfile component | 10 | Hiển thị đủ: avatar, name, bio, stats |
| RepoList + sort | 10 | Danh sách repos, sort theo stars, click mở tab mới |
| Search history | 10 | Lưu/đọc localStorage, hiển thị, click để search lại |
| Hook usage | 8 | Dùng đủ 5 hooks đúng mục đích (không dùng thừa/thiếu) |

**Fail ngay nếu:**
- Gọi `fetch()` trực tiếp trong function body component (không trong useEffect)
- Không xử lý loading state — UI trống hoàn toàn khi đang fetch
- Không xử lý error — app crash hoặc hiển thị blank khi API fail
- Mutate state trực tiếp (`.push()`, `.name = "..."`)
- useEffect không có dependency array (chạy vô hạn)
- Async function trực tiếp trong useEffect callback: `useEffect(async () => {...})`
- `key` prop dùng index cho list có thể thay đổi thứ tự

---

## Câu hỏi tự kiểm tra sau khi học

1. useEffect với `[]` và không có dependency array khác nhau thế nào? Khi nào dùng cái nào?
2. Tại sao `useEffect(async () => {...}, [])` là sai? Cách đúng là gì?
3. Giải thích race condition trong fetch và cách AbortController giải quyết.
4. Controlled form vs uncontrolled form — khi nào dùng cái nào?
5. Khi nào cần "lift state up"? Cho ví dụ.
6. `fetch("/api/users")` trả về response.ok = false — có throw error không? Phải xử lý thế nào?

---

## Tài liệu tham khảo

**Bắt buộc đọc:**
- [React - Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React - useEffect Reference](https://react.dev/reference/react/useEffect)
- [React - Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)

**Đọc thêm:**
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN - AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [GitHub REST API - Users](https://docs.github.com/en/rest/users/users)

---

*Stuck quá 15 phút với một bài -> hỏi mentor ngay.*
