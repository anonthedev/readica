import User from "@/components/User/User";

export default function page({ params }: { params: { username: string } }) {
  return <User username={params.username} />;
}
