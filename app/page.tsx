import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:gap-16">
          {/* LEFT: Logo */}
          <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
              <Image
                src="/images/logo.png"
                alt="Barangay Mawague Seal"
                fill
                priority
                className="object-contain shadow-lg rounded-3xl"
              />
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                Barangay Mawague
              </h1>
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                Linkod App
              </div>
              <p className="text-xl md:text-2xl font-semibold text-slate-700">
                Digital Services
              </p>
            </div>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
              Request barangay certificates and documents online. Fast,
              convenient, and secure.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Button
                asChild
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg shadow-lg active:scale-[0.98] transition-all"
              >
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Link
                href="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline decoration-2 decoration-emerald-500 underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
