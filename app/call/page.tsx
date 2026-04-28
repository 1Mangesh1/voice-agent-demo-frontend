import dynamic from "next/dynamic";

const CallShell = dynamic(
  () => import("@/components/CallShell").then((m) => m.CallShell),
  { ssr: false }
);

export default function CallPage() {
  return <CallShell />;
}
