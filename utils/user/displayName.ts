type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function sanitizeName(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getDisplayName(user: UserLike | null | undefined) {
  if (!user) return "Unknown user";

  const metadata = user.user_metadata ?? {};
  const fromDisplayName = sanitizeName(metadata.display_name);
  if (fromDisplayName) return fromDisplayName;

  const fromFullName = sanitizeName(metadata.full_name);
  if (fromFullName) return fromFullName;

  return user.email ?? "Unknown user";
}
