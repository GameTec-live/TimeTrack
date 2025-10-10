import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
    return (
        <main className="flex flex-col items-center m-4">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-48" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-full" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 w-full items-center justify-center">
                    <h1 className="text-4xl font-bold">
                        <Skeleton className="h-10 w-48" />
                    </h1>

                    <div className="flex flex-col md:flex-row items-center justify-center">
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <CardAction className="flex flex-col items-center gap-2 w-full">
                        <Skeleton className="max-w-md h-18 w-full" />
                        <Skeleton className="h-10 w-20" />
                    </CardAction>
                </CardFooter>
            </Card>
            <div className="mt-10">
                <Spinner />
            </div>
        </main>
    );
}
