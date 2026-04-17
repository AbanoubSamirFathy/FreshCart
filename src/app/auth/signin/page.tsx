"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters.")
    .max(32, "Password must be at most 32 characters."),
});

type SignInFormValues = z.infer<typeof formSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFieldId = React.useId();
  const passwordFieldId = React.useId();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormValues) {
    form.clearErrors("root");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok) {
        form.setError("root", {
          message:
            result?.error === "CredentialsSignin"
              ? "Incorrect email or password."
              : "Unable to sign in right now. Please try again.",
        });
        return;
      }

      router.replace(result.url ?? callbackUrl);
      router.refresh();
    } catch {
      form.setError("root", {
        message: "Unable to sign in right now. Please try again.",
      });
    }
  }

  return (
    <Card className="my-30 mx-auto w-full sm:max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-in-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={emailFieldId}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={emailFieldId}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={passwordFieldId}>Password</FieldLabel>
                  <Input
                    {...field}
                    id={passwordFieldId}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <FieldError errors={[form.formState.errors.root]} />
          </FieldGroup>
        </form>
      </CardContent>
      {/* <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="sign-in-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </Field>
        <Field >
          Not have an account?
          <Button
            className="hover:underline hover:text-green-700"
            onClick={() => router.push("/auth/signup")}
          >
            Sign Up
          </Button>
        </Field>
      </CardFooter> */}
      <CardFooter>
        <div className="flex flex-col gap-4 w-full">
          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <Button
              type="submit"
              form="sign-in-form"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </div>

          {/* Sign up text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Not have an account?</span>

            <button
              type="button"
              className="text-green-700 hover:underline"
              onClick={() => router.push("/auth/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
