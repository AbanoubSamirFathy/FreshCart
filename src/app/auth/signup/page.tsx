"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { apiServices } from "@/app/services/api";
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

const formSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be at most 100 characters."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z
      .string()
      .min(5, "Password must be at least 5 characters.")
      .max(32, "Password must be at most 32 characters."),
    rePassword: z
      .string()
      .min(5, "Password must be at least 5 characters.")
      .max(32, "Password must be at most 32 characters."),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d{10,15}$/, "Please enter a valid phone number."),
  })
  .refine(({ password, rePassword }) => password === rePassword, {
    message: "Passwords do not match.",
    path: ["rePassword"],
  });

type SignUpFormValues = z.infer<typeof formSchema>;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameFieldId = React.useId();
  const emailFieldId = React.useId();
  const passwordFieldId = React.useId();
  const rePasswordFieldId = React.useId();
  const phoneFieldId = React.useId();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      phone: "",
    },
  });

  async function onSubmit(data: SignUpFormValues) {
    form.clearErrors("root");

    try {
      await apiServices.signup(
        data.name,
        data.email,
        data.password,
        data.rePassword,
        data.phone,
      );

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok) {
        router.replace(
          `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
        router.refresh();
        return;
      }

      router.replace(result.url ?? callbackUrl);
      router.refresh();
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign up right now. Please try again.",
      });
    }
  }

  return (
    <Card className="my-30 mx-auto w-full sm:max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Sign up for a new account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-up-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={nameFieldId}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={nameFieldId}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="rePassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={rePasswordFieldId}>
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={rePasswordFieldId}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={phoneFieldId}>Phone</FieldLabel>
                  <Input
                    {...field}
                    id={phoneFieldId}
                    type="tel"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
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
            form="sign-up-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing Up..." : "Sign Up"}
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
              {form.formState.isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>

          {/* Sign up text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Have an account?</span>

            <button
              type="button"
              className="text-green-700 hover:underline"
              onClick={() => router.push("/auth/signin")}
            >
              Sign In
            </button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
