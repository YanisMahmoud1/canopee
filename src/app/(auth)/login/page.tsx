import { AuthForm } from "@/components/auth/AuthForm";
import { loginAction } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} />;
}
