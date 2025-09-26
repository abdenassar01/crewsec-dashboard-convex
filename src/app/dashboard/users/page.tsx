import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { UserListClient } from "./user-list-client";
import { getToken } from "@/lib/auth-server";

export default async function UsersPage() {
  const preloadedUsers = await preloadQuery(api.users.list, { paginationOpts: { cursor: null, numItems: 10 }}, {token: await getToken()});

  return <UserListClient preloadedUsers={preloadedUsers} />;
}