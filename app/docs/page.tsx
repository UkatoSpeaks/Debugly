import type { Metadata } from "next";
import DocsClient from "./DocsClient";

export const metadata: Metadata = {
  title: "Documentation - Debugly",
  description: "Learn how to use Debugly's AI engine to resolve hydration errors, memory leaks, and complex stack traces.",
};

export default function DocsPage() {
  return <DocsClient />;
}
