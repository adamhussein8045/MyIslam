import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/prayer-times")({
  head: () => ({ meta: [{ title: "مواقيت الصلاة — MyIslam" }, { name: "description", content: "مواقيت الصلاة الدقيقة لموقعك." }] }),
  component: () => <p className="p-6">مواقيت الصلاة — قيد الإنشاء.</p>,
});
