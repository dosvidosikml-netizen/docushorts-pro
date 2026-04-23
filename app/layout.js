import "./globals.css";

export const metadata = {
  title: "NeuroCine Studio",
  description: "AI video production workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
