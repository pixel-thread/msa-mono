import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24">
      <Card className="w-full max-w-md border-hairline bg-surface-card">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-normal tracking-tight text-ink">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-body text-base">
            The page you are looking for does not exist or has been moved. Please check the URL or
            navigate back to a known page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-6xl font-normal tracking-tight text-muted-soft">
            404
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button
            asChild
            variant="outline"
            className="h-11 border-hairline bg-surface-strong px-5 text-base font-semibold text-ink hover:bg-surface-strong/80"
          >
            <Link to="/">Go back home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
