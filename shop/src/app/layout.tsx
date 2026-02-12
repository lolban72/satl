import "../styles/globals.css";
import Header from "@/components/Header";
import { Kanit, Brygada_1918 } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
});

const brygada = Brygada_1918({
  subsets: ["latin", "latin-ext"],
  weight: ["500"], // Medium
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={kanit.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}

