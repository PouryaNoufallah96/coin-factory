export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

export function adminRedirectPath(value: string | null | undefined) {
  if (!value || value.startsWith("//")) {
    return ADMIN_HOME_PATH;
  }

  try {
    const url = new URL(value, "https://coinfactory.local");

    if (!url.pathname.startsWith(ADMIN_HOME_PATH)) {
      return ADMIN_HOME_PATH;
    }

    if (url.pathname === ADMIN_LOGIN_PATH) {
      return ADMIN_HOME_PATH;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return ADMIN_HOME_PATH;
  }
}
