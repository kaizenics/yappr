import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Yappr",
  description: "Settings for Yappr",
};

export default function PublicChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
