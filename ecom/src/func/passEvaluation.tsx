export const evaluatePasswordStrength = (
  password: string,
  setPasswordStrength: (strength: string[]) => void,
) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  switch (strength) {
    case 0:
      setPasswordStrength(["text-red-700", "Weak", "5%", "bg-red-700"]);
      break;
    case 1:
      setPasswordStrength(["text-red-700", "Weak", "25%", "bg-red-700"]);
      break;
    case 2:
      setPasswordStrength([
        "text-yellow-500",
        "Moderate",
        "50%",
        "bg-yellow-500",
      ]);
      break;
    case 3:
      setPasswordStrength(["text-green-500", "Strong", "75%", "bg-green-500"]);
      break;
    case 4:
      setPasswordStrength([
        "text-green-700",
        "Very Strong",
        "100%",
        "bg-green-700",
      ]);
      break;
    default:
      setPasswordStrength(["", ""]);
  }
};
