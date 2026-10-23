import type { Me } from "@/lib/api";
import { PotField } from "./PotField";
import { ShareButton } from "./RailButtons";
import s from "./waitlist.module.css";

/** A campus still gathering students: the field fills toward the number that opens it. */
export function Waitlist({ me }: { me: Me }) {
  const joined = Math.min(me.members / me.unlock_at, 1);
  return (
    <main className={s.screen}>
      <PotField id={me.members} outcomes={[{ share: joined }, { share: 1 - joined }]} />
      <div className={s.scrim} />
      <div className={s.body}>
        <h1 className={s.title}>
          {me.school} opens at <span className="outline">{me.unlock_at}</span>
        </h1>
        <p className={s.count}>
          <b>{me.members}</b> of {me.unlock_at} students are in. Bring your friends and it opens sooner.
        </p>
        <ShareButton path="/join" title={`Get ${me.school} on Hunchpot`} label="Invite friends" className={s.invite}>
          Invite friends
        </ShareButton>
      </div>
    </main>
  );
}
