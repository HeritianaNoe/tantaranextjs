"use client";

import { useRouter } from "next/navigation";
import AdminForm from "@/components/AdminForm";

interface Story { id: string; title: string; content: string; image: string | null; categoryId: string | null; }

export default function StoryFormPage({ story = null }: { story?: Story | null }) {
  const router = useRouter();
  const goBack = () => router.push("/admin/stories");
  return <AdminForm story={story} onSuccess={goBack} onCancel={goBack} />;
}
