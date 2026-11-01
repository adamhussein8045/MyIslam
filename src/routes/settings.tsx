import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — MyIslam" }, { name: "description", content: "إعدادات الموقع والمواقيت والمظهر." }] }),
  component: () => <p className="p-6">الإعدادات — قيد الإنشاء.</p>,
});
