import { MainLayout } from "@/components/RootLayout";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </>
  );
}
