export type SignUpResponse = {
  message: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
};
