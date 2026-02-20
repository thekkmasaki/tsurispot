import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepCardProps {
  stepNumber: number;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function StepCard({ stepNumber, title, icon: Icon, children }: StepCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex-row items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}
