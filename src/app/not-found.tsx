import Link from "next/link";
import { OrbitMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="atmosphere flex min-h-[100svh] items-center">
      <div className="mx-auto max-w-2xl px-5 pt-24 pb-16 text-center md:px-8">
        <div className="flex justify-center text-ink/25">
          <OrbitMark size={72} animated />
        </div>
        <p className="label-mono mt-10 justify-center">404 — not found</p>
        <h1 className="text-title mt-4">
          This path was <em className="italic">reconsidered</em>.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ink-2">
          The page you were looking for doesn’t exist here — perhaps it never
          did, perhaps it was revised away. Either way, the question remains
          open.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="btn-primary">
            Return home
          </Link>
          <Link href="/manifesto" className="btn-secondary">
            Read the master prompt
          </Link>
        </div>
      </div>
    </section>
  );
}
