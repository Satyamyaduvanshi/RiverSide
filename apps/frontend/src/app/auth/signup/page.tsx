// eslint-disable-next-line @nx/enforce-module-boundaries
import { SignUpForm } from "apps/frontend/src/components/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUpForm />
    </main>
  );
}