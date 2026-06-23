// ============================================================
// UserProfile component
// ============================================================
// Props:
//   user (object) — data từ GitHub API /users/:username
//
// GitHub API trả về (các field cần dùng):
//   user.avatar_url    — URL ảnh đại diện
//   user.name          — tên hiển thị (có thể null)
//   user.login         — username (luôn có)
//   user.bio           — mô tả (có thể null)
//   user.location      — địa điểm (có thể null)
//   user.public_repos  — số repos công khai
//   user.followers     — số người theo dõi
//   user.following     — số người đang theo dõi
//   user.html_url      — link GitHub profile
//
// Hiển thị:
//   - Avatar (img với className="user-avatar")
//   - Tên (name hoặc login nếu name null)
//   - @login (className="user-login")
//   - Bio nếu có
//   - Location nếu có
//   - Stats: X repos | X followers | X following
//   - Link đến GitHub profile
// ============================================================

// TODO: implement UserProfile component
//
// Gợi ý:
// function UserProfile({ user }) {
//   return (
//     <div className="user-profile">
//       <img className="user-avatar" src={user.avatar_url} alt={user.login} />
//       <div className="user-info">
//         <h2>{user.name || user.login}</h2>
//         <p className="user-login">@{user.login}</p>
//         {user.bio && <p className="user-bio">{user.bio}</p>}
//         {user.location && <p>📍 {user.location}</p>}
//         <div className="user-stats">
//           <span><strong>{user.public_repos}</strong> repos</span>
//           <span><strong>{user.followers}</strong> followers</span>
//           <span><strong>{user.following}</strong> following</span>
//         </div>
//         <a href={user.html_url} target="_blank" rel="noreferrer">
//           Xem trên GitHub
//         </a>
//       </div>
//     </div>
//   );
// }

function UserProfile({ user }) {
  // TODO: implement — thay placeholder bằng UI thực
  return (
    <div className="user-profile">
      <img className="user-avatar" src={user.avatar_url} alt={user.login} />
      <div className="user-info">
        <h2>{user.name || user.login}</h2>
        <p className="user-login">@{user.login}</p>
        {/* TODO: thêm bio, location, stats, link */}
        {user.bio && <p className="user-bio">{user.bio}</p>}
        {user.location && <p>📍 {user.location}</p>}
        <div className="user-stats">
          <span>
            <strong>{user.public_repos.toLocaleString()}</strong> repos
          </span>

          <span>
            <strong>{user.followers.toLocaleString()}</strong> followers
          </span>

          <span>
            <strong>{user.following.toLocaleString()}</strong> following
          </span>
        </div>

        <a href={user.html_url} target="_blank" rel="noreferrer">
          Xem trên GitHub
        </a>
      </div>
    </div>
  );
}

export default UserProfile;
