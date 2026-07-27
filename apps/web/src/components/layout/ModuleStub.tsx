import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Props = {
  title: string;
  description: string;
  phase: string;
};

export function ModuleStub({ title, description, phase }: Props) {
  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </header>
      <Alert>
        <AlertTitle>Coming in {phase}</AlertTitle>
        <AlertDescription>
          The scaffold and navigation are in place. The full CRUD, tables, and forms for this
          module will be built in {phase} of the roadmap.
        </AlertDescription>
      </Alert>
    </main>
  );
}
