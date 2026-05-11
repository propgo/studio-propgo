import { redirect } from "next/navigation";
interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ generationId?: string }> }
export default async function GenerateRedirect({ params, searchParams }: Props) {
  const { id } = await params;
  const { generationId } = await searchParams;
  redirect(`/projects/${id}/generate${generationId ? `?generationId=${generationId}` : ""}`);
}
