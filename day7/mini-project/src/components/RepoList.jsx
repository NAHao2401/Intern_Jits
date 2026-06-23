import RepoCard from "./RepoCard";

// ============================================================
// RepoList component
// ============================================================
// Props:
//   repos (array) — danh sách repo đã sort theo stars (từ App)
//
// Render:
//   - Tiêu đề "Repositories (X)"
//   - Empty state nếu repos rỗng
//   - Danh sách RepoCard
// ============================================================

function RepoList({ repos }) {
  if (repos.length === 0) {
    return <p style={{ color: "#57606a" }}>User này chưa có repo công khai.</p>;
  }

  return (
    <div className="repo-list">
      <h2>Repositories ({repos.length})</h2>
      {/* TODO: render RepoCard cho từng repo */}
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

export default RepoList;
