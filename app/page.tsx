import Home from "@/components/Home/Home";
import Navbar from "@/components/Navbar";
import { SignOutButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <Navbar />
      <Home />
    </>
  );
}
