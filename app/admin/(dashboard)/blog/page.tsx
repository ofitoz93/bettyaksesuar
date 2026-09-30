import Link from "next/link";
import { getAllBlogPostsForAdmin } from "@/lib/data/blog";
import DeleteBlogPostButton from "./DeleteBlogPostButton";

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsForAdmin();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px]">Blog</h1>
        <Link
          href="/admin/blog/yeni"
          className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
        >
          + Yeni Yazı
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Henüz blog yazısı yok. &ldquo;Yeni Yazı&rdquo; ile ilk yazınızı ekleyin.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-line border-y border-line bg-white">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-5 px-5 py-4">
              <div className="flex-1">
                <div className="text-sm">{post.title}</div>
                <div className="mt-0.5 text-xs text-ink-faint">/{post.slug}</div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] uppercase ${
                  post.isPublished
                    ? "bg-status-green-bg text-status-green-fg"
                    : "bg-status-amber-bg text-status-amber-fg"
                }`}
              >
                {post.isPublished ? "Yayında" : "Taslak"}
              </span>
              <Link
                href={`/admin/blog/${post.id}`}
                className="text-xs tracking-wide text-ink-soft hover:text-ink"
              >
                Düzenle
              </Link>
              <DeleteBlogPostButton id={post.id} title={post.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
