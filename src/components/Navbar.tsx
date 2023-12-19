import { File } from "lucide-react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { getAuthSession } from "@/lib/authOptions";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ToggleThemeButton";

const Navbar = async () => {
  const session = await getAuthSession();
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 dark:border-0 bg-white/75 backdrop-blur-lg transition-all dark:bg-black">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-0">
          <Link href="/" className={cn(buttonVariants({variant : "ghost"}),"flex z-40 font-bold text-2xl")} aria-disabled={true} >
            LangChain
          </Link>

          {/* add mobile navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
            <ModeToggle />
            {session ? (<Link href="/dashboard" className={buttonVariants({size : "sm"})}>Dashboard</Link>) : (<Link href="/sign-in" className={buttonVariants({ size: "sm" })}>Sign in</Link>)}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
