import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Chat | Yappr",
  description: "Public chat for Yappr",
};

export default function PublicChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}