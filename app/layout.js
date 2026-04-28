import "./globals.css";

export const metadata = {
  title: "NeuroCine Studio",
  description: "AI storyboard studio for short cinematic videos"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
