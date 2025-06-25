/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { zodResolver as resolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { LoginSchema, loginSchema } from "@/schemas/login.schema";
import { setTokens } from "@/lib/api";

export default function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: resolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchema) {
    try {
      const response = await authService.login(values.email, values.password);
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);
      router.replace("/");
      toast({
        title: "Login successful!",
        description: "User logged in successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <Card className="mx-auto max-w-sm bg-secondary border-none">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Login</CardTitle>
          <CardDescription className="text-white">
            Enter your email and password to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          className="text-white"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                >
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
