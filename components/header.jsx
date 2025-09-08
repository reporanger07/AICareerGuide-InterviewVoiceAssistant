import React from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ChevronDown, FileText, GraduationCap, LayoutDashboard,LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { 
  DropdownMenu,   DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  await checkUser();
  return (
    <header className="fixed top-0 w-full border bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href='/'>
          <span className="h-12 py-1 w-auto object-contain">CareerGuideAi</span>
        </Link>

        <div className="flex items-center space-x-2">
          <SignedIn>
            {/* <Link href='/dashboard'>
              <Button>
                <LayoutDashboard className="h-4 w-4 mr-2"/>
                Industry Insights
              </Button>
            </Link> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span>Tools</span>
                  <ChevronDown className="h-4 w-4 ml-2"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Tools & Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />


                <DropdownMenuItem asChild>
                  <Link href='/dashboard' className="flex items-center gap-2 w-full">
                    <LayoutTemplate className="h-4 w-4"/>
                    dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href='/resume' className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4"/>
                    Build Resume
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/interview' className="flex items-center gap-2 w-full">
                    <GraduationCap className="h-4 w-4"/>
                    Interview Prep
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <UserButton />
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;