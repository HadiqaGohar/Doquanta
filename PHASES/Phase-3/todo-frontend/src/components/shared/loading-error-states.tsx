import { ReloadIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  message?: string;
}


export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ReloadIcon className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "An error occurred", onRetry }: ErrorStateProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-destructive">Error</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}