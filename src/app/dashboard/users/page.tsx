import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { UserListClient } from "./user-list-client";

export default async function UsersPage() {
  const preloadedUsers = await preloadQuery(api.users.list, { paginationOpts: { cursor: null, numItems: 10 } });

  return <UserListClient preloadedUsers={preloadedUsers} />;
}