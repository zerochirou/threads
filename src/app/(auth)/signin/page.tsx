import { LoginForm } from "@/components/login-form";

export default function Signin() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
