// ============================================================
// RepoCard component
// ============================================================
// Props:
//   repo (object) — một repo từ GitHub API /users/:username/repos
//
// GitHub API trả về (field cần dùng):
//   repo.id               — unique id
//   repo.name             — tên repo
//   repo.description      — mô tả (có thể null)
//   repo.html_url         — link GitHub
//   repo.language         — ngôn ngữ chính (có thể null)
//   repo.stargazers_count — số stars
//   repo.forks_count      — số forks
//   repo.updated_at       — lần cập nhật cuối (ISO string)
//
// Render dưới dạng thẻ <a> mở tab mới (target="_blank"):
//   - Tên repo (className="repo-name")
//   - Description nếu có (className="repo-description")
//   - Meta: ngôn ngữ | stars | forks
//
// Click → mở link GitHub trong tab mới
// ============================================================

// TODO: implement RepoCard component
//
// Gợi ý:
// function RepoCard({ repo }) {
//   return (
//     <a
//       className="repo-card"
//       href={repo.html_url}
//       target="_blank"
//       rel="noreferrer"
//     >
//       <div className="repo-name">{repo.name}</div>
//       {repo.description && (
//         <div className="repo-description">{repo.description}</div>
//       )}
//       <div className="repo-meta">
//         {repo.language && (
//           <span className="repo-lang">
//             <span className="lang-dot" />
//             {repo.language}
//           </span>
//         )}
//         <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
//         <span>🍴 {repo.forks_count.toLocaleString()}</span>
//       </div>
//     </a>
//   );
// }

function RepoCard({ repo }) {
  // TODO: implement — thay placeholder bằng UI thực
  return (
    <a
      className="repo-card"
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
    >
      <div className="repo-name">{repo.name}</div>
      {repo.description && (
        <div className="repo-description">{repo.description}</div>
      )}
      <div className="repo-meta">
        {
          /* TODO: thêm ngôn ngữ, stars, forks */
          repo.language && (
            <span className="repo-lang">
              <span className="lang-dot" />
              {repo.language}
            </span>
          )
        }

        <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
        <span>🍴 {repo.forks_count.toLocaleString()}</span>
      </div>
    </a>
  );
}

export default RepoCard;
