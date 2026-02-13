import "../styles/globals.css";
import Header from "@/components/Header";
import { Kanit } from "next/font/google";
import TopMarquee from "@/components/TopMarquee";
import { Brygada_1918 } from "next/font/google";


const brygada = Brygada_1918({
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
});

const kanit = Kanit({
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${kanit.className} bg-white text-black`}>
        <TopMarquee speedSeconds={50} fontClass={brygada.className} />
        <Header />
        {children}
      </body>
    </html>
  );
}
