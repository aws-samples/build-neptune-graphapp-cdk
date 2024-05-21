import { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Settings,
  ScatterChart,
  BrainCircuit,
  CopyPlus,
  Database,
  LogOut,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { signOut } from "aws-amplify/auth";
export const MainLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const submitSignOut = async () => {
    try {
      await signOut();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      navigate({ to: "/signin" });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex min-h-screen w-full flex-col ">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="https://us-east-1.console.aws.amazon.com/neptune/home?region=us-east-1"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Database className="h-5 w-5" />
                  <span className="sr-only">Amazon Neptune</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Amazon Neptune</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <BrainCircuit className="h-5 w-5" />
                  <span className="sr-only">Amazon SageMaker</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Amazon SageMaker</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/register"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <CopyPlus className="h-5 w-5" />
                  <span className="sr-only">Add Vertex/Edge</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Add Vertex/Edge</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/graph"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <ScatterChart className="h-5 w-5" />
                  <span className="sr-only">Graph Visualization</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Graph Visualization</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  onClick={() => submitSignOut()}
                  href="/signin"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Signout</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Signout</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <main className="grid flex-1 pl-12 items-start">{children}</main>
    </div>
  );
};
