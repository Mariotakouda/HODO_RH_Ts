interface AvatarProps {
  photoUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number;
}

export function Avatar({ photoUrl, firstName = "", lastName = "", size = 45 }: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className="rounded-circle border"
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: "#2563eb",
      }}
    >
      {initials}
    </div>
  );
}
