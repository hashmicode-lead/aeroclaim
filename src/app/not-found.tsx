import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="reveal mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <LogoMark size={56} className="drop-shadow-[0_8px_18px_rgba(0,0,0,0.12)]" />
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="title-1 mt-2">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">
        The link may be wrong, or the claim may have been removed. Your other claims are safe in your account.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className="btn-primary">Go to my claims</Link>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </div>
  );
}
