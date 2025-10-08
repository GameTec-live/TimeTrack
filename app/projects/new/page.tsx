import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CreateForm from "@/components/create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function NewProjectPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return redirect("/");

    return (
        <main>
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>Create a project</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateForm />
                </CardContent>
            </Card>
        </main>
    );
}
