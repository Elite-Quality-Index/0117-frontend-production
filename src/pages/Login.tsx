import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FirebaseError } from "firebase/app"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"

export function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signInWithEmail(email, password)
      navigate("/cloud-chat")
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/invalid-credential":
            setError("Invalid email or password")
            break
          case "auth/invalid-email":
            setError("Invalid email address")
            break
          case "auth/user-disabled":
            setError("This account has been disabled")
            break
          case "auth/too-many-requests":
            setError("Too many attempts. Please try again later")
            break
          default:
            setError("An error occurred. Please try again")
        }
      } else {
        setError("An error occurred. Please try again")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      await signInWithGoogle()
      navigate("/cloud-chat")
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/popup-closed-by-user") {
          // User closed popup, no error needed
        } else {
          setError("Failed to sign in with Google")
        }
      } else {
        setError("An error occurred. Please try again")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-1 items-center justify-center p-6 md:p-10", className)} {...props}>
      <div className="w-full max-w-sm md:max-w-3xl flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your EQx Cloud Chat account
                  </p>
                </div>
                {error && (
                  <FieldError>{error}</FieldError>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
                    Sign up
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
            <div className="bg-primary relative hidden md:block">
              <img
                src="/eqx-logo1.png"
                alt="EQx Logo"
                className="absolute bottom-4 right-4 h-8 w-auto object-contain brightness-0 invert"
              />
            </div>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </FieldDescription>
      </div>
    </div>
  )
}
