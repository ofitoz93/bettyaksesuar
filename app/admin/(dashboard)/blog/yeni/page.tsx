import { createBlogPost } from "@/app/admin/actions";
import BlogPostForm from "../BlogPostForm";

export default function YeniBlogYazisiPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yeni Blog Yazısı</h1>
      <BlogPostForm action={createBlogPost} submitLabel="Yayınla" />
    </div>
  );
}
