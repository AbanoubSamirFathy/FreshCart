export type SignInResponse = {
  message: "success" | "Incorrect email or password";
  user: {
    name: string;
    email: string;
    role: string;
  };
  token: string;
};
