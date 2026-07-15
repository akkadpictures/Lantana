import { Shell } from "@/components/admin/Shell";
import { getBlogPosts } from "@/lib/db";
import { BlogClient } from "@/components/admin/BlogClient";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const posts = await getBlogPosts();
  return (
    <Shell title="Journal">
      <BlogClient initial={posts} />
    </Shell>
  );
}
