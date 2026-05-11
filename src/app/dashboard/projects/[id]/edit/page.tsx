import { redirect } from "next/navigation";
interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ step?: string }> }
export default async function EditRedirect({ params, searchParams }: Props) {
  const { id } = await params;
  const { step } = await searchParams;
  redirect(`/projects/${id}/edit${step ? `?step=${step}` : ""}`);
}
