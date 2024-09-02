import User from "@/components/User/User";

export default function page({ params }: { params: { username: string } }) {
  return (
    <main className="px-8">
      <User username={params.username} />
    </main>
  );
}
