"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createProject } from "@/lib/db/queries/projects";
import { Button } from "./ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const formSchema = z.object({
    name: z.string("Required").min(1, "Name is required"),
    description: z.string().optional(),
    color: z
        .union([
            z.literal("bg-purple-600 dark:bg-purple-700"),
            z.literal("bg-green-600 dark:bg-green-700"),
            z.literal("bg-blue-600 dark:bg-blue-700"),
            z.literal("bg-red-600 dark:bg-red-700"),
            z.literal("bg-yellow-600 dark:bg-yellow-700"),
            z.literal("bg-pink-600 dark:bg-pink-700"),
            z.literal("bg-indigo-600 dark:bg-indigo-700"),
            z.literal("bg-gray-600 dark:bg-gray-700"),
        ])
        .optional(),
});

export default function CreateForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            color: "bg-purple-600 dark:bg-purple-700",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                const id = await createProject(
                    data.name,
                    data.description,
                    data.color,
                );
                router.refresh();
                toast.success("Project created");
                form.reset();
                router.push(`/projects/${id}`);
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to create project";
                console.error(e);
                toast.error(msg);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Project Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name of your project.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Project Description"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter a brief description of your project.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={(val) => field.onChange(val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bg-purple-600 dark:bg-purple-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-purple-600 dark:bg-purple-700" />
                                            Purple
                                        </SelectItem>
                                        <SelectItem value="bg-green-600 dark:bg-green-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-green-600 dark:bg-green-700" />
                                            Green
                                        </SelectItem>
                                        <SelectItem value="bg-blue-600 dark:bg-blue-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-blue-600 dark:bg-blue-700" />
                                            Blue
                                        </SelectItem>
                                        <SelectItem value="bg-red-600 dark:bg-red-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-red-600 dark:bg-red-700" />
                                            Red
                                        </SelectItem>
                                        <SelectItem value="bg-yellow-600 dark:bg-yellow-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-yellow-600 dark:bg-yellow-700" />
                                            Yellow
                                        </SelectItem>
                                        <SelectItem value="bg-pink-600 dark:bg-pink-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-pink-600 dark:bg-pink-700" />
                                            Pink
                                        </SelectItem>
                                        <SelectItem value="bg-indigo-600 dark:bg-indigo-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-indigo-600 dark:bg-indigo-700" />
                                            Indigo
                                        </SelectItem>
                                        <SelectItem value="bg-gray-600 dark:bg-gray-700">
                                            <span className="inline-block w-3 h-3 mr-2 rounded bg-gray-600 dark:bg-gray-700" />
                                            Gray
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Choose a color for the project.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={!form.formState.isValid || isPending}
                >
                    Create Project
                </Button>
            </form>
        </Form>
    );
}
