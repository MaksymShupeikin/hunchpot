import { Suspense } from "react";
import { Nav, NavBar } from "@/components/Nav";
import s from "./tabs.module.css";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={s.app}>
      {children}
      <Suspense fallback={<NavBar path={null} />}>
        <Nav />
      </Suspense>
    </div>
  );
}
