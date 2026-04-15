
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/provider/userprovider";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {currentUser} = useUser();
  console.log("Current User:", currentUser);
  const navItems = [
    { name: "Product", href: "#hero" },
    { name: "Features", href: "#features" },
    { name: "Creators", href: "#creators" },
  ];
  return (
    <header className=" select-none fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2"> 
          <Link href="/">
            <Image src="/cyanlogo.png" height={80} width={80} alt="logo"></Image>
          </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
                onClick={e => {
    e.preventDefault();
    const el = document.getElementById(item.href.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {currentUser?
                    <Link
                      href="/flow"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium px-4 py-2 rounded-sm bg-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
: <Link
href="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 py-2 rounded-sm transition-all duration-200 hover:scale-105"
           
                  >
                    Sign in
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                   </Link>
}
          </div>

          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/90 backdrop-blur-xl border-t border-border">
  {navItems.map((item) => (
    <a
      key={item.name}
      href={item.href}
      className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
      onClick={e => {
        e.preventDefault();
        const el = document.getElementById(item.href.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
        setIsMenuOpen(false);
      }}
    >
      {item.name}
    </a>
  ))}
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex flex-col gap-2">
                  {currentUser?
                    <Link
                      href="/flow"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium px-4 py-2 rounded-sm bg-secondary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
:
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 py-2 rounded-sm transition-all duration-200 hover:scale-105"
                    onClick={()=>redirect('/auth')}
                  >
                    Sign in
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
