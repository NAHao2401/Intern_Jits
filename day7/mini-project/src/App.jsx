import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import SearchBar from "./components/SearchBar";
import SearchHistory from "./components/SearchHistory";
import UserProfile from "./components/UserProfile";
import RepoList from "./components/RepoList";
import "./App.css";

// ============================================================
// Mini Project — GitHub User Explorer
// ============================================================
// Tìm kiếm thông tin GitHub user + danh sách repos
//
// API (public, không cần auth):
//   GET https://api.github.com/users/{username}
//   GET https://api.github.com/users/{username}/repos?per_page=30
//
// Chú ý rate limit: 60 request/giờ khi không auth
// Nếu bị rate limit (status 403) → hiện thông báo rõ ràng
//
// Luồng:
//   1. User nhập username → click Search hoặc Enter
//   2. App fetch user + repos song song (Promise.all)
//   3. Lưu username vào localStorage history
//   4. Render UserProfile + RepoList
//
// Hooks bắt buộc sử dụng:
//   useState    — username, userData, repos, loading, error, searchHistory
//   useEffect   — fetch GitHub data; sync history vào localStorage
//   useMemo     — sort repos theo stargazers_count desc
//   useCallback — handleSearch (tránh SearchBar re-render thừa)
//   useRef      — auto-focus search input khi mount
// ============================================================

const HISTORY_KEY = "github_search_history";
const MAX_HISTORY = 5;

function App() {
  // TODO: Khai báo state
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lazy initial state — đọc history từ localStorage một lần
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // TODO: useRef cho search input (truyền xuống SearchBar)
  const searchInputRef = useRef(null);

  // TODO: useEffect — auto-focus khi mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // TODO: useEffect — fetch GitHub data khi username thay đổi
  // - Nếu username rỗng: clear state, return
  // - Tạo AbortController
  // - Promise.all([fetch user, fetch repos])
  // - Handle 404: "User not found"
  // - Handle 403: "GitHub rate limit exceeded. Try again in 1 hour."
  // - Handle AbortError: return sớm
  // - Cleanup: controller.abort()

  useEffect(() => {
    if (!username) {
      setUserData(null);
      setRepos([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchGitHubData() {
      try {
        setLoading(true);
        setError(null);
        setUserData(null);
        setRepos([]);

        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`, {
            signal: controller.signal,
          }),
          fetch(`https://api.github.com/users/${username}/repos?per_page=30`, {
            signal: controller.signal,
          }),
        ]);

        if (useRef.status === 404) {
          throw new Error("User not found");
        }

        if (userRes.status === 403 || reposRes.status === 403) {
          throw new Error("GitHub rate limit exceeded. Try again in 1 hour.");
        }

        if (!userRes.ok) {
          throw new Error("Không thể tải thông tin user");
        }

        if (!reposRes.ok) {
          throw new Error("Không thể tải danh sách repos");
        }

        const [user, repolist] = await Promise.all([
          userRes.json(),
          reposRes.json(),
        ]);

        setUserData(user);
        setRepos(repolist);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubData();

    return () => {
      controller.abort();
    };
  }, [username]);

  // TODO: useEffect — sync history vào localStorage khi searchHistory thay đổi

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
  }, [searchHistory]);
  // TODO: useMemo — sort repos
  // const sortedRepos = useMemo(() => {
  //   return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  // }, [repos]);

  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => b.stargazer_count - a.stargazer_count);
  }, [repos]);

  // TODO: useCallback — handleSearch
  const handleSearch = useCallback(
    (searchUsername) => {
      const trimmed = searchUsername.trim();
      if (!trimmed || trimmed === username) return;

      setUsername(trimmed);

      // Thêm vào history: loại trùng + giữ tối đa MAX_HISTORY
      setSearchHistory((prev) => {
        const filtered = prev.filter((h) => h !== trimmed);
        return [trimmed, ...filtered].slice(0, MAX_HISTORY);
      });
    },
    [username],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>GitHub User Explorer</h1>
      </header>

      <main className="app-main">
        {/* TODO: Render SearchBar với inputRef và onSearch */}
        <SearchBar onSearch={handleSearch} inputRef={searchInputRef} />

        {/* TODO: Render SearchHistory nếu có history */}
        {searchHistory.length > 0 && (
          <SearchHistory history={searchHistory} onSelect={handleSearch} />
        )}

        {/* TODO: Render theo state */}
        {/* Empty state */}
        {!username && <p className="empty-state">Nhập username để tìm kiếm</p>}

        {/* Loading */}
        {loading && <div className="loading">Đang tải...</div>}

        {/* Error */}
        {error && !loading && <p className="error">{error}</p>}

        {/* Result */}
        {userData && !loading && !error && (
          <>
            <UserProfile user={userData} />
            <RepoList repos={sortedRepos} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
