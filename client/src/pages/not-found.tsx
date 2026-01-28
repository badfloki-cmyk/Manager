import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto bg-card border-border/50 shadow-2xl">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground font-display">404 - Offside!</h1>
            <p className="text-muted-foreground">
              The page you are looking for has been flagged. It doesn't exist or has been moved.
            </p>
          </div>

          <Link href="/">
            <button className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors">
              Return to Pitch
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
