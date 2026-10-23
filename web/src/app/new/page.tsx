import type { Metadata } from "next";
import { Composer } from "./Composer";

export const metadata: Metadata = { title: "New bet" };

export default function NewBet() {
  return <Composer />;
}
