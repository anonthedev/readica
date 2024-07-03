// import { supabaseClient } from "@/lib/supabase";
// import { useAuth } from "@clerk/nextjs";

// const { getToken, userId } = useAuth();
// const token = await getToken({ template: "supabase" });
// const supabase = await supabaseClient(token!);

// export async function uploadFile(file: File, filePath: string) {
//   const { data, error } = await supabase.storage
//     .from("papers")
//     .upload(filePath, file);
//   if (error) {
//     console.log(error);
//     return { status: "error", error: error };
//   } else {
//     console.log(data);
//     return { status: "success", data: data };
//   }
// }
