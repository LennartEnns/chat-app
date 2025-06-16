export default (role: string | null) => {
    switch (role) {
      case "admin":
        return "error";
      case "mod":
        return "success";
      case "viewer":
        return "warning";
      default:
        return "primary";
    }
  }
