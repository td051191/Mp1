import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-secondary rounded-full mx-auto mb-6">
            <Construction className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-muted-foreground mb-8">{description}</p>
          <p className="text-sm text-muted-foreground mb-6">
            This page is under construction. Continue prompting to fill in the
            content for this section.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
