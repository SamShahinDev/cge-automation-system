import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      {/* Main Section */}
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">CustomSoft</h2>
          <p className="text-white/80">Custom software at subscription prices</p>
          <a
            href="mailto:contact@customsoft.com"
            className="inline-block mt-4 hover:opacity-80 transition-opacity duration-150"
          >
            contact@customsoft.com
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white/80">
              © 2024 CustomSoft. All rights reserved.
            </p>

            {/* Links */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/privacy"
                className="hover:opacity-80 transition-opacity duration-150"
              >
                Privacy Policy
              </Link>
              <span className="text-white/40">|</span>
              <Link
                href="/terms"
                className="hover:opacity-80 transition-opacity duration-150"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
