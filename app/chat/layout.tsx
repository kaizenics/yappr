import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | Yappr",
  description: "Chat for Yappr",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}