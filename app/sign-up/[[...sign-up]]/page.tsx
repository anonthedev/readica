import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="w-screen min-h-[calc(100vh-80px)] lg:min-h-[100dvh] flex flex-col items-center justify-center">
      <SignUp />
    </main>
  );
}
