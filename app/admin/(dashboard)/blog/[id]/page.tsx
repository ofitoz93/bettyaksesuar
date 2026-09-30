import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/data/blog";
import { updateBlogPost } from "@/app/admin/actions";
import BlogPostForm from "../BlogPostForm";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const updateWithId = updateBlogPost.bind(null, id);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yazıyı Düzenle</h1>
      <BlogPostForm action={updateWithId} post={post} submitLabel="Değişiklikleri Kaydet" />
    </div>
  );
}
