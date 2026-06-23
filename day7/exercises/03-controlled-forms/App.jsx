import { useState } from "react";

// ============================================================
// Bài tập 3 — Controlled Form với validation
// ============================================================
// Xây dựng form tạo post mới, POST lên JSONPlaceholder
//
// Fields:
//   - title: text, required, min 5 ký tự
//   - body: textarea, required, min 10 ký tự
//   - userId: select 1-10, required
//
// Yêu cầu:
// 1. Validate khi click submit — hiển thị lỗi bên dưới từng field
// 2. Gọi POST https://jsonplaceholder.typicode.com/posts với JSON body
// 3. Button "Tạo bài viết" disabled khi đang gửi
// 4. Sau submit thành công: hiển thị response data + reset form
// 5. Sau submit thất bại: hiển thị error message
//
// Lưu ý:
// - e.preventDefault() để ngăn browser reload
// - input value luôn gắn với state (controlled)
// - Single handleChange handler dùng e.target.name
// ============================================================

// Style đơn giản
const styles = {
  form: { maxWidth: 500, margin: "0 auto" },
  field: { marginBottom: 16 },
  label: { display: "block", marginBottom: 4, fontWeight: "bold" },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  textarea: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: 4,
    minHeight: 100,
  },
  select: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  error: { color: "red", fontSize: 14, marginTop: 4 },
  success: {
    background: "#d4edda",
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
};

// TODO: Xây dựng CreatePostForm component
//
// Gợi ý state:
//   const [formData, setFormData] = useState({ title: "", body: "", userId: "" });
//   const [errors, setErrors]     = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [result, setResult]     = useState(null); // response từ API
//
// Gợi ý handleChange:
//   function handleChange(e) {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Xóa error của field này khi user bắt đầu sửa
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
//   }
//
// Gợi ý validate:
//   function validate() {
//     const newErrors = {};
//     if (!formData.title.trim()) newErrors.title = "Tiêu đề không được để trống";
//     else if (formData.title.trim().length < 5) newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự";
//     // TODO: validate body và userId
//     return newErrors;
//   }
//
// Gợi ý handleSubmit:
//   async function handleSubmit(e) {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: formData.title,
//           body: formData.body,
//           userId: Number(formData.userId),
//         }),
//       });
//       if (!res.ok) throw new Error("Tạo post thất bại");
//       const data = await res.json();
//       setResult(data);
//       setFormData({ title: "", body: "", userId: "" }); // reset form
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setSubmitting(false);
//     }
//   }

function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    userId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Tiêu đề phải có ít nhất 5 kí tự";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Nội dung không được để trống";
    } else if (formData.body.trim().length < 10) {
      newErrors.body = "Nội dung phải có ít nhất 10 kí tự";
    }

    if (!formData.userId) {
      newErrors.userId = "Vui lòng chọn user";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setResult(null);

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          userId: Number(formData.userId),
        }),
      });

      if (!res.ok) {
        throw new Error("Tạo post thất bại");
      }

      const data = await res.json();

      setResult(data);
      setFormData({
        title: "",
        body: "",
        userId: "",
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.field}>
        <label style={styles.label} htmlFor="title">
          Tiêu đề
        </label>
        <input
          id="title"
          name="title"
          type="text"
          style={styles.input}
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <div style={styles.error}>{errors.title}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="body">
          Nội dung
        </label>
        <textarea
          id="body"
          name="body"
          style={styles.textarea}
          value={formData.body}
          onChange={handleChange}
        />
        {errors.body && <div style={styles.error}>{errors.body}</div>}
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="userId">
          User
        </label>
        <select
          id="userId"
          name="userId"
          style={styles.select}
          value={formData.userId}
          onChange={handleChange}
        >
          <option value="">-- Chọn user --</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
            <option key={id} value={id}>
              User {id}
            </option>
          ))}
        </select>
        {errors.userId && <div style={styles.error}>{errors.userId}</div>}
      </div>

      {errors.submit && <div style={styles.error}>{errors.submit}</div>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Đang gửi..." : "Tạo bài viết"}
      </button>

      {result && (
        <div style={styles.success}>
          <h3>Tạo bài viết thành công</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Tạo bài viết mới</h1>
      {/* TODO: Render CreatePostForm */}
      <CreatePostForm />
    </div>
  );
}

export default App;
