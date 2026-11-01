import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/qibla")({
  head: () => ({ meta: [{ title: "اتجاه القبلة — MyIslam" }, { name: "description", content: "بوصلة اتجاه القبلة من موقعك." }] }),
  component: () => <p className="p-6">اتجاه القبلة — قيد الإنشاء.</p>,
});
